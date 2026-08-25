export type AiTone = 'developer' | 'enthusiastic' | 'professional' | 'concise' | 'storytelling';
export type AiLanguage = 'es' | 'en';

export interface AppSettings {
  githubToken: string;
  geminiApiKey: string;
  publerApiKey: string;
  publerWorkspaceId?: string;
  aiTone: AiTone;
  aiLanguage: AiLanguage;
  enabledRepoIds: number[];
}
