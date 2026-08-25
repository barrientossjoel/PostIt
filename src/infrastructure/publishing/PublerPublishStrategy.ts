import type { IPublishStrategy, PublishResult } from '../../core/interfaces/IPublishStrategy';
import type { Post } from '../../core/entities/Post';
import type { AppSettings } from '../../core/entities/Settings';

export class PublerPublishStrategy implements IPublishStrategy {
  readonly platformId = 'publer';
  readonly platformName = 'Publer (Multi-Redes)';

  async publish(post: Post, settings: AppSettings): Promise<PublishResult> {
    if (!settings.publerApiKey) {
      return {
        success: false,
        message: 'No has configurado tu API Key de Publer en los Ajustes.',
      };
    }

    const fullContent = post.hashtags.length > 0
      ? `${post.content}\n\n${post.hashtags.join(' ')}`
      : post.content;

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.publerApiKey}`,
      };

      if (settings.publerWorkspaceId) {
        headers['Publer-Workspace-ID'] = settings.publerWorkspaceId;
      }

      const res = await fetch('https://api.publer.io/v1/posts', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          text: fullContent,
          publish_at: null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        return {
          success: false,
          message: errData.message || `Error de Publer API (${res.status}): ${res.statusText}`,
        };
      }

      const data = await res.json();
      return {
        success: true,
        message: '¡Post enviado exitosamente a Publer!',
        jobId: data.id || data.job_id,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Error al conectar con Publer: ${err.message}`,
      };
    }
  }
}
