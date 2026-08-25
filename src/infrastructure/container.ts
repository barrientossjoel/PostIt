import type { IGithubService } from '../core/interfaces/IGithubService';
import type { IAiGeneratorService } from '../core/interfaces/IAiGeneratorService';
import type { IPostRepository } from '../core/interfaces/IPostRepository';
import type { ISettingsRepository } from '../core/interfaces/ISettingsRepository';

import { GithubApiAdapter } from './adapters/GithubApiAdapter';
import { GeminiAiAdapter } from './adapters/GeminiAiAdapter';
import { LocalStorageRepository } from './adapters/LocalStorageRepository';

class ServiceContainer {
  private static instance: ServiceContainer;

  public readonly githubService: IGithubService;
  public readonly aiGeneratorService: IAiGeneratorService;
  public readonly postRepository: IPostRepository;
  public readonly settingsRepository: ISettingsRepository;

  private constructor() {
    const localStorageRepo = new LocalStorageRepository();

    this.githubService = new GithubApiAdapter();
    this.aiGeneratorService = new GeminiAiAdapter();
    this.postRepository = localStorageRepo;
    this.settingsRepository = localStorageRepo;
  }

  public static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }
}

export const container = ServiceContainer.getInstance();
