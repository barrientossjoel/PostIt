import { createClient } from '@libsql/client';
import type { IPostRepository } from '../../core/interfaces/IPostRepository';
import type { ISettingsRepository } from '../../core/interfaces/ISettingsRepository';
import type { Post } from '../../core/entities/Post';
import type { AppSettings } from '../../core/entities/Settings';

const defaultSettings: AppSettings = {
  githubToken: '',
  geminiApiKey: '',
  publerApiKey: '',
  publerWorkspaceId: '',
  aiTone: 'developer',
  aiLanguage: 'es',
  enabledRepoIds: [],
};

export class TursoRepository implements IPostRepository, ISettingsRepository {
  private client;
  private userId: string | null = null;
  private initialized = false;

  constructor() {
    const url = import.meta.env.VITE_TURSO_DATABASE_URL;
    const authToken = import.meta.env.VITE_TURSO_AUTH_TOKEN;

    if (!url) {
      console.warn('VITE_TURSO_DATABASE_URL no está configurada.');
    }

    this.client = createClient({
      url: url || 'libsql://dummy.turso.io',
      authToken: authToken || '',
    });
  }

  setUserId(userId: string | null) {
    this.userId = userId;
  }

  private async initializeTables() {
    if (this.initialized) return;
    
    await this.client.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        user_id TEXT PRIMARY KEY,
        data TEXT NOT NULL
      )
    `);
    
    await this.client.execute(`
      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await this.client.execute(`
      CREATE TABLE IF NOT EXISTS processed_shas (
        user_id TEXT NOT NULL,
        sha TEXT NOT NULL,
        PRIMARY KEY (user_id, sha)
      )
    `);

    this.initialized = true;
  }

  // --- Settings ---
  async getSettings(): Promise<AppSettings> {
    if (!this.userId) return defaultSettings;
    await this.initializeTables();
    try {
      const res = await this.client.execute({
        sql: 'SELECT data FROM settings WHERE user_id = ?',
        args: [this.userId],
      });
      if (res.rows.length === 0) return defaultSettings;
      const data = res.rows[0].data as string;
      return { ...defaultSettings, ...JSON.parse(data) };
    } catch (e) {
      console.error('Error fetching settings from Turso:', e);
      return defaultSettings;
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    if (!this.userId) return;
    await this.initializeTables();
    try {
      await this.client.execute({
        sql: 'INSERT INTO settings (user_id, data) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET data = excluded.data',
        args: [this.userId, JSON.stringify(settings)],
      });
    } catch (e) {
      console.error('Error saving settings to Turso:', e);
    }
  }

  // --- Posts ---
  async getAllPosts(): Promise<Post[]> {
    if (!this.userId) return [];
    await this.initializeTables();
    try {
      const res = await this.client.execute({
        sql: 'SELECT data FROM posts WHERE user_id = ? ORDER BY created_at DESC',
        args: [this.userId],
      });
      return res.rows.map((row) => JSON.parse(row.data as string) as Post);
    } catch (e) {
      console.error('Error fetching posts from Turso:', e);
      return [];
    }
  }

  async getPostById(id: string): Promise<Post | undefined> {
    if (!this.userId) return undefined;
    await this.initializeTables();
    try {
      const res = await this.client.execute({
        sql: 'SELECT data FROM posts WHERE user_id = ? AND id = ?',
        args: [this.userId, id],
      });
      if (res.rows.length === 0) return undefined;
      return JSON.parse(res.rows[0].data as string) as Post;
    } catch (e) {
      console.error('Error fetching post by ID from Turso:', e);
      return undefined;
    }
  }

  async savePost(post: Post): Promise<void> {
    if (!this.userId) return;
    await this.initializeTables();
    try {
      await this.client.execute({
        sql: 'INSERT INTO posts (id, user_id, data) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data',
        args: [post.id, this.userId, JSON.stringify(post)],
      });
    } catch (e) {
      console.error('Error saving post to Turso:', e);
    }
  }

  async deletePost(id: string): Promise<void> {
    if (!this.userId) return;
    await this.initializeTables();
    try {
      await this.client.execute({
        sql: 'DELETE FROM posts WHERE user_id = ? AND id = ?',
        args: [this.userId, id],
      });
    } catch (e) {
      console.error('Error deleting post from Turso:', e);
    }
  }

  // --- Shas ---
  async getProcessedShas(): Promise<string[]> {
    if (!this.userId) return [];
    await this.initializeTables();
    try {
      const res = await this.client.execute({
        sql: 'SELECT sha FROM processed_shas WHERE user_id = ?',
        args: [this.userId],
      });
      return res.rows.map((row) => row.sha as string);
    } catch (e) {
      console.error('Error fetching SHAs from Turso:', e);
      return [];
    }
  }

  async markShasProcessed(shas: string[]): Promise<void> {
    if (!this.userId || shas.length === 0) return;
    await this.initializeTables();
    try {
      const stmts = shas.map(sha => ({
        sql: 'INSERT OR IGNORE INTO processed_shas (user_id, sha) VALUES (?, ?)',
        args: [this.userId!, sha],
      }));
      await this.client.batch(stmts);
    } catch (e) {
      console.error('Error marking SHAs processed in Turso:', e);
    }
  }
}
