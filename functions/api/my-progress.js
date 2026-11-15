import {
  verifyAuthToken,
  jsonResponse
} from "./_auth.js";

export async function onRequestGet(context) {
  try {
    const { request, env } = context;

    const authHeader = request.headers.get("Authorization");

    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : null;

    // Temporary compatibility with the current dashboard.
    const url = new URL(request.url);
    const oldQueryToken = url.searchParams.get("token");

    const token = bearerToken || oldQueryToken;

    const user = await verifyAuthToken(token, env);

    if (!user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const userId = Number(user.sub);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return jsonResponse({ error: "Invalid user account." }, 401);
    }

    const { results } = await env.DB.prepare(`
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
      ORDER BY module_id, lesson_id
    `).bind(userId).all();

    return jsonResponse({
      success: true,
      progress: results
    });

  } catch (error) {
    console.error("Progress retrieval error:", error);

    return jsonResponse({
      error: "Could not retrieve student progress."
    }, 500);
  }
}
