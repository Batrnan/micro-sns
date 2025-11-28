import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

/** 팔로우 추가 */
router.post('/', async (req, res) => {
  try {
    const { follower_id, following_id } = req.body;
    if (!follower_id || !following_id) {
      return res
        .status(400)
        .json({ ok: false, error: 'follower_id and following_id required' });
    }

    if (follower_id === following_id) {
      return res
        .status(400)
        .json({ ok: false, error: 'Cannot follow yourself' });
    }

    await pool.execute(
      `INSERT INTO Follow (follower_id, following_id) VALUES (?, ?)`,
      [follower_id, following_id]
    );

    res.status(201).json({ ok: true, message: 'Followed successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ ok: false, error: 'Already following' });
    }
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/** 언팔로우 */
router.delete('/', async (req, res) => {
  try {
    const { follower_id, following_id } = req.body;
    if (!follower_id || !following_id) {
      return res
        .status(400)
        .json({ ok: false, error: 'follower_id and following_id required' });
    }

    const [result] = await pool.execute(
      `DELETE FROM Follow WHERE follower_id=? AND following_id=?`,
      [follower_id, following_id]
    );
    res.json({ ok: true, data: { affectedRows: result.affectedRows } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/** ✅ 내가 팔로우하는 목록 (Following list) */
router.get('/following/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await pool.execute(
      `SELECT u.user_id, u.name, u.email, f.followed_at
       FROM Follow f
       JOIN User u ON f.following_id = u.user_id
       WHERE f.follower_id = ?`,
      [userId]
    );
    res.json({ ok: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/** ✅ 나를 팔로우하는 사람들 (Follower list) */
router.get('/followers/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await pool.execute(
      `SELECT u.user_id, u.name, u.email, f.followed_at
       FROM Follow f
       JOIN User u ON f.follower_id = u.user_id
       WHERE f.following_id = ?`,
      [userId]
    );
    res.json({ ok: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/** 팔로워/팔로잉 카운트 */
router.get('/count/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const [[stats]] = await pool.execute(
      `SELECT 
         (SELECT COUNT(*) FROM Follow WHERE follower_id = ?) AS following_count,
         (SELECT COUNT(*) FROM Follow WHERE following_id = ?) AS follower_count`,
      [userId, userId]
    );
    res.json({ ok: true, data: stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
