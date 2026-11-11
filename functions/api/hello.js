export async function onRequest(context) {
  const { env } = context;
  try {
    // Test the D1 database binding
    const result = await env.DB.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    return new Response(JSON.stringify({ success: true, tables: result.results }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response("DB error: " + e.message, { status: 500 });
  }
}
