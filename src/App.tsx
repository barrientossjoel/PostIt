import { useState, useEffect } from 'react';
import type { AppSettings } from './core/entities/Settings';
import type { Post } from './core/entities/Post';
import type { UserProfile } from './core/entities/User';
import { container } from './infrastructure/container';

import { Navbar } from './features/shared/components/Navbar';
import type { TabId } from './features/shared/components/Navbar';
import { ToastContainer } from './features/shared/components/Toast';
import type { ToastMessage } from './features/shared/components/Toast';

import { RepoExplorerContainer } from './features/explorer/RepoExplorerContainer';
import { PendingQueueContainer } from './features/pending/PendingQueueContainer';
import { PostPreviewContainer } from './features/preview/PostPreviewContainer';
import { SettingsContainer } from './features/settings/SettingsContainer';
import { GoogleAuthModal } from './features/auth/GoogleAuthModal';

const DEFAULT_GOOGLE_USER: UserProfile = {
  id: 'usr_google_001',
  email: 'joel.barrientos@gmail.com',
  name: 'Joe',
  handle: '@jbardev',
  avatarUrl: 'https://github.com/barrientossjoel.png',
  provider: 'google',
  connectedAccounts: {
    x: true,
    linkedin: true,
    facebook: false,
  },
};


export function App() {
  const [activeTab, setActiveTab] = useState<TabId>('explorer');
  const [settings, setSettings] = useState<AppSettings>(() => container.settingsRepository.getSettings());
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // User Google Auth state
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('postit_user_session');
    return saved ? JSON.parse(saved) : DEFAULT_GOOGLE_USER;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    updatePendingCount();
  }, [activeTab]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('postit_user_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('postit_user_session');
    }
  }, [user]);

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

  const handleLoginWithGoogle = (email?: string, name?: string) => {
    const newUser: UserProfile = {
      id: `usr_google_${Date.now()}`,
      email: email || 'usuario.google@gmail.com',
      name: name || 'Usuario Google',
      avatarUrl: 'https://github.com/barrientossjoel.png',
      provider: 'google',
      connectedAccounts: {
        x: true,
        linkedin: true,
        facebook: true,
      },
    };
    setUser(newUser);
  };

  const handleLogout = () => {
    setUser(null);
    showToast('Sesión de Google cerrada', 'info');
    setIsAuthModalOpen(false);
  };

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingCount}
        settings={settings}
        user={user}
        onOpenGoogleAuth={() => setIsAuthModalOpen(true)}
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
            onNavigateToPending={() => setActiveTab('pending')}
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

      <GoogleAuthModal
        user={user}
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginWithGoogle={handleLoginWithGoogle}
        onLogout={handleLogout}
        onUpdateConnectedAccounts={(accounts) => {
          if (user) {
            setUser({ ...user, connectedAccounts: accounts });
          }
        }}
        showToast={showToast}
      />

      <ToastContainer toasts={toasts} />
    </div>
  );
}

export default App;
