import express from 'express';
import { createRazorpayOrder, verifyRazorpayPayment, getRazorpayConfig } from '../controllers/paymentController.js';

const router = express.Router();

router.get('/config', getRazorpayConfig);
router.post('/create', createRazorpayOrder);
router.post('/verify', verifyRazorpayPayment);

export default router;
