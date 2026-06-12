// src/components/chat/MessageInput.jsx
import React, { useState, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Send, Loader2 } from 'lucide-react';
import { useUiStore } from '@store/uiStore';
import { cn } from '@utils/helpers';

export default function MessageInput({ onSend, disabled = false, autoFocus = false }) {
  const [value,   setValue]   = useState('');
  const { sendOnEnter }       = useUiStore();
  const textareaRef           = useRef(null);

  async function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    setValue('');
    await onSend(trimmed);
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

  return (
    <div className={cn(
      'flex items-end gap-2 bg-surface-raised border border-surface-border rounded-2xl px-4 py-3',
      'focus-within:border-neon-purple/50 focus-within:shadow-glow-sm transition-all duration-200',
      disabled && 'opacity-70'
    )}>
      <TextareaAutosize
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
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
        disabled={!value.trim() || disabled}
        className={cn(
          'btn p-2 rounded-xl transition-all duration-200 shrink-0',
          value.trim() && !disabled
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
  );
}
