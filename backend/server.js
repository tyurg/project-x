import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import tasksRoutes from './routes/tasks.js';
import contactsRoutes from './routes/contacts.js';

const app = express();

// --- Исправленная настройка CORS ---
// Список разрешённых доменов
const allowedOrigins = [
    'https://tyurg.github.io',          // ваш фронтенд на GitHub Pages
    'http://localhost:5500',            // для локальной разработки
    'http://127.0.0.1:5500'
];

// Настройки CORS
const corsOptions = {
    origin: function (origin, callback) {
        // Разрешаем запросы без origin (например, из Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Применяем CORS ко всем маршрутам
app.use(cors(corsOptions));

// Важно: Явно обрабатываем OPTIONS запросы для всех маршрутов
// Это гарантирует правильный ответ на preflight-запросы браузера
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '5mb' }));

// --- Подключение маршрутов ---
app.use('/api/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/contacts', contactsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});