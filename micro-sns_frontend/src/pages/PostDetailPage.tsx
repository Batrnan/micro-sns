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
      <button onClick={() => navigate(-1)} className="mb-4">뒤로가기</button>

      <h1 className="text-2xl font-bold">{post.author}</h1>
      <p className="text-gray-400 text-sm">{post.created_at}</p>

      <div className="mt-6 text-lg whitespace-pre-wrap">
        {post.content}
      </div>
    </div>
  );
}
