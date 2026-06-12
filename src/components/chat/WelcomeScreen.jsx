// src/components/chat/WelcomeScreen.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Code2, PenLine, Calculator, Globe } from 'lucide-react';
import MessageInput from './MessageInput';
import { useAuth } from '@hooks/useAuth';

const STARTERS = [
  { icon: Code2,      text: 'Help me write a React component', color: 'text-cyan-400' },
  { icon: PenLine,    text: 'Explain a concept simply',         color: 'text-purple-400' },
  { icon: Calculator, text: 'Solve a math problem step by step', color: 'text-amber-400' },
  { icon: Globe,      text: 'Translate or improve my writing',  color: 'text-emerald-400' },
];

export default function WelcomeScreen({ onSend }) {
  const { userData } = useAuth();
  const firstName    = userData?.displayName?.split(' ')[0] || 'there';

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[80vh] px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl text-center"
      >
        {/* Logo mark */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
                        bg-gradient-to-br from-purple-500 to-cyan-500
                        shadow-glow-lg mb-6 animate-float">
          <Sparkles size={28} className="text-white" />
        </div>

        <h1 className="font-display font-bold text-3xl text-text-primary mb-2">
          Hey {firstName} 👋
        </h1>
        <p className="text-text-secondary text-base mb-8">
          I'm LukeAI, your personal AI assistant. What can I help you with today?
        </p>

        {/* Prompt starters */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {STARTERS.map(({ icon: Icon, text, color }) => (
            <motion.button
              key={text}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSend(text)}
              className="card-hover text-left p-4 flex items-start gap-3 cursor-pointer"
            >
              <Icon size={18} className={`${color} shrink-0 mt-0.5`} />
              <span className="text-sm text-text-secondary leading-snug">{text}</span>
            </motion.button>
          ))}
        </div>

        {/* Input */}
        <MessageInput onSend={onSend} autoFocus />
      </motion.div>
    </div>
  );
}
