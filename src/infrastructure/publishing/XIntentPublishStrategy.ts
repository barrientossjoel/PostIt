import type { IPublishStrategy, PublishResult } from '../../core/interfaces/IPublishStrategy';
import type { Post } from '../../core/entities/Post';
import type { AppSettings } from '../../core/entities/Settings';

export class XIntentPublishStrategy implements IPublishStrategy {
  readonly platformId = 'x-intent';
  readonly platformName = 'X (Twitter) Intent';

  async publish(post: Post, _settings: AppSettings): Promise<PublishResult> {
    const fullContent = post.hashtags.length > 0
      ? `${post.content}\n\n${post.hashtags.join(' ')}`
      : post.content;

    const params = new URLSearchParams();
    params.append('text', fullContent);

    const intentUrl = `https://twitter.com/intent/tweet?${params.toString()}`;

    window.open(intentUrl, '_blank', 'noopener,noreferrer,width=600,height=400');

    return {
      success: true,
      message: '¡Pestaña de X (Twitter) abierta con el contenido listo para publicar!',
      externalUrl: intentUrl,
    };
  }
}
