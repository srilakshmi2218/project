import express from 'express';
import { initiateCall, getCalls, updateCallStatus, twilioStatusWebhook } from '../controllers/callController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public webhook route for Twilio API callbacks
router.post('/status-webhook', twilioStatusWebhook);

// Protected routes for Agents
router.post('/initiate', protect, initiateCall);
router.get('/', protect, getCalls);
router.post('/status', protect, updateCallStatus);

export default router;
