import React from 'react';
import type { AppSettings } from '../../../core/entities/Settings';
import type { UserProfile } from '../../../core/entities/User';
import { Share2, GitCommit, Inbox, Edit3, Settings as SettingsIcon, LogIn } from 'lucide-react';

export type TabId = 'explorer' | 'pending' | 'preview' | 'settings';

interface Props {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  pendingCount: number;
  settings: AppSettings;
  user: UserProfile | null;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  pendingCount,
  settings,
  user,
  onOpenAuth,
}) => {
  const isGithubConfigured = Boolean(settings.githubToken);
  const isGeminiConfigured = Boolean(settings.geminiApiKey);

  return (
    <header className="app-header">
      {/* Brand Logo Top Left */}
      <div className="brand-logo">
        <div className="brand-icon">
          <Share2 size={20} />
        </div>
        <h1 className="brand-title hide-mobile">PostIt</h1>
      </div>

      {/* Centered Navigation Tabs */}
      <nav className="nav-tabs">
        <button
          className={`nav-tab ${activeTab === 'explorer' ? 'active' : ''}`}
          onClick={() => setActiveTab('explorer')}
        >
          <GitCommit size={16} />
          <span className="hide-mobile">Explorador</span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <Inbox size={16} />
          <span className="hide-mobile">Pendientes</span>
          {pendingCount > 0 && <span className="badge-count">{pendingCount}</span>}
        </button>

        <button
          className={`nav-tab ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          <Edit3 size={16} />
          <span className="hide-mobile">Editor & Preview</span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <SettingsIcon size={16} />
          <span className="hide-mobile">Ajustes</span>
          {(!isGithubConfigured || !isGeminiConfigured) && (
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-orange)' }} />
          )}
        </button>
      </nav>

      {/* Auth / Profile Area Top Right */}
      <div className="auth-area" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {user ? (
          <button
            type="button"
            className="account-item-row"
            onClick={onOpenAuth}
            title="Gestionar Perfil y Cuentas de Google"
            style={{ padding: '4px 10px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-input)', borderRadius: '9999px' }}
          >
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="account-avatar"
              style={{ width: '26px', height: '26px' }}
            />
            <span className="account-name selected-text" style={{ fontSize: '0.82rem' }}>
              {user.name}
            </span>
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onOpenAuth}
          >
            <LogIn size={15} color="var(--accent-x)" />
            <span>Iniciar Sesión</span>
          </button>
        )}
      </div>
    </header>
  );
};
