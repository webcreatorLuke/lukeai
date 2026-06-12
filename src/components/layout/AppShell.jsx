// src/components/layout/AppShell.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUiStore } from '@store/uiStore';
import Sidebar from './Sidebar';
import Header  from './Header';

export default function AppShell({ children }) {
  const { sidebarOpen, setSidebarOpen } = useUiStore();

  return (
    <div className="flex h-screen bg-void overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            key="sidebar"
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0,    opacity: 1 }}
            exit={{   x: -280, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-[280px] flex-shrink-0 border-r border-surface-border
                       bg-surface flex flex-col z-20"
          >
            <Sidebar />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{   opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-10 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-hidden relative">
          {children}
        </main>
      </div>
    </div>
  );
}
