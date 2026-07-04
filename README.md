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
- Plain JSON backup export, encrypted JSON backup export, import, preview, merge restore, and overwrite restore
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

## Backup and Restore

Easybook can export and import local backup JSON files from Settings. Backup and restore run entirely in the browser against IndexedDB. Easybook does not upload backup files, send backup contents to an API route, or store backup data on a server.

Encrypted backups are recommended. They use Web Crypto API AES-GCM encryption with a key derived from the backup password using PBKDF2 SHA-256 and at least 100,000 iterations. Easybook does not store the backup password. If the backup password is lost, the encrypted backup file cannot be recovered.

Plain backups are available as an advanced option. A plain backup is an unencrypted JSON file and may include bookmark text, links, memos, AI explanations, categories, tags, and settings. Settings may include `passwordHash` and `passwordSalt`, so plain backup files must be stored carefully.

Backup files include:

- `app`
- `schemaVersion`
- `exportedAt`
- `backupType`
- local `bookmarks`, `categories`, `tags`, and `settings` for plain backups
- encrypted `payload` plus crypto metadata for encrypted backups

When importing, Easybook validates the backup file, decrypts encrypted backups with the user-provided backup password, shows a preview, and lets the user choose either merge restore or overwrite restore. Settings are not restored by default because restoring settings can change the local app lock password and other browser-specific preferences.

Users are responsible for downloading, storing, and protecting backup files.

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

The next PR will configure the PWA manifest, implement Web Share Target, and support importing links or text shared from the X app or a browser into Easybook.
