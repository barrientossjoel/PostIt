import React, { useState } from 'react';
import type { Post } from '../../core/entities/Post';
import type { AppSettings } from '../../core/entities/Settings';
import { usePostPreview } from './hooks/usePostPreview';
import { SocialCardSimulator } from './components/SocialCardSimulator';
import { SocialSharePanel } from './SocialSharePanel';
import { freeTranslationAdapter } from '../../infrastructure/adapters/FreeTranslationAdapter';
import { container } from '../../infrastructure/container';
import { Copy, Send, Wand2, FileText, Share2, Globe2, Scissors, RotateCcw, XCircle } from 'lucide-react';

interface Props {
  currentPost: Post | null;
  settings: AppSettings;
  onPostUpdated: (post: Post) => void;
  onNavigateToPending?: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const PostPreviewContainer: React.FC<Props> = ({
  currentPost,
  settings,
  onPostUpdated,
  onNavigateToPending,
  showToast,
}) => {
  const preview = usePostPreview(currentPost, settings, onPostUpdated, showToast);
  const [isSharePanelOpen, setIsSharePanelOpen] = useState(false);
  const [translating, setTranslating] = useState(false);

  const hashtagsArray = preview.hashtagsStr
    .split(' ')
    .filter((h) => h.trim().length > 0)
    .map((h) => (h.startsWith('#') ? h : `#${h}`));

  const fullText = hashtagsArray.length > 0 ? `${preview.content}\n\n${hashtagsArray.join(' ')}` : preview.content;
  const isOverLimit = fullText.length > 280;

  // Zero-AI Free Translation to Spanish
  const handleFreeTranslateToSpanish = async () => {
    if (!preview.content) return;
    setTranslating(true);
    try {
      const translated = await freeTranslationAdapter.translateToSpanish(preview.content);
      preview.setContent(translated);
      showToast('Texto traducido al español (Gratis sin IA)', 'success');
    } catch {
      showToast('No se pudo traducir automáticamente', 'error');
    } finally {
      setTranslating(false);
    }
  };

  // Smart Trim to 280 Characters
  const handleSmartTrim = () => {
    const hashtagsLength = hashtagsArray.join(' ').length + (hashtagsArray.length > 0 ? 2 : 0);
    const maxContentLen = Math.max(50, 275 - hashtagsLength);

    let trimmed = preview.content.slice(0, maxContentLen);
    const lastSpace = trimmed.lastIndexOf(' ');
    if (lastSpace > 30) {
      trimmed = trimmed.slice(0, lastSpace);
    }
    trimmed = `${trimmed.trim()}...`;
    preview.setContent(trimmed);
    showToast('Post recortado inteligentemente a 280 caracteres', 'success');
  };

  // Cancel and Return to Pending Queue
  const handleCancelAndReturnToPending = async () => {
    if (!currentPost) return;
    try {
      const updatedPost: Post = {
        ...currentPost,
        content: preview.content,
        hashtags: hashtagsArray,
        status: 'pending',
      };
      await container.postRepository.savePost(updatedPost);
      onPostUpdated(updatedPost);
      showToast('Publicación cancelada y devuelta a Pendientes', 'success');
      if (onNavigateToPending) {
        onNavigateToPending();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

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

          {currentPost && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleCancelAndReturnToPending}
              style={{ color: 'var(--accent-orange)' }}
              title="Cancelar borrador y devolver a la cola de pendientes"
            >
              <RotateCcw size={14} /> Cancelar p/ Pendientes
            </button>
          )}
        </div>

        {/* Text Area */}
        <div className="input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="input-label">Contenido del Post</label>

            {/* Zero-AI Free Spanish Translation button */}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleFreeTranslateToSpanish}
              disabled={translating}
              style={{ padding: '2px 7px', fontSize: '0.75rem', color: 'var(--accent-blue)' }}
            >
              <Globe2 size={13} /> {translating ? 'Traduciendo...' : '🌐 Traducir a Español (Gratis)'}
            </button>
          </div>
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

        {/* Character Limit Warning & 1-Click Trim Action */}
        {isOverLimit && (
          <div
            style={{
              padding: '0.65rem 0.85rem',
              background: 'rgba(248, 81, 73, 0.12)',
              border: '1px solid rgba(248, 81, 73, 0.3)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
            }}
          >
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-red)', fontWeight: 600 }}>
              ⚠️ Excede el límite de X ({fullText.length} / 280)
            </span>
            <button className="btn btn-danger btn-sm" onClick={handleSmartTrim}>
              <Scissors size={14} /> Recortar a 280 chars
            </button>
          </div>
        )}

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
            {/* Embedded Social Share Suite */}
            <button
              className="btn btn-x-black"
              onClick={() => setIsSharePanelOpen(true)}
              style={{ flex: '1 1 180px', justifyContent: 'center' }}
            >
              <Share2 size={15} /> Publicar Embedido en Redes (Publer)
            </button>

            {/* Publer Direct API Publish */}
            <button
              className="btn btn-primary"
              onClick={() => preview.handlePublish('publer')}
              disabled={preview.publishing || !settings.publerApiKey}
              style={{ flex: '1 1 180px', justifyContent: 'center' }}
              title={!settings.publerApiKey ? 'Configura tu API Key de Publer en Ajustes' : ''}
            >
              <Send size={15} /> Enviar Vía API Publer
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={preview.handleCopyClipboard} style={{ flex: 1, justifyContent: 'center' }}>
              <Copy size={15} /> Copiar al Portapapeles
            </button>

            {currentPost && (
              <button
                className="btn btn-danger btn-sm"
                onClick={handleCancelAndReturnToPending}
                title="Cancelar y Devolver a Pendientes"
              >
                <XCircle size={15} /> Cancelar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Live Social Card Simulator */}
      <SocialCardSimulator
        post={currentPost}
        content={preview.content}
        hashtags={hashtagsArray}
        onSmartTrim={handleSmartTrim}
      />

      {/* Embedded Social Share Suite Drawer Modal */}
      {currentPost && (
        <SocialSharePanel
          post={{ ...currentPost, content: preview.content, hashtags: hashtagsArray }}
          isOpen={isSharePanelOpen}
          onClose={() => setIsSharePanelOpen(false)}
          onConfirmPublished={() => {
            setIsSharePanelOpen(false);
            showToast('Post marcado como publicado', 'success');
          }}
          showToast={showToast}
        />
      )}
    </div>
  );
};
