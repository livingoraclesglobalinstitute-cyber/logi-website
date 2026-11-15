import {
  hashPassword,
  createAuthToken,
  jsonResponse
} from "./_auth.js";

export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    const { email, password, fullName } = await request.json();

    if (
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return jsonResponse({
        error: "Email and password are required."
      }, 400);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const name = typeof fullName === "string"
      ? fullName.trim()
      : "";

    if (
      normalizedEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      return jsonResponse({ error: "Please enter a valid email address." }, 400);
    }

    if (password.length < 8 || password.length > 256) {
      return jsonResponse({
        error: "Password must be between 8 and 256 characters."
      }, 400);
    }

    if (name.length > 120) {
      return jsonResponse({ error: "Name is too long." }, 400);
    }

    if (!env.DB || !env.JWT_SECRET) {
      return jsonResponse({
        error: "Registration service is not configured."
      }, 500);
    }

    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();

    await env.DB.prepare(`
      INSERT INTO users (
        email,
        password_hash,
        full_name,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      normalizedEmail,
      passwordHash,
      name || null,
      now,
      now
    ).run();

    const user = await env.DB.prepare(`
      SELECT id, email, full_name
      FROM users
      WHERE email = ?
    `).bind(normalizedEmail).first();

    if (!user) {
      return jsonResponse({
        error: "Account creation could not be confirmed."
      }, 500);
    }

    const token = await createAuthToken(user, env);

    return jsonResponse({
      success: true,
      message: "Account created successfully.",
      token,
      email: user.email,
      fullName: user.full_name || ""
    });

  } catch (error) {
    if (
      error.message?.includes("UNIQUE constraint failed")
    ) {
      return jsonResponse({
        error: "An account with this email already exists."
      }, 409);
    }

    console.error("Registration error:", error?.stack || error);

    return jsonResponse({
      error: "Registration could not be completed."
    }, 500);
  }
}
