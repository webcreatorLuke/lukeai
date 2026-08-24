// src/pages/ChatPage.jsx
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useChat }             from '@hooks/useChat';
import { useScrollToBottom }   from '@hooks/useScrollToBottom';
import MessageBubble           from '@components/chat/MessageBubble';
import MessageInput            from '@components/chat/MessageInput';
import TypingIndicator         from '@components/chat/TypingIndicator';
import WelcomeScreen           from '@components/chat/WelcomeScreen';

export default function ChatPage() {
  const { id }                 = useParams();
  const { messages, loading, streaming, error, openConversation, sendMessage } = useChat();
  const scrollRef              = useScrollToBottom([messages.length, streaming]);

  useEffect(() => {
    if (id) openConversation(id);
  }, [id]);

  const isEmpty = !loading && messages.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* Message list */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <>
            <WelcomeScreen onSend={sendMessage} />
            {/* Error can happen even before any message is created (e.g. not
                signed in, or the Firestore write failed) — always show it,
                not just once messages exist. */}
            {error && (
              <div className="max-w-2xl mx-auto px-4 -mt-4 pb-6">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-red-400 text-sm py-3 px-4
                             bg-red-500/10 rounded-xl border border-red-500/20"
                >
                  {error}
                </motion.div>
              </div>
            )}
          </>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-2">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
            </AnimatePresence>

            {streaming && <TypingIndicator />}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-red-400 text-sm py-3 px-4
                           bg-red-500/10 rounded-xl border border-red-500/20"
              >
                {error}
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      {!isEmpty && (
        <div className="border-t border-surface-border bg-surface/80 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <MessageInput onSend={sendMessage} disabled={streaming} />
          </div>
        </div>
      )}
    </div>
  );
}
