import type { IGithubService } from '../core/interfaces/IGithubService';
import type { IAiGeneratorService } from '../core/interfaces/IAiGeneratorService';


import { GithubApiAdapter } from './adapters/GithubApiAdapter';
import { GeminiAiAdapter } from './adapters/GeminiAiAdapter';
import { TursoRepository } from './adapters/TursoRepository';

class ServiceContainer {
  private static instance: ServiceContainer;

  public readonly githubService: IGithubService;
  public readonly aiGeneratorService: IAiGeneratorService;
  public readonly postRepository: TursoRepository;
  public readonly settingsRepository: TursoRepository;
  public readonly tursoRepository: TursoRepository;

  private constructor() {
    const tursoRepo = new TursoRepository();

    this.githubService = new GithubApiAdapter();
    this.aiGeneratorService = new GeminiAiAdapter();
    this.postRepository = tursoRepo;
    this.settingsRepository = tursoRepo;
    this.tursoRepository = tursoRepo;
  }

  public static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }
}

export const container = ServiceContainer.getInstance();
