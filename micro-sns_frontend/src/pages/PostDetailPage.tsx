import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, type Post } from '@/lib/api';

export default function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    async function fetchPost() {
      const res = await api.get(`/posts/${postId}`);
      setPost(res.data.data);
    }
    fetchPost();
  }, [postId]);

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition mb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>

      <h1 className="text-2xl font-bold">{post.author}</h1>
      <p className="text-gray-400 text-sm">{post.created_at}</p>

      <div className="mt-6 text-lg whitespace-pre-wrap">
        {post.content}
      </div>

      {/* 이미지가 있을 경우 보여주기 */}
      {post.image_url && (
        <div className="mt-4">
          <img
            src={`http://localhost:3001${post.image_url}`}
            alt="게시글 이미지"
            className="rounded-lg max-h-[500px] object-cover"
          />
        </div>
      )}
    </div>
  );
}
