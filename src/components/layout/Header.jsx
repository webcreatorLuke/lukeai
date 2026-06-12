// src/components/layout/Header.jsx
import React from 'react';
import { PanelLeft, Sparkles } from 'lucide-react';
import { useUiStore } from '@store/uiStore';
import { useChat }   from '@hooks/useChat';
import { useChatStore } from '@store/chatStore';
import InstallButton from '@components/ui/InstallButton';

export default function Header() {
  const { toggleSidebar } = useUiStore();
  const { activeConvId }  = useChat();
  const conversations     = useChatStore((s) => s.conversations);
  const activeConv        = conversations.find((c) => c.id === activeConvId);

  return (
    <header className="h-14 border-b border-surface-border bg-surface/80 backdrop-blur-sm
                       flex items-center px-4 gap-3 shrink-0 z-10">
      <button
        onClick={toggleSidebar}
        className="btn-ghost p-2 rounded-lg"
        aria-label="Toggle sidebar"
      >
        <PanelLeft size={18} />
      </button>
      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-medium text-text-primary truncate">
          {activeConv?.title || (
            <span className="flex items-center gap-2 text-text-muted">
              <Sparkles size={14} className="text-neon-purple" />
              LukeAI — powered by Claude
            </span>
          )}
        </h1>
      </div>
      <InstallButton />
    </header>
  );
}
