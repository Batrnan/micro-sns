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
  image_url?: string | null;
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

export async function createPost(
  user_id: number,
  content: string,
  image?: File | null
) {
  const formData = new FormData();
  formData.append("user_id", user_id.toString());
  formData.append("content", content);
  if (image) formData.append("image", image);

  const res = await api.post("/posts", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

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

export async function updatePost(post_id: number, content: string) {
  const res = await api.put(`/posts/${post_id}`, { content });
  return res.data;
}

// 좋아요 추가
export async function addLike(user_id: number, post_id: number) {
  const res = await api.post('/likes', { user_id, post_id });
  return res.data;
}

// 좋아요 취소
export async function removeLike(user_id: number, post_id: number) {
  const res = await api.delete('/likes', {
    data: { user_id, post_id },
  });
  return res.data;
}

// 좋아요 개수 조회
export async function getLikeCount(post_id: number): Promise<number> {
  const res = await api.get(`/likes/count/${post_id}`);
  return res.data.like_count;
}

// 사용자가 좋아요한 게시글 목록
export async function getLikedPostsByUser(user_id: number): Promise<Post[]> {
  const res = await api.get(`/likes/by-user/${user_id}`);
  return res.data.data;
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

// 댓글 인터페이스
export interface Comment {
  comment_id: number;
  content: string;
  created_at: string;
  author_id: number;
  author: string;
}

// 게시글별 댓글 조회
export async function getCommentsByPost(post_id: number): Promise<Comment[]> {
  const res = await api.get(`/comments/by-post/${post_id}`);
  return res.data.data;
}

// 댓글 작성
export async function createComment(
  post_id: number,
  user_id: number,
  content: string
) {
  const res = await api.post('/comments', { post_id, user_id, content });
  return res.data;
}

// 댓글 수정
export async function updateComment(comment_id: number, content: string) {
  const res = await api.put(`/comments/${comment_id}`, { content });
  return res.data;
}

// 댓글 삭제
export async function deleteComment(comment_id: number) {
  const res = await api.delete(`/comments/${comment_id}`);
  return res.data;
}

// 특정 사용자 정보 가져오기
export async function getUserInfo(user_id: number) {
  const res = await api.get(`/users/${user_id}`);
  return res.data.user;
}

// 특정 사용자 게시글 보기
export async function getPostsByUser(user_id: number): Promise<Post[]> {
  const res = await api.get(`/posts/user/${user_id}`);
  return res.data.data;
}

export async function getTrendingPosts(): Promise<Post[]> {
  const res = await api.get('/posts/trending');
  return res.data.data;
}

export async function searchUsers(keyword: string) {
  const res = await api.get(`/users/search?keyword=${keyword}`);
  return res.data.data;
}

export async function changePassword(user_id: number, oldPw: string, newPw: string) {
  return api.post("/users/change-password", {
    user_id,
    oldPassword: oldPw,
    newPassword: newPw,
  });
}
