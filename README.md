# Easybook

Easybook is a mobile-first personal bookmark explainer for X/Twitter links and text.

## Local Development

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Current Features

- Mobile-first dark app shell
- Local bookmark creation with link, original text, title, and memo
- Bookmark list, search, detail view, status changes, importance changes, and delete
- Dexie / IndexedDB storage in the browser
- Mock AI analysis without any real AI API call
- Automatic category and tag creation from mock analysis results
- Easy, medium, and advanced explanation sections
- Category list with review status, rename, and delete
- Home statistics backed by local data

## Mock AI Analysis

The current analysis is deterministic mock logic. It checks bookmark text and URL for keywords such as Bitcoin, AI, React, TypeScript, economy, and education. Based on those keywords, it fills the bookmark title, summary, category, tags, difficulty explanations, importance, and confidence.

No OpenAI API, serverless function, or API key is used in this PR. Real AI integration is intentionally left for a later PR.

## Local Data

Bookmarks, categories, and tags are stored only in the browser IndexedDB database named `easybook-db`.

- `bookmarks`: saved bookmark records and mock analysis output
- `categories`: user or AI-created categories
- `tags`: user or AI-created tags

If the browser site data is cleared, saved Easybook data can disappear.

## Next PR

The next PR will connect a real AI API, add a Vercel serverless function, parse AI JSON responses, and strengthen failed-analysis retry handling.
