import { useState, useEffect } from 'react';
import type { Post } from '../../../core/entities/Post';
import type { AppSettings } from '../../../core/entities/Settings';
import { container } from '../../../infrastructure/container';
import { RefinePostUseCase } from '../../../core/usecases/RefinePostUseCase';
import { PublishPostUseCase } from '../../../core/usecases/PublishPostUseCase';

export function usePostPreview(
  currentPost: Post | null,
  settings: AppSettings,
  onPostUpdated: (post: Post) => void,
  showToast: (msg: string, type?: 'success' | 'error') => void
) {
  const [content, setContent] = useState('');
  const [hashtagsStr, setHashtagsStr] = useState('');
  const [refining, setRefining] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (currentPost) {
      setContent(currentPost.content);
      setHashtagsStr((currentPost.hashtags || []).join(' '));
    }
  }, [currentPost]);

  const handleRefine = async (instruction: string) => {
    if (!content.trim()) return;
    setRefining(true);
    try {
      const useCase = new RefinePostUseCase(container.aiGeneratorService);
      const refinedText = await useCase.execute({
        currentContent: content,
        instruction,
        settings,
      });

      setContent(refinedText);

      if (currentPost) {
        const updated: Post = {
          ...currentPost,
          content: refinedText,
          updatedAt: new Date().toISOString(),
        };
        container.postRepository.savePost(updated);
        onPostUpdated(updated);
      }

      showToast('¡Texto refinado con IA!', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setRefining(false);
    }
  };

  const handlePublish = async (platformId: string) => {
    if (!content.trim()) {
      showToast('Escribe algo antes de publicar', 'error');
      return;
    }

    setPublishing(true);
    try {
      const hashtags = hashtagsStr
        .split(' ')
        .filter((h) => h.trim().length > 0)
        .map((h) => (h.startsWith('#') ? h : `#${h}`));

      const postToPublish: Post = currentPost || {
        id: `post_${Date.now()}`,
        repoFullName: 'PostIt/manual',
        commits: [],
        title: 'Publicación Manual',
        content,
        hashtags,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        aiTone: settings.aiTone,
      };

      const useCase = new PublishPostUseCase(container.postRepository);
      const result = await useCase.execute({
        post: { ...postToPublish, content, hashtags },
        platformId,
        settings,
      });

      if (result.success) {
        showToast(result.message, 'success');
      } else {
        showToast(result.message, 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setPublishing(false);
    }
  };

  const handleCopyClipboard = () => {
    const fullText = hashtagsStr.trim() ? `${content}\n\n${hashtagsStr}` : content;
    navigator.clipboard.writeText(fullText);
    showToast('¡Copiado al portapapeles!', 'success');
  };

  return {
    content,
    setContent,
    hashtagsStr,
    setHashtagsStr,
    refining,
    publishing,
    handleRefine,
    handlePublish,
    handleCopyClipboard,
  };
}
