// cloudflare-worker/image-proxy.js
//
// Free image generation proxy for LukeAI, using Cloudflare Workers AI's
// flux-1-schnell model — no OpenAI account, no billing, and no separate API
// key needed. Cloudflare's free tier covers roughly 100+ images/day for a
// personal project. This exists because browsers can't call most AI image
// APIs directly (CORS), so this Worker runs server-side and the frontend
// calls it instead.
//
// Deploy: paste this file's contents into a new Cloudflare Worker, then bind
// Workers AI to it (Settings → Bindings → Add → Workers AI → variable name "AI").
// No secrets needed — the AI binding itself is the authentication.

export default {
  async fetch(request, env) {
    // Handle the browser's CORS preflight request
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    let prompt;
    try {
      const body = await request.json();
      prompt = body?.prompt;
    } catch {
      return jsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    if (!prompt || typeof prompt !== 'string') {
      return jsonResponse({ error: 'Missing "prompt" in request body' }, 400);
    }

    try {
      const result = await env.AI.run('@cf/black-forest-labs/flux-1-schnell', {
        prompt,
      });

      if (!result?.image) {
        return jsonResponse({ error: 'Model did not return image data' }, 502);
      }

      return jsonResponse({ b64_json: result.image });
    } catch (err) {
      return jsonResponse({ error: `Image generation failed: ${err.message}` }, 500);
    }
  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────
function corsHeaders() {
  return {
    // Tighten this to your actual site (e.g. 'https://webcreatorluke.github.io')
    // once everything works, instead of leaving it open to any origin.
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}
