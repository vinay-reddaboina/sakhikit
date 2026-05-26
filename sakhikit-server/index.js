import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import healthRoutes from './routes/healthRoutes.js';
import './models/User.js';
import userRoutes from './routes/userRoutes.js';

// Load environment variables BEFORE anything that uses them
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// API routes
app.use('/api/health', healthRoutes);
// API routes
app.use('/api/health', healthRoutes);
app.use('/api/users', userRoutes);

// Root route — quick check the server is alive
app.get('/', (req, res) => {
  res.send('SakhiKit API root. Use /api/health for status.');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});