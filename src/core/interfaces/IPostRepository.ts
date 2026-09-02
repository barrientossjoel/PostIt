import type { Post } from '../entities/Post';

export interface IPostRepository {
  getAllPosts(): Promise<Post[]>;
  getPostById(id: string): Promise<Post | undefined>;
  savePost(post: Post): Promise<void>;
  deletePost(id: string): Promise<void>;
  getProcessedShas(): Promise<string[]>;
  markShasProcessed(shas: string[]): Promise<void>;
}
