import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoute.js';
import menuRoutes from './routes/menuRoute.js';
import orderRoutes from './routes/orderRoute.js';
import qrRoutes from './routes/qrRoute.js';
import paymentRoutes from './routes/paymentRoute.js';
import marketingRoutes from './routes/marketingRoute.js';

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/marketing', marketingRoutes);

app.get('/', (req, res) => {
    res.send('Restaurant API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
