import express from 'express';
import { registerAgent, loginAgent, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerAgent);
router.post('/login', loginAgent);
router.get('/me', protect, getMe);

export default router;
