import type { Repository } from '../entities/Repository';
import type { Post } from '../entities/Post';
import type { AppSettings } from '../entities/Settings';
import type { IGithubService } from '../interfaces/IGithubService';
import type { IAiGeneratorService } from '../interfaces/IAiGeneratorService';
import type { IPostRepository } from '../interfaces/IPostRepository';

export class ScanPendingCommitsUseCase {
  private githubService: IGithubService;
  private aiService: IAiGeneratorService;
  private postRepo: IPostRepository;

  constructor(
    githubService: IGithubService,
    aiService: IAiGeneratorService,
    postRepo: IPostRepository
  ) {
    this.githubService = githubService;
    this.aiService = aiService;
    this.postRepo = postRepo;
  }

  async execute(params: { repos: Repository[]; settings: AppSettings }): Promise<Post[]> {
    const { repos, settings } = params;

    if (!settings.githubToken || !settings.geminiApiKey) {
      throw new Error('Configura tus API Keys de GitHub y Gemini en Ajustes primero.');
    }

    const processedShas = new Set(this.postRepo.getProcessedShas());
    const targetRepoIds = settings.enabledRepoIds.length > 0
      ? settings.enabledRepoIds
      : repos.slice(0, 5).map((r) => r.id);

    const targetRepos = repos.filter((r) => targetRepoIds.includes(r.id));
    const newPendingPosts: Post[] = [];

    for (const repo of targetRepos) {
      try {
        const repoCommits = await this.githubService.fetchRepositoryCommits(settings.githubToken, repo.fullName, 10);
        const unprocessed = repoCommits.filter((c) => !processedShas.has(c.sha));

        if (unprocessed.length > 0) {
          const commitsToProcess = unprocessed.slice(0, 3);
          const aiOutput = await this.aiService.generatePostFromCommits({
            apiKey: settings.geminiApiKey,
            commits: commitsToProcess,
            repoName: repo.name,
            tone: settings.aiTone,
            language: settings.aiLanguage,
          });

          const pendingPost: Post = {
            id: `pending_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            repoFullName: repo.fullName,
            commits: commitsToProcess,
            title: aiOutput.title,
            content: aiOutput.content,
            hashtags: aiOutput.hashtags,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            aiTone: settings.aiTone,
          };

          this.postRepo.savePost(pendingPost);
          this.postRepo.markShasProcessed(commitsToProcess.map((c) => c.sha));
          newPendingPosts.push(pendingPost);
        }
      } catch (e) {
        console.error(`Error escaneando repo ${repo.fullName}:`, e);
      }
    }

    return newPendingPosts;
  }
}
