import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import channelRoutes from './routes/channels.js';
import messageRoutes from './routes/messages.js';
import { SchedulerService } from './services/schedulerService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Initialize scheduler
SchedulerService.init();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
