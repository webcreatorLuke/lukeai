// src/types/index.js
// Shared type definitions as JSDoc (works without TypeScript compiler)

/**
 * @typedef {Object} User
 * @property {string}  uid          - Firebase Auth UID
 * @property {string}  lukeId       - Custom LukeAI user ID (luke_xxxxxxxxxxxx)
 * @property {string}  email        - User email
 * @property {string}  displayName  - Display name
 * @property {string|null} photoURL - Avatar URL
 * @property {string}  provider     - 'google.com' | 'password' | 'passkey'
 * @property {Date}    createdAt    - Account creation timestamp
 * @property {Date}    lastLoginAt  - Last login timestamp
 * @property {UserSettings} settings
 */

/**
 * @typedef {Object} UserSettings
 * @property {string}  theme         - 'dark' (only option for now)
 * @property {string}  fontSize      - 'sm' | 'md' | 'lg'
 * @property {boolean} sendOnEnter   - Whether Enter sends message
 * @property {string}  apiKey        - Encrypted Anthropic API key
 * @property {string}  systemPrompt  - Custom system prompt override
 * @property {boolean} streamResponse - Enable streaming
 */

/**
 * @typedef {Object} Conversation
 * @property {string}  id          - Firestore document ID
 * @property {string}  userId      - Owner UID
 * @property {string}  title       - Conversation title (auto-generated)
 * @property {Date}    createdAt
 * @property {Date}    updatedAt
 * @property {Message|null} lastMessage - Preview of last message
 * @property {number}  messageCount
 * @property {boolean} pinned
 * @property {string[]} tags
 */

/**
 * @typedef {Object} Message
 * @property {string}  id         - Unique message ID
 * @property {string}  convId     - Parent conversation ID
 * @property {'user'|'assistant'|'system'} role
 * @property {string}  content    - Message text (Markdown)
 * @property {Date}    createdAt
 * @property {boolean} isStreaming - True while token stream is active
 * @property {number|null} tokenCount
 * @property {MessageMeta|null} meta
 */

/**
 * @typedef {Object} MessageMeta
 * @property {string}  model      - Claude model used
 * @property {number}  latencyMs  - Time to first token
 * @property {boolean} cached     - Whether prompt cache was hit
 */

/**
 * @typedef {Object} Passkey
 * @property {string}  id           - Credential ID (base64url)
 * @property {string}  userId       - Owner UID
 * @property {string}  name         - User-given device name
 * @property {Date}    createdAt
 * @property {Date}    lastUsedAt
 * @property {string}  aaguid       - Authenticator AAGUID
 * @property {string}  publicKey    - Stored public key (base64url)
 * @property {number}  signCount    - Replay-attack counter
 */

/**
 * @typedef {Object} AuthState
 * @property {User|null}  user
 * @property {boolean}    loading
 * @property {string|null} error
 * @property {boolean}    initialized
 */

/**
 * @typedef {Object} ChatState
 * @property {Conversation[]} conversations
 * @property {string|null}    activeConvId
 * @property {Message[]}      messages
 * @property {boolean}        loading
 * @property {boolean}        streaming
 * @property {string|null}    error
 */

export {};  // Makes this a module so JSDoc @typedef is importable via IDE
