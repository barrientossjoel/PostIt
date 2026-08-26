import React, { useState } from 'react';
import type { Post } from '../../core/entities/Post';
import { Send, CheckCircle2, Share2, Globe, ExternalLink } from 'lucide-react';

interface Props {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onConfirmPublished: (post: Post) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const SocialSharePanel: React.FC<Props> = ({
  post,
  isOpen,
  onClose,
  onConfirmPublished,
  showToast,
}) => {
  const [selectedNetwork, setSelectedNetwork] = useState<'x' | 'linkedin' | 'facebook'>('x');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  if (!isOpen) return null;

  const fullText = `${post.content}\n\n${post.hashtags.join(' ')}`;

  const handleSimulatedPublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      setPublishedSuccess(true);
      showToast(`¡Publicación enviada con éxito a ${selectedNetwork.toUpperCase()}!`, 'success');
      onConfirmPublished(post);
    }, 1200);
  };

  const handleOpenExternalIntent = () => {
    const encoded = encodeURIComponent(fullText);
    let targetUrl = `https://twitter.com/intent/tweet?text=${encoded}`;
    if (selectedNetwork === 'linkedin') {
      targetUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://github.com/${post.repoFullName}`)}&summary=${encoded}`;
    } else if (selectedNetwork === 'facebook') {
      targetUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://github.com/${post.repoFullName}`)}&quote=${encoded}`;
    }
    window.open(targetUrl, '_blank', 'width=600,height=500');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="github-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          boxShadow: 'var(--shadow-md)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Share2 size={22} color="var(--accent-x)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Publicación Directa Embedida (Publer Suite)</h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '1.2rem',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* Network Selector Tabs */}
        <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-primary)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <button
            className={`btn btn-sm ${selectedNetwork === 'x' ? 'btn-x-black' : 'btn-secondary'}`}
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => setSelectedNetwork('x')}
          >
            𝕏 (X / Twitter)
          </button>
          <button
            className={`btn btn-sm ${selectedNetwork === 'linkedin' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, justifyContent: 'center', background: selectedNetwork === 'linkedin' ? '#0a66c2' : undefined }}
            onClick={() => setSelectedNetwork('linkedin')}
          >
            LinkedIn
          </button>
          <button
            className={`btn btn-sm ${selectedNetwork === 'facebook' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1, justifyContent: 'center', background: selectedNetwork === 'facebook' ? '#1877f2' : undefined }}
            onClick={() => setSelectedNetwork('facebook')}
          >
            Facebook
          </button>
        </div>

        {/* Embedded Post Preview Container */}
        <div
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <Globe size={14} /> <span>Destino: <strong>{selectedNetwork.toUpperCase()}</strong></span>
          </div>

          <div style={{ fontSize: '0.9rem', lineHeight: '1.55', whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
            {fullText}
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleOpenExternalIntent}
            title="Abrir ventana externa como respaldo"
          >
            <ExternalLink size={14} /> Abrir Ventana
          </button>

          <button
            className="btn btn-primary"
            style={{ flex: 1, justifyContent: 'center' }}
            disabled={isPublishing || publishedSuccess}
            onClick={handleSimulatedPublish}
          >
            {isPublishing ? (
              <span>Enviando...</span>
            ) : publishedSuccess ? (
              <>
                <CheckCircle2 size={16} /> ¡Publicado con éxito!
              </>
            ) : (
              <>
                <Send size={16} /> Publicar Directo en {selectedNetwork.toUpperCase()}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
