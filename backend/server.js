import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import tasksRoutes from './routes/tasks.js';
import contactsRoutes from './routes/contacts.js';

const app = express();

// 1. Настройка CORS: явно разрешаем доступ для GitHub Pages и для локальной разработки
const allowedOrigins = [
  'https://tyurg.github.io',
  'http://localhost:5500',   // для VS Code Live Server
  'http://127.0.0.1:5500',
  'http://localhost:5501',
  'http://localhost:5502'
];

app.use(cors({
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
}));

// 2. Этот middleware ОБЯЗАТЕЛЬНО должен идти до всех маршрутов
app.use(express.json({ limit: '5mb' }));

// 3. Ваши маршруты
app.use('/api/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/contacts', contactsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});