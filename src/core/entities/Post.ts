import type { Commit } from './Commit';
import type { AiTone } from './Settings';

export type PostStatus = 'draft' | 'pending' | 'published';

export interface Post {
  id: string;
  repoFullName: string;
  commits: Commit[];
  title: string;
  content: string;
  hashtags: string[];
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
  aiTone: AiTone;
}
