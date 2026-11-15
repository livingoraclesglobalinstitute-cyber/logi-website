import {
  verifyAuthToken,
  jsonResponse
} from "./_auth.js";

export async function onRequestPost({ request, env }) {
  try {
    if (!env.DB) {
      throw new Error("Database binding DB is missing.");
    }

    const body = await request.json();

    // Accept a token from the Authorization header
    // or the existing dashboard's request body.
    const authHeader = request.headers.get("Authorization") || "";
    const bearerToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : "";

    const token = bearerToken || String(body.token || "");

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

    const moduleId = String(body.moduleId || body.module_id || "").trim();
    const lessonId = String(body.lessonId || body.lesson_id || "").trim();

    const completed =
      body.completed === true ||
      body.completed === 1 ||
      body.completed === "1" ? 1 : 0;

    const quizScore = Number(body.quizScore ?? body.quiz_score ?? 0);
    const quizTotal = Number(body.quizTotal ?? body.quiz_total ?? 0);

    if (!moduleId || !lessonId) {
      return jsonResponse({
        success: false,
        error: "Module ID and lesson ID are required."
      }, 400);
    }

    if (moduleId.length > 150 || lessonId.length > 150) {
      return jsonResponse({
        success: false,
        error: "Module ID or lesson ID is too long."
      }, 400);
    }

    if (
      !Number.isInteger(quizScore) ||
      !Number.isInteger(quizTotal) ||
      quizScore < 0 ||
      quizTotal < 0 ||
      quizScore > quizTotal
    ) {
      return jsonResponse({
        success: false,
        error: "Invalid quiz score."
      }, 400);
    }

    await env.DB.prepare(`
      INSERT INTO progress (
        user_id,
        module_id,
        lesson_id,
        completed,
        quiz_score,
        quiz_total,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)

      ON CONFLICT(user_id, module_id, lesson_id)
      DO UPDATE SET
        completed = excluded.completed,
        quiz_score = excluded.quiz_score,
        quiz_total = excluded.quiz_total,
        updated_at = CURRENT_TIMESTAMP
    `).bind(
      authenticatedUser.id,
      moduleId,
      lessonId,
      completed,
      quizScore,
      quizTotal
    ).run();

    return jsonResponse({
      success: true,
      message: "Progress saved successfully."
    });

  } catch (error) {
    console.error("LOGI progress error:", error);

    return jsonResponse({
      success: false,
      error: "Unable to save progress. Please try again."
    }, 500);
  }
}
