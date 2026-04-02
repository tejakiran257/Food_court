import express from 'express';
import { registerOwner, loginOwner, getProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerOwner);
router.post('/login', loginOwner);
router.get('/profile', protect, getProfile);

export default router;
