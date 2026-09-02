import type { Repository } from '../entities/Repository';
import type { Post } from '../entities/Post';
import type { AppSettings } from '../entities/Settings';
import type { IGithubService } from '../interfaces/IGithubService';
import type { IPostRepository } from '../interfaces/IPostRepository';

export class ScanPendingCommitsUseCase {
  private githubService: IGithubService;
  private postRepo: IPostRepository;

  constructor(
    githubService: IGithubService,
    _aiService: any,
    postRepo: IPostRepository
  ) {
    this.githubService = githubService;
    this.postRepo = postRepo;
  }

  async execute(params: { repos: Repository[]; settings: AppSettings }): Promise<Post[]> {
    const { repos, settings } = params;

    if (!settings.githubToken) {
      throw new Error('Configura tu Token de GitHub en Ajustes primero.');
    }

    const processedShasArray = await this.postRepo.getProcessedShas();
    const processedShas = new Set(processedShasArray);
    const newPendingPosts: Post[] = [];

    for (const repo of repos) {
      try {
        const repoCommits = await this.githubService.fetchRepositoryCommits(settings.githubToken, repo.fullName, 10);
        const unprocessed = repoCommits.filter((c) => !processedShas.has(c.sha));

        if (unprocessed.length > 0) {
          const commitsToProcess = unprocessed.slice(0, 3);
          const firstTitle = commitsToProcess[0]?.message.split('\n')[0] || '';

          const title = commitsToProcess.length === 1
            ? `${repo.name}: ${firstTitle}`
            : `Novedades en ${repo.name} (${commitsToProcess.length} commits)`;

          const itemsText = commitsToProcess
            .map((c) => `• ${c.message.split('\n')[0]}`)
            .join('\n');

          const content = commitsToProcess.length === 1
            ? `🚀 Update en ${repo.name}:\n\n${commitsToProcess[0].message}`
            : `🚀 Updates en ${repo.name}:\n\n${itemsText}`;

          const pendingPost: Post = {
            id: `pending_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            repoFullName: repo.fullName,
            commits: commitsToProcess,
            title,
            content,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            aiTone: settings.aiTone,
          };

          await this.postRepo.savePost(pendingPost);
          await this.postRepo.markShasProcessed(commitsToProcess.map((c) => c.sha));
          newPendingPosts.push(pendingPost);
        }
      } catch (e) {
        console.error(`Error escaneando repo ${repo.fullName}:`, e);
      }
    }

    return newPendingPosts;
  }
}
