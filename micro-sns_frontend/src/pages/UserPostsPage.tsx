import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPostsByUser, type Post } from '@/lib/api';
import { PostCard } from '@/components/common/PostCard';

export default function UserPostsPage() {
  const { id } = useParams<{ id: string }>();

  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (id) load();
  }, [id]);
 
  const load = async () => {
    const data = await getPostsByUser(Number(id));
    setPosts(data);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h1 className="text-xl text-white font-bold mb-6">
        사용자 {id}의 게시글
      </h1>

      {posts.length === 0 ? (
        <p className="text-gray-400">게시글이 없습니다.</p>
      ) : (
        posts.map((post) => (
          <div key={post.post_id} className="mb-4">
            <PostCard post={post} currentUserId={undefined} />
          </div>
        ))
      )}
    </div>
  );
}