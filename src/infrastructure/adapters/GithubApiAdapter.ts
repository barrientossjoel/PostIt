import type { IGithubService } from '../../core/interfaces/IGithubService';
import type { Repository } from '../../core/entities/Repository';
import type { Commit } from '../../core/entities/Commit';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class GithubApiAdapter implements IGithubService {
  private baseUrl = 'https://api.github.com';
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos de tiempo de vida para la caché

  private getFromCache<T>(key: string, ttlMs: number = this.DEFAULT_TTL): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > ttlMs) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  private setToCache<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  public clearCache(): void {
    this.cache.clear();
  }

  async verifyToken(token: string): Promise<{ username: string; avatarUrl: string }> {
    if (!token) {
      throw new Error('No se ha configurado un token de GitHub');
    }

    const cacheKey = `user:${token}`;
    const cachedUser = this.getFromCache<{ username: string; avatarUrl: string }>(cacheKey, 10 * 60 * 1000);
    if (cachedUser) {
      return cachedUser;
    }

    const res = await fetch(`${this.baseUrl}/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
    });

    if (!res.ok) {
      throw new Error('Token de GitHub inválido o expirado');
    }

    const data = await res.json();
    const result = {
      username: data.login,
      avatarUrl: data.avatar_url,
    };

    this.setToCache(cacheKey, result);
    return result;
  }

  async fetchUserRepositories(token: string): Promise<Repository[]> {
    if (!token) {
      return [];
    }

    const cacheKey = `repos:${token}`;
    const cachedRepos = this.getFromCache<Repository[]>(cacheKey);
    if (cachedRepos) {
      return cachedRepos;
    }

    try {
      const res = await fetch(`${this.baseUrl}/user/repos?sort=updated&per_page=100`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
        },
      });

      if (!res.ok) {
        return [];
      }

      const data = await res.json();
      if (!Array.isArray(data)) {
        return [];
      }

      const repos: Repository[] = data.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        isPrivate: repo.private,
        description: repo.description,
        htmlUrl: repo.html_url,
        defaultBranch: repo.default_branch || 'main',
        updatedAt: repo.updated_at,
        language: repo.language,
        stargazersCount: repo.stargazers_count || 0,
      }));

      this.setToCache(cacheKey, repos);
      return repos;
    } catch {
      return [];
    }
  }

  async fetchRepositoryCommits(
    token: string,
    repoFullName: string,
    limit: number = 35,
    page: number = 1,
    sortOrder: 'desc' | 'asc' = 'desc'
  ): Promise<Commit[]> {
    if (!token || !repoFullName) {
      return [];
    }

    const cacheKey = `commits:${repoFullName}:${limit}:${page}:${sortOrder}`;
    const cachedCommits = this.getFromCache<Commit[]>(cacheKey);
    if (cachedCommits) {
      return cachedCommits;
    }

    try {
      const res = await fetch(
        `${this.baseUrl}/repos/${repoFullName}/commits?per_page=${limit}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
          },
        }
      );

      if (!res.ok) {
        return [];
      }

      const data = await res.json();
      if (!Array.isArray(data)) {
        return [];
      }

      const mapped: Commit[] = data.map((item: any) => ({
        sha: item.sha,
        message: item.commit.message,
        author: {
          name: item.commit.author.name,
          email: item.commit.author.email,
          date: item.commit.author.date,
          avatarUrl: item.author?.avatar_url,
        },
        htmlUrl: item.html_url,
        repoFullName,
      }));

      mapped.sort((a, b) => {
        const tA = new Date(a.author.date).getTime();
        const tB = new Date(b.author.date).getTime();
        return sortOrder === 'desc' ? tB - tA : tA - tB;
      });

      this.setToCache(cacheKey, mapped);
      return mapped;
    } catch {
      return [];
    }
  }
}
