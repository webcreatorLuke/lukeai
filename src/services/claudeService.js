// src/services/claudeService.js
// Handles all communication with the Anthropic Claude API
// Supports both streaming and non-streaming responses

import { CLAUDE_MODEL, CLAUDE_MAX_TOKENS, DEFAULT_SYSTEM_PROMPT } from '@config/constants';
import { decryptApiKey } from '@utils/cryptoUtils';

// ─── Send a message and get a full response ───────────────────────────────────
export async function sendMessage({ messages, systemPrompt, apiKey, uid }) {
  const key = await resolveApiKey(apiKey, uid);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method:  'POST',
    headers: buildHeaders(key),
    body:    JSON.stringify({
      model:      CLAUDE_MODEL,
      max_tokens: CLAUDE_MAX_TOKENS,
      system:     systemPrompt || DEFAULT_SYSTEM_PROMPT,
      messages:   formatMessages(messages),
    }),
  });

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

  let response;
  try {
    response = await fetch('https://api.anthropic.com/v1/messages', {
      method:  'POST',
      headers: buildHeaders(key),
      body:    JSON.stringify({
        model:      CLAUDE_MODEL,
        max_tokens: CLAUDE_MAX_TOKENS,
        system:     systemPrompt || DEFAULT_SYSTEM_PROMPT,
        messages:   formatMessages(messages),
        stream:     true,
      }),
    });
  } catch (err) {
    onError?.(new Error('Network error — check your connection.'));
    return;
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    onError?.(buildApiError(response.status, err));
    return;
  }

  const reader  = response.body.getReader();
  const decoder = new TextDecoder();
  let   buffer  = '';
  let   full    = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep incomplete line

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6).trim();
        if (payload === '[DONE]') break;

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
    onError?.(new Error('Stream interrupted.'));
    return;
  }

  onDone?.(full);
}

// ─── Build conversation message array for the API ────────────────────────────
function formatMessages(messages) {
  return messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role, content: m.content }));
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
  console.log('ENV KEY CHECK:', envKey ? `${envKey.slice(0,12)}...${envKey.slice(-4)} (length ${envKey.length})` : 'MISSING/EMPTY');
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
  if (status === 429)   return new Error('Rate limit reached. Please wait a moment.');
  if (status === 529)   return new Error('Claude is overloaded right now. Try again soon.');
  if (status >= 500)    return new Error('Claude server error. Try again in a moment.');
  return new Error(msg || `API error (${status})`);
}
