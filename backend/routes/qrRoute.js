import express from 'express';
import { generateQRCode } from '../controllers/qrController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, generateQRCode);

export default router;
