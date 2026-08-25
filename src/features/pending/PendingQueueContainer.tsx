import React, { useState, useRef } from 'react';
import type { Post } from '../../core/entities/Post';
import { usePendingQueue } from './hooks/usePendingQueue';
import { Inbox, Trash2, Edit3, GitCommit, Clock } from 'lucide-react';

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
  const [dimensions, setDimensions] = useState<{ width?: number; height?: number }>({});
  const isResizing = useRef(false);
  const startPos = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!cardRef.current) return;

    isResizing.current = true;
    const rect = cardRef.current.getBoundingClientRect();
    startPos.current = {
      x: e.clientX,
      y: e.clientY,
      w: rect.width,
      h: rect.height,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizing.current) return;
      const deltaX = moveEvent.clientX - startPos.current.x;
      const deltaY = moveEvent.clientY - startPos.current.y;

      const newWidth = Math.max(280, startPos.current.w + deltaX);
      const newHeight = Math.max(170, startPos.current.h + deltaY);

      setDimensions({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      ref={cardRef}
      className="github-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        position: 'relative',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        minHeight: dimensions.height ? `${dimensions.height}px` : 'auto',
        height: dimensions.height ? `${dimensions.height}px` : 'auto',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
        <div>
          <span className="badge badge-pending" style={{ marginBottom: '6px' }}>
            {post.repoFullName}
          </span>
          <h3 style={{ fontSize: '0.98rem', fontWeight: 700, lineHeight: '1.35', color: 'var(--text-primary)' }}>
            {post.title}
          </h3>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
          <Clock size={12} /> {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Content box: Same background as card, expands naturally without inner scrollbar */}
      <div
        style={{
          background: 'transparent',
          padding: '0.4rem 0',
          fontSize: '0.88rem',
          lineHeight: '1.55',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          color: 'var(--text-primary)',
          flex: 1,
          overflowY: 'auto',
        }}
      >
        {post.content}
      </div>

      {post.hashtags.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {post.hashtags.map((h, i) => (
            <span key={i} style={{ fontSize: '0.78rem', color: 'var(--accent-x)', fontWeight: 600 }}>
              {h}
            </span>
          ))}
        </div>
      )}

      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <GitCommit size={14} color="var(--accent-blue)" />
        <span>Basado en {post.commits.length} commit(s)</span>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.65rem', borderTop: '1px solid var(--border-color)', paddingRight: '1rem' }}>
        <button
          className="btn btn-primary btn-sm"
          style={{ flex: 1, justifyContent: 'center' }}
          onClick={() => queue.handleReviewInPreview(post)}
        >
          <Edit3 size={14} /> Revisar en Preview
        </button>

        <button
          className="btn btn-danger btn-sm"
          onClick={() => queue.handleDismiss(post.id)}
          title="Descartar"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Inverted L Icon Resize Handle (esquina inferior derecha) */}
      <div
        className="resize-handle-inverted-l"
        onMouseDown={handleMouseDown}
        title="Arrastrar para redimensionar tarjeta (L al revés)"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v10H2" />
          <path d="M12 6v6H6" strokeWidth="1.5" opacity="0.6" />
        </svg>
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
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Pendientes de Revisión ({queue.pendingPosts.length})</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Commits detectados automáticamente que esperan tu aprobación antes de enviarse. Arrastra desde la esquina inferior derecha (ícono L al revés ⌟) para redimensionar.
          </p>
        </div>
      </div>

      {/* Non-overlapping Responsive CSS Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1.25rem',
          alignItems: 'start',
          width: '100%',
        }}
      >
        {queue.pendingPosts.map((post) => (
          <ResizablePendingCard key={post.id} post={post} queue={queue} />
        ))}
      </div>
    </div>
  );
};
