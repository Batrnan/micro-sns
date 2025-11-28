import { useState, useEffect } from 'react';
import {
  type Comment,
  getCommentsByPost,
  createComment,
  deleteComment,
} from '@/lib/api';
import { UserAvatar } from './UserAvatar';
import { DeleteIcon } from '@/components/icons';
import { formatTimeAgo } from '@/lib/utils';
import { showError, showSuccess } from '@/lib/utils';

interface CommentSectionProps {
  postId: number;
  currentUserId?: number;
}

export function CommentSection({ postId, currentUserId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const data = await getCommentsByPost(postId);
      setComments(data);
    } catch (error) {
      console.error('댓글 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUserId) return;

    setSubmitting(true);
    try {
      await createComment(postId, currentUserId, newComment.trim());
      setNewComment('');
      await loadComments();
      showSuccess('댓글이 작성되었습니다.');
    } catch (error) {
      showError(error, '댓글 작성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;

    try {
      await deleteComment(commentId);
      await loadComments();
      showSuccess('댓글이 삭제되었습니다.');
    } catch (error) {
      showError(error, '댓글 삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="border-t border-gray-800 pt-3 mt-3">
        <div className="text-center py-4 text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-800 pt-3 mt-3">
      {/* Comment Input */}
      {currentUserId && (
        <form onSubmit={handleSubmit} className="mb-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 입력하세요..."
              className="flex-1 bg-gray-800 text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors"
            >
              {submitting ? '...' : '작성'}
            </button>
          </div>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-center py-4 text-gray-500 text-sm">
            첫 댓글을 작성해보세요!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.comment_id} className="flex gap-2">
              <UserAvatar name={comment.author} size="xs" />
              <div className="flex-1 bg-gray-800 rounded-lg px-3 py-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">
                      {comment.author}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {formatTimeAgo(comment.created_at)}
                    </span>
                  </div>
                  {currentUserId === comment.author_id && (
                    <button
                      onClick={() => handleDelete(comment.comment_id)}
                      className="text-gray-500 hover:text-red-500 transition-colors p-1"
                      aria-label="댓글 삭제"
                    >
                      <DeleteIcon className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <p className="text-white text-sm">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
