import type { AppSettings } from '../entities/Settings';

export interface ISettingsRepository {
  getSettings(userId?: string): AppSettings;
  saveSettings(settings: AppSettings, userId?: string): void;
}

