import { useState } from 'react';
import { getPosts, type Post } from '@/lib/api';

export function usePostActions() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const postsArray = await getPosts();  // 이게 무조건 Post[]임
      setPosts(postsArray);
    } catch (error) {
      console.error('게시물 로드 실패:', error);
      setPosts([]);  // 실패해도 배열로 고정
    } finally {
      setLoading(false);
    }
  };

  return { posts, setPosts, fetchPosts, loading };
}
