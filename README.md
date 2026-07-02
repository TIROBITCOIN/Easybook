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
- Home, bookmarks, add, categories, and settings routes
- Local bookmark creation with link, original text, title, and memo
- Bookmark list, search, detail view, status changes, importance changes, and delete
- Home statistics backed by local bookmark data

## Local Data

Bookmarks are stored only in the browser IndexedDB database named `easybook-db`, in the `bookmarks` table. If the browser site data is cleared, saved bookmarks can disappear.

## Next PR

The next PR will add mock AI analysis for title, summary, category, tags, and easy/medium/advanced explanations.
