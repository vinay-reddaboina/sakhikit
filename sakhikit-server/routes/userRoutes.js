import express from 'express';
import checkJwt from '../middleware/auth.js';
import { syncUser, getMe } from '../controllers/userController.js';

const router = express.Router();

router.post('/sync', checkJwt, syncUser);
router.get('/me', checkJwt, getMe);

export default router;