import {
  verifyPassword,
  hashPassword,
  createAuthToken,
  jsonResponse
} from "./_auth.js";

export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    const { email, password } = await request.json();

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return jsonResponse({
        error: "Email and password are required."
      }, 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail.length > 254 || password.length > 256) {
      return jsonResponse({
        error: "Invalid email or password."
      }, 401);
    }

    if (!env.DB || !env.JWT_SECRET) {
      return jsonResponse({
        error: "Login service is not configured."
      }, 500);
    }

    const user = await env.DB.prepare(`
      SELECT id, email, password_hash, full_name
      FROM users
      WHERE email = ?
    `).bind(normalizedEmail).first();

    if (!user) {
      return jsonResponse({
        error: "Invalid email or password."
      }, 401);
    }

    const verification = await verifyPassword(
      password,
      user.password_hash
    );

    if (!verification.valid) {
      return jsonResponse({
        error: "Invalid email or password."
      }, 401);
    }

    // Upgrade existing SHA-256 hashes after successful login.
    if (verification.needsUpgrade) {
      const newHash = await hashPassword(password);

      await env.DB.prepare(`
        UPDATE users
        SET password_hash = ?,
            updated_at = ?
        WHERE id = ?
          AND password_hash = ?
      `).bind(
        newHash,
        new Date().toISOString(),
        user.id,
        user.password_hash
      ).run();
    }

    const token = await createAuthToken(user, env);

    return jsonResponse({
      success: true,
      token,
      email: user.email,
      fullName: user.full_name || ""
    });

  } catch (error) {
    console.error("Login error:", error);

    return jsonResponse({
      error: "Login could not be completed."
    }, 500);
  }
}
