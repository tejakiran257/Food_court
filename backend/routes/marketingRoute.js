import express from 'express';
import { broadcastMessage, getAudienceSize } from '../controllers/marketingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/audience', protect, getAudienceSize);
router.post('/broadcast', protect, broadcastMessage);

export default router;
