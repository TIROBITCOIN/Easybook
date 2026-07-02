import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { LockScreen } from './components/LockScreen';
import { PrivacyNotice } from './components/PrivacyNotice';
import { getSettings } from './db/repo';
import { AddBookmarkPage } from './pages/AddBookmarkPage';
import { BookmarkDetailPage } from './pages/BookmarkDetailPage';
import { BookmarksPage } from './pages/BookmarksPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { HomePage } from './pages/HomePage';
import { SettingsPage } from './pages/SettingsPage';
import type { AppSettings } from './types';

export function App() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    void getSettings().then((loadedSettings) => {
      setSettings(loadedSettings);
      setIsUnlocked(!loadedSettings.appLockEnabled);
      document.documentElement.classList.toggle('light', loadedSettings.theme === 'light');
    });
  }, []);

  useEffect(() => {
    if (settings) {
      document.documentElement.classList.toggle('light', settings.theme === 'light');
    }
  }, [settings]);

  if (!settings) {
    return <main className="screen">로딩 중...</main>;
  }

  if (!isUnlocked) {
    return (
      <LockScreen
        onSettingsChanged={setSettings}
        onUnlocked={() => setIsUnlocked(true)}
        settings={settings}
      />
    );
  }

  return (
    <>
      {!settings.hasAcceptedAiPrivacyNotice ? <PrivacyNotice onAccepted={setSettings} /> : null}
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="/bookmarks/:id" element={<BookmarkDetailPage />} />
          <Route path="/add" element={<AddBookmarkPage />} />
          <Route path="/share-target" element={<AddBookmarkPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/settings" element={<SettingsPage onSettingsChanged={setSettings} settings={settings} />} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Route>
      </Routes>
    </>
  );
}
