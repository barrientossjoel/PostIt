import type { Post } from '../entities/Post';
import type { AppSettings } from '../entities/Settings';

export interface PublishResult {
  success: boolean;
  message: string;
  externalUrl?: string;
  jobId?: string;
}

export interface IPublishStrategy {
  readonly platformId: string;
  readonly platformName: string;
  publish(post: Post, settings: AppSettings): Promise<PublishResult>;
}
