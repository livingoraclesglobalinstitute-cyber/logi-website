import {
  verifyPassword,
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

    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return jsonResponse({
        success: false,
        error: "Please enter your email address and password."
      }, 400);
    }

    const user = await env.DB.prepare(`
      SELECT
        id,
        full_name,
        email,
        password_hash
      FROM users
      WHERE email = ?
      LIMIT 1
    `).bind(email).first();

    if (!user) {
      return jsonResponse({
        success: false,
        error: "Invalid email address or password."
      }, 401);
    }

    const passwordIsValid = await verifyPassword(
      password,
      user.password_hash
    );

    if (!passwordIsValid) {
      return jsonResponse({
        success: false,
        error: "Invalid email address or password."
      }, 401);
    }

    const token = await createAuthToken({
      id: user.id,
      email: user.email
    }, env);

    return jsonResponse({
      success: true,
      message: "Login successful.",
      token,
      id: user.id,
      fullName: user.full_name,
      email: user.email
    });

  } catch (error) {
    console.error("LOGI login error:", error);

    return jsonResponse({
      success: false,
      error: "Login could not be completed. Please try again."
    }, 500);
  }
}
