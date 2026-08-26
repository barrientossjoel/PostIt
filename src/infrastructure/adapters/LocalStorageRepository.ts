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
  enabledRepoIds: [],
};

export class LocalStorageRepository implements IPostRepository, ISettingsRepository {
  getSettings(): AppSettings {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    if (!raw) return defaultSettings;
    try {
      return { ...defaultSettings, ...JSON.parse(raw) };
    } catch {
      return defaultSettings;
    }
  }

  saveSettings(settings: AppSettings): void {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  }

  getAllPosts(): Post[] {
    const raw = localStorage.getItem(KEYS.POSTS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
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
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  markShasProcessed(shas: string[]): void {
    const set = new Set(this.getProcessedShas());
    shas.forEach((sha) => set.add(sha));
    localStorage.setItem(KEYS.PROCESSED_SHAS, JSON.stringify(Array.from(set)));
  }
}
