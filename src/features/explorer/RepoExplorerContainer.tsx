import React from 'react';
import type { AppSettings } from '../../core/entities/Settings';
import type { Post } from '../../core/entities/Post';
import type { Commit } from '../../core/entities/Commit';
import { useRepoExplorer } from './hooks/useRepoExplorer';
import {
  Search,
  FolderGit2,
  GitCommit,
  CheckSquare,
  Square,
  RefreshCw,
  Sparkles,
  Lock,
  Globe,
  ArrowRight,
  ChevronRight,
  ArrowLeft,
  MoreHorizontal,
  GitBranch,
  Copy,
  ChevronLeft,
  ArrowUpDown,
} from 'lucide-react';

interface Props {
  settings: AppSettings;
  onSaveSettings: (s: AppSettings) => void;
  onPostGenerated: (post: Post) => void;
  onNavigateToPreview: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

// Format relative time (e.g., "2 hours ago", "3 days ago")
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'hace un momento';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `hace ${diffInMinutes} min`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
  return date.toLocaleDateString();
}

// Format Date Header (e.g., "Commits en 25 ago 2026")
function formatDateHeader(dateString: string): string {
  const date = new Date(dateString);
  return `Commits en ${date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

// Split commit message into title and body
function parseCommitMessage(message: string) {
  const lines = message.split('\n');
  const title = lines[0] || '';
  const body = lines.slice(1).join('\n').trim();
  return { title, body, hasBody: body.length > 0 };
}

// Group commits preserving array order
function groupCommitsByDatePreservingOrder(commits: Commit[]) {
  const groups: { [dateKey: string]: Commit[] } = {};
  for (const c of commits) {
    const dateKey = new Date(c.author.date).toDateString();
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(c);
  }
  return groups;
}

export const RepoExplorerContainer: React.FC<Props> = ({
  settings,
  onSaveSettings,
  onPostGenerated,
  onNavigateToPreview,
  showToast,
}) => {
  const explorer = useRepoExplorer(
    settings,
    onSaveSettings,
    (post) => {
      onPostGenerated(post);
      onNavigateToPreview();
    },
    showToast
  );

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copiado`, 'success');
  };

  const commitGroups = groupCommitsByDatePreservingOrder(explorer.commits);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%' }}>
      {/* GitHub Breadcrumb Header */}
      <div
        className="github-card"
        style={{
          padding: '0.65rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.88rem',
          fontWeight: 600,
          background: 'var(--bg-secondary)',
        }}
      >
        <button
          onClick={() => explorer.setMobileStep('repos')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent-blue)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            font: 'inherit',
            fontWeight: 600,
            padding: 0,
          }}
        >
          <FolderGit2 size={16} /> Repositorios
        </button>

        {explorer.selectedRepo && (
          <>
            <ChevronRight size={14} color="var(--text-muted)" />
            <span style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {explorer.selectedRepo.isPrivate ? <Lock size={12} color="var(--accent-orange)" /> : <Globe size={12} color="var(--accent-github-hover)" />}
              {explorer.selectedRepo.fullName}
            </span>
          </>
        )}
      </div>

      <div className="grid-split animate-fade-in">
        {/* Panel 1: Repositories List (Hidden on mobile if viewing commits) */}
        <div
          className={`github-card ${explorer.mobileStep === 'commits' ? 'hide-mobile' : ''}`}
          style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%', minWidth: 0, height: 'fit-content' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FolderGit2 size={18} color="var(--accent-blue)" />
              <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Mis Repositorios</h2>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={explorer.loadRepos} disabled={explorer.loadingRepos}>
              <RefreshCw size={13} className={explorer.loadingRepos ? 'spin' : ''} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="input-text"
                placeholder="Buscar repositorio..."
                style={{ paddingLeft: '2rem', fontSize: '0.82rem' }}
                value={explorer.searchQuery}
                onChange={(e) => explorer.setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
              {(['all', 'public', 'private'] as const).map((type) => (
                <button
                  key={type}
                  className={`btn btn-secondary btn-sm ${explorer.filterType === type ? 'btn-primary' : ''}`}
                  style={{ flex: '1 1 0px', minWidth: 0, fontSize: '0.75rem', padding: '0.35rem 0.25rem', justifyContent: 'center', overflow: 'hidden', textOverflow: 'ellipsis' }}
                  onClick={() => explorer.setFilterType(type)}
                >
                  {type === 'all' ? 'Todos' : type === 'public' ? 'Públicos' : 'Privados'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
            {explorer.repos.map((repo) => {
              const isSelected = explorer.selectedRepo?.id === repo.id;
              const isAutoScanEnabled = settings.enabledRepoIds.includes(repo.id);

              return (
                <div
                  key={repo.id}
                  onClick={() => explorer.handleSelectRepo(repo)}
                  style={{
                    padding: '0.65rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: isSelected ? 'var(--bg-tertiary)' : 'transparent',
                    border: isSelected ? '1px solid var(--accent-blue)' : '1px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {repo.isPrivate ? (
                        <span title="Privado" style={{ display: 'inline-flex' }}>
                          <Lock size={12} color="var(--accent-orange)" />
                        </span>
                      ) : (
                        <span title="Público" style={{ display: 'inline-flex' }}>
                          <Globe size={12} color="var(--accent-github-hover)" />
                        </span>
                      )}
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {repo.name}
                      </span>
                    </div>
                    {repo.language && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{repo.language}</span>}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        explorer.toggleAutoScanRepo(repo.id);
                      }}
                      title={isAutoScanEnabled ? 'Monitoreo auto activo' : 'Click para monitorear'}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: isAutoScanEnabled ? 'var(--accent-x)' : 'var(--text-muted)' }}
                    >
                      {isAutoScanEnabled ? <CheckSquare size={16} /> : <Square size={16} />}
                    </button>
                    <ChevronRight size={14} color="var(--text-muted)" />
                  </div>
                </div>
              );
            })}
          </div>

          <button
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={explorer.scanForPendings}
            disabled={explorer.scanning}
          >
            <Sparkles size={14} color="var(--accent-purple)" />
            {explorer.scanning ? 'Escaneando...' : 'Escanear p/ Pendientes'}
          </button>
        </div>

        {/* Panel 2: Commits List (Hidden on mobile if viewing repos) */}
        <div
          className={`github-card ${explorer.mobileStep === 'repos' ? 'hide-mobile' : ''}`}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', minWidth: 0 }}
        >
          {explorer.selectedRepo ? (
            <>
              {/* Minimalistic Clean Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.65rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    className="btn btn-secondary btn-sm show-mobile"
                    onClick={() => explorer.setMobileStep('repos')}
                    style={{ padding: '3px 8px' }}
                    title="Volver a Repositorios"
                  >
                    <ArrowLeft size={14} />
                  </button>

                  {/* Branch selector tag */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                    }}
                  >
                    <GitBranch size={13} color="var(--accent-blue)" />
                    <span>{explorer.selectedRepo.defaultBranch}</span>
                  </div>

                  <h2 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                    {explorer.selectedRepo.name}
                    <span className={explorer.selectedRepo.isPrivate ? 'badge badge-private' : 'badge badge-public'}>
                      {explorer.selectedRepo.isPrivate ? 'Privado' : 'Público'}
                    </span>
                  </h2>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* Sort Order Toggle Button */}
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={explorer.toggleSortOrder}
                    title={explorer.sortOrder === 'desc' ? 'Orden actual: Más recientes primero. Click para invertir' : 'Orden actual: Más antiguos primero. Click para invertir'}
                  >
                    <ArrowUpDown size={13} color="var(--accent-blue)" />
                    <span>{explorer.sortOrder === 'desc' ? 'Más recientes' : 'Más antiguos'}</span>
                  </button>

                  <button className="btn btn-secondary btn-sm" onClick={explorer.toggleSelectAllCommits}>
                    {explorer.selectedCommitShas.length === explorer.commits.length ? 'Desmarcar Todos' : 'Marcar Todos'}
                  </button>
                </div>
              </div>

              {explorer.loadingCommits ? (
                <div className="empty-state">
                  <RefreshCw size={24} className="spin" />
                  <p>Cargando commits de GitHub...</p>
                </div>
              ) : explorer.commits.length === 0 ? (
                <div className="empty-state">
                  <GitCommit size={30} />
                  <p>No se encontraron commits recientes en este repositorio.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  {Object.entries(commitGroups).map(([dateKey, groupCommits]) => (
                    <div key={dateKey} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {/* Date Group Header */}
                      <div
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          paddingLeft: '4px',
                        }}
                      >
                        <GitCommit size={14} color="var(--accent-blue)" />
                        <span>{formatDateHeader(dateKey)}</span>
                      </div>

                      {/* GitHub Commit Cards */}
                      <div style={{ display: 'flex', flexDirection: 'column', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', overflow: 'hidden', background: 'transparent' }}>
                        {groupCommits.map((c, idx) => {
                          const isChecked = explorer.selectedCommitShas.includes(c.sha);
                          const isExpanded = explorer.expandedCommitShas.includes(c.sha);
                          const { title, body, hasBody } = parseCommitMessage(c.message);

                          return (
                            <div
                              key={c.sha}
                              onClick={() => explorer.toggleCommitSelection(c.sha)}
                              style={{
                                padding: '0.75rem 0.9rem',
                                background: isChecked ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                                borderBottom: idx < groupCommits.length - 1 ? '1px solid var(--border-color)' : 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '0.75rem',
                                transition: 'all 0.12s ease',
                              }}
                            >
                              <input
                                type="checkbox"
                                className="checkbox-custom"
                                checked={isChecked}
                                onChange={() => {}}
                                style={{ marginTop: '3px' }}
                              />

                              <div style={{ flex: 1, minWidth: 0 }}>
                                {/* Title Line + Optional GitHub "..." Pill */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                                  <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                                    {title}
                                  </span>

                                  {hasBody && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        explorer.toggleExpandCommitBody(c.sha);
                                      }}
                                      style={{
                                        background: 'var(--bg-tertiary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '4px',
                                        color: 'var(--text-secondary)',
                                        padding: '1px 5px',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        fontSize: '0.7rem',
                                      }}
                                      title={isExpanded ? 'Ocultar descripción' : 'Mostrar descripción'}
                                    >
                                      <MoreHorizontal size={12} />
                                    </button>
                                  )}
                                </div>

                                {/* Expanded Body Text (GitHub Style) */}
                                {hasBody && isExpanded && (
                                  <div
                                    style={{
                                      margin: '6px 0',
                                      padding: '0.5rem 0.75rem',
                                      background: 'var(--bg-primary)',
                                      border: '1px solid var(--border-subtle)',
                                      borderRadius: 'var(--radius-sm)',
                                      fontSize: '0.8rem',
                                      fontFamily: 'var(--font-mono)',
                                      color: 'var(--text-secondary)',
                                      whiteSpace: 'pre-wrap',
                                      wordBreak: 'break-word',
                                    }}
                                  >
                                    {body}
                                  </div>
                                )}

                                {/* Metadata: Author + Time */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', flexWrap: 'wrap', marginTop: '2px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <div
                                      style={{
                                        width: 16,
                                        height: 16,
                                        borderRadius: '50%',
                                        background: 'var(--accent-blue)',
                                        color: '#ffffff',
                                        fontSize: '0.6rem',
                                        fontWeight: 800,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}
                                    >
                                      {c.author.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span>{c.author.name} committed {formatRelativeTime(c.author.date)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Right Side SHA & Copy Action */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', alignSelf: 'center' }}>
                                <span
                                  style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.75rem',
                                    color: 'var(--accent-blue)',
                                    background: 'var(--bg-tertiary)',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    border: '1px solid var(--border-subtle)',
                                  }}
                                >
                                  {c.sha.slice(0, 7)}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(c.sha, 'SHA de commit');
                                  }}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    padding: '3px',
                                    display: 'flex',
                                    alignItems: 'center',
                                  }}
                                  title="Copiar Hash SHA"
                                >
                                  <Copy size={13} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* GitHub Bottom Pagination Control */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '12px',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid var(--border-color)',
                      marginTop: '0.5rem',
                    }}
                  >
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={explorer.handlePrevPage}
                      disabled={explorer.page <= 1 || explorer.loadingCommits}
                    >
                      <ChevronLeft size={14} /> Anterior
                    </button>

                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Página {explorer.page}
                    </span>

                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={explorer.handleNextPage}
                      disabled={!explorer.hasMoreCommits || explorer.loadingCommits}
                    >
                      Siguiente <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {explorer.selectedCommitShas.length > 0 && (
                <div
                  style={{
                    marginTop: 'auto',
                    padding: '0.85rem 1rem',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                      {explorer.selectedCommitShas.length} commit(s) seleccionado(s)
                    </span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Generar borrador inteligente con IA
                    </p>
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={explorer.generatePostFromSelectedCommits}
                    disabled={explorer.generatingPost}
                  >
                    <Sparkles size={15} />
                    {explorer.generatingPost ? 'Generando...' : 'Generar Post en Preview'}
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <FolderGit2 size={36} />
              <p>Selecciona un repositorio de la lista para ver sus commits.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
