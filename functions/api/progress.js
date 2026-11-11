// functions/api/progress.js
export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { token, moduleId, lessonId, completed, quizScore, quizTotal } = await request.json();

    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // Decode token to get user ID
    const user = JSON.parse(atob(token));
    const userId = user.id;

    // Save or update progress in D1
    await env.DB.prepare(`
      INSERT INTO progress (user_id, module_id, lesson_id, completed, quiz_score, quiz_total)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, module_id, lesson_id) 
      DO UPDATE SET completed=excluded.completed, quiz_score=excluded.quiz_score, quiz_total=excluded.quiz_total
    `).bind(userId, moduleId, lessonId, completed ? 1 : 0, quizScore, quizTotal).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
