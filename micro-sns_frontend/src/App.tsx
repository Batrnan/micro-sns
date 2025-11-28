import { useEffect, useState } from 'react';
import { Button } from './components/ui';
import { createPost, deletePost } from './lib/api';
import { useAuthStore } from './stores/auth';
import { Header } from './components/layout/Header';
import { UserAvatar } from './components/common/UserAvatar';
import { PostCard } from './components/common/PostCard';
import { FollowListModal } from './components/common/FollowListModal';
import { DeleteConfirmModal } from '@/components/common/DeleteConfirmModal';
import { usePostActions, useFollowStats } from './hooks';
import { showError, showSuccess } from './lib/utils';

function App() {
  const { user } = useAuthStore();
  const { posts, fetchPosts } = usePostActions();
  const { stats, loadStats } = useFollowStats();
  const [content, setContent] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'followers' | 'following'>('followers');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
    if (user) {
      loadStats(user.user_id);
    }
  }, [user]);

  const handleCreate = async () => {
    if (!content.trim()) return;

    if (!user) {
      showError('로그인이 필요합니다.');
      return;
    }

    try {
      await createPost(user.user_id, content);
      setContent('');
      await fetchPosts();
      showSuccess('게시물이 작성되었습니다.');
    } catch (error) {
      showError(error, '게시물 작성에 실패했습니다.');
    }
  };

  const handleDeleteClick = (post_id: number) => {
    setDeleteTargetId(post_id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;

    setDeleteLoading(true);
    try {
      await deletePost(deleteTargetId);
      await fetchPosts();
      setDeleteModalOpen(false);
      setDeleteTargetId(null);
      showSuccess('게시물이 삭제되었습니다.');
    } catch (error) {
      showError(error, '게시물 삭제에 실패했습니다.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleStatsClick = (type: 'followers' | 'following') => {
    setModalType(type);
    setModalOpen(true);
  };

  const handleFollowChange = async () => {
    await Promise.all([fetchPosts(), user && loadStats(user.user_id)]);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Header user={user} stats={stats} onStatsClick={handleStatsClick} />

      <div className="px-4 max-w-2xl mx-auto">
        {/* Post Input */}
        {user && (
          <div className="border-b border-gray-800 py-6 bg-gray-900">
            <div className="flex gap-3">
              <UserAvatar name={user.name} />
              <div className="flex-1">
                <textarea
                  className="w-full bg-transparent border-none text-white text-base placeholder-gray-600 focus:outline-none resize-none"
                  placeholder="무슨 일이 일어나고 있나요?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end mt-3 pt-3 border-t border-gray-800">
                  <Button
                    onClick={handleCreate}
                    disabled={!content.trim()}
                    className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-bold rounded-full px-6 py-2"
                  >
                    게시하기
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Posts Feed */}
        <div className="divide-y divide-gray-800">
          {posts.map((post) => (
            <PostCard
              key={post.post_id}
              post={post}
              currentUserId={user?.user_id}
              showFollowButton={true}
              showDeleteButton={true}
              onDelete={handleDeleteClick}
              onFollowChange={{
                fetchPosts,
                loadStats: () => user && loadStats(user.user_id),
              }}
            />
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-xl">아직 게시물이 없습니다</p>
            <p className="mt-2">첫 번째 게시물을 작성해보세요!</p>
          </div>
        )}
      </div>

      {/* Follow List Modal */}
      {user && (
        <FollowListModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          userId={user.user_id}
          currentUserId={user.user_id}
          type={modalType}
          onFollowChange={handleFollowChange}
        />
      )}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  );
}

export default App;
