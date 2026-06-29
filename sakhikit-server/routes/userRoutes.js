import express from 'express';
import {
  syncUser,
  getMe,
  getAllUsers,
  updateUserRole,
} from '../controllers/userController.js';
import { checkJwt, loadUser, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/sync', checkJwt, syncUser);
router.get('/me', checkJwt, loadUser, getMe);
router.get('/all', checkJwt, loadUser, requireRole('platform_admin'), getAllUsers);
router.patch('/:id/role', checkJwt, loadUser, requireRole('platform_admin'), updateUserRole);

export default router;