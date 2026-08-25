import { useState, useEffect } from 'react';
import type { AppSettings } from './core/entities/Settings';
import type { Post } from './core/entities/Post';
import { container } from './infrastructure/container';

import { Navbar } from './features/shared/components/Navbar';
import type { TabId } from './features/shared/components/Navbar';
import { ToastContainer } from './features/shared/components/Toast';
import type { ToastMessage } from './features/shared/components/Toast';

import { RepoExplorerContainer } from './features/explorer/RepoExplorerContainer';
import { PendingQueueContainer } from './features/pending/PendingQueueContainer';
import { PostPreviewContainer } from './features/preview/PostPreviewContainer';
import { SettingsContainer } from './features/settings/SettingsContainer';

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>('explorer');
  const [settings, setSettings] = useState<AppSettings>(() => container.settingsRepository.getSettings());
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    updatePendingCount();
  }, [activeTab]);

  const updatePendingCount = () => {
    const allPosts = container.postRepository.getAllPosts();
    const count = allPosts.filter((p) => p.status === 'pending').length;
    setPendingCount(count);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast_${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleSettingsSaved = (newSettings: AppSettings) => {
    setSettings(newSettings);
    container.settingsRepository.saveSettings(newSettings);
  };

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingCount}
        settings={settings}
      />

      <main className="main-content">
        {activeTab === 'explorer' && (
          <RepoExplorerContainer
            settings={settings}
            onSaveSettings={handleSettingsSaved}
            onPostGenerated={(post) => {
              setCurrentPost(post);
              updatePendingCount();
            }}
            onNavigateToPreview={() => setActiveTab('preview')}
            showToast={showToast}
          />
        )}

        {activeTab === 'pending' && (
          <PendingQueueContainer
            onSelectForPreview={(post) => setCurrentPost(post)}
            onNavigateToPreview={() => setActiveTab('preview')}
            showToast={showToast}
          />
        )}

        {activeTab === 'preview' && (
          <PostPreviewContainer
            currentPost={currentPost}
            settings={settings}
            onPostUpdated={(post) => {
              setCurrentPost(post);
              updatePendingCount();
            }}
            showToast={showToast}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsContainer
            settings={settings}
            onSettingsSaved={handleSettingsSaved}
            showToast={showToast}
          />
        )}
      </main>

      <ToastContainer toasts={toasts} />
    </div>
  );
}

export default App;
