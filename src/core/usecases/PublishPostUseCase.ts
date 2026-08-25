import type { Post } from '../entities/Post';
import type { AppSettings } from '../entities/Settings';
import type { IPostRepository } from '../interfaces/IPostRepository';
import type { PublishResult } from '../interfaces/IPublishStrategy';
import { PublishStrategyFactory } from '../../infrastructure/publishing/PublishStrategyFactory';

export class PublishPostUseCase {
  private postRepo: IPostRepository;

  constructor(postRepo: IPostRepository) {
    this.postRepo = postRepo;
  }

  async execute(params: {
    post: Post;
    platformId: string;
    settings: AppSettings;
  }): Promise<PublishResult> {
    const { post, platformId, settings } = params;

    const strategy = PublishStrategyFactory.getStrategy(platformId);
    const result = await strategy.publish(post, settings);

    if (result.success) {
      const updatedPost: Post = {
        ...post,
        status: 'published',
        updatedAt: new Date().toISOString(),
      };
      this.postRepo.savePost(updatedPost);
    }

    return result;
  }
}
