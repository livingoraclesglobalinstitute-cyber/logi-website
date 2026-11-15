const ITERATIONS = 310000;
const TOKEN_LIFETIME = 7 * 24 * 60 * 60;
const encoder = new TextEncoder();

function base64url(bytes) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function decodeBase64url(value) {
  const base64 = value
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const padded = base64 + "=".repeat((4 - base64.length % 4) % 4);
  const binary = atob(padded);

  return Uint8Array.from(binary, c => c.charCodeAt(0));
}

function getSecret(env) {
  const secret = env.JWT_SECRET;

  if (typeof secret !== "string" || secret.length < 32) {
    throw new Error("JWT_SECRET must contain at least 32 characters.");
  }

  return secret;
}

async function derivePassword(password, salt) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: ITERATIONS,
      hash: "SHA-256"
    },
    key,
    256
  );

  return new Uint8Array(bits);
}

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePassword(password, salt);

  return `pbkdf2$${ITERATIONS}$${base64url(salt)}$${base64url(hash)}`;
}

export async function verifyPassword(password, storedHash) {
  try {
    const parts = storedHash.split("$");

    if (parts.length !== 4 || parts[0] !== "pbkdf2") {
      return false;
    }

    const iterations = Number(parts[1]);

    if (!Number.isInteger(iterations) ||
        iterations < 100000 ||
        iterations > 1000000) {
      return false;
    }

    const salt = decodeBase64url(parts[2]);
    const expected = decodeBase64url(parts[3]);

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );

    const bits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations,
        hash: "SHA-256"
      },
      key,
      256
    );

    const actual = new Uint8Array(bits);

    if (actual.length !== expected.length) return false;

    return actual.every((value, index) => value === expected[index]);
  } catch {
    return false;
  }
}

async function signJWT(data, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(data)
  );

  return base64url(new Uint8Array(signature));
}

export async function createAuthToken(user, env) {
  const secret = getSecret(env);
  const now = Math.floor(Date.now() / 1000);

  const header = {
    alg: "HS256",
    typ: "JWT"
  };

  const payload = {
    sub: String(user.id),
    email: user.email,
    iat: now,
    exp: now + TOKEN_LIFETIME
  };

  const unsigned =
    `${base64url(encoder.encode(JSON.stringify(header)))}.` +
    `${base64url(encoder.encode(JSON.stringify(payload)))}`;

  const signature = await signJWT(unsigned, secret);

  return `${unsigned}.${signature}`;
}

export async function verifyAuthToken(token, env) {
  try {
    const secret = getSecret(env);
    const parts = token.split(".");

    if (parts.length !== 3) return null;

    const [headerPart, payloadPart, signaturePart] = parts;

    const header = JSON.parse(
      new TextDecoder().decode(decodeBase64url(headerPart))
    );

    const payload = JSON.parse(
      new TextDecoder().decode(decodeBase64url(payloadPart))
    );

    if (header.alg !== "HS256" || header.typ !== "JWT") {
      return null;
    }

    const unsigned = `${headerPart}.${payloadPart}`;
    const expectedSignature = await signJWT(unsigned, secret);

    if (signaturePart !== expectedSignature) return null;

    const now = Math.floor(Date.now() / 1000);

    if (!payload.sub || !payload.email) return null;
    if (!Number.isFinite(payload.exp) || payload.exp <= now) return null;
    if (!Number.isFinite(payload.iat) || payload.iat > now + 60) return null;
    if (payload.exp - payload.iat > TOKEN_LIFETIME) return null;

    return {
      id: Number(payload.sub),
      email: payload.email
    };
  } catch {
    return null;
  }
}

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    }
  });
}
