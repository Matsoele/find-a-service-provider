import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import providerRoutes from './routes/providers.js';
import categoryRoutes from './routes/categories.js';
import messageRoutes from './routes/messages.js';
import requestRoutes from './routes/requests.js';
import reviewRoutes from './routes/reviews.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Dynamic CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    // Allow any localhost port dynamically (5173, 5174, 5176, etc.)
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    
    // Allow the production URL from .env
    if (origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (_req, res) => res.json({ status: 'ok', service: 'FASP API' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('💥', err);
  res.status(500).json({ error: err.message || 'Server error' });
});

const server = http.createServer(app);

// Socket.IO setup with the same CORS options
const io = new Server(server, {
  cors: corsOptions
});

io.on('connection', (socket) => {
  socket.on('join', (room) => socket.join(room));
  socket.on('disconnect', () => {});
});

// Expose io to requests so controllers can emit events
app.use((req, _res, next) => { 
  req.io = io; 
  next(); 
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 API running on http://localhost:${PORT}`));