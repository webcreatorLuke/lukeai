# LukeAI 🤖

**Your personal AI assistant powered by Claude** — with Firebase authentication, Google login, passkeys, and cloud-synced chat history.

[![Deploy to Firebase](https://img.shields.io/badge/deploy-Firebase-orange?logo=firebase)](https://firebase.google.com)
[![Built with Vite](https://img.shields.io/badge/built_with-Vite-646cff?logo=vite)](https://vitejs.dev)
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react)](https://reactjs.org)
[![Claude](https://img.shields.io/badge/AI-Claude-7c3aed)](https://anthropic.com)

---

## ✨ Features

- 🤖 **Claude AI** — streaming responses powered by Anthropic's Claude
- 🔐 **Firebase Auth** — Google OAuth, email/password, and WebAuthn passkeys
- 🪪 **Unique LukeAI IDs** — every account gets a `luke_xxxxxxxxxxxx` ID
- 🔑 **Passkeys** — biometric login (Touch ID, Face ID, Windows Hello)
- ☁️ **Firestore** — chat history saved and synced to the cloud
- 🎨 **Dark UI** — polished void-purple design with Tailwind CSS
- 🚀 **GitHub Actions** — automatic deploy to Firebase Hosting on push

---

## 🚀 Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/lukeai.git
cd lukeai
npm install
```

### 2. Set up Firebase

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication** → Google and Email/Password providers
4. Enable **Firestore Database** (start in production mode)
5. Register a **Web app** and copy the config

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in your Firebase values:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 4. Add your Anthropic API key

Either set `VITE_ANTHROPIC_API_KEY` in `.env` (shared key, dev only), or leave it blank and enter your key in **Settings** after signing up.

Get a key at [console.anthropic.com](https://console.anthropic.com).

### 5. Deploy Firestore rules

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules,firestore:indexes
```

### 6. Run locally

```bash
npm run dev
# → http://localhost:3000
```

---

## 🚢 Deploy to GitHub + Firebase Hosting

### Set up GitHub Secrets

In your GitHub repo → **Settings → Secrets → Actions**, add:

| Secret | Value |
|--------|-------|
| `VITE_FIREBASE_API_KEY` | Your Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Your project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID |
| `VITE_FIREBASE_APP_ID` | App ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Measurement ID |
| `VITE_APP_URL` | `https://your-project.web.app` |
| `FIREBASE_SERVICE_ACCOUNT` | JSON from Firebase → Project Settings → Service accounts |

### Push to deploy

```bash
git add .
git commit -m "Initial deploy"
git push origin main
```

GitHub Actions will automatically build and deploy to Firebase Hosting. ✅

---

## 🔐 Passkeys setup

For passkeys to work, your site **must be served over HTTPS** (Firebase Hosting handles this automatically). They will not work on `http://localhost` — use the Firebase emulator or a real domain.

After signing up, go to **Settings → Passkeys** and click **Add** to register your device.

---

## 📁 Project Structure

```
lukeai/
├── src/
│   ├── components/
│   │   ├── auth/          # Auth form components
│   │   ├── chat/          # MessageBubble, MessageInput, TypingIndicator
│   │   ├── layout/        # AppShell, Sidebar, Header
│   │   └── ui/            # Avatar, LoadingScreen, GoogleIcon
│   ├── config/
│   │   ├── constants.js   # All magic strings & config
│   │   └── firebase.js    # Firebase initialization
│   ├── hooks/             # useAuth, useChat, usePasskeys, ...
│   ├── pages/             # LandingPage, LoginPage, SignupPage, ChatPage, SettingsPage
│   ├── services/          # authService, claudeService, userService, ...
│   ├── store/             # Zustand stores (auth, chat, ui)
│   ├── styles/            # globals.css (Tailwind + custom)
│   ├── types/             # JSDoc type definitions
│   └── utils/             # helpers, validators, cryptoUtils, idGenerator
├── firebase/
│   ├── firestore.rules    # Firestore security rules
│   └── firestore.indexes.json
├── public/
│   ├── icons/             # Favicon and PWA icons
│   └── manifest.json      # PWA manifest
├── .github/
│   └── workflows/
│       └── deploy.yml     # GitHub Actions CI/CD
├── .env.example           # Template — copy to .env
├── firebase.json          # Firebase Hosting config
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Routing | React Router v6 |
| State | Zustand |
| Animation | Framer Motion |
| AI | Anthropic Claude (streaming) |
| Auth | Firebase Authentication |
| Database | Firestore |
| Passkeys | WebAuthn API |
| Forms | React Hook Form + Zod |
| Markdown | react-markdown + Prism |
| Deploy | Firebase Hosting + GitHub Actions |

---

## 📝 License

MIT © Luke
