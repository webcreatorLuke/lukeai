// src/components/chat/ChatImage.jsx
// Fetches and displays an image from Google Custom Search based on a search query
import React, { useEffect, useState } from 'react';
import { ImageOff, Loader2 } from 'lucide-react';
import { searchImage } from '@services/imageSearchService';

export default function ChatImage({ query }) {
  const [image,   setImage]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed,  setFailed]  = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setFailed(false);
      const result = await searchImage(query);
      if (cancelled) return;
      if (result) {
        setImage(result);
      } else {
        setFailed(true);
      }
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [query]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 h-48 w-full max-w-md
                      bg-surface-overlay border border-surface-border rounded-xl my-2
                      text-text-muted text-sm">
        <Loader2 size={16} className="animate-spin" />
        Finding an image for "{query}"…
      </div>
    );
  }

  if (failed || !image) {
    return (
      <div className="flex items-center justify-center gap-2 h-24 w-full max-w-md
                      bg-surface-overlay border border-surface-border rounded-xl my-2
                      text-text-muted text-sm">
        <ImageOff size={16} />
        Couldn't find an image for "{query}"
      </div>
    );
  }

  return (
    <figure className="my-2 max-w-md">
      <a href={image.creditUrl} target="_blank" rel="noopener noreferrer">
        <img
          src={image.url}
          alt={image.alt}
          loading="lazy"
          className="rounded-xl border border-surface-border w-full object-cover"
          onError={(e) => { e.currentTarget.src = image.thumbUrl; }}
        />
      </a>
      <figcaption className="text-2xs text-text-muted mt-1">
        Source:{' '}
        <a href={image.creditUrl} target="_blank" rel="noopener noreferrer"
           className="text-purple-400 hover:text-purple-300">
          {image.credit}
        </a>
      </figcaption>
    </figure>
  );
}
