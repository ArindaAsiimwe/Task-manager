const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/connection');

const JWT_SECRET = process.env.API_KEY || 'default-jwt-secret-change-me';

// ─── POST /api/auth/register ────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      console.warn('[AUTH] Register — Missing fields');
      return res.status(400).json({ success: false, error: 'Name, email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      console.warn(`[AUTH] Register — Email already exists: ${email}`);
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const result = await db.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name, email, hashedPassword]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    console.log(`[AUTH] Register — New user: ${email} (id: ${user.id})`);
    res.status(201).json({ success: true, data: { user, token } });
  } catch (err) {
    console.error('[AUTH] Register — Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/auth/login ───────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.warn('[AUTH] Login — Missing credentials');
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    // Find user
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      console.warn(`[AUTH] Login — User not found: ${email}`);
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.warn(`[AUTH] Login — Wrong password for: ${email}`);
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    console.log(`[AUTH] Login — Success: ${email}`);
    res.json({
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email },
        token
      }
    });
  } catch (err) {
    console.error('[AUTH] Login — Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/auth/me — Get current user ────────────────
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const result = await db.query('SELECT id, name, email, created_at FROM users WHERE id = $1', [decoded.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('[AUTH] Me — Error:', err.message);
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
});

module.exports = router;
