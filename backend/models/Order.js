import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    customerPhone: { type: String, required: true },
    type: { type: String, enum: ['Dine-in', 'Takeaway'], required: true },
    paymentMethod: { type: String, enum: ['Cash', 'Online'], required: true },
    paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
    orderStatus: { type: String, enum: ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Completed', 'Cancelled'], default: 'Pending' },
    tokenNumber: { type: String },
    estimatedTime: { type: Number },
    cancellationReason: { type: String },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;
