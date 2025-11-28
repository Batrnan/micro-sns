import axios from 'axios';

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

export interface Post {
  post_id: number;
  author: string;
  author_id: number;
  content: string;
  created_at: string;
  like_count: number;
}

export interface FollowStats {
  following_count: number;
  follower_count: number;
}

export interface FollowUser {
  user_id: number;
  name: string;
  email: string;
  followed_at: string;
}

export async function getPosts(): Promise<Post[]> {
  const res = await api.get('/posts');
  return res.data.data;
}

export async function createPost(user_id: number, content: string) {
  const res = await api.post('/posts', { user_id, content });
  return res.data;
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
  bio?: string
) {
  const res = await api.post('/users/register', { name, email, password, bio });
  return res.data;
}

export async function loginUser(email: string, password: string) {
  const res = await api.post('/users/login', { email, password });
  return res.data.user;
}

export async function deletePost(post_id: number) {
  const res = await api.delete(`/posts/${post_id}`);
  return res.data;
}

export async function addLike(user_id: number, post_id: number) {
  const res = await api.post('/likes', { user_id, post_id });
  return res.data;
}

export async function countLike(post_id: number) {
  const res = await api.get(`/count/${post_id}`);
  return res.data;
}

// 팔로우 추가
export async function followUser(follower_id: number, following_id: number) {
  const res = await api.post('/follows', { follower_id, following_id });
  return res.data;
}

// 언팔로우
export async function unfollowUser(follower_id: number, following_id: number) {
  const res = await api.delete('/follows', {
    data: { follower_id, following_id },
  });
  return res.data;
}

// 팔로우 통계
export async function getFollowStats(userId: number): Promise<FollowStats> {
  const res = await api.get(`/follows/count/${userId}`);
  return res.data.data;
}

// 팔로잉 목록
export async function getFollowingList(userId: number): Promise<FollowUser[]> {
  const res = await api.get(`/follows/following/${userId}`);
  return res.data.data;
}

// 팔로워 목록
export async function getFollowerList(userId: number): Promise<FollowUser[]> {
  const res = await api.get(`/follows/followers/${userId}`);
  return res.data.data;
}

// 팔로우 여부 확인 (프론트에서 체크)
export async function isFollowing(
  follower_id: number,
  following_id: number
): Promise<boolean> {
  const followingList = await getFollowingList(follower_id);
  return followingList.some((user) => user.user_id === following_id);
}
