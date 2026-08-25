import type { Repository } from '../entities/Repository';
import type { Commit } from '../entities/Commit';

export interface IGithubService {
  verifyToken(token: string): Promise<{ username: string; avatarUrl: string }>;
  fetchUserRepositories(token: string): Promise<Repository[]>;
  fetchRepositoryCommits(
    token: string,
    repoFullName: string,
    limit?: number,
    page?: number
  ): Promise<Commit[]>;
}
