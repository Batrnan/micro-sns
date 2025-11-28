import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// 좋아요 추가
router.post('/', async (req, res) => {
  try {
    const { user_id, post_id } = req.body;
    if (!user_id || !post_id)
      return res
        .status(400)
        .json({ ok: false, error: 'user_id and post_id required' });

    await pool.execute(`INSERT INTO Likes (user_id, post_id) VALUES (?, ?)`, [
      user_id,
      post_id,
    ]);

    res.status(201).json({ ok: true, message: 'Post liked successfully' });
  } catch (err) {
    // 중복 좋아요 시 에러 방지
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ ok: false, error: 'Already liked' });
    }
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.delete('/', async (req, res) => {
  try {
    const { user_id, post_id } = req.body;
    if (!user_id || !post_id)
      return res
        .status(400)
        .json({ ok: false, error: 'user_id and post_id required' });

    const [result] = await pool.execute(
      `DELETE FROM Likes WHERE user_id=? AND post_id=?`,
      [user_id, post_id]
    );
    res.json({ ok: true, data: { affectedRows: result.affectedRows } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 특정 게시글의 좋아요 수
router.get('/count/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const [rows] = await pool.execute(
      `SELECT COUNT(*) AS like_count FROM Likes WHERE post_id=?`,
      [postId]
    );
    res.json({ ok: true, like_count: rows[0].like_count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/** 사용자가 좋아요한 게시글 목록 */
router.get('/by-user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await pool.execute(
      `SELECT p.post_id, p.content, p.created_at, u.name AS author
       FROM Likes l
       JOIN Post p ON l.post_id = p.post_id
       JOIN User u ON p.user_id = u.user_id
       WHERE l.user_id = ?`,
      [userId]
    );
    res.json({ ok: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
