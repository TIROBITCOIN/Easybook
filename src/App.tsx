import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { AddBookmarkPage } from './routes/AddBookmarkPage';
import { BookmarksPage } from './routes/BookmarksPage';
import { CategoriesPage } from './routes/CategoriesPage';
import { HomePage } from './routes/HomePage';
import { SettingsPage } from './routes/SettingsPage';

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="/bookmarks" element={<BookmarksPage />} />
        <Route path="/add" element={<AddBookmarkPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Route>
    </Routes>
  );
}
