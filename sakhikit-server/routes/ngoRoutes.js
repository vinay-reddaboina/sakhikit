import express from 'express';
import {
  registerNGO,
  getVerifiedNGOs,
  getPendingNGOs,
  getMyNGO,
  getNGOById,
  verifyNGO,
} from '../controllers/ngoController.js';
import { checkJwt, loadUser, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getVerifiedNGOs);
router.get('/pending', checkJwt, loadUser, requireRole('platform_admin'), getPendingNGOs);
router.get('/mine', checkJwt, loadUser, requireRole('ngo_admin'), getMyNGO);
router.get('/:id', getNGOById);
router.post('/', checkJwt, loadUser, registerNGO);
router.patch('/:id/verify', checkJwt, loadUser, requireRole('platform_admin'), verifyNGO);

export default router;
