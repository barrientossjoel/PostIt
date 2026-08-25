import { useState } from 'react';
import type { AppSettings } from '../../../core/entities/Settings';
import { container } from '../../../infrastructure/container';

export function useSettings(
  initialSettings: AppSettings,
  onSettingsSaved: (s: AppSettings) => void,
  showToast: (msg: string, type?: 'success' | 'error') => void
) {
  const [form, setForm] = useState<AppSettings>(initialSettings);
  const [testingGithub, setTestingGithub] = useState(false);
  const [githubUser, setGithubUser] = useState<string | null>(null);

  const updateField = (field: keyof AppSettings, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const testGithubToken = async () => {
    if (!form.githubToken) {
      showToast('Ingresa un token de GitHub primero', 'error');
      return;
    }

    setTestingGithub(true);
    try {
      const user = await container.githubService.verifyToken(form.githubToken);
      setGithubUser(user.username);
      showToast(`¡Conectado como @${user.username}!`, 'success');
    } catch (err: any) {
      setGithubUser(null);
      showToast(err.message, 'error');
    } finally {
      setTestingGithub(false);
    }
  };

  const saveSettings = () => {
    container.settingsRepository.saveSettings(form);
    onSettingsSaved(form);
    showToast('Ajustes guardados correctamente', 'success');
  };

  return {
    form,
    updateField,
    testingGithub,
    githubUser,
    testGithubToken,
    saveSettings,
  };
}
