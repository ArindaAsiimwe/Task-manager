const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db/connection');

const JWT_SECRET = process.env.API_KEY || 'default-jwt-secret-change-me';

// ─── Auth middleware — verify JWT and extract user_id ────
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.warn('[AUTH] Invalid token:', err.message);
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

// Apply auth middleware to all task routes
router.use(authenticate);

// ─── GET /api/tasks — List tasks for the logged-in user ─
router.get('/', async (req, res) => {
  try {
    const { status, priority } = req.query;
    let query = 'SELECT * FROM tasks WHERE user_id = $1';
    const params = [req.userId];

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    if (priority) {
      params.push(priority);
      query += ` AND priority = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);
    console.log(`[TASKS] GET / — User ${req.userId}: returned ${result.rows.length} tasks`);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    console.error('[TASKS] GET / — Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/tasks/:id — Get a single task (owned by user) ─
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [id, req.userId]);

    if (result.rows.length === 0) {
      console.warn(`[TASKS] GET /${id} — Task not found for user ${req.userId}`);
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    console.log(`[TASKS] GET /${id} — Found task: "${result.rows[0].title}"`);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(`[TASKS] GET /${req.params.id} — Error:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/tasks — Create a new task for the logged-in user ─
router.post('/', async (req, res) => {
  try {
    const { title, description, status, priority } = req.body;

    if (!title) {
      console.warn('[TASKS] POST / — Missing title');
      return res.status(400).json({ success: false, error: 'Title is required' });
    }

    const result = await db.query(
      `INSERT INTO tasks (title, description, status, priority, user_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, description || null, status || 'pending', priority || 'medium', req.userId]
    );

    console.log(`[TASKS] POST / — User ${req.userId} created task #${result.rows[0].id}: "${title}"`);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('[TASKS] POST / — Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── PUT /api/tasks/:id — Update a task (owned by user) ─
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority } = req.body;

    const result = await db.query(
      `UPDATE tasks
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           priority = COALESCE($4, priority),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [title, description, status, priority, id, req.userId]
    );

    if (result.rows.length === 0) {
      console.warn(`[TASKS] PUT /${id} — Task not found for user ${req.userId}`);
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    console.log(`[TASKS] PUT /${id} — Updated task: "${result.rows[0].title}"`);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(`[TASKS] PUT /${req.params.id} — Error:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── DELETE /api/tasks/:id — Delete a task (owned by user) ─
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *', [id, req.userId]);

    if (result.rows.length === 0) {
      console.warn(`[TASKS] DELETE /${id} — Task not found for user ${req.userId}`);
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    console.log(`[TASKS] DELETE /${id} — Deleted task: "${result.rows[0].title}"`);
    res.json({ success: true, message: 'Task deleted', data: result.rows[0] });
  } catch (err) {
    console.error(`[TASKS] DELETE /${req.params.id} — Error:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
