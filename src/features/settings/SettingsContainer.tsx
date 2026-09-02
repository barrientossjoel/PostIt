import React, { useState, useEffect } from 'react';
import type { AppSettings } from '../../core/entities/Settings';
import type { UserProfile } from '../../core/entities/User';
import type { SocialAccount } from '../preview/types/SocialAccount';
import { useSettings } from './hooks/useSettings';
import { Save, ExternalLink, Check, CheckCircle2, AlertCircle, Settings2, Plus } from 'lucide-react';
import { SocialAccountSettingsModal } from './components/SocialAccountSettingsModal';
import { AddSocialAccountModal } from '../preview/components/AddSocialAccountModal';

interface Props {
  settings: AppSettings;
  user?: UserProfile | null;
  onSettingsSaved: (s: AppSettings) => Promise<void> | void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onOpenAuth?: () => void;
}

const STORAGE_KEY = 'postit_social_accounts';

export const SettingsContainer: React.FC<Props> = ({
  settings,
  user,
  onSettingsSaved,
  showToast,
  onOpenAuth,
}) => {
  const { form, updateField, testingGithub, githubUser, testGithubToken, saveSettings } =
    useSettings(settings, onSettingsSaved, showToast);

  const [accounts, setAccounts] = useState<SocialAccount[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedAccount, setSelectedAccount] = useState<SocialAccount | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  }, [accounts]);

  const handleUpdateAccount = (updated: SocialAccount) => {
    setAccounts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  const handleRemoveAccount = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAddAccount = (accData: Omit<SocialAccount, 'id' | 'selected'>) => {
    const newAcc: SocialAccount = {
      ...accData,
      id: `acc_${accData.platform}_${Date.now()}`,
      selected: true,
    };
    setAccounts((prev) => [...prev, newAcc]);
    showToast(`Cuenta de ${newAcc.platform.toUpperCase()} agregada`, 'success');
  };

  const isGithubConfigured = Boolean(settings.githubToken);
  const isGeminiConfigured = Boolean(settings.geminiApiKey);

  const getPlatformBadge = (platform: SocialAccount['platform']) => {
    switch (platform) {
      case 'linkedin': return { bg: '#0a66c2', label: 'in' };
      case 'x': return { bg: '#000000', label: '𝕏' };
      case 'threads': return { bg: '#18181b', label: '@' };
      case 'instagram': return { bg: 'linear-gradient(45deg, #f09433, #dc2743, #bc1888)', label: 'ig' };
      default: return { bg: 'var(--accent-blue)', label: 'S' };
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* SECCIÓN 0: Perfil de Usuario */}
      <div className="github-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{user ? user.name : 'Cuenta de Usuario'}</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {user ? user.email : 'Inicia sesión para sincronizar tus configuraciones y redes sociales.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            className={user ? "btn btn-secondary btn-sm" : "btn btn-primary btn-sm"}
            onClick={onOpenAuth}
          >
            {user ? 'Cerrar Sesión / Gestionar' : 'Iniciar Sesión'}
          </button>
        </div>
      </div>

      {/* SECCIÓN 1: Redes Sociales Conectadas */}
      <div className="github-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Redes Sociales Conectadas</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Gestiona las cuentas sociales vinculadas para publicaciones automáticas en Publer.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setIsAddModalOpen(true)}
            style={{ borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)' }}
          >
            <Plus size={14} /> Vincular Red Social
          </button>
        </div>

        {accounts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No hay redes sociales vinculadas aún. Haz clic en <strong>Vincular Red Social</strong> para agregar LinkedIn, Twitter/X, Threads o Instagram.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {accounts.map((acc) => {
              const badge = getPlatformBadge(acc.platform);
              return (
                <div
                  key={acc.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.9rem',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-input)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ position: 'relative' }}>
                      <img
                        src={acc.avatarUrl}
                        alt={acc.name}
                        style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '-3px',
                          left: '-3px',
                          background: badge.bg,
                          color: '#fff',
                          fontSize: '9px',
                          fontWeight: 800,
                          width: '15px',
                          height: '15px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid #16181c',
                        }}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>{acc.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                        @{acc.handle.replace(/^@/, '')} • {acc.platform.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setSelectedAccount(acc);
                      setIsSettingsModalOpen(true);
                    }}
                  >
                    <Settings2 size={14} /> Configurar
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECCIÓN 2: Credenciales y API Keys */}
      <div className="github-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Configuración y Credenciales</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Tus credenciales se guardan localmente en tu navegador de forma 100% segura.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              borderRadius: '9999px',
              background: isGithubConfigured ? 'rgba(46, 160, 67, 0.15)' : 'rgba(83, 100, 113, 0.15)',
              color: isGithubConfigured ? 'var(--accent-github-hover)' : 'var(--text-muted)',
              fontWeight: 600
            }}>
              {isGithubConfigured ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              <span>GitHub</span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              borderRadius: '9999px',
              background: isGeminiConfigured ? 'rgba(46, 160, 67, 0.15)' : 'rgba(83, 100, 113, 0.15)',
              color: isGeminiConfigured ? 'var(--accent-github-hover)' : 'var(--text-muted)',
              fontWeight: 600
            }}>
              {isGeminiConfigured ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              <span>Gemini AI</span>
            </div>
          </div>
        </div>

        {/* GitHub PAT */}
        <div className="input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              Token Personal de GitHub (PAT)
            </label>
            <a
              href="https://github.com/settings/tokens/new?scopes=repo&description=PostItApp"
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Obtener Token ( scope 'repo' ) <ExternalLink size={12} />
            </a>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="password"
              className="input-text"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              value={form.githubToken}
              onChange={(e) => updateField('githubToken', e.target.value)}
            />
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={testGithubToken}
              disabled={testingGithub}
            >
              {testingGithub ? 'Probando...' : 'Probar'}
            </button>
          </div>
          {githubUser && (
            <p style={{ fontSize: '0.78rem', color: 'var(--accent-github-hover)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Check size={14} /> Autenticado como @{githubUser} (Acceso a repos públicos y privados activo)
            </p>
          )}
        </div>

        {/* Gemini API Key */}
        <div className="input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              API Key de Google Gemini (Gratis)
            </label>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Conseguir API Key <ExternalLink size={12} />
            </a>
          </div>
          <input
            type="password"
            className="input-text"
            placeholder="AIzaSyxxxxxxxxxxxxxxxxxxxx"
            value={form.geminiApiKey}
            onChange={(e) => updateField('geminiApiKey', e.target.value)}
          />
        </div>

        {/* Publer API Key */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }} className="input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              Publer API Key (Opcional)
            </label>
            <a
              href="https://publer.io"
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Ir a Publer <ExternalLink size={12} />
            </a>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="password"
              className="input-text"
              style={{ flex: 1 }}
              placeholder="Publer API Key"
              value={form.publerApiKey}
              onChange={(e) => updateField('publerApiKey', e.target.value)}
            />
            <input
              type="text"
              className="input-text"
              style={{ flex: 1 }}
              placeholder="Workspace ID (opcional)"
              value={form.publerWorkspaceId || ''}
              onChange={(e) => updateField('publerWorkspaceId', e.target.value)}
            />
          </div>
        </div>

        {/* AI Defaults */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="input-group">
            <label className="input-label">Tono Predeterminado de IA</label>
            <select
              className="select-input"
              value={form.aiTone}
              onChange={(e) => updateField('aiTone', e.target.value as any)}
            >
              <option value="developer">👨‍💻 Dev Geek (Técnico e informativo)</option>
              <option value="enthusiastic">🚀 Entusiasta / Hype</option>
              <option value="professional">💼 Profesional / Release note</option>
              <option value="concise">⚡ Conciso</option>
              <option value="storytelling">📖 Storytelling</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Idioma del Post</label>
            <select
              className="select-input"
              value={form.aiLanguage}
              onChange={(e) => updateField('aiLanguage', e.target.value as any)}
            >
              <option value="es">🇪🇸 Español</option>
              <option value="en">🇺🇸 Inglés</option>
            </select>
          </div>
        </div>

        <button type="button" className="btn btn-primary" onClick={saveSettings} style={{ marginTop: '0.5rem', alignSelf: 'flex-end' }}>
          <Save size={16} /> Guardar Ajustes
        </button>
      </div>

      {/* Modal de Configuración Individual de Cuenta Social (Publer Style) */}
      <SocialAccountSettingsModal
        account={selectedAccount}
        isOpen={isSettingsModalOpen}
        onClose={() => {
          setIsSettingsModalOpen(false);
          setSelectedAccount(null);
        }}
        onUpdateAccount={handleUpdateAccount}
        onRemoveAccount={handleRemoveAccount}
        showToast={showToast}
      />

      {/* Modal de Agregar Red Social */}
      <AddSocialAccountModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddAccount={handleAddAccount}
        user={user}
        publerApiKey={settings.publerApiKey}
      />
    </div>
  );
};
