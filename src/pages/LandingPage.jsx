// src/pages/LandingPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Shield, Key, ArrowRight, Github } from 'lucide-react';

const FEATURES = [
  { icon: Zap,     title: 'Claude-powered',    desc: 'Built on Anthropic\'s Claude — one of the most capable AI models available.' },
  { icon: Shield,  title: 'Firebase Auth',     desc: 'Secure accounts with Google login, email/password, and passkey support.' },
  { icon: Key,     title: 'Passkeys',          desc: 'Log in with your fingerprint or Face ID — no password needed.' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-void text-text-primary overflow-hidden relative">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none" />
      {/* Radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px]
                      bg-gradient-radial from-neon-purple/20 to-transparent pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between max-w-6xl mx-auto px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500
                          flex items-center justify-center font-display font-bold text-white text-sm shadow-glow-sm">
            L
          </div>
          <span className="font-display font-semibold text-lg">LukeAI</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="https://github.com" target="_blank" rel="noopener"
             className="btn-ghost text-sm gap-1.5">
            <Github size={16} /> GitHub
          </a>
          <button onClick={() => navigate('/login')}  className="btn-secondary text-sm">Sign in</button>
          <button onClick={() => navigate('/signup')} className="btn-primary text-sm">Get started</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 badge-purple mb-6 px-4 py-1.5 text-sm">
            <Sparkles size={14} /> Powered by Claude AI
          </div>

          <h1 className="font-display font-bold text-5xl sm:text-6xl mb-6 leading-tight">
            Your personal AI,{' '}
            <span className="gradient-text">always ready</span>
          </h1>

          <p className="text-text-secondary text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            LukeAI gives you a secure, private AI chat assistant powered by Claude —
            with Google login, passkey support, and your chat history saved to the cloud.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => navigate('/signup')}
              className="btn-primary text-base px-7 py-3 shadow-glow-md"
            >
              Start for free <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="btn-secondary text-base px-7 py-3"
            >
              Sign in
            </button>
          </div>
        </motion.div>

        {/* Mock chat preview */}
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-16 card border-neon-purple/30 shadow-glow-sm text-left max-w-2xl mx-auto"
        >
          <div className="flex gap-3 mb-4">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500
                            flex items-center justify-center text-white text-xs font-bold">Y</div>
            <div className="bg-neon-purple text-white text-sm rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[80%]">
              Can you help me build a React hook for dark mode?
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500
                            flex items-center justify-center shrink-0">
              <Sparkles size={12} className="text-white" />
            </div>
            <div className="bg-surface-overlay border border-surface-border text-text-primary text-sm
                            rounded-2xl rounded-tl-sm px-4 py-2.5 flex-1">
              <p className="mb-2">Sure! Here's a clean custom hook:</p>
              <code className="block bg-void rounded-lg p-3 text-xs font-mono text-purple-300">
                {`const useDarkMode = () => {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList
      .toggle('dark', dark);
  }, [dark]);
  return [dark, setDark];
};`}
              </code>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.4 }}
              className="card-hover"
            >
              <div className="w-10 h-10 rounded-xl bg-neon-purple/20 border border-neon-purple/30
                              flex items-center justify-center mb-4">
                <Icon size={20} className="text-neon-purple" />
              </div>
              <h3 className="font-display font-semibold text-text-primary mb-2">{title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-surface-border py-8 text-center text-text-muted text-sm">
        Built with ❤️ by Luke · Powered by{' '}
        <a href="https://anthropic.com" className="text-purple-400 hover:text-purple-300">Anthropic Claude</a>
      </footer>
    </div>
  );
}
