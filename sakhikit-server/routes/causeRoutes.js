import express from 'express';
import {
  createCause,
  getCauses,
  getCauseById,
  getMyCauses,
  updateCause,
  deleteCause,
  getCauseStats,
} from '../controllers/causeController.js';
import { checkJwt, loadUser, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', getCauseStats);
router.get('/', getCauses);
router.get('/ngo/mine', checkJwt, loadUser, requireRole('ngo_admin'), getMyCauses);
router.get('/:id', getCauseById);
router.post('/', checkJwt, loadUser, requireRole('ngo_admin'), createCause);
router.patch('/:id', checkJwt, loadUser, requireRole('ngo_admin'), updateCause);
router.delete('/:id', checkJwt, loadUser, requireRole('ngo_admin'), deleteCause);

export default router;
