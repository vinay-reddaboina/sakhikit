import express from 'express';
import { createTestUser, getAllUsers } from '../controllers/userController.js';

const router = express.Router();

// Temporary test routes — remove before deployment
router.post('/test', createTestUser);
router.get('/all', getAllUsers);

export default router;