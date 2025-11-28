import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import { Toaster } from '@/components/ui/sonner';
import UserPostsPage from './pages/UserPostsPage.tsx';
import PostDetailPage from './pages/PostDetailPage.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />
        <Route path="/user/:id/posts" element={<UserPostsPage />} />
        <Route path="/posts/:postId" element={<PostDetailPage />} />
      </Routes>
      <Toaster position="top-center" />
    </BrowserRouter>
  </StrictMode>
);
