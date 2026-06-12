// src/components/ui/LoadingScreen.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-void flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500
                        flex items-center justify-center shadow-glow-lg animate-pulse-glow">
          <Sparkles size={26} className="text-white" />
        </div>
        <div className="flex gap-1.5">
          {[0,1,2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-neon-purple"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
