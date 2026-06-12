// src/services/imageSearchService.js
// Fetches images from Google Custom Search (Image Search) based on a search query

const GOOGLE_SEARCH_API_URL = 'https://www.googleapis.com/customsearch/v1';

export async function searchImage(query) {
  const apiKey = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY;
  const cx      = import.meta.env.VITE_GOOGLE_SEARCH_CX;

  if (!apiKey || !cx) {
    console.warn('[imageSearchService] Missing VITE_GOOGLE_SEARCH_API_KEY or VITE_GOOGLE_SEARCH_CX.');
    return null;
  }

  try {
    const params = new URLSearchParams({
      key:        apiKey,
      cx,
      q:          query,
      searchType: 'image',
      num:        '1',
      safe:       'active',
    });

    const url = `${GOOGLE_SEARCH_API_URL}?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.warn('[imageSearchService] Google Custom Search request failed:', response.status);
      return null;
    }

    const data = await response.json();
    const result = data.items?.[0];
    if (!result) return null;

    return {
      url:         result.link,
      thumbUrl:    result.image?.thumbnailLink || result.link,
      alt:         result.title || query,
      credit:      result.displayLink || 'Google Images',
      creditUrl:   result.image?.contextLink || result.link,
      unsplashUrl: result.image?.contextLink || result.link, // kept for compatibility with ChatImage
    };
  } catch (err) {
    console.warn('[imageSearchService] Error fetching image:', err);
    return null;
  }
}

// ─── Parse a message for [IMAGE: query] tags ──────────────────────────────────
// Returns an array of { type: 'text' | 'image', content } segments
export function parseMessageForImages(text) {
  const regex = /\[IMAGE:\s*([^\]]+)\]/gi;
  const segments = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: 'image', content: match[1].trim() });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) });
  }

  // If no image tags were found, return the whole text as one segment
  if (segments.length === 0) {
    segments.push({ type: 'text', content: text });
  }

  return segments;
}
