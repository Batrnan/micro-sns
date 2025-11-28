import { useNavigate } from 'react-router-dom';
import { type Post } from '@/lib/api';
import { formatTimeAgo } from '@/lib/utils';
import { UserAvatar } from './UserAvatar';
import { DeleteIcon, CommentIcon, HeartIcon } from '@/components/icons';
import { FollowButton } from './FollowButton';

interface PostCardProps {
  post: Post;
  currentUserId?: number;
  showFollowButton?: boolean;
  showDeleteButton?: boolean;
  onDelete?: (postId: number) => void;
  onFollowChange?: {
    fetchPosts: () => void;
    loadStats: () => void;
  };
}

export function PostCard({
  post,
  currentUserId,
  showFollowButton = false,
  showDeleteButton = false,
  onDelete,
  onFollowChange,
}: PostCardProps) {
  const navigate = useNavigate();

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile/${post.author_id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(post.post_id);
    }
  };

  const isOwnPost = currentUserId === post.author_id;
  const shouldShowFollow = showFollowButton && currentUserId && !isOwnPost;
  const shouldShowDelete = showDeleteButton && isOwnPost;

  return (
    <div className="py-4 transition-colors">
      <div className="flex gap-3">
        <UserAvatar name={post.author} size="sm" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="font-bold text-white hover:underline cursor-pointer"
                onClick={handleAuthorClick}
              >
                {post.author}
              </span>
              <span className="text-gray-600">·</span>
              <span className="text-gray-500 text-sm">
                {formatTimeAgo(post.created_at)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {shouldShowFollow && onFollowChange && (
                <FollowButton
                  key={`${post.author_id}-${currentUserId}`}
                  currentUserId={currentUserId}
                  targetUserId={post.author_id}
                  onFollowChange={onFollowChange}
                />
              )}

              {shouldShowDelete && (
                <button
                  onClick={handleDeleteClick}
                  className="text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full p-2 transition-colors"
                  aria-label="삭제"
                >
                  <DeleteIcon />
                </button>
              )}
            </div>
          </div>

          <p className="text-white mt-1 text-[15px] leading-normal whitespace-pre-wrap break-words">
            {post.content}
          </p>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-3 text-gray-500">
            <button className="flex items-center gap-2 hover:text-blue-500 transition-colors group">
              <div className="group-hover:bg-blue-500/10 rounded-full p-2 transition-colors">
                <CommentIcon />
              </div>
            </button>
            <button className="flex items-center gap-2 hover:text-red-500 transition-colors group">
              <div className="group-hover:bg-red-500/10 rounded-full p-2 transition-colors">
                <HeartIcon />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
