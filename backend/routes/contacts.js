import express from 'express';
import { pool } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendContactEmail } from '../utils/resendEmail.js';

const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
    const { fio, phone, desiredDate, message, photoBase64, userEmail } = req.body; // добавили userEmail
    if (!fio || !phone || !desiredDate) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        await pool.query(
            `INSERT INTO contacts (user_id, fio, phone, desired_date, message, photo_base64, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [req.userId, fio, phone, desiredDate, message || '', photoBase64 || null, Date.now()]
        );

        // Передаём userEmail в функцию отправки
        await sendContactEmail({ fio, phone, desiredDate, message, photoBase64, userEmail }, req.userId);

        res.status(201).json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;