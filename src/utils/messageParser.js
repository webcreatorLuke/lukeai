// src/utils/messageParser.js
// Splits an assistant message into renderable segments:
//   - 'text'            plain markdown
//   - 'image-search'    [IMAGE: query]                    → looked up via Google Custom Search
//   - 'image-gen'       [GENERATE_IMAGE: prompt]           → generated via Gemini
//   - 'file'            [FILE: name.ext]...content...[/FILE] → downloadable file block
//
// Tags are matched in a single left-to-right pass so ordering in the reply is preserved.

const TAG_REGEX = new RegExp(
  [
    '\\[IMAGE:\\s*([^\\]]+)\\]',                              // 1: search query
    '\\[GENERATE_IMAGE:\\s*([^\\]]+)\\]',                     // 2: gen prompt
    '\\[FILE:\\s*([^\\]]+)\\]\\n([\\s\\S]*?)\\n\\[\\/FILE\\]', // 3: filename, 4: content
  ].join('|'),
  'gi'
);

export function parseMessageForContent(text) {
  const segments = [];
  let lastIndex = 0;
  let match;

  TAG_REGEX.lastIndex = 0;
  while ((match = TAG_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }

    if (match[1] !== undefined) {
      segments.push({ type: 'image-search', query: match[1].trim() });
    } else if (match[2] !== undefined) {
      segments.push({ type: 'image-gen', prompt: match[2].trim() });
    } else if (match[3] !== undefined) {
      segments.push({
        type:     'file',
        filename: match[3].trim(),
        content:  stripFence(match[4]),
      });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) });
  }

  if (segments.length === 0) {
    segments.push({ type: 'text', content: text });
  }

  return segments;
}

// A [FILE: ...] block's content is often wrapped in a ```lang fence by habit —
// strip it so the downloaded file doesn't contain markdown fence markers.
function stripFence(raw) {
  const trimmed = raw.trim();
  const fenceMatch = /^```[^\n]*\n([\s\S]*?)\n?```$/.exec(trimmed);
  return fenceMatch ? fenceMatch[1] : trimmed;
}

// ─── Guess a mime type from a filename extension, for the download blob ──────
export function guessMimeType(filename) {
  const ext = filename.split('.').pop()?.toLowerCase();
  const map = {
    txt: 'text/plain', md: 'text/markdown', csv: 'text/csv',
    json: 'application/json', js: 'text/javascript', jsx: 'text/javascript',
    ts: 'text/typescript', tsx: 'text/typescript', html: 'text/html',
    css: 'text/css', py: 'text/x-python', xml: 'application/xml',
    yml: 'text/yaml', yaml: 'text/yaml', sh: 'text/x-sh',
  };
  return map[ext] || 'text/plain';
}
