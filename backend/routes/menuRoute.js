import express from 'express';
import { getMenuItems, getOwnerMenuItems, addMenuItem, updateMenuItem, deleteMenuItem } from '../controllers/menuController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getMenuItems)
    .post(protect, upload.single('image'), addMenuItem);

router.route('/owner').get(protect, getOwnerMenuItems);

router.route('/:id')
    .put(protect, upload.single('image'), updateMenuItem)
    .delete(protect, deleteMenuItem);

export default router;
