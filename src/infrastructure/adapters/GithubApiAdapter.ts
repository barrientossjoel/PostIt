import type { IGithubService } from '../../core/interfaces/IGithubService';
import type { Repository } from '../../core/entities/Repository';
import type { Commit } from '../../core/entities/Commit';

const SAMPLE_REPOS: Repository[] = [
  {
    id: 101,
    name: 'Nout',
    fullName: 'barrientossjoel/Nout',
    isPrivate: false,
    description: 'Plataforma colaborativa de notas y mapas de conocimiento',
    htmlUrl: 'https://github.com/barrientossjoel/Nout',
    defaultBranch: 'main',
    updatedAt: '2026-07-28T14:30:00Z',
    language: 'TypeScript',
    stargazersCount: 12,
  },
  {
    id: 102,
    name: 'PostIt',
    fullName: 'barrientossjoel/PostIt',
    isPrivate: false,
    description: 'Generador de publicaciones para redes sociales basado en GitHub commits',
    htmlUrl: 'https://github.com/barrientossjoel/PostIt',
    defaultBranch: 'main',
    updatedAt: '2026-08-25T18:00:00Z',
    language: 'TypeScript',
    stargazersCount: 45,
  },
  {
    id: 103,
    name: 'Galan',
    fullName: 'barrientossjoel/Galan',
    isPrivate: true,
    description: 'Sitio web corporativo e interfaz interactiva',
    htmlUrl: 'https://github.com/barrientossjoel/Galan',
    defaultBranch: 'main',
    updatedAt: '2026-06-10T12:00:00Z',
    language: 'HTML',
    stargazersCount: 3,
  },
  {
    id: 104,
    name: 'Digital-Impulso',
    fullName: 'barrientossjoel/Digital-Impulso',
    isPrivate: false,
    description: 'Landing page y dashboard de servicios digitales',
    htmlUrl: 'https://github.com/barrientossjoel/Digital-Impulso',
    defaultBranch: 'main',
    updatedAt: '2026-05-20T09:00:00Z',
    language: 'CSS',
    stargazersCount: 8,
  },
];

const SAMPLE_COMMITS_MAP: { [repoFullName: string]: Commit[] } = {
  'barrientossjoel/Nout': [
    {
      sha: '1b407f0',
      message: 'chore: add Open Graph meta tags for Nout',
      author: { name: 'barrientossjoel', email: 'joel@example.com', date: '2026-07-28T14:30:00Z' },
      htmlUrl: 'https://github.com/barrientossjoel/Nout/commit/1b407f0',
      repoFullName: 'barrientossjoel/Nout',
    },
    {
      sha: '14cd788',
      message: 'Update README with new project details',
      author: { name: 'barrientossjoel', email: 'joel@example.com', date: '2026-07-28T12:00:00Z' },
      htmlUrl: 'https://github.com/barrientossjoel/Nout/commit/14cd788',
      repoFullName: 'barrientossjoel/Nout',
    },
    {
      sha: '64aa0bf',
      message: 'UI: Refine sidebar layout, responsive breadcrumb truncation and spacing',
      author: { name: 'barrientossjoel', email: 'joel@example.com', date: '2026-06-24T16:45:00Z' },
      htmlUrl: 'https://github.com/barrientossjoel/Nout/commit/64aa0bf',
      repoFullName: 'barrientossjoel/Nout',
    },
    {
      sha: 'cfe5077',
      message: 'fix(collab): proxy WS through Vite in dev and fix PartyKit setup',
      author: { name: 'barrientossjoel', email: 'joel@example.com', date: '2026-06-15T10:15:00Z' },
      htmlUrl: 'https://github.com/barrientossjoel/Nout/commit/cfe5077',
      repoFullName: 'barrientossjoel/Nout',
    },
    {
      sha: 'b3de4e5',
      message: 'TEAM_001: Fix collaboration synchronization issues across devices and browsers',
      author: { name: 'barrientossjoel', email: 'joel@example.com', date: '2026-06-15T09:30:00Z' },
      htmlUrl: 'https://github.com/barrientossjoel/Nout/commit/b3de4e5',
      repoFullName: 'barrientossjoel/Nout',
    },
  ],
  'barrientossjoel/PostIt': [
    {
      sha: 'a9f82c1',
      message: 'feat(explorer): implement github pagination and responsive mobile flow',
      author: { name: 'barrientossjoel', email: 'joel@example.com', date: '2026-08-25T18:00:00Z' },
      htmlUrl: 'https://github.com/barrientossjoel/PostIt/commit/a9f82c1',
      repoFullName: 'barrientossjoel/PostIt',
    },
    {
      sha: '9c73b1a',
      message: 'refactor(ui): update commit cards background and custom dark checkboxes',
      author: { name: 'barrientossjoel', email: 'joel@example.com', date: '2026-08-25T17:30:00Z' },
      htmlUrl: 'https://github.com/barrientossjoel/PostIt/commit/9c73b1a',
      repoFullName: 'barrientossjoel/PostIt',
    },
    {
      sha: 'e4d812f',
      message: 'feat(core): setup clean architecture and screaming domain structure',
      author: { name: 'barrientossjoel', email: 'joel@example.com', date: '2026-08-25T14:00:00Z' },
      htmlUrl: 'https://github.com/barrientossjoel/PostIt/commit/e4d812f',
      repoFullName: 'barrientossjoel/PostIt',
    },
  ],
};

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
      return { username: 'barrientossjoel', avatarUrl: 'https://github.com/barrientossjoel.png' };
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
      return SAMPLE_REPOS;
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
        return SAMPLE_REPOS;
      }

      const data = await res.json();
      if (!Array.isArray(data)) {
        return SAMPLE_REPOS;
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
      return SAMPLE_REPOS;
    }
  }

  async fetchRepositoryCommits(
    token: string,
    repoFullName: string,
    limit: number = 35,
    page: number = 1,
    sortOrder: 'desc' | 'asc' = 'desc'
  ): Promise<Commit[]> {
    const cacheKey = `commits:${repoFullName}:${limit}:${page}:${sortOrder}`;
    const cachedCommits = this.getFromCache<Commit[]>(cacheKey);
    if (cachedCommits) {
      return cachedCommits;
    }

    const getSampleData = () => {
      const raw = SAMPLE_COMMITS_MAP[repoFullName] || SAMPLE_COMMITS_MAP['barrientossjoel/Nout'];
      const sorted = [...raw].sort((a, b) => {
        const tA = new Date(a.author.date).getTime();
        const tB = new Date(b.author.date).getTime();
        return sortOrder === 'desc' ? tB - tA : tA - tB;
      });
      const start = (page - 1) * limit;
      return sorted.slice(start, start + limit);
    };

    if (!token) {
      return getSampleData();
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
        return getSampleData();
      }

      const data = await res.json();
      if (!Array.isArray(data)) {
        return getSampleData();
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
      return getSampleData();
    }
  }
}
