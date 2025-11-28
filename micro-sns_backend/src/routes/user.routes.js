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

export default router;
