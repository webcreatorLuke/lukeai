// src/pages/SettingsPage.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Key, Fingerprint, User, Trash2, Plus,
  Check, Loader2, Copy, Eye, EyeOff, Shield,
} from 'lucide-react';
import { useAuth }       from '@hooks/useAuth';
import { usePasskeys }   from '@hooks/usePasskeys';
import { userService }   from '@services/userService';
import { encryptApiKey } from '@utils/cryptoUtils';
import { apiKeySchema, passkeyNameSchema, updateProfileSchema } from '@utils/validators';
import { copyToClipboard, formatRelative } from '@utils/helpers';
import { updateUserProfile } from '@services/authService';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-text-primary">Settings</h1>
          <p className="text-text-secondary text-sm mt-1">Manage your account and preferences</p>
        </div>

        <ProfileSection />
        <ApiKeySection />
        <PasskeysSection />
        <AccountIdSection />
      </div>
    </div>
  );
}

// ─── Profile ──────────────────────────────────────────────────────────────────
function ProfileSection() {
  const { user, userData }  = useAuth();
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver:      zodResolver(updateProfileSchema),
    defaultValues: { displayName: user?.displayName || '' },
  });

  async function onSubmit({ displayName }) {
    setSaving(true);
    try {
      await updateUserProfile({ displayName });
      toast.success('Profile updated');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <User size={16} className="text-purple-400" />
        <h2 className="font-display font-semibold text-text-primary">Profile</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Display Name</label>
          <input {...register('displayName')} className="input" />
          {errors.displayName && <p className="field-error">{errors.displayName.message}</p>}
        </div>
        <div>
          <label className="label">Email</label>
          <input value={user?.email || ''} readOnly className="input opacity-60 cursor-not-allowed" />
        </div>
        <button type="submit" disabled={saving} className="btn-primary text-sm">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          Save
        </button>
      </form>
    </section>
  );
}

// ─── API Key ─────────────────────────────────────────────────────────────────
function ApiKeySection() {
  const { user, userData, updateSettings } = useAuth();
  const [saving,   setSaving]   = useState(false);
  const [showKey,  setShowKey]  = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(apiKeySchema),
  });

  async function onSubmit({ apiKey }) {
    setSaving(true);
    console.log('STEP 1: starting, user.uid =', user?.uid);
    try {
      console.log('STEP 2: encrypting...');
      const enc = await encryptApiKey(apiKey, user.uid);
      console.log('STEP 3: encrypted, saving to firestore...');
      await userService.saveApiKey(user.uid, enc);
      console.log('STEP 4: saved to firestore');
      updateSettings({ apiKey: enc });
      console.log('STEP 5: local state updated');
      toast.success('API key saved');
    } catch (e) {
      console.log('ERROR:', e);
      toast.error('Failed to save key');
    } finally {
      setSaving(false);
    }
  }

  const hasKey = !!userData?.settings?.apiKey;

  return (
    <section className="card space-y-4">
      <div className="flex items-center gap-2">
        <Key size={16} className="text-amber-400" />
        <h2 className="font-display font-semibold text-text-primary">Anthropic API Key</h2>
        {hasKey && <span className="badge badge-green ml-auto">Saved</span>}
      </div>
      <p className="text-text-secondary text-sm">
        Enter your Anthropic API key to use Claude.
        Get one at{' '}
        <a href="https://console.anthropic.com" target="_blank" rel="noopener"
           className="text-purple-400 hover:text-purple-300">console.anthropic.com</a>.
        Your key is encrypted and stored in your account.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="relative">
          <input
            {...register('apiKey')}
            type={showKey ? 'text' : 'password'}
            className="input pr-10"
            placeholder="sk-ant-api03-…"
          />
          <button type="button" onClick={() => setShowKey((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.apiKey && <p className="field-error">{errors.apiKey.message}</p>}
        <button type="submit" disabled={saving} className="btn-primary text-sm">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Key size={14} />}
          Save API Key
        </button>
      </form>
    </section>
  );
}

// ─── Passkeys ─────────────────────────────────────────────────────────────────
function PasskeysSection() {
  const { passkeys, supported, loading, addPasskey, removePasskey } = usePasskeys();
  const [adding,    setAdding]   = useState(false);
  const [newName,   setNewName]  = useState('');

  async function handleAdd() {
    if (!newName.trim()) return toast.error('Enter a device name');
    setAdding(true);
    try {
      await addPasskey(newName.trim());
      setNewName('');
      toast.success('Passkey registered!');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setAdding(false);
    }
  }

  if (!supported) return null;

  return (
    <section className="card space-y-4">
      <div className="flex items-center gap-2">
        <Fingerprint size={16} className="text-cyan-400" />
        <h2 className="font-display font-semibold text-text-primary">Passkeys</h2>
        <span className="badge badge-green ml-auto">Recommended</span>
      </div>
      <p className="text-text-secondary text-sm">
        Use your device's biometric (Touch ID, Face ID, Windows Hello) to sign in — no password needed.
      </p>

      {/* Existing passkeys */}
      {passkeys.length > 0 && (
        <ul className="space-y-2">
          {passkeys.map((pk) => (
            <li key={pk.id}
              className="flex items-center gap-3 px-3 py-2.5 bg-surface-overlay rounded-xl border border-surface-border">
              <Fingerprint size={14} className="text-cyan-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{pk.name}</p>
                <p className="text-2xs text-text-muted">
                  Last used {pk.lastUsedAt ? formatRelative(pk.lastUsedAt) : 'never'}
                </p>
              </div>
              <button
                onClick={() => removePasskey(pk.id)}
                className="btn-ghost p-1.5 text-red-400 hover:text-red-300"
              >
                <Trash2 size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Add new passkey */}
      <div className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="input text-sm"
          placeholder="Device name (e.g. MacBook Pro)"
        />
        <button onClick={handleAdd} disabled={adding || loading} className="btn-primary shrink-0 text-sm">
          {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Add
        </button>
      </div>
    </section>
  );
}

// ─── Account ID ───────────────────────────────────────────────────────────────
function AccountIdSection() {
  const { userData }      = useAuth();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await copyToClipboard(userData?.lukeId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('LukeAI ID copied!');
  }

  return (
    <section className="card space-y-3">
      <div className="flex items-center gap-2">
        <Shield size={16} className="text-purple-400" />
        <h2 className="font-display font-semibold text-text-primary">Your LukeAI ID</h2>
      </div>
      <p className="text-text-secondary text-sm">
        This unique ID identifies your account. You can use it to log in with a passkey.
      </p>
      <div className="flex items-center gap-2 bg-surface-overlay border border-surface-border
                      rounded-xl px-4 py-3">
        <code className="flex-1 text-sm font-mono text-purple-300">{userData?.lukeId}</code>
        <button onClick={handleCopy} className="btn-ghost p-1.5">
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
        </button>
      </div>
    </section>
  );
}
