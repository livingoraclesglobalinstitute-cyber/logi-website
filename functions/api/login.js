// functions/api/login.js
export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email and password required" }), { status: 400 });
    }

    // Hash the input password to match the database
    const msgBuffer = new TextEncoder().encode(password + "LOGI_SECRET_SALT");
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Check D1 Database
    const user = await env.DB.prepare(
      "SELECT id, email FROM users WHERE email = ? AND password_hash = ?"
    ).bind(email.toLowerCase(), passwordHash).first();

    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid email or password" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

    // In a production app, use JWT. For this setup, we'll send a simple token.
    const token = btoa(JSON.stringify({ id: user.id, email: user.email }));

    return new Response(JSON.stringify({ success: true, token: token, email: user.email }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
