import { useEffect, useState } from 'react';
import { getFollowerList, getFollowingList, type FollowUser } from '@/lib/api';
import { FollowButton } from './FollowButton';
import { UserAvatar } from './UserAvatar';
import { CloseIcon } from '@/components/icons';

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  currentUserId?: number;
  type: 'followers' | 'following';
  onFollowChange?: () => void;
}

export function FollowListModal({
  isOpen,
  onClose,
  userId,
  currentUserId,
  type,
  onFollowChange,
}: FollowListModalProps) {
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen, userId, type]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data =
        type === 'followers'
          ? await getFollowerList(userId)
          : await getFollowingList(userId);
      setUsers(data);
    } catch (error) {
      console.error('유저 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowChange = () => {
    loadUsers();
    onFollowChange?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-800 rounded-2xl w-full max-w-sm max-h-[80vh] flex flex-col border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">
            {type === 'followers' ? '팔로워' : '팔로잉'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-full"
            aria-label="닫기"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-lg">
                {type === 'followers'
                  ? '아직 팔로워가 없습니다'
                  : '아직 팔로잉이 없습니다'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {users.map((user) => (
                <div
                  key={user.user_id}
                  className="p-4 hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <UserAvatar name={user.name} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white hover:underline cursor-pointer truncate">
                          {user.name}
                        </div>
                      </div>
                    </div>

                    {/* Follow Button */}
                    {currentUserId && (
                      <FollowButton
                        currentUserId={currentUserId}
                        targetUserId={user.user_id}
                        onFollowChange={{ loadStats: handleFollowChange }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
