import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

/** 전체 게시글 */
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.post_id, u.user_id AS author_id, u.name AS author, p.content, p.created_at,
             COUNT(l.user_id) AS like_count
      FROM Post p
      JOIN User u ON p.user_id = u.user_id
      LEFT JOIN Likes l ON p.post_id = l.post_id
      GROUP BY p.post_id
      ORDER BY p.created_at DESC
    `);
    res.json({ ok: true, data: rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/** 특정 사용자 게시글 */
router.get('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      `
      SELECT 
        p.post_id,
        p.content,
        p.created_at,
        p.user_id AS author_id,
        u.name AS author,
        (SELECT COUNT(*) FROM Likes WHERE post_id = p.post_id) AS like_count
      FROM Post p
      JOIN User u ON p.user_id = u.user_id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
      `,
      [id]
    );

    res.json({ ok: true, data: rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/** 팔로우 기반 피드 */
router.get('/feed/:followerId', async (req, res) => {
  try {
    const { followerId } = req.params;
    const [rows] = await pool.execute(
      `
      SELECT p.post_id, u.user_id AS author_id, u.name AS author, p.content, p.created_at
      FROM Post p
      JOIN User u ON p.user_id = u.user_id
      WHERE p.user_id IN (SELECT following_id FROM Follow WHERE follower_id = ?)
      ORDER BY p.created_at DESC
      `,
      [followerId]
    );
    res.json({ ok: true, data: rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/** 특정 사용자 게시글 (구버전) */
router.get('/by-user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await pool.execute(
      `SELECT post_id, content, created_at, updated_at FROM Post WHERE user_id=? ORDER BY created_at DESC`,
      [userId]
    );
    res.json({ ok: true, data: rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/** 게시글 작성 */
router.post('/', async (req, res) => {
  try {
    const { user_id, content } = req.body;
    if (!user_id || !content)
      return res.status(400).json({ ok: false, error: 'user_id and content required' });

    const [result] = await pool.execute(
      `INSERT INTO Post (user_id, content) VALUES (?, ?)`,
      [user_id, content]
    );
    res.status(201).json({ ok: true, data: { post_id: result.insertId } });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/** 게시글 수정 */
router.put('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    if (!content)
      return res.status(400).json({ ok: false, error: 'content required' });

    const [result] = await pool.execute(
      `UPDATE Post SET content=?, updated_at=NOW() WHERE post_id=?`,
      [content, postId]
    );
    res.json({ ok: true, data: { affectedRows: result.affectedRows } });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/** 게시글 삭제 */
router.delete('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const [result] = await pool.execute(
      `DELETE FROM Post WHERE post_id=?`,
      [postId]
    );
    res.json({ ok: true, data: { affectedRows: result.affectedRows } });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/** 게시글 상세 - 맨 마지막에 둠 */
router.get('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const [rows] = await pool.execute(
      `
      SELECT p.post_id, p.content, p.created_at, p.updated_at,
             u.user_id AS author_id, u.name AS author
      FROM Post p 
      JOIN User u ON p.user_id = u.user_id
      WHERE p.post_id = ?
      `,
      [postId]
    );
    res.json({ ok: true, data: rows[0] || null });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
