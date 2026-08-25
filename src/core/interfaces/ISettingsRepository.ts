import type { AppSettings } from '../entities/Settings';

export interface ISettingsRepository {
  getSettings(): AppSettings;
  saveSettings(settings: AppSettings): void;
}
