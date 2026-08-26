import { useState, useEffect } from 'react';
import type { Repository } from '../../../core/entities/Repository';
import type { Commit } from '../../../core/entities/Commit';
import type { Post } from '../../../core/entities/Post';
import type { AppSettings } from '../../../core/entities/Settings';
import { container } from '../../../infrastructure/container';
import { ScanPendingCommitsUseCase } from '../../../core/usecases/ScanPendingCommitsUseCase';

export function useRepoExplorer(
  settings: AppSettings,
  onSaveSettings: (s: AppSettings) => void,
  onPostGenerated: (post: Post) => void,
  showToast: (msg: string, type?: 'success' | 'error') => void
) {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);

  const [commits, setCommits] = useState<Commit[]>([]);
  const [loadingCommits, setLoadingCommits] = useState(false);
  const [selectedCommitShas, setSelectedCommitShas] = useState<string[]>([]);
  const [expandedCommitShas, setExpandedCommitShas] = useState<string[]>([]);

  const [page, setPage] = useState(1);
  const [hasMoreCommits, setHasMoreCommits] = useState(true);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // 'desc' = más recientes, 'asc' = más antiguos

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'public' | 'private'>('all');
  const [scanning, setScanning] = useState(false);

  // Mobile Navigation Step: 'repos' | 'commits'
  const [mobileStep, setMobileStep] = useState<'repos' | 'commits'>('repos');

  useEffect(() => {
    loadRepos();
  }, [settings.githubToken]);

  const loadRepos = async () => {
    setLoadingRepos(true);
    try {
      if ('clearCache' in container.githubService && typeof (container.githubService as any).clearCache === 'function') {
        (container.githubService as any).clearCache();
      }
      const fetchedRepos = await container.githubService.fetchUserRepositories(settings.githubToken);
      setRepos(fetchedRepos);
      if (fetchedRepos.length > 0 && !selectedRepo) {
        setSelectedRepo(fetchedRepos[0]);
        fetchCommitsForRepo(fetchedRepos[0], 1, sortOrder);
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoadingRepos(false);
    }
  };

  const fetchCommitsForRepo = async (
    repo: Repository,
    pageNum: number,
    order: 'desc' | 'asc' = sortOrder
  ) => {
    setLoadingCommits(true);
    try {
      const fetchedCommits = await container.githubService.fetchRepositoryCommits(
        settings.githubToken,
        repo.fullName,
        35,
        pageNum,
        order
      );
      setCommits(fetchedCommits);
      setHasMoreCommits(fetchedCommits.length === 35);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoadingCommits(false);
    }
  };

  const handleSelectRepo = async (repo: Repository) => {
    setSelectedRepo(repo);
    setSelectedCommitShas([]);
    setExpandedCommitShas([]);
    setPage(1);
    setMobileStep('commits');
    await fetchCommitsForRepo(repo, 1, sortOrder);
  };

  const handleNextPage = async () => {
    if (!selectedRepo || !hasMoreCommits) return;
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchCommitsForRepo(selectedRepo, nextPage, sortOrder);
  };

  const handlePrevPage = async () => {
    if (!selectedRepo || page <= 1) return;
    const prevPage = page - 1;
    setPage(prevPage);
    await fetchCommitsForRepo(selectedRepo, prevPage, sortOrder);
  };

  const toggleSortOrder = async () => {
    const nextSort = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(nextSort);
    setPage(1);
    if (selectedRepo) {
      await fetchCommitsForRepo(selectedRepo, 1, nextSort);
    }
  };

  const toggleCommitSelection = (sha: string) => {
    setSelectedCommitShas((prev) =>
      prev.includes(sha) ? prev.filter((id) => id !== sha) : [...prev, sha]
    );
  };

  const toggleExpandCommitBody = (sha: string) => {
    setExpandedCommitShas((prev) =>
      prev.includes(sha) ? prev.filter((id) => id !== sha) : [...prev, sha]
    );
  };

  const toggleSelectAllCommits = () => {
    if (selectedCommitShas.length === commits.length) {
      setSelectedCommitShas([]);
    } else {
      setSelectedCommitShas(commits.map((c) => c.sha));
    }
  };

  const toggleAutoScanRepo = (repoId: number) => {
    const updatedIds = settings.enabledRepoIds.includes(repoId)
      ? settings.enabledRepoIds.filter((id) => id !== repoId)
      : [...settings.enabledRepoIds, repoId];

    const newSettings: AppSettings = { ...settings, enabledRepoIds: updatedIds };
    onSaveSettings(newSettings);
    showToast(
      updatedIds.includes(repoId) ? 'Repositorio marcado para monitoreo' : 'Monitoreo desactivado',
      'success'
    );
  };

  const scanForPendings = async () => {
    if (repos.length === 0) {
      showToast('No hay repositorios disponibles para escanear', 'error');
      return;
    }
    setScanning(true);
    try {
      const scanUseCase = new ScanPendingCommitsUseCase(
        container.githubService,
        container.aiGeneratorService,
        container.postRepository
      );
      const generatedPosts = await scanUseCase.execute({ repos, settings });
      showToast(`Escaneo finalizado: ${generatedPosts.length} nuevo(s) borrador(es) en Pendientes`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setScanning(false);
    }
  };

  const generatePostFromSelectedCommits = () => {
    if (!selectedRepo || selectedCommitShas.length === 0) return;

    const selectedCommits = commits.filter((c) => selectedCommitShas.includes(c.sha));

    let contentText = '';
    let postTitle = '';

    if (selectedCommits.length === 1) {
      const c = selectedCommits[0];
      const lines = c.message.split('\n');
      const title = lines[0] || '';
      const body = lines.slice(1).join('\n').trim();

      postTitle = `${selectedRepo.name}: ${title}`;
      contentText = body
        ? `🚀 Update en ${selectedRepo.name}:\n\n${title}\n\n${body}`
        : `🚀 Update en ${selectedRepo.name}:\n\n${title}`;
    } else {
      postTitle = `Actualización de ${selectedRepo.name} (${selectedCommits.length} commits)`;
      const items = selectedCommits
        .map((c) => {
          const title = c.message.split('\n')[0];
          return `• ${title}`;
        })
        .join('\n');
      contentText = `🚀 Updates en ${selectedRepo.name}:\n\n${items}`;
    }

    const newPost: Post = {
      id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      repoFullName: selectedRepo.fullName,
      commits: selectedCommits,
      title: postTitle,
      content: contentText,
      hashtags: ['#BuildInPublic', '#DevUpdate'],
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      aiTone: settings.aiTone,
    };

    container.postRepository.savePost(newPost);
    onPostGenerated(newPost);
    showToast('Post en borrador generado desde los commits', 'success');
  };

  const filteredRepos = repos.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterType === 'public') return matchesSearch && !r.isPrivate;
    if (filterType === 'private') return matchesSearch && r.isPrivate;
    return matchesSearch;
  });

  return {
    repos: filteredRepos,
    loadingRepos,
    selectedRepo,
    commits,
    loadingCommits,
    selectedCommitShas,
    expandedCommitShas,
    page,
    hasMoreCommits,
    sortOrder,
    toggleSortOrder,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    scanning,
    mobileStep,
    setMobileStep,
    loadRepos,
    handleSelectRepo,
    handleNextPage,
    handlePrevPage,
    toggleCommitSelection,
    toggleExpandCommitBody,
    toggleSelectAllCommits,
    toggleAutoScanRepo,
    scanForPendings,
    generatePostFromSelectedCommits,
  };
}
