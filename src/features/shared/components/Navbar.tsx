import React from 'react';
import type { AppSettings } from '../../../core/entities/Settings';
import type { UserProfile } from '../../../core/entities/User';
import { Share2, GitCommit, Inbox, Edit3, Settings as SettingsIcon, CheckCircle2, AlertCircle, LogIn, MoreHorizontal } from 'lucide-react';


export type TabId = 'explorer' | 'pending' | 'preview' | 'settings';

interface Props {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  pendingCount: number;
  settings: AppSettings;
  user: UserProfile | null;
  onOpenGoogleAuth: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  pendingCount,
  settings,
  user,
  onOpenGoogleAuth,
}) => {
  const isGithubConfigured = Boolean(settings.githubToken);
  const isGeminiConfigured = Boolean(settings.geminiApiKey);

  return (
    <header className="app-header">
      <div className="brand-logo">
        <div className="brand-icon">
          <Share2 size={20} />
        </div>
        <h1 className="brand-title">PostIt</h1>
      </div>

      <nav className="nav-tabs">
        <button
          className={`nav-tab ${activeTab === 'explorer' ? 'active' : ''}`}
          onClick={() => setActiveTab('explorer')}
        >
          <GitCommit size={16} />
          <span>Explorador</span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <Inbox size={16} />
          <span>Pendientes</span>
          {pendingCount > 0 && <span className="badge-count">{pendingCount}</span>}
        </button>

        <button
          className={`nav-tab ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          <Edit3 size={16} />
          <span>Editor & Preview</span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <SettingsIcon size={16} />
          <span>Ajustes</span>
          {(!isGithubConfigured || !isGeminiConfigured) && (
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-orange)' }} />
          )}
        </button>
      </nav>

      <div className="header-status-indicators">
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isGithubConfigured ? 'var(--accent-github-hover)' : 'var(--text-muted)' }}>
          {isGithubConfigured ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
          <span>GitHub</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isGeminiConfigured ? 'var(--accent-github-hover)' : 'var(--text-muted)' }}>
          {isGeminiConfigured ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
          <span>Gemini AI</span>
        </div>

        {/* Google Authentication / User Profile Widget (Matching X Profile Bar) */}
        <button
          className="user-profile-widget"
          onClick={onOpenGoogleAuth}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '6px 12px',
            borderRadius: '9999px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
          }}
        >
          {user ? (
            <>
              <img
                src={user.avatarUrl}
                alt={user.name}
                style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid var(--border-color)', objectFit: 'cover' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.2 }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {user.name}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {user.handle || `@${user.email.split('@')[0]}`}
                </span>
              </div>
              <MoreHorizontal size={16} color="var(--text-primary)" style={{ marginLeft: '6px' }} />
            </>
          ) : (
            <>
              <LogIn size={15} color="var(--accent-x)" />
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>Google Login</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
