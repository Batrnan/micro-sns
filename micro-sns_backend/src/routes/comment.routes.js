import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

/** ✅ 댓글 조회 (게시글별) */
router.get('/by-post/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const [rows] = await pool.execute(
      `SELECT c.comment_id, c.content, c.created_at, 
              u.user_id AS author_id, u.name AS author
       FROM Comment c 
       JOIN User u ON c.user_id = u.user_id
       WHERE c.post_id = ?
       ORDER BY c.created_at ASC`,
      [postId]
    );
    res.json({ ok: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/** ✅ 댓글 작성 */
router.post('/', async (req, res) => {
  try {
    const { post_id, user_id, content } = req.body;
    if (!post_id || !user_id || !content) {
      return res
        .status(400)
        .json({ ok: false, error: 'post_id, user_id, content required' });
    }

    const [result] = await pool.execute(
      `INSERT INTO Comment (post_id, user_id, content) VALUES (?, ?, ?)`,
      [post_id, user_id, content]
    );

    res.status(201).json({ ok: true, data: { comment_id: result.insertId } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/** ✅ 댓글 수정 */
router.put('/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    if (!content)
      return res.status(400).json({ ok: false, error: 'content required' });

    const [result] = await pool.execute(
      `UPDATE Comment SET content=? WHERE comment_id=?`,
      [content, commentId]
    );
    res.json({ ok: true, data: { affectedRows: result.affectedRows } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/** ✅ 댓글 삭제 */
router.delete('/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    const [result] = await pool.execute(
      `DELETE FROM Comment WHERE comment_id=?`,
      [commentId]
    );
    res.json({ ok: true, data: { affectedRows: result.affectedRows } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
