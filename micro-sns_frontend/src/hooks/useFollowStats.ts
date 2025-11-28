import { useState } from 'react';
import { getFollowStats, type FollowStats } from '@/lib/api';

/**
 * 팔로우 통계 관리를 위한 커스텀 훅
 */
export function useFollowStats() {
  const [stats, setStats] = useState<FollowStats>({
    following_count: 0,
    follower_count: 0,
  });
  const [loading, setLoading] = useState(false);

  const loadStats = async (userId: number) => {
    setLoading(true);
    try {
      const data = await getFollowStats(userId);
      setStats(data);
    } catch (error) {
      console.error('팔로우 통계 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  return { stats, setStats, loadStats, loading };
}
