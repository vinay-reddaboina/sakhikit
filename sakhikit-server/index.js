import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import './models/User.js';
import './models/NGO.js';
import './models/Cause.js';
import healthRoutes from './routes/healthRoutes.js';
import userRoutes from './routes/userRoutes.js';
import ngoRoutes from './routes/ngoRoutes.js';
import causeRoutes from './routes/causeRoutes.js';

connectDB();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/health', healthRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ngos', ngoRoutes);
app.use('/api/causes', causeRoutes);

app.get('/', (req, res) => res.send('SakhiKit API'));

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));