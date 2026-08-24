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

  // ─── Send a user message (with optional images) and stream Claude's reply ──
  // images: [{ mediaType, data, dataUrl, name }] — from utils/imageUtils.js
  async sendMessage({ content, images = [], userId, userData }) {
    const { activeConvId, messages } = get();
    if (!content.trim() && images.length === 0) return;

    try {
      if (!userId) {
        throw new Error('You need to be signed in to send messages.');
      }

      // Create conversation if needed
      let convId = activeConvId;
      if (!convId) {
        convId = await conversationService.create(userId, content || 'Image');
        set((s) => ({
          activeConvId: convId,
          conversations: [
            {
              id:        convId,
              title:     (content || 'Image').slice(0, 50),
              updatedAt: new Date(),
              pinned:    false,
            },
            ...s.conversations,
          ],
        }));
      }

      // Strip dataUrl before persisting/sending — only mediaType + data needed
      const imagePayload = images.map(({ mediaType, data }) => ({ mediaType, data }));

      // Optimistic user message (keep dataUrl locally for instant preview)
      const userMsg = {
        id:        generateMessageId(),
        convId,
        role:      'user',
        content,
        images:    images.map(({ mediaType, data, dataUrl }) => ({ mediaType, data, dataUrl })),
        createdAt: new Date(),
      };
      set((s) => ({ messages: [...s.messages, userMsg], error: null }));

      // Persist user message (images stored as base64 on the doc)
      await messageService.add(convId, { role: 'user', content, images: imagePayload });

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

      // Build message history for Claude (include images per message)
      const history = [...messages, userMsg].map((m) => ({
        role:    m.role,
        content: m.content,
        images:  m.images || [],
      }));

      await streamMessage({
        messages:     history,
        systemPrompt: userData?.settings?.systemPrompt || '',
        apiKey:       userData?.settings?.apiKey || '',
        uid:          userId,
        onChunk(token, full) {
          set((s) => ({
            messages: s.messages.map((m) =>
              m.id === placeholderId ? { ...m, content: full } : m
            ),
            streamingText: full,
          }));
        },
        async onDone(full) {
          try {
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
          } catch (e) {
            set({ streaming: false, streamingText: '', error: e.message });
          }
        },
        onError(err) {
          set((s) => ({
            streaming:     false,
            streamingText: '',
            error:         err.message || 'Something went wrong talking to Claude.',
            messages:      s.messages.filter((m) => m.id !== placeholderId),
          }));
        },
      });
    } catch (e) {
      set({
        streaming:     false,
        streamingText: '',
        loading:       false,
        error:         e.message || 'Something went wrong sending your message.',
      });
    }
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
