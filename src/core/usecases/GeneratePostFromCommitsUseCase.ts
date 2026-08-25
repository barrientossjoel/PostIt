import type { Commit } from '../entities/Commit';
import type { Post } from '../entities/Post';
import type { AppSettings } from '../entities/Settings';
import type { IAiGeneratorService } from '../interfaces/IAiGeneratorService';
import type { IPostRepository } from '../interfaces/IPostRepository';

export class GeneratePostFromCommitsUseCase {
  private aiService: IAiGeneratorService;
  private postRepo: IPostRepository;

  constructor(aiService: IAiGeneratorService, postRepo: IPostRepository) {
    this.aiService = aiService;
    this.postRepo = postRepo;
  }

  async execute(params: {
    commits: Commit[];
    repoName: string;
    settings: AppSettings;
  }): Promise<Post> {
    const { commits, repoName, settings } = params;

    if (commits.length === 0) {
      throw new Error('Debes seleccionar al menos un commit para generar el post.');
    }

    if (!settings.geminiApiKey) {
      throw new Error('Configura tu API Key de Gemini en Ajustes primero.');
    }

    const aiOutput = await this.aiService.generatePostFromCommits({
      apiKey: settings.geminiApiKey,
      commits,
      repoName,
      tone: settings.aiTone,
      language: settings.aiLanguage,
    });

    const newPost: Post = {
      id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      repoFullName: repoName,
      commits,
      title: aiOutput.title,
      content: aiOutput.content,
      hashtags: aiOutput.hashtags,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      aiTone: settings.aiTone,
    };

    this.postRepo.savePost(newPost);
    return newPost;
  }
}
