# Easybook

Easybook is a mobile-first personal bookmark explainer for X/Twitter links and text.

## Local Development

```bash
npm install
npm run dev
npm run build
npm run preview
```

For real AI analysis, create `.env.local`:

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.5
VITE_AI_PROVIDER=real
```

Do not commit real API keys. `OPENAI_API_KEY` is used only by the serverless API route. Never put an OpenAI key in a `VITE_` environment variable because Vite exposes those variables to the browser bundle.

## Current Features

- Mobile-first dark app shell
- Local bookmark creation with link, original text, title, and memo
- Bookmark list, search, detail view, status changes, importance changes, and delete
- Dexie / IndexedDB storage in the browser
- Real AI analysis through `/api/analyze-bookmark`
- Mock AI provider for local development
- Automatic category and tag creation from AI analysis results
- Easy, medium, and advanced explanation sections
- AI privacy consent before sending bookmark text/link for analysis
- Analysis failure state and retry button
- Category list with review status, rename, and delete
- Home statistics backed by local data
- Local app lock with a PBKDF2 password hash and per-password salt
- Dark/light theme setting
- Full local data deletion from settings

## AI Analysis

The browser never calls OpenAI directly. Easybook sends bookmark text and links to the local serverless route `/api/analyze-bookmark`, which calls the OpenAI Responses API with Structured Outputs JSON Schema.

The serverless function uses:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`, defaulting to `gpt-5.5`

The route sets `store: false` and does not write request or response contents to a server database. Bookmark data and analysis results are stored in browser IndexedDB.

To develop without a real API key, set:

```bash
VITE_AI_PROVIDER=mock
```

## Local Data

Bookmarks, categories, tags, and app settings are stored only in the browser IndexedDB database named `easybook-db`.

If the browser site data is cleared, saved Easybook data can disappear.

The app lock is local to the browser. It is not an account login. Easybook does not store the password in plaintext; it stores a PBKDF2 hash and salt in IndexedDB settings. Bookmark contents are not encrypted yet, so anyone with access to the browser profile or developer tools may still be able to inspect local IndexedDB data.

Settings include:

- `appLockEnabled`
- `passwordHash`
- `passwordSalt`
- `theme`
- `aiAutoAnalyze`
- `aiAnalyzeSensitiveContent`
- `hasAcceptedAiPrivacyNotice`
- `aiProvider`
- `backupMode`

## Vercel Setup

In Vercel project settings, add:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`

Do not add `OPENAI_API_KEY` as a client-visible `VITE_` variable.

## Next PR

The next PR will add plain JSON export, encrypted JSON export, backup JSON import, and a restore preview before overwriting local data.
