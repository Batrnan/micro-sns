import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type Post } from '@/lib/api';
import { formatTimeAgo } from '@/lib/utils';
import { UserAvatar } from './UserAvatar';
import { DeleteIcon, CommentIcon, HeartIcon, EditIcon } from '@/components/icons';
import { FollowButton } from './FollowButton';
import { CommentSection } from './CommentSection';
import { useLike } from '@/hooks';

interface PostCardProps {
  post: Post;
  currentUserId?: number;
  showFollowButton?: boolean;
  showDeleteButton?: boolean;
  showEditButton?: boolean;
  onDelete?: (postId: number) => void;
  onEdit?: (postId: number, content: string) => void;
  onFollowChange?: {
    fetchPosts: () => void;
    loadStats: () => void;
  };
  isLikedByUser?: boolean;
  showLikeCount?: boolean;
  onLikeChanged?: () => void;  
}

export function PostCard({
  post,
  currentUserId,
  showFollowButton = false,
  showDeleteButton = false,
  showEditButton = false,
  onDelete,
  onEdit,
  onFollowChange,
  isLikedByUser = false,
  showLikeCount = true,
  onLikeChanged,    
}: PostCardProps) {
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const { likeCount, isLiked, isLoading, toggleLike } = useLike(
    post.post_id,
    post.like_count ?? 0,   // ← null/undefined일 때 0으로 대체
    currentUserId,
    isLikedByUser
  );
  
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

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(post.post_id, post.content);
    }
  };

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUserId) return;
await toggleLike();
if (onLikeChanged) onLikeChanged();
  };

  const isOwnPost = currentUserId === post.author_id;
  const shouldShowFollow = showFollowButton && currentUserId && !isOwnPost;
  const shouldShowDelete = showDeleteButton && isOwnPost;
  const shouldShowEdit = showEditButton && isOwnPost;

return (
  <div
    className="py-4 transition-colors cursor-pointer"
    onClick={() => navigate(`/posts/${post.post_id}`)}
  >
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

            {shouldShowFollow && onFollowChange && (
              <div onClick={(e) => e.stopPropagation()}>
              <FollowButton
                key={`${post.author_id}-${currentUserId}`}
                currentUserId={currentUserId}
                targetUserId={post.author_id}
                onFollowChange={onFollowChange}
              />
              </div>
            )}
          </div>

          <p className="text-white mt-1 text-[15px] leading-normal whitespace-pre-wrap break-words">
            {post.content}
          </p>
          {post.image_url && (
          <div className="mt-3">
            <img
              src={`${import.meta.env.VITE_API_URL}${post.image_url}`}
              alt="post"
              className="rounded-lg max-h-96 object-cover"
            />
          </div>
        )}


          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-3 pt-2">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowComments(!showComments)}
                className={`flex items-center gap-1 transition-colors group ${
                  showComments ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'
                }`}
              >
                <div className="group-hover:bg-blue-500/10 rounded-full p-2 transition-colors">
                  <CommentIcon />
                </div>
              </button>

              <button
                onClick={handleLikeClick}
                disabled={isLoading || !currentUserId}
                className={`flex items-center gap-1 transition-colors group ${
                  isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                } ${!currentUserId ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <div className="group-hover:bg-red-500/10 rounded-full p-2 transition-colors">
                  <HeartIcon filled={isLiked} />
                </div>
{showLikeCount && (
  <span className="text-sm">{likeCount}</span>
)}
              </button>
            </div>

            <div className="flex items-center gap-1">
              {shouldShowEdit && (
                <button
                  onClick={handleEditClick}
                  className="text-gray-500 hover:text-blue-500 hover:bg-blue-500/10 rounded-full p-2 transition-colors"
                  aria-label="수정"
                >
                  <EditIcon />
                </button>
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

          {/* Comment Section */}
          {showComments && (
            <CommentSection postId={post.post_id} currentUserId={currentUserId} />
          )}
        </div>
      </div>
  );
}
