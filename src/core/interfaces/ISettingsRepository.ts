import type { AppSettings } from '../entities/Settings';

export interface ISettingsRepository {
  getSettings(userId?: string): Promise<AppSettings>;
  saveSettings(settings: AppSettings, userId?: string): Promise<void>;
}

