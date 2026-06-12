// src/components/layout/Sidebar.jsx
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, MessageSquare, Pin, Trash2, Search,
  Settings, LogOut, ChevronDown,
} from 'lucide-react';
import { useChat } from '@hooks/useChat';
import { useAuth } from '@hooks/useAuth';
import { signOutUser } from '@services/authService';
import { formatTimestamp, truncate, cn } from '@utils/helpers';
import Avatar from '@components/ui/Avatar';
import toast  from 'react-hot-toast';

export default function Sidebar() {
  const navigate                  = useNavigate();
  const { id: activeId }          = useParams();
  const { conversations, newConversation, openConversation, deleteConversation } = useChat();
  const { user, userData }        = useAuth();
  const [search, setSearch]       = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const filtered = conversations.filter((c) =>
    c.title?.toLowerCase().includes(search.toLowerCase())
  );

  const pinned   = filtered.filter((c) => c.pinned);
  const recent   = filtered.filter((c) => !c.pinned);

  async function handleNew() {
    newConversation();
    navigate('/chat');
  }

  async function handleOpen(convId) {
    await openConversation(convId);
    navigate(`/chat/${convId}`);
  }

  async function handleDelete(e, convId) {
    e.stopPropagation();
    setDeletingId(convId);
    try {
      await deleteConversation(convId);
      if (activeId === convId) navigate('/chat');
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSignOut() {
    try {
      await signOutUser();
      navigate('/');
    } catch {
      toast.error('Sign out failed');
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-surface-border">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500
                        flex items-center justify-center text-white font-display font-bold text-sm shadow-glow-sm">
          L
        </div>
        <span className="font-display font-semibold text-text-primary text-lg">LukeAI</span>
        <div className="ml-auto badge badge-purple">Beta</div>
      </div>

      {/* New chat */}
      <div className="px-3 pt-3">
        <button onClick={handleNew} className="btn-primary w-full text-sm">
          <Plus size={16} /> New chat
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pt-2">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats…"
            className="input pl-8 py-2 text-xs"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {pinned.length > 0 && (
          <>
            <p className="text-2xs text-text-muted uppercase tracking-widest px-2 py-1">Pinned</p>
            {pinned.map((c) => (
              <ConvItem key={c.id} conv={c} active={activeId === c.id}
                onOpen={handleOpen} onDelete={handleDelete} deleting={deletingId === c.id} />
            ))}
            <div className="h-px bg-surface-border my-1" />
          </>
        )}

        {recent.length === 0 && !search && (
          <div className="text-center py-12 text-text-muted text-sm">
            <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
            <p>No chats yet</p>
            <p className="text-xs mt-1">Start a new conversation above</p>
          </div>
        )}

        {recent.map((c) => (
          <ConvItem key={c.id} conv={c} active={activeId === c.id}
            onOpen={handleOpen} onDelete={handleDelete} deleting={deletingId === c.id} />
        ))}
      </div>

      {/* User footer */}
      <div className="border-t border-surface-border p-3">
        <div className="flex items-center gap-3">
          <Avatar user={user} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              {user?.displayName || 'User'}
            </p>
            <p className="text-2xs text-text-muted truncate">{userData?.lukeId}</p>
          </div>
          <div className="flex gap-1">
            <button onClick={() => navigate('/settings')} className="btn-ghost p-2 rounded-lg">
              <Settings size={15} />
            </button>
            <button onClick={handleSignOut} className="btn-ghost p-2 rounded-lg text-red-400 hover:text-red-300">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConvItem({ conv, active, onOpen, onDelete, deleting }) {
  return (
    <motion.div
      layout
      onClick={() => onOpen(conv.id)}
      className={cn(
        'group flex items-start gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150',
        active
          ? 'bg-neon-purple/20 border border-neon-purple/30 text-text-primary'
          : 'text-text-secondary hover:bg-surface-raised hover:text-text-primary'
      )}
    >
      <MessageSquare size={14} className="mt-0.5 shrink-0 opacity-60" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{conv.title || 'Untitled'}</p>
        {conv.lastMessage && (
          <p className="text-2xs text-text-muted truncate mt-0.5">
            {truncate(conv.lastMessage.content, 40)}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {conv.pinned && <Pin size={11} className="text-amber-400" />}
        <button
          onClick={(e) => onDelete(e, conv.id)}
          disabled={deleting}
          className="p-1 rounded hover:text-red-400 transition-colors"
        >
          <Trash2 size={12} />
        </button>
      </div>
      {conv.updatedAt && (
        <span className="text-2xs text-text-muted shrink-0 mt-0.5">
          {formatTimestamp(conv.updatedAt)}
        </span>
      )}
    </motion.div>
  );
}
