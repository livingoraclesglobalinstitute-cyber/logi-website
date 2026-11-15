const ITERATIONS = 310000;
const TOKEN_LIFETIME = 7 * 24 * 60 * 60;

function base64url(bytes) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64url(value) {
  const base64 = value
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const padded = base64 + "=".repeat((4 - base64.length % 4) % 4);
  const binary = atob(padded);

  return Uint8Array.from(binary, c => c.charCodeAt(0));
}

function constantTimeEqual(a, b) {
  if (a.length !== b.length) return false;

  let difference = 0;

  for (let i = 0; i < a.length; i++) {
    difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return difference === 0;
}

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const derived = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: ITERATIONS,
      hash: "SHA-256"
    },
    key,
    256
  );

  const hash = new Uint8Array(derived);

  return `pbkdf2$sha256$${ITERATIONS}$${base64url(salt)}$${base64url(hash)}`;
}

export async function verifyPassword(password, storedHash) {
  // Support existing LOGI SHA-256 password hashes.
  if (/^[a-f0-9]{64}$/i.test(storedHash)) {
    const legacyBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(password + "LOGI_SECRET_SALT")
    );

    const legacyHash = Array.from(new Uint8Array(legacyBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    return {
      valid: constantTimeEqual(
        legacyHash.toLowerCase(),
        storedHash.toLowerCase()
      ),
      needsUpgrade: true
    };
  }

  const parts = storedHash.split("$");

  if (
    parts.length !== 5 ||
    parts[0] !== "pbkdf2" ||
    parts[1] !== "sha256"
  ) {
    return { valid: false, needsUpgrade: false };
  }

  const iterations = Number(parts[2]);

  if (
    !Number.isSafeInteger(iterations) ||
    iterations < 100000 ||
    iterations > 1000000
  ) {
    return { valid: false, needsUpgrade: false };
  }

  try {
    const salt = fromBase64url(parts[3]);
    const expectedHash = fromBase64url(parts[4]);

    if (salt.length !== 16 || expectedHash.length !== 32) {
      return { valid: false, needsUpgrade: false };
    }

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );

    const derived = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations,
        hash: "SHA-256"
      },
      key,
      256
    );

    const actualHash = new Uint8Array(derived);

    let difference = 0;

    for (let i = 0; i < actualHash.length; i++) {
      difference |= actualHash[i] ^ expectedHash[i];
    }

    return {
      valid: difference === 0,
      needsUpgrade: false
    };
  } catch {
    return { valid: false, needsUpgrade: false };
  }
}

export async function createAuthToken(user, env) {
  if (!env.JWT_SECRET || new TextEncoder().encode(env.JWT_SECRET).length < 32) {
    throw new Error("Authentication secret is not configured correctly.");
  }

  const header = base64url(
    new TextEncoder().encode(
      JSON.stringify({ alg: "HS256", typ: "JWT" })
    )
  );

  const now = Math.floor(Date.now() / 1000);

  const payload = base64url(
    new TextEncoder().encode(
      JSON.stringify({
        sub: String(user.id),
        email: user.email,
        iat: now,
        exp: now + TOKEN_LIFETIME
      })
    )
  );

  const message = `${header}.${payload}`;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(env.JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message)
  );

  return `${message}.${base64url(new Uint8Array(signature))}`;
}

export async function verifyAuthToken(token, env) {
  if (!token || !env.JWT_SECRET) return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;

    const decodedHeader = JSON.parse(
      new TextDecoder().decode(fromBase64url(header))
    );

    if (decodedHeader.alg !== "HS256" || decodedHeader.typ !== "JWT") {
      return null;
    }

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(env.JWT_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64url(signature),
      new TextEncoder().encode(`${header}.${payload}`)
    );

    if (!valid) return null;

    const user = JSON.parse(
      new TextDecoder().decode(fromBase64url(payload))
    );

    const now = Math.floor(Date.now() / 1000);

    if (
      !user.sub ||
      !user.email ||
      !Number.isFinite(user.exp) ||
      user.exp <= now ||
      !Number.isFinite(user.iat) ||
      user.iat > now + 60
    ) {
      return null;
    }

    return user;
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
