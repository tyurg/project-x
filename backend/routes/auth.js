import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
    const { email, password, name, avatar, location } = req.body;
    if (!email || !password || !name) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const created_at = Date.now();
        const result = await pool.query(
            `INSERT INTO users (email, password, name, avatar, location, created_at)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, name, avatar, location`,
            [email, hashedPassword, name, avatar || '', location || '', created_at]
        );
        const user = result.rows[0];
        const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.status(201).json({ token, user });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }
    try {
        const result = await pool.query(
            `SELECT id, email, password, name, avatar, location FROM users WHERE email = $1`,
            [email]
        );
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const user = result.rows[0];
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
        const { password: _, ...userWithoutPassword } = user;
        res.json({ token, user: userWithoutPassword });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/me', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, email, name, avatar, location FROM users WHERE id = $1`,
            [req.userId]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/me', authenticateToken, async (req, res) => {
    const { name, email, avatar, location } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
    }
    try {
        const result = await pool.query(
            `UPDATE users SET name = $1, email = $2, avatar = $3, location = $4
             WHERE id = $5 RETURNING id, email, name, avatar, location`,
            [name, email, avatar || '', location || '', req.userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        if (err.code === '23505') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;