// src/pages/SignupPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Sparkles, Loader2 } from 'lucide-react';
import { signUpWithEmail, signInWithGoogle } from '@services/authService';
import { signUpSchema } from '@utils/validators';
import toast from 'react-hot-toast';
import GoogleIcon from '@components/ui/GoogleIcon';

export default function SignupPage() {
  const navigate   = useNavigate();
  const [showPass, setShowPass]  = useState(false);
  const [loading,  setLoading]   = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signUpSchema),
  });

  async function onSubmit({ displayName, email, password }) {
    setLoading(true);
    try {
      const { lukeId } = await signUpWithEmail({ displayName, email, password });
      toast.success(`Account created! Your LukeAI ID: ${lukeId}`);
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
      const { lukeId, isNew } = await signInWithGoogle();
      if (isNew) toast.success(`Welcome! Your LukeAI ID: ${lukeId}`);
      navigate('/chat');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-void flex items-center justify-center px-4 py-8">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px]
                      bg-gradient-radial from-neon-purple/15 to-transparent pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl
                          bg-gradient-to-br from-purple-500 to-cyan-500 shadow-glow-md mb-4">
            <Sparkles size={22} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl text-text-primary">Create your account</h1>
          <p className="text-text-secondary text-sm mt-1">Join LukeAI — it's free</p>
        </div>

        <div className="card">
          <button onClick={handleGoogle} disabled={loading} className="btn-google w-full mb-4">
            <GoogleIcon /> Continue with Google
          </button>

          <div className="relative flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-surface-border" />
            <span className="text-text-muted text-xs">or email</span>
            <div className="flex-1 h-px bg-surface-border" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Display Name</label>
              <input {...register('displayName')} className="input" placeholder="Your name" />
              {errors.displayName && <p className="field-error">{errors.displayName.message}</p>}
            </div>

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
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                />
                <button type="button" onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="field-error">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <input {...register('confirm')} type="password" className="input" placeholder="••••••••" />
              {errors.confirm && <p className="field-error">{errors.confirm.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Create account'}
            </button>
          </form>

          <p className="text-center text-text-muted text-sm mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
