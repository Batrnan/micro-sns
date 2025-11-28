import { useState } from 'react';
import { addLike, removeLike } from '@/lib/api';

export function useLike(
  postId: number,
  initialLikeCount: number,
  currentUserId?: number,
  isInitiallyLiked: boolean = false
) {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiked, setIsLiked] = useState(isInitiallyLiked);
  const [isLoading, setIsLoading] = useState(false);

  const toggleLike = async () => {
    if (!currentUserId) {
      return;
    }

    setIsLoading(true);
    try {
      if (isLiked) {
        // 좋아요 취소
        await removeLike(currentUserId, postId);
        setIsLiked(false);
        setLikeCount((prev) => Math.max(prev - 1, 0));
      } else {
        // 좋아요 추가
        await addLike(currentUserId, postId);
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
      // 에러 발생 시 상태 복구는 하지 않음 (서버 상태와 동기화)
    } finally {
      setIsLoading(false);
    }
  };

  return {
    likeCount,
    isLiked,
    isLoading,
    toggleLike,
  };
}
