// src/config/constants.js
// All magic strings, limits, and feature flags live here

// ─── App metadata ─────────────────────────────────────────────────────────────
export const APP_NAME        = 'LukeAI';
export const APP_VERSION     = '1.0.0';
export const APP_DESCRIPTION = 'Your personal AI assistant powered by Webcreatorluke';
export const APP_URL         = import.meta.env.VITE_APP_URL || 'https://lukeai.web.app';

// ─── Claude / AI ──────────────────────────────────────────────────────────────
export const CLAUDE_MODEL          = 'claude-sonnet-4-6';
export const CLAUDE_MAX_TOKENS     = 4096;
export const CLAUDE_TEMPERATURE    = 1.0;   // Claude best-effort (API default)
export const CLAUDE_API_URL        = 'https://api.anthropic.com/v1/messages';
// The API key is stored in Firestore per user or in env — never exposed client-side in prod
// In dev you can set VITE_ANTHROPIC_API_KEY; in prod use Firebase Functions as a proxy

export const DEFAULT_SYSTEM_PROMPT = `You are LukeAI, a friendly and highly capable AI assistant.
You help users with coding, writing, analysis, math, creative tasks, and general questions.
Be concise when the user wants brevity, thorough when they want depth.
When writing code, prefer well-commented, production-quality examples.
You have a warm, slightly playful personality — feel free to be witty when appropriate.

You can show relevant images to the user. When an image would help illustrate your answer
(e.g. the user asks what something looks like, or a picture would clarify your response),
include a tag in this exact format on its own line: [IMAGE: short descriptive search query]

Examples:
- User: "what does a golden retriever look like?"
  You: "Golden retrievers are friendly, medium-to-large dogs with long golden coats.
  [IMAGE: golden retriever dog]"
- User: "show me the Eiffel Tower"
  You: "Here's the Eiffel Tower in Paris, France.
  [IMAGE: Eiffel Tower Paris]"

Only use [IMAGE: ...] when a picture is genuinely useful — not for every message.
Keep the search query short (2-5 words) and specific.`;

// ─── Firestore collections ────────────────────────────────────────────────────
export const COLLECTIONS = {
  USERS:         'users',
  CONVERSATIONS: 'conversations',
  MESSAGES:      'messages',
  SETTINGS:      'settings',
  PASSKEYS:      'passkeys',
  API_KEYS:      'apiKeys',   // Encrypted user-provided API keys
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const AUTH_PROVIDERS = {
  GOOGLE:   'google.com',
  EMAIL:    'password',
  PASSKEY:  'passkey',
};

export const USER_ID_PREFIX  = 'luke_';
export const USER_ID_LENGTH  = 12;   // Characters after the prefix

// ─── UI limits ───────────────────────────────────────────────────────────────
export const MAX_MESSAGE_LENGTH     = 32_000;   // chars
export const MAX_CONVERSATIONS      = 500;
export const MAX_MESSAGES_PER_CONV  = 1_000;
export const SIDEBAR_WIDTH          = 280;      // px
export const MOBILE_BREAKPOINT      = 768;      // px

// ─── Local storage keys ──────────────────────────────────────────────────────
export const LS_KEYS = {
  THEME:          'lukeai_theme',
  SIDEBAR_OPEN:   'lukeai_sidebar',
  LAST_CONV_ID:   'lukeai_last_conv',
  FONT_SIZE:      'lukeai_font_size',
  SEND_ON_ENTER:  'lukeai_send_enter',
};

// ─── Routes ───────────────────────────────────────────────────────────────────
export const ROUTES = {
  HOME:      '/',
  CHAT:      '/chat',
  CHAT_ID:   '/chat/:id',
  LOGIN:     '/login',
  SIGNUP:    '/signup',
  SETTINGS:  '/settings',
  PROFILE:   '/profile',
  PASSKEYS:  '/settings/passkeys',
  NOT_FOUND: '*',
};

// ─── Feature flags ────────────────────────────────────────────────────────────
export const FEATURES = {
  PASSKEYS:    true,
  GOOGLE_AUTH: true,
  ANALYTICS:   true,
  DARK_ONLY:   true,   // No light mode for now
};

// ─── Error messages ──────────────────────────────────────────────────────────
export const ERRORS = {
  AUTH: {
    INVALID_CREDENTIALS:  'Invalid email or password.',
    EMAIL_IN_USE:         'An account with this email already exists.',
    WEAK_PASSWORD:        'Password must be at least 8 characters.',
    USER_NOT_FOUND:       'No account found with this email.',
    TOO_MANY_REQUESTS:    'Too many attempts. Please try again later.',
    POPUP_CLOSED:         'Sign-in popup was closed before completing.',
    NETWORK:              'Network error. Check your connection.',
    GENERIC:              'Authentication failed. Please try again.',
  },
  API: {
    NO_KEY:     'No API key configured. Add one in Settings.',
    RATE_LIMIT: 'Rate limit reached. Please wait a moment.',
    GENERIC:    'Something went wrong with the AI. Please try again.',
  },
};
