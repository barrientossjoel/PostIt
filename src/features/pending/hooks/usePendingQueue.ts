import { useState, useEffect } from 'react';
import type { Post } from '../../../core/entities/Post';
import { container } from '../../../infrastructure/container';

export function usePendingQueue(
  onSelectForPreview: (post: Post) => void,
  showToast: (msg: string, type?: 'success' | 'error') => void
) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);

  useEffect(() => {
    loadPendingPosts();
  }, []);

  const loadPendingPosts = () => {
    const all = container.postRepository.getAllPosts();
    setPosts(all.filter((p) => p.status === 'pending'));
  };

  const togglePostSelection = (id: string) => {
    setSelectedPostIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedPostIds.length === posts.length) {
      setSelectedPostIds([]);
    } else {
      setSelectedPostIds(posts.map((p) => p.id));
    }
  };

  const handleReviewInPreview = (post: Post) => {
    onSelectForPreview(post);
  };

  const handleDismiss = (id: string) => {
    container.postRepository.deletePost(id);
    setSelectedPostIds((prev) => prev.filter((i) => i !== id));
    loadPendingPosts();
    showToast('Post pendiente descartado', 'success');
  };

  const generateCombinedPostFromSelected = () => {
    if (selectedPostIds.length === 0) return;

    const selectedPosts = posts.filter((p) => selectedPostIds.includes(p.id));

    let combinedPost: Post;

    if (selectedPosts.length === 1) {
      const p = selectedPosts[0];
      combinedPost = {
        ...p,
        status: 'draft',
        updatedAt: new Date().toISOString(),
      };
    } else {
      const allCommits = selectedPosts.flatMap((p) => p.commits);
      const repoNames = Array.from(new Set(selectedPosts.map((p) => p.repoFullName)));
      const combinedTitle = `Actualización de ${repoNames.join(', ')}`;
      const combinedContent = selectedPosts.map((p) => p.content).join('\n\n---\n\n');


      combinedPost = {
        id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        repoFullName: repoNames.join(', '),
        commits: allCommits,
        title: combinedTitle,
        content: combinedContent,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        aiTone: selectedPosts[0]?.aiTone || 'developer',
      };
    }

    // Save combined post and remove combined pending items
    container.postRepository.savePost(combinedPost);
    selectedPosts.forEach((p) => {
      if (p.id !== combinedPost.id) {
        container.postRepository.deletePost(p.id);
      }
    });

    loadPendingPosts();
    setSelectedPostIds([]);
    onSelectForPreview(combinedPost);
    showToast('Post generado con éxito en el Editor', 'success');
  };

  return {
    pendingPosts: posts,
    selectedPostIds,
    togglePostSelection,
    toggleSelectAll,
    loadPendingPosts,
    handleReviewInPreview,
    handleDismiss,
    generateCombinedPostFromSelected,
  };
}
