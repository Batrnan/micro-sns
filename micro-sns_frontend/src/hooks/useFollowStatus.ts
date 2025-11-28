import { useState, useEffect } from 'react';
import { isFollowing } from '@/lib/api';

/**
 * 팔로우 상태를 관리하는 커스텀 훅
 */
export function useFollowStatus(currentUserId?: number, targetUserId?: number) {
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
      setLoading(false);
      return;
    }

    const checkStatus = async () => {
      setLoading(true);
      try {
        const status = await isFollowing(currentUserId, targetUserId);
        setFollowing(status);
      } catch (error) {
        console.error('팔로우 상태 확인 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [currentUserId, targetUserId]);

  return { following, setFollowing, loading };
}
