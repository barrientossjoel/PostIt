import type { AppSettings } from '../entities/Settings';
import type { IAiGeneratorService } from '../interfaces/IAiGeneratorService';

export class RefinePostUseCase {
  private aiService: IAiGeneratorService;

  constructor(aiService: IAiGeneratorService) {
    this.aiService = aiService;
  }

  async execute(params: {
    currentContent: string;
    instruction: string;
    settings: AppSettings;
  }): Promise<string> {
    const { currentContent, instruction, settings } = params;

    if (!settings.geminiApiKey) {
      throw new Error('Configura tu API Key de Gemini en Ajustes primero.');
    }

    return await this.aiService.refinePost({
      apiKey: settings.geminiApiKey,
      currentContent,
      actionInstruction: instruction,
      language: settings.aiLanguage,
    });
  }
}
