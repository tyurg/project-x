import express from 'express';
import { pool } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, title, description, priority, deadline, category, completed, created_at
             FROM tasks WHERE user_id = $1 ORDER BY created_at DESC`,
            [req.userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/', authenticateToken, async (req, res) => {
    const { title, description, priority, deadline, category, completed } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });
    try {
        const result = await pool.query(
            `INSERT INTO tasks (user_id, title, description, priority, deadline, category, completed, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [req.userId, title, description || '', priority || 'medium', deadline || null, category || 'other', completed || false, Date.now()]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/:id', authenticateToken, async (req, res) => {
    const { title, description, priority, deadline, category, completed } = req.body;
    const taskId = parseInt(req.params.id);
    if (!title) return res.status(400).json({ error: 'Title required' });
    try {
        const check = await pool.query(`SELECT id FROM tasks WHERE id = $1 AND user_id = $2`, [taskId, req.userId]);
        if (check.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
        const result = await pool.query(
            `UPDATE tasks SET title=$1, description=$2, priority=$3, deadline=$4, category=$5, completed=$6
             WHERE id = $7 AND user_id = $8 RETURNING *`,
            [title, description || '', priority, deadline, category, completed, taskId, req.userId]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/:id', authenticateToken, async (req, res) => {
    const taskId = parseInt(req.params.id);
    try {
        const result = await pool.query(
            `DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id`,
            [taskId, req.userId]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;