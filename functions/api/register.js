// functions/api/register.js
export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { email, password, fullName } = await request.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email and password required" }), { status: 400 });
    }

    // Hash the password using Web Crypto API (SHA-256 with salt)
    const msgBuffer = new TextEncoder().encode(password + "LOGI_SECRET_SALT");
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Insert into D1 Database
    await env.DB.prepare(
      "INSERT INTO users (email, password_hash) VALUES (?, ?)"
    ).bind(email.toLowerCase(), passwordHash).run();

    return new Response(JSON.stringify({ success: true, message: "User created" }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    if (e.message.includes("UNIQUE constraint failed")) {
      return new Response(JSON.stringify({ error: "Email already exists" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
