# Easybook

Mobile-first PWA for saving X/Twitter bookmark links or text into browser IndexedDB, then organizing them with local-first category, tag, explanation, and backup workflows.

## Stack

- Vite, React, TypeScript
- Tailwind CSS
- Dexie / IndexedDB
- React Router
- Web Crypto API
- PWA manifest with Web Share Target
- Vercel serverless API seam for future AI calls

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Privacy Model

Easybook does not create accounts and does not use a server database. Bookmark data is stored in the browser IndexedDB. The first implementation uses mock AI analysis locally; the serverless AI route is a no-storage integration seam for a future real model.
