import React from 'react';
import type { AppSettings } from '../../core/entities/Settings';
import { useSettings } from './hooks/useSettings';
import { Key, Save, ExternalLink, ShieldCheck, Sparkles, Share2, Check, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  settings: AppSettings;
  onSettingsSaved: (s: AppSettings) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const SettingsContainer: React.FC<Props> = ({
  settings,
  onSettingsSaved,
  showToast,
}) => {
  const { form, updateField, testingGithub, githubUser, testGithubToken, saveSettings } =
    useSettings(settings, onSettingsSaved, showToast);

  const isGithubConfigured = Boolean(settings.githubToken);
  const isGeminiConfigured = Boolean(settings.geminiApiKey);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div className="github-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Key size={24} color="var(--accent-blue)" />
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
              <ShieldCheck size={14} color="var(--accent-blue)" /> Token Personal de GitHub (PAT)
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
              <Sparkles size={14} color="var(--accent-purple)" /> API Key de Google Gemini (Gratis)
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
              <Share2 size={14} color="var(--accent-github-hover)" /> Publer API Key (Opcional)
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
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
    </div>
  );
};
