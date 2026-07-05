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
- Installable PWA manifest with home screen icons
- Web Share Target support for shared title, text, and URL payloads
- Local bookmark creation with link, original text, title, and memo
- Bookmark list, search, detail view, status changes, importance changes, and delete
- Dexie / IndexedDB storage in the browser
- Real AI analysis through `/api/analyze-bookmark`
- Mock AI provider for local development
- Local AI analysis queue with daily limits, retry backoff, and max input length controls
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

## PWA Install and Share Target

Easybook can be installed from supported browsers as a standalone app.

- Chrome/Edge desktop: use the install icon in the address bar or browser menu.
- Android Chrome: use the browser menu and choose the home screen/app install option.
- iOS Safari: use the share button and choose the home screen option.

After Easybook is installed, supported browsers can show Easybook as a share target. From X/Twitter or a browser page, use the share menu, choose Easybook, review the shared link/text/title, and save it as a local bookmark. Easybook opens `/share-target` with the shared fields prefilled so you can edit the title, body, link, and memo before saving.

Browser support differs by device and browser. If Easybook does not appear in the share menu, copy the link and paste it into the manual Add bookmark screen.

Shared data is not stored on an Easybook server. It is only saved to the browser's local IndexedDB after you confirm the save. If automatic AI analysis is enabled and you have accepted the AI privacy notice, Easybook uses the existing `/api/analyze-bookmark` route for analysis; otherwise the bookmark remains local until you choose to analyze it.

X API automatic bookmark sync, X OAuth login, accounts, server databases, and cloud sync are not implemented yet.

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

### Analysis Queue and Limits

Easybook places automatic and manual analysis requests into a local IndexedDB queue before running them. The queue is stored only in the browser and is not uploaded to a server.

Default limits:

- Daily analysis attempts: `30`
- Max AI input text: `6000` characters
- Retry enabled: yes
- Max attempts per queue item: `3`
- Retry cooldown: `5` minutes multiplied by the current attempt count

The original bookmark text is not truncated in storage. Only the text sent to the existing `/api/analyze-bookmark` route is capped by the configured max input length.

If the daily limit is reached, queued analysis waits instead of calling the API. Temporary failures such as network errors, rate limits, and generic request failures can be retried with backoff. Invalid input and invalid AI response errors are not retried indefinitely.

The Settings screen lets you turn automatic queue execution on or off and adjust the daily limit, max input length, retry count, and cooldown. The Home, bookmark list, and detail screens show whether analysis is waiting, running, complete, failed, or at its attempt limit.

Analysis queue state is intentionally not included in Easybook backups. Restored bookmarks can be analyzed again from their detail page.

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

The next PR will implement duplicate bookmark detection for matching URLs, matching source text, and similar bookmark content.
