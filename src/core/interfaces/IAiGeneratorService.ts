import type { Commit } from '../entities/Commit';
import type { AiLanguage, AiTone } from '../entities/Settings';

export interface GeneratePostOptions {
  apiKey: string;
  commits: Commit[];
  repoName: string;
  tone: AiTone;
  language: AiLanguage;
}

export interface RefinePostOptions {
  apiKey: string;
  currentContent: string;
  actionInstruction: string;
  language: AiLanguage;
}

export interface GeneratedPostOutput {
  title: string;
  content: string;
}

export interface IAiGeneratorService {
  generatePostFromCommits(options: GeneratePostOptions): Promise<GeneratedPostOutput>;
  refinePost(options: RefinePostOptions): Promise<string>;
}
