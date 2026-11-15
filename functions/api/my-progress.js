import {
  verifyAuthToken,
  jsonResponse
} from "./_auth.js";

export async function onRequestGet({ request, env }) {
  try {
    if (!env.DB) {
      throw new Error("Database binding DB is missing.");
    }

    // Support the existing dashboard's token query parameter
    // and the more secure Authorization: Bearer header.
    const authHeader = request.headers.get("Authorization") || "";

    const bearerToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : "";

    const url = new URL(request.url);
    const queryToken = url.searchParams.get("token") || "";

    const token = bearerToken || queryToken;

    if (!token) {
      return jsonResponse({
        success: false,
        error: "Authentication required. Please log in."
      }, 401);
    }

    const authenticatedUser = await verifyAuthToken(token, env);

    if (!authenticatedUser) {
      return jsonResponse({
        success: false,
        error: "Your session is invalid or has expired. Please log in again."
      }, 401);
    }

    const result = await env.DB.prepare(`
      SELECT
        module_id,
        lesson_id,
        completed,
        quiz_score,
        quiz_total,
        created_at,
        updated_at
      FROM progress
      WHERE user_id = ?
      ORDER BY updated_at DESC
    `).bind(authenticatedUser.id).all();

    return jsonResponse({
      success: true,
      progress: result.results || []
    });

  } catch (error) {
    console.error("LOGI my-progress error:", error);

    return jsonResponse({
      success: false,
      error: "Unable to retrieve your progress. Please try again."
    }, 500);
  }
}
