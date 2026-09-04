// src/components/chat/FileBlock.jsx
// Renders a downloadable file that Claude wrote directly in its reply via a
// [FILE: name.ext] ... [/FILE] tag. No external API involved — this just turns
// text content into a real Blob the user can save, with an expandable preview.
import React, { useState } from 'react';
import { FileText, Download, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { copyToClipboard } from '@utils/helpers';
import { guessMimeType } from '@utils/messageParser';

const PREVIEW_LINES = 8;

export default function FileBlock({ filename, content }) {
  const [copied,   setCopied]   = useState(false);
  const [expanded, setExpanded] = useState(false);

  const lines = content.split('\n');
  const isLong = lines.length > PREVIEW_LINES;
  const shown = expanded ? content : lines.slice(0, PREVIEW_LINES).join('\n');

  function handleDownload() {
    const blob = new Blob([content], { type: guessMimeType(filename) });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function handleCopy() {
    await copyToClipboard(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="my-2 max-w-md rounded-xl overflow-hidden border border-surface-border">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 py-2 bg-surface-overlay border-b border-surface-border">
        <span className="flex items-center gap-1.5 text-2xs text-text-primary font-mono truncate">
          <FileText size={12} className="shrink-0 text-purple-400" />
          {filename}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-2xs text-text-muted hover:text-text-primary transition-colors"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 text-2xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            <Download size={12} />
            Download
          </button>
        </div>
      </div>

      {/* Preview */}
      <pre className="px-4 py-3 text-xs font-mono text-text-primary bg-[#13131a] overflow-x-auto whitespace-pre-wrap break-words">
        {shown}
      </pre>

      {isLong && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center justify-center gap-1 w-full py-1.5 text-2xs text-text-muted
                     hover:text-text-primary bg-surface-overlay border-t border-surface-border transition-colors"
        >
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {expanded ? 'Show less' : `Show all ${lines.length} lines`}
        </button>
      )}
    </div>
  );
}
