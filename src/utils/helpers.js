// src/utils/helpers.js
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

// ─── Tailwind class merge helper ──────────────────────────────────────────────
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ─── Format Firestore timestamp or Date for display ───────────────────────────
export function formatTimestamp(ts) {
  if (!ts) return '';
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  if (isToday(date))     return format(date, 'h:mm a');
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d');
}

export function formatRelative(ts) {
  if (!ts) return '';
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  return formatDistanceToNow(date, { addSuffix: true });
}

// ─── Truncate long strings ────────────────────────────────────────────────────
export function truncate(str, max = 60) {
  if (!str || str.length <= max) return str;
  return str.slice(0, max).trimEnd() + '…';
}

// ─── Auto-generate conversation title from first user message ─────────────────
export function generateConvTitle(firstMessage) {
  const clean = firstMessage.replace(/\s+/g, ' ').trim();
  return truncate(clean, 50) || 'New conversation';
}

// ─── Detect code blocks in message ───────────────────────────────────────────
export function hasCode(text) {
  return /```[\s\S]*?```/.test(text) || /`[^`]+`/.test(text);
}

// ─── Estimate token count (rough: 1 token ≈ 4 chars) ─────────────────────────
export function estimateTokens(text) {
  return Math.ceil((text || '').length / 4);
}

// ─── Copy text to clipboard ───────────────────────────────────────────────────
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity  = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  }
}

// ─── Debounce ─────────────────────────────────────────────────────────────────
export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ─── Sleep ────────────────────────────────────────────────────────────────────
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Get initials from name ───────────────────────────────────────────────────
export function getInitials(name = '') {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';
}

// ─── Scroll element to bottom ─────────────────────────────────────────────────
export function scrollToBottom(el, smooth = true) {
  if (!el) return;
  el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'instant' });
}
