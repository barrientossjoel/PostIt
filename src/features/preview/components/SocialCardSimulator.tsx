import React, { useState, useEffect } from 'react';
import type { Post } from '../../../core/entities/Post';
import type { SocialAccount } from '../types/SocialAccount';
import {
  MessageSquare,
  Heart,
  Repeat,
  Share,
  Globe,
  ThumbsUp,
  MessageCircle,
  BarChart2,
  Bookmark,
  Scissors,
  Monitor,
  Smartphone,
  MoreHorizontal,
  Send,
  Info,
} from 'lucide-react';

interface Props {
  post: Post | null;
  content: string;
  hashtags?: string[];
  activeAccount?: SocialAccount;
  githubUser?: string;
  githubAvatar?: string;
  onSmartTrim?: () => void;
}

export const SocialCardSimulator: React.FC<Props> = ({
  post,
  content,
  activeAccount,
  githubUser = '',
  githubAvatar,
  onSmartTrim,
}) => {
  const [activePlatform, setActivePlatform] = useState<'linkedin' | 'x' | 'facebook'>('x');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    if (activeAccount?.platform) {
      if (activeAccount.platform === 'linkedin' || activeAccount.platform === 'x') {
        setActivePlatform(activeAccount.platform);
      }
    }
  }, [activeAccount?.platform]);

  const charCount = content.length;
  const platformLimits: Record<'linkedin' | 'x' | 'facebook', number> = {
    x: 280,
    linkedin: 3000,
    facebook: 5000,
  };
  const limit = platformLimits[activePlatform];
  const isOverLimit = charCount > limit;

  const displayName = activeAccount
    ? activeAccount.name
    : githubUser.trim()
    ? githubUser
    : 'Sin cuenta vinculada';

  const handleName = activeAccount
    ? (activeAccount.handle.startsWith('@') ? activeAccount.handle : `@${activeAccount.handle}`)
    : githubUser.trim()
    ? `@${githubUser.toLowerCase().replace(/\s+/g, '')}`
    : '@sin_cuenta';

  const avatarUrl = activeAccount?.avatarUrl || githubAvatar;

  return (
    <div
      className="github-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        width: '100%',
        minWidth: 0,
      }}
    >
      {/* Header: Post Preview ℹ️ + Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '0.65rem',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Post Preview
          </h3>
          <span title="Vista previa en tiempo real adaptada a la red social" style={{ display: 'inline-flex', cursor: 'help', color: 'var(--text-muted)' }}>
            <Info size={14} />
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Platform Selector Dropdown / Tabs */}
          <select
            className="select-input"
            value={activePlatform}
            onChange={(e) => setActivePlatform(e.target.value as any)}
            style={{
              padding: '3px 8px',
              fontSize: '0.78rem',
              fontWeight: 600,
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <option value="linkedin">💼 LinkedIn</option>
            <option value="x">𝕏 / Twitter</option>
            <option value="facebook">📘 Facebook</option>
          </select>

          {/* View Mode Switcher (Desktop / Mobile) */}
          <div
            style={{
              display: 'flex',
              gap: '2px',
              background: 'var(--bg-primary)',
              padding: '2px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
            }}
          >
            <button
              type="button"
              className={`btn btn-sm ${viewMode === 'desktop' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '3px 6px' }}
              onClick={() => setViewMode('desktop')}
              title="Vista de Escritorio"
            >
              <Monitor size={13} />
            </button>
            <button
              type="button"
              className={`btn btn-sm ${viewMode === 'mobile' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '3px 6px' }}
              onClick={() => setViewMode('mobile')}
              title="Vista Móvil"
            >
              <Smartphone size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Character Count Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.76rem',
          color: 'var(--text-muted)',
        }}
      >
        <span>Límite de caracteres ({activePlatform.toUpperCase()}):</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isOverLimit && onSmartTrim && (
            <button
              type="button"
              className="btn btn-danger btn-sm"
              style={{ padding: '1px 6px', fontSize: '0.72rem' }}
              onClick={onSmartTrim}
              title="Recortar texto automáticamente para cumplir el límite de 280 caracteres"
            >
              <Scissors size={12} /> Auto-recortar
            </button>
          )}
          <span
            style={{
              color: isOverLimit ? 'var(--accent-red)' : 'var(--accent-github-hover)',
              fontWeight: 700,
            }}
          >
            {charCount} / {limit}
          </span>
        </div>
      </div>

      {/* Container Wrapper with Mobile vs Desktop constraint */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
        }}
      >
        <div
          style={{
            width: viewMode === 'mobile' ? '100%' : '100%',
            maxWidth: viewMode === 'mobile' ? '360px' : '100%',
            background: activePlatform === 'x' ? '#000000' : 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: viewMode === 'mobile' ? '20px' : '12px',
            padding: viewMode === 'mobile' ? '1rem' : '1.1rem',
            color: '#e7e9ea',
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            boxSizing: 'border-box',
            boxShadow: viewMode === 'mobile' ? '0 8px 24px rgba(0,0,0,0.4)' : 'none',
          }}
        >
          {/* User Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '0.75rem' }}>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background:
                    activePlatform === 'linkedin'
                      ? '#0a66c2'
                      : activePlatform === 'facebook'
                      ? '#1877f2'
                      : 'linear-gradient(135deg, #1d9bf0, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  flexShrink: 0,
                }}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  color: '#f7f9f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  lineHeight: '1.2',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <span>{displayName}</span>
                  {activePlatform === 'x' && <span style={{ fontSize: '0.75rem', color: '#1d9bf0' }}>✔</span>}
                </div>
                <MoreHorizontal size={16} color="#71767b" style={{ cursor: 'pointer' }} />
              </div>

              <div
                style={{
                  fontSize: '0.78rem',
                  color: '#71767b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '2px',
                }}
              >
                <span>{activePlatform === 'x' ? handleName : 'Software Engineer & Builder'}</span>
                <span>•</span>
                <span>ahora</span>
                <span>•</span>
                <Globe size={11} color="#71767b" />
              </div>
            </div>
          </div>

          {/* Main Body Content */}
          <div
            style={{
              fontSize: '0.92rem',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap',
              marginBottom: '0.85rem',
              color: '#e7e9ea',
              fontWeight: 400,
              wordBreak: 'break-word',
            }}
          >
            {content || 'Escribe o genera el contenido de tu publicación para previsualizar aquí...'}
          </div>

          {/* Embedded Repository Snippet Card */}
          {post?.repoFullName && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                padding: '0.6rem 0.8rem',
                marginBottom: '0.85rem',
                fontSize: '0.8rem',
                color: '#71767b',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ color: '#e7e9ea', fontWeight: 600 }}>📦 Repositorio: {post.repoFullName}</span>
              <span style={{ color: '#1d9bf0', fontSize: '0.75rem' }}>github.com</span>
            </div>
          )}

          {/* Social Platform Actions */}
          <div
            style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              paddingTop: '0.65rem',
              color: '#71767b',
              fontSize: '0.8rem',
            }}
          >
            {activePlatform === 'linkedin' ? (
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                  <ThumbsUp size={15} /> Me gusta
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                  <MessageCircle size={15} /> Comentar
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                  <Repeat size={15} /> Repostear
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                  <Send size={15} /> Enviar
                </span>
              </div>
            ) : activePlatform === 'x' ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <MessageSquare size={15} /> Responder
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <Repeat size={15} /> Repostear
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <Heart size={15} /> Me gusta
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <BarChart2 size={15} /> Vistas
                </span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Bookmark size={15} style={{ cursor: 'pointer' }} />
                  <Share size={15} style={{ cursor: 'pointer' }} />
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                  <ThumbsUp size={15} /> Me gusta
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                  <MessageCircle size={15} /> Comentar
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                  <Share size={15} /> Compartir
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
