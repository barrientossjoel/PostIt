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

  // User Google Auth state
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('postit_user_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_GOOGLE_USER;
      }
    }
    return DEFAULT_GOOGLE_USER;
  });

  const [settings, setSettings] = useState<AppSettings>(() =>
    container.settingsRepository.getSettings(user?.id)
  );
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    updatePendingCount();
  }, [activeTab]);

  useEffect(() => {
    if (user) {
      const userSettings = container.settingsRepository.getSettings(user.id);
      const mergedSettings: AppSettings = {
        ...userSettings,
        githubToken: user.githubToken || userSettings.githubToken || settings.githubToken,
        geminiApiKey: user.geminiApiKey || userSettings.geminiApiKey || settings.geminiApiKey,
        publerApiKey: user.publerApiKey || userSettings.publerApiKey || settings.publerApiKey,
        publerWorkspaceId: user.publerWorkspaceId || userSettings.publerWorkspaceId || settings.publerWorkspaceId,
        aiTone: user.aiTone || userSettings.aiTone || settings.aiTone,
        aiLanguage: user.aiLanguage || userSettings.aiLanguage || settings.aiLanguage,
      };
      setSettings(mergedSettings);
      container.settingsRepository.saveSettings(mergedSettings, user.id);
      localStorage.setItem(
        'postit_user_session',
        JSON.stringify({
          ...user,
          githubToken: mergedSettings.githubToken,
          geminiApiKey: mergedSettings.geminiApiKey,
          publerApiKey: mergedSettings.publerApiKey,
          publerWorkspaceId: mergedSettings.publerWorkspaceId,
          aiTone: mergedSettings.aiTone,
          aiLanguage: mergedSettings.aiLanguage,
        })
      );
    } else {
      localStorage.removeItem('postit_user_session');
    }
  }, [user?.id]);

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
    container.settingsRepository.saveSettings(newSettings, user?.id);
    if (user) {
      const updatedUser: UserProfile = {
        ...user,
        githubToken: newSettings.githubToken,
        geminiApiKey: newSettings.geminiApiKey,
        publerApiKey: newSettings.publerApiKey,
        publerWorkspaceId: newSettings.publerWorkspaceId,
        aiTone: newSettings.aiTone,
        aiLanguage: newSettings.aiLanguage,
      };
      setUser(updatedUser);
    }
  };

  const handleLoginWithGoogle = (email?: string, name?: string) => {
    const activeSettings = container.settingsRepository.getSettings(user?.id);
    const userId = `usr_google_${email ? email.replace(/[^a-zA-Z0-9]/g, '_') : 'default'}`;
    const newUser: UserProfile = {
      id: userId,
      email: email || 'joel.barrientos@gmail.com',
      name: name || 'Joel Barrientos',
      avatarUrl: 'https://github.com/barrientossjoel.png',
      provider: 'google',
      githubToken: activeSettings.githubToken,
      geminiApiKey: activeSettings.geminiApiKey,
      publerApiKey: activeSettings.publerApiKey,
      publerWorkspaceId: activeSettings.publerWorkspaceId,
      aiTone: activeSettings.aiTone,
      aiLanguage: activeSettings.aiLanguage,
      connectedAccounts: {
        x: true,
        linkedin: true,
        facebook: true,
      },
    };
    setUser(newUser);
    container.settingsRepository.saveSettings(activeSettings, userId);
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
