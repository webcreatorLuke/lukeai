// src/store/chatStore.js
import { create } from 'zustand';
import { conversationService } from '@services/conversationService';
import { messageService } from '@services/messageService';
import { streamMessage } from '@services/claudeService';
import { generateMessageId } from '@utils/idGenerator';

export const useChatStore = create((set, get) => ({
  conversations: [],
  activeConvId:  null,
  messages:      [],
  loading:       false,
  streaming:     false,
  streamingText: '',
  error:         null,

  // ─── Load all conversations for user ─────────────────────────────────
  async loadConversations(userId) {
    set({ loading: true });
    try {
      const convs = await conversationService.list(userId);
      set({ conversations: convs, loading: false });
    } catch (e) {
      set({ error: e.message, loading: false });
    }
  },

  // ─── Subscribe to real-time conversation updates ──────────────────────
  subscribeConversations(userId) {
    return conversationService.subscribe(userId, (convs) => {
      set({ conversations: convs });
    });
  },

  // ─── Open a conversation and load its messages ────────────────────────
  async openConversation(convId) {
    set({ activeConvId: convId, loading: true, messages: [] });
    try {
      const msgs = await messageService.list(convId);
      set({ messages: msgs, loading: false });
    } catch (e) {
      set({ error: e.message, loading: false });
    }
  },

  // ─── Send a user message and stream Claude's reply ───────────────────
  async sendMessage({ content, userId, userData }) {
    const { activeConvId, messages } = get();
    if (!content.trim()) return;

    // Create conversation if needed
    let convId = activeConvId;
    if (!convId) {
      convId = await conversationService.create(userId, content);
      set((s) => ({
        activeConvId: convId,
        conversations: [
          {
            id:        convId,
            title:     content.slice(0, 50),
            updatedAt: new Date(),
            pinned:    false,
          },
          ...s.conversations,
        ],
      }));
    }

    // Optimistic user message
    const userMsg = {
      id:        generateMessageId(),
      convId,
      role:      'user',
      content,
      createdAt: new Date(),
    };
    set((s) => ({ messages: [...s.messages, userMsg] }));

    // Persist user message
    await messageService.add(convId, { role: 'user', content });

    // Placeholder for streaming assistant message
    const placeholderId = generateMessageId();
    const placeholder   = {
      id:          placeholderId,
      convId,
      role:        'assistant',
      content:     '',
      isStreaming: true,
      createdAt:   new Date(),
    };
    set((s) => ({ messages: [...s.messages, placeholder], streaming: true, streamingText: '' }));

    // Build message history for Claude
    const history = [...messages, userMsg].map((m) => ({
      role:    m.role,
      content: m.content,
    }));

    let fullText = '';

    await streamMessage({
      messages:     history,
      systemPrompt: userData?.settings?.systemPrompt || '',
      apiKey:       userData?.settings?.apiKey || '',
      uid:          userId,
      onChunk(token, full) {
        fullText = full;
        set((s) => ({
          messages: s.messages.map((m) =>
            m.id === placeholderId ? { ...m, content: full } : m
          ),
          streamingText: full,
        }));
      },
      async onDone(full) {
        // Replace placeholder with final message
        const savedId = await messageService.add(convId, {
          role:    'assistant',
          content: full,
        });
        set((s) => ({
          streaming:     false,
          streamingText: '',
          messages:      s.messages.map((m) =>
            m.id === placeholderId
              ? { ...m, id: savedId, content: full, isStreaming: false }
              : m
          ),
        }));
        await conversationService.touch(convId, { role: 'assistant', content: full });
      },
      onError(err) {
        set((s) => ({
          streaming:     false,
          streamingText: '',
          error:         err.message,
          messages:      s.messages.filter((m) => m.id !== placeholderId),
        }));
      },
    });
  },

  // ─── Delete a conversation ────────────────────────────────────────────
  async deleteConversation(convId) {
    await conversationService.delete(convId);
    set((s) => ({
      conversations: s.conversations.filter((c) => c.id !== convId),
      activeConvId:  s.activeConvId === convId ? null : s.activeConvId,
      messages:      s.activeConvId === convId ? [] : s.messages,
    }));
  },

  newConversation() {
    set({ activeConvId: null, messages: [], error: null });
  },

  clearError() {
    set({ error: null });
  },
}));
