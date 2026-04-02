import Order from '../models/Order.js';
import axios from 'axios';

// Utility function to send SMS via Fast2SMS
const sendSMS = async (to, message) => {
    try {
        if (!process.env.FAST2SMS_API_KEY) {
            console.log(`\n================================`);
            console.log(`[MOCK FAST2SMS] To: ${to}`);
            console.log(`[MOCK FAST2SMS] Message: ${message}`);
            console.log(`================================\n`);
            return true;
        }

        // Fast2SMS requires just the 10-digit number
        const cleanPhone = String(to).replace('+91', '').replace(/\D/g, '').slice(-10);
        
        if (cleanPhone.length !== 10) throw new Error('Invalid Indian phone number length');

        await axios.post(
            'https://www.fast2sms.com/dev/bulkV2',
            { route: 'q', message: message, flash: 0, numbers: cleanPhone },
            { headers: { authorization: process.env.FAST2SMS_API_KEY, 'Content-Type': 'application/json' } }
        );
        
        console.log(`[FAST2SMS] Successfully sent message to ${cleanPhone}`);
        return true;
    } catch (error) {
        console.error('[FAST2SMS ERROR] Failed to send SMS:', error.response?.data?.message || error.message);
        return false;
    }
};

export const createOrder = async (req, res) => {
    try {
        const { items, totalAmount, type, paymentMethod, restaurant, customerPhone } = req.body;

        if (items && items.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        const tokenNumber = Math.floor(1000 + Math.random() * 9000).toString();

        const order = new Order({
            items, totalAmount, type, paymentMethod, tokenNumber, restaurant, customerPhone
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ restaurant: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { orderStatus, estimatedTime, paymentStatus, cancellationReason } = req.body;
        const order = await Order.findOne({ _id: req.params.id, restaurant: req.user._id });

        if (order) {
            order.orderStatus = orderStatus || order.orderStatus;
            order.estimatedTime = estimatedTime || order.estimatedTime;
            order.paymentStatus = paymentStatus || order.paymentStatus;
            if (cancellationReason !== undefined) {
                order.cancellationReason = cancellationReason;
            }

            const updatedOrder = await order.save();

            // Check if status just changed to 'Ready' and send SMS
            if (orderStatus === 'Ready' && updatedOrder.customerPhone) {
                const message = `Hello! Your order (Token: ${updatedOrder.tokenNumber}) from the Food Court is now READY for pickup. Enjoy your meal!`;
                sendSMS(updatedOrder.customerPhone, message);
            }
            
            // Check if status changed to 'Cancelled' and send SMS
            if (orderStatus === 'Cancelled' && updatedOrder.customerPhone) {
                const reasonText = updatedOrder.cancellationReason ? ` Reason: ${updatedOrder.cancellationReason}` : '';
                const message = `Hello. Sorry to inform you that your order (Token: ${updatedOrder.tokenNumber}) has been CANCELLED.${reasonText}`;
                sendSMS(updatedOrder.customerPhone, message);
            }

            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
