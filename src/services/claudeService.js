  // src/services/claudeService.js
// Handles all communication with the Anthropic Claude API
// Supports both streaming and non-streaming responses

import { CLAUDE_MODEL, CLAUDE_MAX_TOKENS, DEFAULT_SYSTEM_PROMPT } from '@config/constants';
import { decryptApiKey } from '@utils/cryptoUtils';

const REQUEST_TIMEOUT_MS = 30_000;

// ─── Send a message and get a full response ───────────────────────────────────
export async function sendMessage({ messages, systemPrompt, apiKey, uid }) {
  const key = await resolveApiKey(apiKey, uid);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch('https://api.anthropic.com/v1/messages', {
      method:  'POST',
      headers: buildHeaders(key),
      signal:  controller.signal,
      body:    JSON.stringify({
        model:      CLAUDE_MODEL,
        max_tokens: CLAUDE_MAX_TOKENS,
        system:     systemPrompt || DEFAULT_SYSTEM_PROMPT,
        messages:   formatMessages(messages),
      }),
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Check your connection and try again.');
    }
    throw new Error('Network error — check your connection.');
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw buildApiError(response.status, err);
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
}

// ─── Stream a response — calls onChunk(token) for each piece ─────────────────
export async function streamMessage({ messages, systemPrompt, apiKey, uid, onChunk, onDone, onError }) {
  let key;
  try {
    key = await resolveApiKey(apiKey, uid);
  } catch (err) {
    onError?.(err);
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch('https://api.anthropic.com/v1/messages', {
      method:  'POST',
      headers: buildHeaders(key),
      signal:  controller.signal,
      body:    JSON.stringify({
        model:      CLAUDE_MODEL,
        max_tokens: CLAUDE_MAX_TOKENS,
        system:     systemPrompt || DEFAULT_SYSTEM_PROMPT,
        messages:   formatMessages(messages),
        stream:     true,
      }),
    });
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      onError?.(new Error('Request timed out. Check your connection and try again.'));
    } else {
      onError?.(new Error('Network error — check your connection.'));
    }
    return;
  }

  if (!response.ok) {
    clearTimeout(timeout);
    const err = await response.json().catch(() => ({}));
    onError?.(buildApiError(response.status, err));
    return;
  }

  const reader  = response.body.getReader();
  const decoder = new TextDecoder();
  let   buffer  = '';
  let   full    = '';
  let   done_   = false;

  try {
    while (!done_) {
      const { done, value } = await reader.read();
      if (done) break;

      // Any activity resets the timeout — we only want to time out a truly
      // stalled connection, not a long-but-active generation.
      clearTimeout(timeout);
      setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep incomplete line

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6).trim();
        if (payload === '[DONE]') {
          done_ = true;
          break;
        }

        try {
          const evt = JSON.parse(payload);
          if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
            const token = evt.delta.text;
            full += token;
            onChunk?.(token, full);
          }
        } catch {
          // Ignore malformed SSE lines
        }
      }
    }
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      onError?.(new Error('Response stalled — please try again.'));
    } else {
      onError?.(new Error('Stream interrupted.'));
    }
    return;
  }

  clearTimeout(timeout);
  onDone?.(full);
}

// ─── Build conversation message array for the API ────────────────────────────
// Messages with attached images become multi-part content blocks
// (images first, then text), per Anthropic's vision API format.
function formatMessages(messages) {
  return messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => {
      const images = m.images || [];
      if (images.length === 0) {
        return { role: m.role, content: m.content };
      }
      const content = [
        ...images.map((img) => ({
          type:   'image',
          source: { type: 'base64', media_type: img.mediaType, data: img.data },
        })),
        ...(m.content ? [{ type: 'text', text: m.content }] : []),
      ];
      return { role: m.role, content };
    });
}

// ─── Build request headers ────────────────────────────────────────────────────
function buildHeaders(apiKey) {
  return {
    'Content-Type':         'application/json',
    'x-api-key':            apiKey,
    'anthropic-version':    '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true',
  };
}

// ─── Resolve API key (env fallback → user key from Firestore) ────────────────
async function resolveApiKey(encryptedKey, uid) {
  // Dev/demo: use env variable if set
  const envKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!envKey) {
    console.warn('[claudeService] No VITE_ANTHROPIC_API_KEY at build time — falling back to per-user key.');
  }
  if (envKey) return envKey;
  if (!encryptedKey) {
    throw new Error('No API key configured. Add your Anthropic API key in Settings.');
  }
  if (!uid) throw new Error('Must be signed in to use a saved API key.');
  return await decryptApiKey(encryptedKey, uid);
}

// ─── Build a friendly error from Anthropic API responses ─────────────────────
function buildApiError(status, body) {
  const msg = body?.error?.message || '';
  if (status === 401)   return new Error('Invalid API key. Check your key in Settings.');
  if (status === 403)   return new Error('This request was blocked (CORS or permissions). Check your API key\'s allowed origins.');
  if (status === 429)   return new Error('Rate limit reached. Please wait a moment.');
  if (status === 529)   return new Error('Claude is overloaded right now. Try again soon.');
  if (status >= 500)    return new Error('Claude server error. Try again in a moment.');
  return new Error(msg || `API error (${status})`);
}
