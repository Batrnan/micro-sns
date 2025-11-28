import { useState } from 'react';
import { getPosts, type Post } from '@/lib/api';

/**
 * 게시물 목록 관리를 위한 커스텀 훅
 */
export function usePostActions() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await getPosts();
      setPosts(data);
    } catch (error) {
      console.error('게시물 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  return { posts, setPosts, fetchPosts, loading };
}
