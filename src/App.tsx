import { useState, useEffect } from 'react';
import type { AppSettings } from './core/entities/Settings';
import type { Post } from './core/entities/Post';
import type { UserProfile } from './core/entities/User';
import { container } from './infrastructure/container';

import { Navbar } from './features/shared/components/Navbar';
import type { TabId } from './features/shared/components/Navbar';
import { ToastContainer } from './features/shared/components/Toast';
import type { ToastMessage } from './features/shared/components/Toast';
import { GoogleAuthModal } from './features/auth/GoogleAuthModal';
import { OAuthCallbackPage } from './features/auth/OAuthCallbackPage';

import { RepoExplorerContainer } from './features/explorer/RepoExplorerContainer';
import { PendingQueueContainer } from './features/pending/PendingQueueContainer';
import { PostPreviewContainer } from './features/preview/PostPreviewContainer';
import { SettingsContainer } from './features/settings/SettingsContainer';

import { LoginPage } from './features/auth/LoginPage';

const SESSION_KEY = 'postit_user_session';

const defaultSettings: AppSettings = {
  githubToken: '',
  geminiApiKey: '',
  publerApiKey: '',
  publerWorkspaceId: '',
  aiTone: 'developer',
  aiLanguage: 'es',
  enabledRepoIds: [],
};

export function App() {
  // Render the lightweight OAuth callback page inside the popup window
  if (window.location.pathname === '/oauth-callback') {
    return <OAuthCallbackPage />;
  }

  const [activeTab, setActiveTab] = useState<TabId>('explorer');
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // User Authentication State
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    // Sync userId with Turso DB
    container.tursoRepository.setUserId(user?.email || null);
    
    if (user) {
      container.settingsRepository.getSettings().then(setSettings);
    } else {
      setSettings(defaultSettings);
    }
    updatePendingCount();
  }, [user]);

  useEffect(() => {
    updatePendingCount();
  }, [activeTab]);

  const updatePendingCount = async () => {
    const allPosts = await container.postRepository.getAllPosts();
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

  const handleSettingsSaved = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    await container.settingsRepository.saveSettings(newSettings);
  };

  const handleLoginWithGoogle = (email: string, name: string, avatarUrl?: string) => {
    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      email,
      name,
      avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
      provider: 'google',
      connectedAccounts: user?.connectedAccounts || { x: false, linkedin: false, facebook: false },
    };
    setUser(newUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.setItem(SESSION_KEY, ''); // Emptying string to remove session
    localStorage.removeItem(SESSION_KEY);
    showToast('Sesión cerrada correctamente', 'info');
    setIsAuthModalOpen(false);
  };

  const handleUpdateConnectedAccounts = (accounts: UserProfile['connectedAccounts']) => {
    if (!user) return;
    const updated = { ...user, connectedAccounts: accounts };
    setUser(updated);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  };

  if (!user) {
    return (
      <>
        <LoginPage onLoginWithGoogle={handleLoginWithGoogle} showToast={showToast} />
        <ToastContainer toasts={toasts} />
      </>
    );
  }

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingCount}
        settings={settings}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
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
            user={user}
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
            user={user}
            onSettingsSaved={handleSettingsSaved}
            showToast={showToast}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}
      </main>

      <GoogleAuthModal
        user={user}
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginWithGoogle={handleLoginWithGoogle}
        onLogout={handleLogout}
        onUpdateConnectedAccounts={handleUpdateConnectedAccounts}
        showToast={showToast}
      />

      <ToastContainer toasts={toasts} />
    </div>
  );
}

export default App;
