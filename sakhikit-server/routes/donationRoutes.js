import express from 'express';
import {
  createPaymentIntent,
  createSubscription,
  handleWebhook,
  getMyDonations,
} from '../controllers/donationController.js';
import { checkJwt, loadUser } from '../middleware/auth.js';

const router = express.Router();

// Webhook must use raw body — mounted before express.json() in index.js
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

router.post('/create-payment-intent', checkJwt, loadUser, createPaymentIntent);
router.post('/create-subscription', checkJwt, loadUser, createSubscription);
router.get('/my', checkJwt, loadUser, getMyDonations);

export default router;
