const express = require('express');
const { pool } = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, title, done, created_at FROM tasks WHERE user_id = $1 ORDER BY id DESC',
    [req.user.id]
  );
  res.json(rows);
});

router.post('/', async (req, res) => {
  const title = (req.body?.title || '').trim();
  if (!title) return res.status(400).json({ error: 'Title required' });
  const { rows } = await pool.query(
    'INSERT INTO tasks (user_id, title) VALUES ($1, $2) RETURNING id, title, done, created_at',
    [req.user.id, title]
  );
  res.status(201).json(rows[0]);
});

router.put('/:id', async (req, res) => {
  const { title, done } = req.body || {};
  const { rows } = await pool.query(
    `UPDATE tasks SET title = COALESCE($1, title), done = COALESCE($2, done)
     WHERE id = $3 AND user_id = $4 RETURNING id, title, done, created_at`,
    [title ?? null, done ?? null, req.params.id, req.user.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Task not found' });
  res.json(rows[0]);
});

router.delete('/:id', async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [
    req.params.id,
    req.user.id,
  ]);
  if (!rowCount) return res.status(404).json({ error: 'Task not found' });
  res.status(204).end();
});

module.exports = router;
