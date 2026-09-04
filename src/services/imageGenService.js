// src/services/imageGenService.js
// Generates real AI images (not search results) using OpenAI's image model
// (gpt-image-1). Claude's own API has no image-generation capability, so this
// is a separate call triggered when Claude emits a [GENERATE_IMAGE: ...] tag.
//
// OpenAI's API does not allow direct calls from a browser (no CORS support),
// so requests are routed through a small Cloudflare Worker proxy that holds
// the real OpenAI key server-side and forwards the prompt. See
// cloudflare-worker/image-proxy.js in this repo for that proxy's source.

const PROXY_URL = import.meta.env.VITE_IMAGE_GEN_PROXY_URL;

// ─── Generate an image from a text prompt ─────────────────────────────────────
// Returns { dataUrl, mimeType } on success, or { error } on failure.
export async function generateImage(prompt) {
  if (!PROXY_URL) {
    console.warn('[imageGenService] Missing VITE_IMAGE_GEN_PROXY_URL.');
    return { error: 'No image generation proxy configured. Add VITE_IMAGE_GEN_PROXY_URL in Settings.' };
  }

  try {
    const response = await fetch(PROXY_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ prompt }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const msg = data?.error || `Image generation failed (${response.status})`;
      console.warn('[imageGenService] Proxy request failed:', msg);
      return { error: msg };
    }

    if (!data?.b64_json) {
      return { error: 'The model did not return an image for that prompt.' };
    }

    const dataUrl = `data:image/jpeg;base64,${data.b64_json}`;
    return { dataUrl, mimeType: 'image/jpeg' };
  } catch (err) {
    console.warn('[imageGenService] Error generating image:', err);
    return { error: 'Network error while generating image.' };
  }
}
