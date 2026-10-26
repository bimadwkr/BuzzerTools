# Buzzer Tools — Multi-Provider AI Comment Generator

Buzzer Tools is an advanced, production-ready SaaS web application built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and official AI SDKs to help users draft highly contextual, platform-tailored replies and comments for Reddit, Quora, Threads, X (Twitter), and general discussions.

## Key Features

- **Multi-Provider AI Support**: Configure and switch between **Google Gemini**, **OpenAI**, **Anthropic Claude**, and **OpenAI-Compatible endpoints** (like local Ollama or LM Studio).
- **Secure Local-First Configuration**: API keys are securely stored in browser local storage and communicated strictly via server-side API routes (never exposed to frontend bundles).
- **Comprehensive Generator Dashboard**:
  - Source post ingestion with word/character counts.
  - Platform selector (Reddit, Quora, Threads, X, Auto Detect).
  - Rich Response Intents (Agree & Add Value, Disagree Respectfully, Helpful Answer, Subtle Product Mention, Custom Instructions, etc.).
  - Tone & Capitalization controls (all lowercase, ALL UPPERCASE, Sentence case, natural capitalization).
  - Writing style toggles (contractions, no emojis, no hashtags, no generic AI filler phrases).
  - Comment length targets (Very Short to Long, or custom word ranges).
  - Multiple variations generation (1, 3, 5, or 10 variations).
- **Result Management**: Copy individual or all comments, inline editing, individual regeneration, bookmarking favorites, and deletion.
- **History, Favorites, & Presets**: Automatic generation history, dedicated favorites bookmarks, and custom presets management.

---

## Getting Started

### Prerequisites
- Node.js 18+ installed.

### Installation & Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

4. Go to **Settings**, configure your preferred AI Provider API Key, test the connection, and start generating comments!

---

## Production Build

```bash
npm run build
npm start
```

