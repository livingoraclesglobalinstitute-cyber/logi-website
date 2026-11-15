import {
  hashPassword,
  createAuthToken,
  jsonResponse
} from "./_auth.js";

export async function onRequestPost({ request, env }) {
  try {
    if (!env.DB) {
      throw new Error("Database binding DB is missing.");
    }

    if (
      typeof env.JWT_SECRET !== "string" ||
      env.JWT_SECRET.length < 32
    ) {
      throw new Error("JWT_SECRET is missing or invalid.");
    }

    const body = await request.json();

    const fullName = String(body.fullName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!fullName || !email || !password) {
      return jsonResponse({
        success: false,
        error: "Please provide your full name, email and password."
      }, 400);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({
        success: false,
        error: "Please enter a valid email address."
      }, 400);
    }

    if (password.length < 8) {
      return jsonResponse({
        success: false,
        error: "Your password must contain at least 8 characters."
      }, 400);
    }

    if (fullName.length > 150 || email.length > 254) {
      return jsonResponse({
        success: false,
        error: "The supplied information is too long."
      }, 400);
    }

    const existing = await env.DB.prepare(
      "SELECT id FROM users WHERE email = ? LIMIT 1"
    ).bind(email).first();

    if (existing) {
      return jsonResponse({
        success: false,
        error: "An account with this email already exists."
      }, 409);
    }

    const passwordHash = await hashPassword(password);

    await env.DB.prepare(`
      INSERT INTO users (
        full_name,
        email,
        password_hash,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).bind(
      fullName,
      email,
      passwordHash
    ).run();

    const user = await env.DB.prepare(
      "SELECT id, full_name, email FROM users WHERE email = ? LIMIT 1"
    ).bind(email).first();

    if (!user) {
      throw new Error("Unable to retrieve the newly created account.");
    }

    const token = await createAuthToken({
      id: user.id,
      email: user.email
    }, env);

    return jsonResponse({
      success: true,
      message: "Registration successful.",
      token,
      id: user.id,
      fullName: user.full_name,
      email: user.email
    }, 201);

  } catch (error) {
    console.error("LOGI registration error:", error);

    return jsonResponse({
      success: false,
      error: "Registration could not be completed. Please try again."
    }, 500);
  }
}
