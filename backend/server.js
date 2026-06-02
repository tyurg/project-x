import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import tasksRoutes from './routes/tasks.js';
import contactsRoutes from './routes/contacts.js';

const app = express();

// Определяем список разрешённых доменов
const allowedOrigins = [
  'https://tyurg.github.io',                 // ваш сайт на GitHub Pages
  'http://localhost:5500',                   // для локальной разработки (Live Server)
  'http://127.0.0.1:5500',                   // альтернативный адрес локалки
  'http://localhost:5501',                   // если вдруг порт другой
  'http://localhost:5502'                    // если вдруг порт другой
];

// Настройка CORS
const corsOptions = {
  origin: function (origin, callback) {
    // Разрешаем запросы без origin (например, из Postman или curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,                         // важно для кук и авторизации
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Обработка preflight-запросов (OPTIONS)
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '5mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/contacts', contactsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});