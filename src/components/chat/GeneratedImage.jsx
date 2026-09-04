// src/components/chat/GeneratedImage.jsx
// Generates a real AI image (via Gemini) from a prompt and displays it,
// with a download button since these are one-off generated assets.
import React, { useEffect, useState } from 'react';
import { ImageOff, Loader2, Download, Sparkles } from 'lucide-react';
import { generateImage } from '@services/imageGenService';

export default function GeneratedImage({ prompt }) {
  const [image,   setImage]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      const result = await generateImage(prompt);
      if (cancelled) return;
      if (result?.dataUrl) {
        setImage(result);
      } else {
        setError(result?.error || 'Could not generate image.');
      }
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [prompt]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 h-48 w-full max-w-md
                      bg-surface-overlay border border-surface-border rounded-xl my-2
                      text-text-muted text-sm">
        <Loader2 size={16} className="animate-spin" />
        Generating "{prompt}"…
      </div>
    );
  }

  if (error || !image) {
    return (
      <div className="flex items-center gap-2 h-auto py-3 px-4 w-full max-w-md
                      bg-surface-overlay border border-surface-border rounded-xl my-2
                      text-text-muted text-sm">
        <ImageOff size={16} className="shrink-0" />
        <span>{error || `Couldn't generate an image for "${prompt}"`}</span>
      </div>
    );
  }

  const filename = `${prompt.replace(/[^a-z0-9]+/gi, '-').toLowerCase().slice(0, 40) || 'generated-image'}.png`;

  return (
    <figure className="my-2 max-w-md">
      <img
        src={image.dataUrl}
        alt={prompt}
        className="rounded-xl border border-surface-border w-full object-cover"
      />
      <figcaption className="flex items-center justify-between gap-2 text-2xs text-text-muted mt-1">
        <span className="flex items-center gap-1 truncate">
          <Sparkles size={10} className="shrink-0" />
          AI-generated: {prompt}
        </span>
        <a
          href={image.dataUrl}
          download={filename}
          className="flex items-center gap-1 shrink-0 text-purple-400 hover:text-purple-300"
        >
          <Download size={12} />
          Save
        </a>
      </figcaption>
    </figure>
  );
}
