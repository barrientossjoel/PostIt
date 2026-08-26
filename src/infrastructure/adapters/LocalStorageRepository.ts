import type { IPostRepository } from '../../core/interfaces/IPostRepository';
import type { ISettingsRepository } from '../../core/interfaces/ISettingsRepository';
import type { Post } from '../../core/entities/Post';
import type { AppSettings } from '../../core/entities/Settings';

const KEYS = {
  SETTINGS: 'postit_settings_v2',
  POSTS: 'postit_posts_v2',
  PROCESSED_SHAS: 'postit_shas_v2',
};

const defaultSettings: AppSettings = {
  githubToken: '',
  geminiApiKey: '',
  publerApiKey: '',
  publerWorkspaceId: '',
  aiTone: 'developer',
  aiLanguage: 'es',
  enabledRepoIds: [101, 102],
};

const INITIAL_SAMPLE_POSTS: Post[] = [
  {
    id: 'post_sample_nout',
    repoFullName: 'barrientossjoel/Nout',
    title: '🚀 Actualizaciones en Nout: Meta tags Open Graph & Colaboración en Tiempo Real',
    content: `Ajustes recientes en #Nout:
- Integración de meta tags Open Graph para previsualizaciones ricas.
- Proxy WebSockets a través de Vite & solución de PartyKit setup.
- Rediseño de la barra lateral responsive con truncado inteligente.

#buildinpublic #indiehackers #devlife #react #typescript`,
    hashtags: ['#buildinpublic', '#indiehackers', '#devlife', '#react', '#typescript'],
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    aiTone: 'developer',
    commits: [
      {
        sha: '1b407f0',
        message: 'chore: add Open Graph meta tags for Nout',
        author: {
          name: 'barrientossjoel',
          email: 'joel@example.com',
          date: '2026-07-28T14:30:00Z',
        },
        htmlUrl: 'https://github.com/barrientossjoel/Nout/commit/1b407f0',
        repoFullName: 'barrientossjoel/Nout',
      },
      {
        sha: 'cfe5077',
        message: 'fix(collab): proxy WS through Vite in dev and fix PartyKit setup',
        author: {
          name: 'barrientossjoel',
          email: 'joel@example.com',
          date: '2026-06-15T10:15:00Z',
        },
        htmlUrl: 'https://github.com/barrientossjoel/Nout/commit/cfe5077',
        repoFullName: 'barrientossjoel/Nout',
      },
    ],
  },
  {
    id: 'post_sample_postit',
    repoFullName: 'barrientossjoel/PostIt',
    title: '✨ PostIt: Arquitectura Screaming, Paginación y Mobile UX Estilo GitHub',
    content: `Elevando la experiencia de PostIt:
- Navegación responsive estilo GitHub con breadcrumbs fluidos.
- Paginación dinámica de commits (35 commits por página).
- Selector de temas y ordenamiento cronológico.

#github #webdev #cleancode #buildinpublic`,
    hashtags: ['#github', '#webdev', '#cleancode', '#buildinpublic'],
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    aiTone: 'professional',
    commits: [
      {
        sha: 'a9f82c1',
        message: 'feat(explorer): implement github pagination and responsive mobile flow',
        author: {
          name: 'barrientossjoel',
          email: 'joel@example.com',
          date: '2026-08-25T18:00:00Z',
        },
        htmlUrl: 'https://github.com/barrientossjoel/PostIt/commit/a9f82c1',
        repoFullName: 'barrientossjoel/PostIt',
      },
    ],
  },
];

function obfuscateToken(val?: string): string {
  if (!val) return '';
  if (val.startsWith('enc_v1:')) return val;
  try {
    return 'enc_v1:' + btoa(encodeURIComponent(val));
  } catch {
    return val;
  }
}

function deobfuscateToken(val?: string): string {
  if (!val) return '';
  if (!val.startsWith('enc_v1:')) return val;
  try {
    return decodeURIComponent(atob(val.slice(7)));
  } catch {
    return val;
  }
}

export class LocalStorageRepository implements IPostRepository, ISettingsRepository {
  constructor() {
    this.seedInitialDataIfEmpty();
  }

  private seedInitialDataIfEmpty(): void {
    if (!localStorage.getItem(KEYS.POSTS)) {
      localStorage.setItem(KEYS.POSTS, JSON.stringify(INITIAL_SAMPLE_POSTS));
    }
  }

  getSettings(userId?: string): AppSettings {
    const key = userId ? `${KEYS.SETTINGS}_${userId}` : KEYS.SETTINGS;
    const raw = localStorage.getItem(key) || localStorage.getItem(KEYS.SETTINGS);
    if (!raw) return defaultSettings;
    try {
      const parsed: AppSettings = JSON.parse(raw);
      return {
        ...defaultSettings,
        ...parsed,
        githubToken: deobfuscateToken(parsed.githubToken),
        geminiApiKey: deobfuscateToken(parsed.geminiApiKey),
        publerApiKey: deobfuscateToken(parsed.publerApiKey),
      };
    } catch {
      return defaultSettings;
    }
  }

  saveSettings(settings: AppSettings, userId?: string): void {
    const obfuscated: AppSettings = {
      ...settings,
      githubToken: obfuscateToken(settings.githubToken),
      geminiApiKey: obfuscateToken(settings.geminiApiKey),
      publerApiKey: obfuscateToken(settings.publerApiKey),
    };
    const jsonStr = JSON.stringify(obfuscated);
    localStorage.setItem(KEYS.SETTINGS, jsonStr);
    if (userId) {
      localStorage.setItem(`${KEYS.SETTINGS}_${userId}`, jsonStr);
    }
  }


  getAllPosts(): Post[] {
    const raw = localStorage.getItem(KEYS.POSTS);
    if (!raw) {
      this.seedInitialDataIfEmpty();
      return INITIAL_SAMPLE_POSTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_SAMPLE_POSTS;
    }
  }

  getPostById(id: string): Post | undefined {
    return this.getAllPosts().find((p) => p.id === id);
  }

  savePost(post: Post): void {
    const posts = this.getAllPosts();
    const index = posts.findIndex((p) => p.id === post.id);
    if (index >= 0) {
      posts[index] = post;
    } else {
      posts.unshift(post);
    }
    localStorage.setItem(KEYS.POSTS, JSON.stringify(posts));
  }

  deletePost(id: string): void {
    const filtered = this.getAllPosts().filter((p) => p.id !== id);
    localStorage.setItem(KEYS.POSTS, JSON.stringify(filtered));
  }

  getProcessedShas(): string[] {
    const raw = localStorage.getItem(KEYS.PROCESSED_SHAS);
    if (!raw) return ['1b407f0', 'cfe5077'];
    try {
      return JSON.parse(raw);
    } catch {
      return ['1b407f0', 'cfe5077'];
    }
  }

  markShasProcessed(shas: string[]): void {
    const set = new Set(this.getProcessedShas());
    shas.forEach((sha) => set.add(sha));
    localStorage.setItem(KEYS.PROCESSED_SHAS, JSON.stringify(Array.from(set)));
  }
}
