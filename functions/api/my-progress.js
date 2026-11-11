export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    
    // Get token from the URL query string
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // Decode token to get user ID
    const user = JSON.parse(atob(token));
    
    // Fetch progress from D1
    const { results } = await env.DB.prepare(
      "SELECT module_id, lesson_id, completed, quiz_score, quiz_total FROM progress WHERE user_id = ?"
    ).bind(user.id).all();

    return new Response(JSON.stringify({ success: true, progress: results }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
