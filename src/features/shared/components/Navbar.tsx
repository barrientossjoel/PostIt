import React from 'react';
import type { AppSettings } from '../../../core/entities/Settings';
import { Share2, GitCommit, Inbox, Edit3, Settings as SettingsIcon, CheckCircle2, AlertCircle } from 'lucide-react';

export type TabId = 'explorer' | 'pending' | 'preview' | 'settings';

interface Props {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  pendingCount: number;
  settings: AppSettings;
}

export const Navbar: React.FC<Props> = ({ activeTab, setActiveTab, pendingCount, settings }) => {
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
      </div>
    </header>
  );
};
