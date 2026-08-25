import { useState, useEffect } from 'react';
import type { Post } from '../../../core/entities/Post';
import { container } from '../../../infrastructure/container';

export function usePendingQueue(
  onSelectForPreview: (post: Post) => void,
  showToast: (msg: string, type?: 'success' | 'error') => void
) {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    loadPendingPosts();
  }, []);

  const loadPendingPosts = () => {
    const all = container.postRepository.getAllPosts();
    setPosts(all.filter((p) => p.status === 'pending'));
  };

  const handleReviewInPreview = (post: Post) => {
    onSelectForPreview(post);
  };

  const handleDismiss = (id: string) => {
    container.postRepository.deletePost(id);
    loadPendingPosts();
    showToast('Post pendiente descartado', 'success');
  };

  return {
    pendingPosts: posts,
    loadPendingPosts,
    handleReviewInPreview,
    handleDismiss,
  };
}
