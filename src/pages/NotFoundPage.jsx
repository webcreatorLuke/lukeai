// src/pages/NotFoundPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-void flex items-center justify-center text-center px-4">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-7xl font-display font-bold gradient-text mb-4">404</p>
        <h1 className="text-2xl font-display font-semibold text-text-primary mb-2">Page not found</h1>
        <p className="text-text-secondary mb-8">The page you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/')} className="btn-primary">Go home</button>
      </motion.div>
    </div>
  );
}
