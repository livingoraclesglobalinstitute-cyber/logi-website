import {
  verifyAuthToken,
  jsonResponse
} from "./_auth.js";

export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    const body = await request.json();

    // Accept the existing dashboard's token format temporarily.
    const authHeader = request.headers.get("Authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : null;

    const token = bearerToken || body.token;

    const user = await verifyAuthToken(token, env);

    if (!user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const userId = Number(user.sub);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return jsonResponse({ error: "Invalid user account." }, 401);
    }

    const {
      moduleId,
      lessonId,
      completed,
      quizScore,
      quizTotal
    } = body;

    if (
      typeof moduleId !== "string" ||
      !moduleId.trim() ||
      moduleId.length > 150 ||
      typeof lessonId !== "string" ||
      !lessonId.trim() ||
      lessonId.length > 150
    ) {
      return jsonResponse({
        error: "Valid module and lesson IDs are required."
      }, 400);
    }

    if (
      ![true, false, 0, 1].includes(completed)
    ) {
      return jsonResponse({
        error: "Invalid completion status."
      }, 400);
    }

    const score = quizScore ?? null;
    const total = quizTotal ?? null;

    if (
      (score === null) !== (total === null) ||
      (score !== null && (
        !Number.isInteger(score) ||
        !Number.isInteger(total) ||
        score < 0 ||
        total <= 0 ||
        score > total
      ))
    ) {
      return jsonResponse({
        error: "Invalid quiz score."
      }, 400);
    }

    const now = new Date().toISOString();

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
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)

      ON CONFLICT(user_id, module_id, lesson_id)
      DO UPDATE SET
        completed = excluded.completed,
        quiz_score = excluded.quiz_score,
        quiz_total = excluded.quiz_total,
        updated_at = excluded.updated_at
    `).bind(
      userId,
      moduleId.trim(),
      lessonId.trim(),
      completed ? 1 : 0,
      score,
      total,
      now,
      now
    ).run();

    return jsonResponse({ success: true });

  } catch (error) {
    console.error("Progress save error:", error);

    return jsonResponse({
      error: "Could not save student progress."
    }, 500);
  }
}
