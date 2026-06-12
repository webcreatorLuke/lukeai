// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Sparkles, Fingerprint, Loader2 } from 'lucide-react';
import { signInWithEmail, signInWithGoogle } from '@services/authService';
import { authenticateWithPasskey, isPasskeySupported } from '@services/passkeyService';
import { userService } from '@services/userService';
import { useAuthStore } from '@store/authStore';
import { signInSchema } from '@utils/validators';
import { cn } from '@utils/helpers';
import toast from 'react-hot-toast';
import GoogleIcon from '@components/ui/GoogleIcon';
import InstallButton from '@components/ui/InstallButton';

export default function LoginPage() {
  const navigate    = useNavigate();
  const setUser     = useAuthStore((s) => s.setUser);
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [passkeyOk, setPasskeyOk] = useState(false);

  // Check passkey support
  React.useEffect(() => {
    isPasskeySupported().then(setPasskeyOk);
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signInSchema),
  });

  async function onSubmit({ email, password }) {
    setLoading(true);
    try {
      await signInWithEmail({ email, password });
      navigate('/chat');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/chat');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handlePasskey() {
    // We need a lukeId or uid to identify who to authenticate
    const lukeId = prompt('Enter your LukeAI ID (luke_…):');
    if (!lukeId) return;
    setLoading(true);
    try {
      const found = await userService.getUserByLukeId(lukeId.trim());
      if (!found) throw new Error('No account found with that LukeAI ID.');
      await authenticateWithPasskey(found.uid);
      toast.success('Passkey verified! Signing you in…');
      navigate('/chat');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-void flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px]
                      bg-gradient-radial from-neon-purple/15 to-transparent pointer-events-none" />

      {/* Download / Install button — top right */}
      <div className="fixed top-4 right-4 z-20">
        <InstallButton />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl
                          bg-gradient-to-br from-purple-500 to-cyan-500 shadow-glow-md mb-4">
            <Sparkles size={22} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl text-text-primary">Welcome back</h1>
          <p className="text-text-secondary text-sm mt-1">Sign in to LukeAI</p>
        </div>

        <div className="card">
          {/* Google */}
          <button onClick={handleGoogle} disabled={loading} className="btn-google w-full mb-4">
            <GoogleIcon /> Continue with Google
          </button>

          {/* Passkey */}
          {passkeyOk && (
            <button onClick={handlePasskey} disabled={loading}
              className="btn-secondary w-full mb-4 text-sm">
              <Fingerprint size={16} className="text-purple-400" /> Sign in with Passkey
            </button>
          )}

          <div className="relative flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-surface-border" />
            <span className="text-text-muted text-xs">or email</span>
            <div className="flex-1 h-px bg-surface-border" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input {...register('email')} type="email" className="input" placeholder="you@example.com" />
              {errors.email && <p className="field-error">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="field-error">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-text-muted text-sm mt-4">
            Don't have an account?{' '}
            <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
