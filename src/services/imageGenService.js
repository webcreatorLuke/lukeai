// src/services/imageGenService.js
// Generates real AI images (not search results) using Google's Gemini image
// generation model ("Nano Banana"). Returns a base64 data URL Claude never sees
// or produces itself — Claude's own API has no image-generation capability, so
// this is a separate call triggered when Claude emits a [GENERATE_IMAGE: ...] tag.

import { GEMINI_IMAGE_MODEL } from '@config/constants';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// ─── Generate an image from a text prompt ─────────────────────────────────────
// Returns { dataUrl, mimeType } on success, or null on failure.
export async function generateImage(prompt) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('[imageGenService] Missing VITE_GEMINI_API_KEY.');
    return { error: 'No Gemini API key configured. Add VITE_GEMINI_API_KEY in Settings.' };
  }

  const url = `${GEMINI_API_BASE}/${GEMINI_IMAGE_MODEL}:generateContent`;

  try {
    const response = await fetch(url, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const msg = body?.error?.message || `Image generation failed (${response.status})`;
      console.warn('[imageGenService] Gemini request failed:', msg);
      return { error: msg };
    }

    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p) => p.inlineData?.data);

    if (!imagePart) {
      return { error: 'The model did not return an image for that prompt.' };
    }

    const mimeType = imagePart.inlineData.mimeType || 'image/png';
    const dataUrl  = `data:${mimeType};base64,${imagePart.inlineData.data}`;

    return { dataUrl, mimeType };
  } catch (err) {
    console.warn('[imageGenService] Error generating image:', err);
    return { error: 'Network error while generating image.' };
  }
}
