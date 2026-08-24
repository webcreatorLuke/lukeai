// src/hooks/useChat.js
import { useEffect } from 'react';
import { useChatStore } from '@store/chatStore';
import { useAuthStore } from '@store/authStore';

export function useChat() {
  const store    = useChatStore();
  const authStore = useAuthStore();

  useEffect(() => {
    const userId = authStore.user?.uid;
    if (!userId) return;
    const unsub = store.subscribeConversations(userId);
    return () => unsub?.();
  }, [authStore.user?.uid]);

  return {
    conversations:  store.conversations,
    activeConvId:   store.activeConvId,
    messages:       store.messages,
    loading:        store.loading,
    streaming:      store.streaming,
    error:          store.error,
    openConversation: store.openConversation,
    sendMessage:    (content, images = []) =>
      store.sendMessage({
        content,
        images,
        userId:   authStore.user?.uid,
        userData: authStore.userData,
      }),
    deleteConversation: store.deleteConversation,
    newConversation:    store.newConversation,
    clearError:         store.clearError,
  };
}
