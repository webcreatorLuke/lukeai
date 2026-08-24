// src/components/chat/MessageInput.jsx
import React, { useState, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Send, Loader2, ImagePlus, X } from 'lucide-react';
import { useUiStore } from '@store/uiStore';
import { cn } from '@utils/helpers';
import { fileToResizedImage, MAX_IMAGES_PER_MESSAGE } from '@utils/imageUtils';

export default function MessageInput({ onSend, disabled = false, autoFocus = false }) {
  const [value,   setValue]   = useState('');
  const [images,  setImages]  = useState([]); // { mediaType, data, dataUrl, name }
  const [imgError, setImgError] = useState('');
  const { sendOnEnter }       = useUiStore();
  const textareaRef           = useRef(null);
  const fileInputRef          = useRef(null);

  async function handleFiles(fileList) {
    setImgError('');
    const files = Array.from(fileList || []);
    if (!files.length) return;

    if (images.length + files.length > MAX_IMAGES_PER_MESSAGE) {
      setImgError(`Up to ${MAX_IMAGES_PER_MESSAGE} images per message.`);
      return;
    }

    for (const file of files) {
      try {
        const img = await fileToResizedImage(file);
        setImages((prev) => [...prev, img]);
      } catch (e) {
        setImgError(e.message);
      }
    }
  }

  function removeImage(i) {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSend() {
    const trimmed = value.trim();
    if ((!trimmed && images.length === 0) || disabled) return;
    const pendingImages = images;
    setValue('');
    setImages([]);
    setImgError('');
    await onSend(trimmed, pendingImages);
    textareaRef.current?.focus();
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      if (sendOnEnter && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      } else if (!sendOnEnter && e.ctrlKey) {
        e.preventDefault();
        handleSend();
      }
    }
  }

  const canSend = (value.trim() || images.length > 0) && !disabled;

  return (
    <div className="flex flex-col gap-2">
      {/* Image previews */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 px-1">
          {images.map((img, i) => (
            <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-surface-border group">
              <img src={img.dataUrl} alt={img.name} className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(i)}
                className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5
                           opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <X size={12} className="text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {imgError && (
        <p className="text-2xs text-red-400 px-1">{imgError}</p>
      )}

      <div className={cn(
        'flex items-end gap-2 bg-surface-raised border border-surface-border rounded-2xl px-4 py-3',
        'focus-within:border-neon-purple/50 focus-within:shadow-glow-sm transition-all duration-200',
        disabled && 'opacity-70'
      )}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          hidden
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = ''; // allow re-selecting the same file
          }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || images.length >= MAX_IMAGES_PER_MESSAGE}
          className="btn p-2 rounded-xl shrink-0 text-text-muted hover:text-text-primary
                     hover:bg-surface-overlay transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Attach image"
        >
          <ImagePlus size={18} />
        </button>

        <TextareaAutosize
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={(e) => {
            const files = Array.from(e.clipboardData?.files || []);
            if (files.length) handleFiles(files);
          }}
          placeholder="Message LukeAI…"
          disabled={disabled}
          autoFocus={autoFocus}
          minRows={1}
          maxRows={8}
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted
                     resize-none outline-none font-body leading-relaxed"
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={cn(
            'btn p-2 rounded-xl transition-all duration-200 shrink-0',
            canSend
              ? 'bg-neon-purple text-white shadow-glow-sm hover:shadow-glow-md'
              : 'bg-surface-overlay text-text-muted cursor-not-allowed'
          )}
          aria-label="Send message"
        >
          {disabled
            ? <Loader2 size={16} className="animate-spin" />
            : <Send size={16} />
          }
        </button>
      </div>
    </div>
  );
}
