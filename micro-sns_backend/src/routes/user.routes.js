import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

/** 회원가입 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, bio } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ ok: false, error: 'name/email/password required' });
    }

    await pool.execute(
      `INSERT INTO User (name, email, password, bio) VALUES (?, ?, ?, ?)`,
      [name, email, password, bio ?? null]
    );

    res.status(201).json({ ok: true, message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/** 로그인 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ ok: false, error: 'email/password required' });
    }

    const [rows] = await pool.execute(
      `SELECT user_id, name, email, bio FROM User WHERE email=? AND password=?`,
      [email, password]
    );

    if (rows.length === 0) {
      return res
        .status(401)
        .json({ ok: false, error: 'Invalid email or password' });
    }

    res.json({ ok: true, user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});
/** 🔍 사용자 검색 API - 무조건 위쪽에 위치해야 함! */
router.get('/search', async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword || keyword.trim() === "") {
      return res.json({ ok: true, data: [] });
    }

    const [rows] = await pool.execute(
      `
      SELECT user_id, name, email
      FROM User
      WHERE name LIKE CONCAT('%', ?, '%')
      LIMIT 20
      `,
      [keyword]
    );

    res.json({ ok: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});
/** ===============================
 * 🔐 비밀번호 변경
 * =============================== */
router.post('/change-password', async (req, res) => {
  try {
    const { user_id, oldPassword, newPassword } = req.body;

    if (!user_id || !oldPassword || !newPassword) {
      return res.status(400).json({ ok: false, error: '모든 필드가 필요합니다.' });
    }

    // 1) 기존 비밀번호 확인
    const [rows] = await pool.execute(
      `SELECT password FROM User WHERE user_id = ?`,
      [user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, error: '사용자를 찾을 수 없습니다.' });
    }

    if (rows[0].password !== oldPassword) {
      return res.status(401).json({ ok: false, error: '기존 비밀번호가 일치하지 않습니다.' });
    }

    // 2) 새 비밀번호로 업데이트
    await pool.execute(
      `UPDATE User SET password = ? WHERE user_id = ?`,
      [newPassword, user_id]
    );

    res.json({ ok: true, message: '비밀번호가 성공적으로 변경되었습니다.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});


/** 사용자 프로필 정보 조회 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      `SELECT user_id, name, email, bio, created_at
       FROM User
       WHERE user_id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    res.json({ ok: true, user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/** 사용자 프로필 정보 조회 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      `SELECT user_id, name, email, bio, created_at
       FROM User
       WHERE user_id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    res.json({ ok: true, user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;