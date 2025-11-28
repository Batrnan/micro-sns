import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import {
  getPosts,
  getFollowStats,
  getFollowingList,
  type Post,
  deletePost,
  updatePost,
  followUser,
  unfollowUser,
  getLikedPostsByUser,
  getUserInfo,
} from '@/lib/api';

import { Button } from '@/components/ui/button';
import { FollowListModal } from '@/components/common/FollowListModal';
import { DeleteConfirmModal } from '@/components/common/DeleteConfirmModal';
import { EditPostModal } from '@/components/common/EditPostModal';
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

  const [likedPostIds, setLikedPostIds] = useState<Set<number>>(new Set());
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'liked'>('posts');

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTargetId, setEditTargetId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editLoading, setEditLoading] = useState(false);

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

  const handleEditClick = (post_id: number, content: string) => {
    setEditTargetId(post_id);
    setEditContent(content);
    setEditModalOpen(true);
  };

  const handleEditConfirm = async (newContent: string) => {
    if (!editTargetId) return;

    setEditLoading(true);
    try {
      await updatePost(editTargetId, newContent);
      await loadProfileData();
      setEditModalOpen(false);
      setEditTargetId(null);
      setEditContent('');
      showSuccess('게시물이 수정되었습니다.');
    } catch (error) {
      showError(error, '게시물 수정에 실패했습니다.');
    } finally {
      setEditLoading(false);
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
    if (userId) loadProfileData();
  }, [userId]);

  const loadProfileData = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const userIdNum = Number(userId);

      const userInfo = await getUserInfo(userIdNum);
      setProfileUser(userInfo);

      const allPosts = await getPosts();
      const userPosts = allPosts.filter((p) => p.author_id === userIdNum);
      setPosts(userPosts);

      const followStats = await getFollowStats(userIdNum);
      setStats(followStats);

      if (currentUser && currentUser.user_id !== userIdNum) {
        const followingList = await getFollowingList(currentUser.user_id);
        const following = followingList.some((u) => u.user_id === userIdNum);
        setIsFollowingUser(following);
      }

      const likedByProfileUser = await getLikedPostsByUser(userIdNum);
      setLikedPosts(likedByProfileUser);

      if (currentUser) {
        const myLiked = await getLikedPostsByUser(currentUser.user_id);
        setLikedPostIds(new Set(myLiked.map((p) => p.post_id)));
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

  const handleBack = () => navigate('/');

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
      <div className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={handleBack}
            className="text-white hover:bg-gray-800 rounded-full p-2 transition-colors"
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
        <div className="border-b border-gray-800 pb-4">
          <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600"></div>

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
                    className={`px-6 py-2 rounded-full font-bold text-sm transition-colors ${
                      isFollowingUser
                        ? 'bg-transparent border-2 border-gray-600 text-gray-300 hover:border-red-600 hover:text-red-500 hover:bg-red-500/10'
                        : 'bg-white text-black hover:bg-gray-200'
                    }`}
                  >
                    {followLoading ? '...' : isFollowingUser ? '팔로잉' : '팔로우'}
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
              <h2 className="text-2xl font-bold text-white">{profileUser.name}</h2>
              <p className="text-gray-400 text-sm">{profileUser.email}</p>
            </div>

            {profileUser.bio && <p className="text-white mb-4">{profileUser.bio}</p>}

            <div className="flex gap-6 text-sm">
              <button
                onClick={() => handleStatsClick('following')}
                className="hover:underline transition-colors"
              >
                <span className="font-bold text-white">{stats.following_count}</span>
                <span className="text-gray-400 ml-1">팔로잉</span>
              </button>

              <button
                onClick={() => handleStatsClick('followers')}
                className="hover:underline transition-colors"
              >
                <span className="font-bold text-white">{stats.follower_count}</span>
                <span className="text-gray-400 ml-1">팔로워</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs (모든 사용자 공통) */}
        <div className="border-b border-gray-800 flex">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-4 text-center font-semibold transition-colors ${
              activeTab === 'posts'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            게시글
          </button>

          <button
            onClick={() => setActiveTab('liked')}
            className={`flex-1 py-4 text-center font-semibold transition-colors ${
              activeTab === 'liked'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            좋아요한 게시글
          </button>
        </div>

        {/* Posts Rendering */}
        <div className="divide-y divide-gray-800">
          {activeTab === 'posts' &&
            (posts.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <p className="text-xl">아직 게시물이 없습니다</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.post_id} className="px-4">
<PostCard
  post={post}
  currentUserId={currentUser?.user_id}
  showDeleteButton={isOwnProfile}
  showEditButton={isOwnProfile}
  isLikedByUser={likedPostIds.has(post.post_id)}
  showLikeCount={true}
/>

                </div>
              ))
            ))}

          {activeTab === 'liked' &&
            (likedPosts.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <p className="text-xl">좋아요한 게시물이 없습니다</p>
                {!isOwnProfile && (
                  <p className="mt-2 text-gray-600">
                    이 사용자는 아직 게시물에 좋아요를 누르지 않았습니다.
                  </p>
                )}
              </div>
            ) : (
              likedPosts.map((post) => (
                <div key={post.post_id} className="px-4">
<PostCard
  post={post}
  currentUserId={currentUser?.user_id}
  showDeleteButton={currentUser?.user_id === post.author_id}
  showEditButton={currentUser?.user_id === post.author_id}
  isLikedByUser={true}
  showLikeCount={false}   // 숫자 숨기기
/>

                </div>
              ))
            ))}
        </div>
      </div>

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

      <EditPostModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onConfirm={handleEditConfirm}
        initialContent={editContent}
        loading={editLoading}
      />
    </div>
  );
}