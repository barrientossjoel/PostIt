import React, { useState } from 'react';
import type { Post } from '../../../core/entities/Post';
import { MessageSquare, Heart, Repeat, Share, Globe, ThumbsUp, MessageCircle, BarChart2, Bookmark } from 'lucide-react';

interface Props {
  post: Post | null;
  content: string;
  hashtags: string[];
}

export const SocialCardSimulator: React.FC<Props> = ({ post, content, hashtags }) => {
  const [activePlatform, setActivePlatform] = useState<'x' | 'linkedin' | 'facebook'>('x');

  const fullText = hashtags.length > 0 ? `${content}\n\n${hashtags.join(' ')}` : content;
  const charCount = fullText.length;
  const xLimit = 280;

  return (
    <div className="github-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Simulador de Redes</h3>
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-primary)', padding: '3px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          {(['x', 'linkedin', 'facebook'] as const).map((p) => (
            <button
              key={p}
              className={`btn btn-sm ${activePlatform === p ? 'btn-primary' : 'btn-secondary'}`}
              style={{ textTransform: 'capitalize', fontSize: '0.75rem', padding: '3px 8px' }}
              onClick={() => setActivePlatform(p)}
            >
              {p === 'x' ? 'X / Twitter' : p === 'linkedin' ? 'LinkedIn' : 'Facebook'}
            </button>
          ))}
        </div>
      </div>

      {/* Character count bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
        <span>Límite de caracteres (X):</span>
        <span style={{ color: charCount > xLimit ? 'var(--accent-red)' : 'var(--accent-github-hover)', fontWeight: 700 }}>
          {charCount} / {xLimit}
        </span>
      </div>

      {/* Simulated Social Card - Fused with official X typography */}
      <div
        style={{
          background: activePlatform === 'x' ? '#000000' : 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '1rem 1.25rem',
          color: '#e7e9ea',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* User Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '0.75rem' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1d9bf0, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: '#ffffff',
              fontSize: '0.95rem',
              flexShrink: 0,
            }}
          >
            P
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f7f9f9', display: 'flex', alignItems: 'center', gap: '4px', lineHeight: '1.2' }}>
              PostIt Dev <span style={{ fontSize: '0.75rem', color: '#1d9bf0' }}>✔</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#71767b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              @dev_builder • ahora {activePlatform === 'linkedin' && <Globe size={12} />}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ fontSize: '0.95rem', lineHeight: '1.5', whiteSpace: 'pre-wrap', marginBottom: '0.85rem', color: '#e7e9ea', fontWeight: 400 }}>
          {content || 'Escribe tu borrador para previsualizar aquí...'}
          {hashtags.length > 0 && (
            <div style={{ color: '#1d9bf0', marginTop: '0.5rem', fontWeight: 500 }}>
              {hashtags.join(' ')}
            </div>
          )}
        </div>

        {/* Repository Tag Card */}
        {post?.repoFullName && (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '0.65rem 0.85rem',
              marginBottom: '0.85rem',
              fontSize: '0.82rem',
              color: '#71767b',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ color: '#e7e9ea', fontWeight: 500 }}>📦 Repositorio: {post.repoFullName}</span>
            <span style={{ color: '#1d9bf0' }}>github.com</span>
          </div>
        )}

        {/* Social Actions Simulation */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '0.75rem',
            color: '#71767b',
            fontSize: '0.82rem',
          }}
        >
          {activePlatform === 'x' ? (
            <>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}><MessageSquare size={16} /> 12</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}><Repeat size={16} /> 8</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}><Heart size={16} /> 45</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}><BarChart2 size={16} /> 63 mil</span>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Bookmark size={16} style={{ cursor: 'pointer' }} />
                <Share size={16} style={{ cursor: 'pointer' }} />
              </div>
            </>
          ) : (
            <>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}><ThumbsUp size={15} /> Me gusta</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}><MessageCircle size={15} /> Comentar</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}><Repeat size={15} /> Repostear</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
