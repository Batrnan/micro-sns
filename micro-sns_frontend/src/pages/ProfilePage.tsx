import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import {
  getPosts,
  getFollowStats,
  getFollowingList,
  type Post,
  deletePost,
  followUser,
  unfollowUser,
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { FollowListModal } from '@/components/common/FollowListModal';
import { DeleteConfirmModal } from '@/components/common/DeleteConfirmModal';
import { UserAvatar } from '@/components/common/UserAvatar';
import { PostCard } from '@/components/common/PostCard';
import { BackIcon } from '@/components/icons';
import { showError, showSuccess } from '@/lib/utils';

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuthStore();

  const [posts, setPosts] = useState<Post[]>([]);
  const [profileUser, setProfileUser] = useState<{
    user_id: number;
    name: string;
    email: string;
    bio?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'followers' | 'following'>('followers');
  const [followLoading, setFollowLoading] = useState(false);
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [stats, setStats] = useState({ following_count: 0, follower_count: 0 });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteClick = (post_id: number) => {
    setDeleteTargetId(post_id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;

    setDeleteLoading(true);
    try {
      await deletePost(deleteTargetId);
      await loadProfileData();
      setDeleteModalOpen(false);
      setDeleteTargetId(null);
      showSuccess('게시물이 삭제되었습니다.');
    } catch (error) {
      showError(error, '게시물 삭제에 실패했습니다.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleFollowClick = async () => {
    if (!currentUser || !profileUser) return;

    setFollowLoading(true);
    const wasFollowing = isFollowingUser;

    // Optimistic update
    setIsFollowingUser(!wasFollowing);
    setStats({
      ...stats,
      follower_count: stats.follower_count + (wasFollowing ? -1 : 1),
    });

    try {
      if (wasFollowing) {
        await unfollowUser(currentUser.user_id, profileUser.user_id);
      } else {
        await followUser(currentUser.user_id, profileUser.user_id);
      }
    } catch (error) {
      // Rollback on error
      setIsFollowingUser(wasFollowing);
      setStats({
        ...stats,
        follower_count: stats.follower_count + (wasFollowing ? 1 : -1),
      });
      showError(error, '팔로우 처리 중 오류가 발생했습니다.');
    } finally {
      setFollowLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadProfileData();
    }
  }, [userId]);

  const loadProfileData = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const userIdNum = Number(userId);

      // Load posts for this user
      const allPosts = await getPosts();
      const userPosts = allPosts.filter((p) => p.author_id === userIdNum);
      setPosts(userPosts);

      // Get user info from posts or current user
      if (userPosts.length > 0) {
        setProfileUser({
          user_id: userPosts[0].author_id,
          name: userPosts[0].author,
          email: '',
        });
      } else if (currentUser && currentUser.user_id === userIdNum) {
        setProfileUser({
          user_id: currentUser.user_id,
          name: currentUser.name || '사용자',
          email: currentUser.email || '',
        });
      }

      // Load follow stats
      const followStats = await getFollowStats(userIdNum);
      setStats(followStats);

      // Check if current user is following this profile
      if (currentUser && currentUser.user_id !== userIdNum) {
        const followingList = await getFollowingList(currentUser.user_id);
        const isFollowing = followingList.some((u) => u.user_id === userIdNum);
        setIsFollowingUser(isFollowing);
      }
    } catch (error) {
      console.error('프로필 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatsClick = (type: 'followers' | 'following') => {
    setModalType(type);
    setModalOpen(true);
  };

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-white mb-4">사용자를 찾을 수 없습니다</p>
          <Button onClick={handleBack} className="bg-blue-500 hover:bg-blue-600">
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.user_id === profileUser.user_id;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={handleBack}
            className="text-white hover:bg-gray-800 rounded-full p-2 transition-colors"
            aria-label="뒤로 가기"
          >
            <BackIcon />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">{profileUser.name}</h1>
            <p className="text-sm text-gray-400">{posts.length}개의 게시물</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="border-b border-gray-800 pb-4">
          {/* Cover Image Placeholder */}
          <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600"></div>

          {/* Profile Info */}
          <div className="px-4">
            <div className="flex justify-between items-start -mt-16 mb-4">
              <div className="border-4 border-gray-900 rounded-full">
                <UserAvatar name={profileUser.name} size="xl" />
              </div>

              {currentUser && !isOwnProfile && (
                <div className="mt-20">
                  <Button
                    onClick={handleFollowClick}
                    disabled={followLoading}
                    className={`
        px-6 py-2 rounded-full font-bold text-sm transition-colors
        ${
          isFollowingUser
            ? 'bg-transparent border-2 border-gray-600 text-gray-300 hover:border-red-600 hover:text-red-500 hover:bg-red-500/10'
            : 'bg-white text-black hover:bg-gray-200'
        }
      `}
                  >
                    {followLoading
                      ? '...'
                      : isFollowingUser
                      ? '팔로잉'
                      : '팔로우'}
                  </Button>
                </div>
              )}

              {isOwnProfile && (
                <div className="mt-20">
                  <Button
                    className="bg-transparent border-2 border-gray-600 text-gray-300 hover:bg-gray-800 rounded-full px-4 py-1.5"
                    onClick={handleLogout}
                  >
                    로그아웃
                  </Button>
                </div>
              )}
            </div>

            <div className="mb-4">
              <h2 className="text-2xl font-bold text-white">
                {profileUser.name}
              </h2>
            </div>

            {profileUser.bio && (
              <p className="text-white mb-4">{profileUser.bio}</p>
            )}

            {/* Stats */}
            <div className="flex gap-6 text-sm">
              <button
                onClick={() => handleStatsClick('following')}
                className="hover:underline transition-colors"
              >
                <span className="font-bold text-white">
                  {stats.following_count}
                </span>
                <span className="text-gray-400 ml-1">팔로잉</span>
              </button>
              <button
                onClick={() => handleStatsClick('followers')}
                className="hover:underline transition-colors"
              >
                <span className="font-bold text-white">
                  {stats.follower_count}
                </span>
                <span className="text-gray-400 ml-1">팔로워</span>
              </button>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="divide-y divide-gray-800">
          {posts.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-xl">아직 게시물이 없습니다</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.post_id} className="p-4">
                <PostCard
                  post={post}
                  currentUserId={currentUser?.user_id}
                  showDeleteButton={isOwnProfile}
                  onDelete={handleDeleteClick}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Follow List Modal */}
      <FollowListModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        userId={profileUser.user_id}
        currentUserId={currentUser?.user_id}
        type={modalType}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  );
}
