import express from 'express';
import multer from 'multer';
import {
  createImpactUpdate,
  getImpactByCause,
  getAllImpactUpdates,
  uploadPhoto,
} from '../controllers/impactController.js';
import { checkJwt, loadUser, requireRole } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/all', getAllImpactUpdates);
router.get('/cause/:causeId', getImpactByCause);
router.post('/', checkJwt, loadUser, requireRole('ngo_admin'), createImpactUpdate);
router.post('/upload-photo', checkJwt, loadUser, requireRole('ngo_admin'), upload.single('photo'), uploadPhoto);

export default router;
