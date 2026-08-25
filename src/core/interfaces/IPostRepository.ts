import type { Post } from '../entities/Post';

export interface IPostRepository {
  getAllPosts(): Post[];
  getPostById(id: string): Post | undefined;
  savePost(post: Post): void;
  deletePost(id: string): void;
  getProcessedShas(): string[];
  markShasProcessed(shas: string[]): void;
}
