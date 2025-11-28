import { create } from 'zustand';

interface FollowStore {
  followingIds: Set<number>;
  followStats: Record<
    number,
    { following_count: number; follower_count: number }
  >;

  setFollowing: (userId: number, isFollowing: boolean) => void;
  toggleFollow: (userId: number) => void;
  isFollowing: (userId: number) => boolean;
  setFollowStats: (
    userId: number,
    stats: { following_count: number; follower_count: number }
  ) => void;
  updateFollowCounts: (userId: number, delta: 1 | -1) => void;
}

export const useFollowStore = create<FollowStore>((set, get) => ({
  followingIds: new Set(),
  followStats: {},

  setFollowing: (userId, isFollowing) =>
    set((state) => {
      const newFollowingIds = new Set(state.followingIds);
      if (isFollowing) {
        newFollowingIds.add(userId);
      } else {
        newFollowingIds.delete(userId);
      }
      return { followingIds: newFollowingIds };
    }),

  toggleFollow: (userId) =>
    set((state) => {
      const newFollowingIds = new Set(state.followingIds);
      if (newFollowingIds.has(userId)) {
        newFollowingIds.delete(userId);
      } else {
        newFollowingIds.add(userId);
      }
      return { followingIds: newFollowingIds };
    }),

  isFollowing: (userId) => get().followingIds.has(userId),

  setFollowStats: (userId, stats) =>
    set((state) => ({
      followStats: {
        ...state.followStats,
        [userId]: stats,
      },
    })),

  updateFollowCounts: (userId, delta) =>
    set((state) => {
      const currentStats = state.followStats[userId] || {
        following_count: 0,
        follower_count: 0,
      };
      return {
        followStats: {
          ...state.followStats,
          [userId]: {
            ...currentStats,
            following_count: currentStats.following_count + delta,
          },
        },
      };
    }),
}));
