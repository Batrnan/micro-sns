import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import userRouter from './routes/user.routes.js';
import postRouter from './routes/post.routes.js';
import commentRouter from './routes/comment.routes.js';
import likeRouter from './routes/like.routes.js';
import followRouter from './routes/follow.routes.js';

const app = express();
app.use(cors());
app.use(express.json());

// 헬스체크
app.get('/api/health', async (req, res) => {
  try {
    const ok = await ping();
    res.json({ ok });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// 라우트
app.use('/api/users', userRouter);
app.use('/api/posts', postRouter);
app.use('/api/comments', commentRouter);
app.use('/api/likes', likeRouter);
app.use('/api/follows', followRouter);

// 에러 핸들링 (최후)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ ok: false, error: 'Internal Server Error' });
});

const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => {
  console.log(`✅ Server running http://localhost:${PORT}`);
});
