import { useState, useEffect } from 'react';
import type { Repository } from '../../../core/entities/Repository';
import type { Commit } from '../../../core/entities/Commit';
import type { Post } from '../../../core/entities/Post';
import type { AppSettings } from '../../../core/entities/Settings';
import { container } from '../../../infrastructure/container';
import { GeneratePostFromCommitsUseCase } from '../../../core/usecases/GeneratePostFromCommitsUseCase';
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
  const [generatingPost, setGeneratingPost] = useState(false);

  // Mobile Navigation Step: 'repos' | 'commits'
  const [mobileStep, setMobileStep] = useState<'repos' | 'commits'>('repos');

  useEffect(() => {
    loadRepos();
  }, [settings.githubToken]);

  const loadRepos = async () => {
    setLoadingRepos(true);
    try {
      const fetchedRepos = await container.githubService.fetchUserRepositories(settings.githubToken);
      setRepos(fetchedRepos);
      if (fetchedRepos.length > 0 && !selectedRepo) {
        setSelectedRepo(fetchedRepos[0]);
        fetchCommitsForRepo(fetchedRepos[0], 1);
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoadingRepos(false);
    }
  };

  const fetchCommitsForRepo = async (repo: Repository, pageNum: number) => {
    setLoadingCommits(true);
    try {
      const fetchedCommits = await container.githubService.fetchRepositoryCommits(
        settings.githubToken,
        repo.fullName,
        35,
        pageNum
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
    await fetchCommitsForRepo(repo, 1);
  };

  const handleNextPage = async () => {
    if (!selectedRepo || !hasMoreCommits) return;
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchCommitsForRepo(selectedRepo, nextPage);
  };

  const handlePrevPage = async () => {
    if (!selectedRepo || page <= 1) return;
    const prevPage = page - 1;
    setPage(prevPage);
    await fetchCommitsForRepo(selectedRepo, prevPage);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
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
    if (settings.enabledRepoIds.length === 0) {
      showToast('Selecciona al menos un repositorio para monitorear con la casilla ✔', 'error');
      return;
    }
    setScanning(true);
    try {
      const monitoredRepos = repos.filter((r) => settings.enabledRepoIds.includes(r.id));
      const scanUseCase = new ScanPendingCommitsUseCase(
        container.githubService,
        container.aiGeneratorService,
        container.postRepository
      );
      const generatedPosts = await scanUseCase.execute({ repos: monitoredRepos, settings });
      showToast(`Escaneo finalizado: ${generatedPosts.length} nuevo(s) borrador(es)`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setScanning(false);
    }
  };

  const generatePostFromSelectedCommits = async () => {
    if (!selectedRepo || selectedCommitShas.length === 0) return;

    const selectedCommits = sortedCommits.filter((c) => selectedCommitShas.includes(c.sha));
    setGeneratingPost(true);

    try {
      const useCase = new GeneratePostFromCommitsUseCase(
        container.aiGeneratorService,
        container.postRepository
      );
      const post = await useCase.execute({
        commits: selectedCommits,
        repoName: selectedRepo.fullName,
        settings,
      });
      onPostGenerated(post);
      showToast('Post generado con éxito en el Editor', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setGeneratingPost(false);
    }
  };

  const sortedCommits = [...commits].sort((a, b) => {
    const timeA = new Date(a.author.date).getTime();
    const timeB = new Date(b.author.date).getTime();
    return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
  });

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
    commits: sortedCommits,
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
    generatingPost,
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
