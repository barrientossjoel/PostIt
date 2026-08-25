import React from 'react';
import type { Post } from '../../core/entities/Post';
import type { AppSettings } from '../../core/entities/Settings';
import { usePostPreview } from './hooks/usePostPreview';
import { SocialCardSimulator } from './components/SocialCardSimulator';
import { Copy, Send, Wand2, FileText, Share2 } from 'lucide-react';

interface Props {
  currentPost: Post | null;
  settings: AppSettings;
  onPostUpdated: (post: Post) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const PostPreviewContainer: React.FC<Props> = ({
  currentPost,
  settings,
  onPostUpdated,
  showToast,
}) => {
  const preview = usePostPreview(currentPost, settings, onPostUpdated, showToast);

  const hashtagsArray = preview.hashtagsStr
    .split(' ')
    .filter((h) => h.trim().length > 0)
    .map((h) => (h.startsWith('#') ? h : `#${h}`));

  return (
    <div className="grid-split animate-fade-in">
      {/* Left Column: Editor & AI Controls */}
      <div className="github-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="var(--accent-blue)" /> Editor de Posteo
            </h2>
            {currentPost && (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Basado en {currentPost.commits.length} commit(s) de {currentPost.repoFullName}
              </span>
            )}
          </div>
        </div>

        {/* Text Area */}
        <div className="input-group">
          <label className="input-label">Contenido del Post</label>
          <textarea
            className="textarea-input"
            rows={6}
            placeholder="Escribe o genera tu publicación..."
            value={preview.content}
            onChange={(e) => preview.setContent(e.target.value)}
          />
        </div>

        {/* Hashtags Input */}
        <div className="input-group">
          <label className="input-label">Hashtags (separados por espacio)</label>
          <input
            type="text"
            className="input-text"
            placeholder="#BuildInPublic #DevUpdate #React"
            value={preview.hashtagsStr}
            onChange={(e) => preview.setHashtagsStr(e.target.value)}
          />
        </div>

        {/* AI Quick Refinements Bar */}
        <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}>
            <Wand2 size={14} /> Refinar con IA (Gemini):
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => preview.handleRefine('Hazlo más corto y conciso (máximo 250 caracteres)')}
              disabled={preview.refining}
            >
              ⚡ Más corto
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => preview.handleRefine('Añade un tono más entusiasta con emojis dev')}
              disabled={preview.refining}
            >
              🚀 Emojis Dev
            </button>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => preview.handleRefine('Traduce el post a Inglés nativo dev')}
              disabled={preview.refining}
            >
              🇺🇸 Inglés
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {/* 1-Click X Share Intent */}
            <button
              className="btn btn-x-black"
              onClick={() => preview.handlePublish('x-intent')}
              disabled={preview.publishing}
              style={{ flex: '1 1 180px', justifyContent: 'center' }}
            >
              <Share2 size={15} /> Publicar en X (Gratis)
            </button>

            {/* Publer API Publish */}
            <button
              className="btn btn-primary"
              onClick={() => preview.handlePublish('publer')}
              disabled={preview.publishing || !settings.publerApiKey}
              style={{ flex: '1 1 180px', justifyContent: 'center' }}
              title={!settings.publerApiKey ? 'Configura tu API Key de Publer en Ajustes' : ''}
            >
              <Send size={15} /> Publicar vía Publer
            </button>
          </div>

          <button className="btn btn-secondary" onClick={preview.handleCopyClipboard} style={{ width: '100%', justifyContent: 'center' }}>
            <Copy size={15} /> Copiar al Portapapeles
          </button>
        </div>
      </div>

      {/* Right Column: Live Social Card Simulator */}
      <SocialCardSimulator post={currentPost} content={preview.content} hashtags={hashtagsArray} />
    </div>
  );
};
