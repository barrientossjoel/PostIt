import React from 'react';
import type { Post } from '../../core/entities/Post';
import { usePendingQueue } from './hooks/usePendingQueue';
import { Inbox, Trash2, Edit3, GitCommit, Clock, ArrowRight } from 'lucide-react';
import { MasonryGrid } from '../shared/components/MasonryGrid';

interface Props {
  onSelectForPreview: (post: Post) => void;
  onNavigateToPreview: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

interface ResizableCardProps {
  post: Post;
  queue: ReturnType<typeof usePendingQueue>;
}

const ResizablePendingCard: React.FC<ResizableCardProps> = ({ post, queue }) => {
  const isSelected = queue.selectedPostIds.includes(post.id);

  const formattedTime = new Date(post.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className="github-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.9rem',
        border: isSelected ? '1.5px solid var(--accent-cyan)' : undefined,
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '220px',
        boxSizing: 'border-box',
        transition: 'border 0.2s ease, box-shadow 0.2s ease',
        boxShadow: isSelected ? '0 4px 20px rgba(0, 229, 255, 0.15)' : 'none',
        resize: 'both',
        overflow: 'hidden',
      }}
    >
      {/* Top Header Row: Checkbox + Repo Pill + Timestamp */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            className="checkbox-custom"
            checked={isSelected}
            onChange={() => queue.togglePostSelection(post.id)}
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
          <span
            style={{
              background: 'rgba(168, 85, 247, 0.15)',
              color: '#c084fc',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              padding: '3px 10px',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            {post.repoFullName}
          </span>
        </div>

        <span
          style={{
            fontSize: '0.78rem',
            color: '#8a8f9d',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            whiteSpace: 'nowrap',
          }}
        >
          <Clock size={13} color="#8a8f9d" /> {formattedTime}
        </span>
      </div>

      {/* Title */}
      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, lineHeight: '1.3', color: '#ffffff', margin: 0 }}>
        {post.title}
      </h3>

      {/* Post Preview Content */}
      <div
        style={{
          fontSize: '0.86rem',
          lineHeight: '1.55',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          color: '#d1d5db',
          flex: 1,
          fontFamily: post.content.includes('```') ? 'Consolas, Monaco, monospace' : 'inherit',
        }}
      >
        {post.content}
      </div>

      {/* Hashtags */}
      {post.hashtags.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {post.hashtags.map((h, i) => (
            <span key={i} style={{ fontSize: '0.82rem', color: '#1d9bf0', fontWeight: 600 }}>
              {h.startsWith('#') ? h : `#${h}`}
            </span>
          ))}
        </div>
      )}

      {/* Commits Meta */}
      <div style={{ fontSize: '0.78rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '5px' }}>
        <GitCommit size={14} color="var(--accent-cyan)" />
        <span>Basado en {post.commits.length} commit(s)</span>
      </div>

      {/* Bottom Action Bar: Pill White Button + Circular Trash Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginTop: 'auto',
          paddingTop: '0.5rem',
          paddingRight: '1rem',
        }}
      >
        <button
          type="button"
          onClick={() => queue.handleReviewInPreview(post)}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: '#eef2f6',
            color: '#0f1419',
            border: 'none',
            borderRadius: '9999px',
            padding: '0.65rem 1.25rem',
            fontSize: '0.86rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'background 0.15s ease, transform 0.1s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#ffffff')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#eef2f6')}
        >
          <Edit3 size={15} color="#0f1419" /> Revisar en Preview
        </button>

        <button
          type="button"
          onClick={() => queue.handleDismiss(post.id)}
          title="Eliminar pendiente"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'background 0.15s ease, transform 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)')}
        >
          <Trash2 size={16} color="#ef4444" />
        </button>
      </div>

    </div>
  );
};

export const PendingQueueContainer: React.FC<Props> = ({
  onSelectForPreview,
  onNavigateToPreview,
  showToast,
}) => {
  const queue = usePendingQueue(
    (post) => {
      onSelectForPreview(post);
      onNavigateToPreview();
    },
    showToast
  );

  if (queue.pendingPosts.length === 0) {
    return (
      <div className="github-card empty-state animate-fade-in">
        <Inbox className="empty-icon" size={40} />
        <h2>Bandeja de Pendientes vacía</h2>
        <p>No tienes publicaciones pendientes de revisión. Escanea nuevos commits desde el Explorador de Repositorios.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Pendientes de Revisión ({queue.pendingPosts.length})</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Commits detectados automáticamente que esperan tu aprobación antes de enviarse. Selecciona uno o varios pendientes para combinarlos.
          </p>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={queue.toggleSelectAll}>
          {queue.selectedPostIds.length === queue.pendingPosts.length ? 'Desmarcar Todos' : 'Marcar Todos'}
        </button>
      </div>

      <MasonryGrid columnWidth={280} gap={20}>
        {queue.pendingPosts.map((post) => (
          <ResizablePendingCard key={post.id} post={post} queue={queue} />
        ))}
      </MasonryGrid>

      {/* Sticky Viewport-Anchored Floating Bar (zIndex: 9999) */}
      {queue.selectedPostIds.length > 0 && (
        <div
          className="floating-action-bar"
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            zIndex: 9999,
            padding: '0.85rem 1.25rem',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--accent-blue)',
            borderRadius: 'var(--radius-md, 10px)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: '0 10px 32px rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(12px)',
            maxWidth: 'calc(100vw - 3rem)',
          }}
        >
          <div>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              {queue.selectedPostIds.length} pendiente(s) seleccionado(s)
            </span>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              Combinar e importar directamente al Editor
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={queue.generateCombinedPostFromSelected}
            style={{ fontWeight: 600 }}
          >
            Generar Post en Preview
            <ArrowRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
};
