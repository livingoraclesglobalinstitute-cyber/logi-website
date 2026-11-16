import { onRequestPost as login } from "./login.js";
import { onRequestPost as register } from "./register.js";
import { onRequestGet as getProgress } from "./my-progress.js";
import { onRequestPost as saveProgress } from "./progress.js";
import { onRequest as hello } from "./hello.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Handle CORS (Crucial for frontend to connect)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        }
      });
    }

    try {
      if (url.pathname === "/hello" && request.method === "GET") {
        return await hello({ request, env });
      }
      if (url.pathname === "/login" && request.method === "POST") {
        return await login({ request, env });
      }
      if (url.pathname === "/register" && request.method === "POST") {
        return await register({ request, env });
      }
      if (url.pathname === "/my-progress" && request.method === "GET") {
        return await getProgress({ request, env });
      }
      if (url.pathname === "/progress" && request.method === "POST") {
        return await saveProgress({ request, env });
      }

      return new Response("LOGI API is running. Try /hello", { 
        status: 404,
        headers: { "Access-Control-Allow-Origin": "*" }
      });

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*" 
        }
      });
    }
  }
};
