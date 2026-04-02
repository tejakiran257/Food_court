import express from 'express';
import { createOrder, getOrders, updateOrderStatus, getOrderById } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(createOrder).get(protect, getOrders);
router.route('/:id').get(getOrderById).put(protect, updateOrderStatus);

export default router;
