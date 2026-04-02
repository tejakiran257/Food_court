import Order from '../models/Order.js';
import axios from 'axios';

const sendSMS = async (to, message) => {
    try {
        if (!process.env.FAST2SMS_API_KEY) {
            console.log(`\n================================`);
            console.log(`[MOCK FAST2SMS BROADCAST] To: ${to}`);
            console.log(`[MOCK FAST2SMS BROADCAST] Message: ${message}`);
            console.log(`================================\n`);
            return true;
        }

        const cleanPhone = String(to).replace('+91', '').replace(/\D/g, '').slice(-10);
        
        if (cleanPhone.length !== 10) throw new Error('Invalid Indian phone number format');

        await axios.post(
            'https://www.fast2sms.com/dev/bulkV2',
            { route: 'q', message: message, flash: 0, numbers: cleanPhone },
            { headers: { authorization: process.env.FAST2SMS_API_KEY, 'Content-Type': 'application/json' } }
        );
        
        return true;
    } catch (error) {
        console.error('[FAST2SMS ERROR] Failed to send broadcast SMS:', error.response?.data?.message || error.message);
        return false;
    }
};

export const broadcastMessage = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ message: 'Message is required' });

        // Find all unique phone numbers for this restaurant
        const orders = await Order.find({ 
            restaurant: req.user._id, 
            customerPhone: { $exists: true, $ne: '' } 
        }).select('customerPhone');
        
        const phoneNumbers = [...new Set(orders.map(order => order.customerPhone))];

        if (phoneNumbers.length === 0) {
            return res.status(404).json({ message: 'No customers found to broadcast to.' });
        }

        let successCount = 0;
        let failCount = 0;
        
        // Sequentially to avoid overwhelming trial accounts or hitting rate limits
        for (const phone of phoneNumbers) {
            const success = await sendSMS(phone, message);
            if (success) successCount++;
            else failCount++;
        }

        res.json({ message: 'Broadcast complete', successCount, failCount, total: phoneNumbers.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAudienceSize = async (req, res) => {
    try {
        const orders = await Order.find({ 
            restaurant: req.user._id, 
            customerPhone: { $exists: true, $ne: '' } 
        }).select('customerPhone');
        
        const phoneNumbers = [...new Set(orders.map(order => order.customerPhone))];
        
        res.json({ count: phoneNumbers.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
