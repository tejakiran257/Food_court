import { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaArrowLeft, FaTrash, FaMinus, FaPlus, FaMoneyBillWave, FaCreditCard } from 'react-icons/fa';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, clearCart, total } = useContext(CartContext);
    const [orderType, setOrderType] = useState('Dine-in');
    const [paymentMethod, setPaymentMethod] = useState('Online');
    const [isProcessing, setIsProcessing] = useState(false);
    const navigate = useNavigate();

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return toast.error('Cart is empty');
        if (!cart[0]?.restaurant) {
            toast.error('Your cart contains outdated items. Please clear your cart and add items again from the new QR menu.');
            return;
        }

        const customerPhone = localStorage.getItem('customerPhone');
        if (!customerPhone) {
            toast.error('Customer phone number is missing. Please return to the menu and enter it.');
            return;
        }

        setIsProcessing(true);

        try {
            if (paymentMethod === 'Online') {
                const res = await loadRazorpay();
                if (!res) {
                    toast.error('Razorpay failed to load');
                    setIsProcessing(false);
                    return;
                }

                // Fetch Razorpay Key ID from backend
                const { data: configData } = await axios.get('/api/payment/config');
                const razorpayKeyId = configData.key_id;

                if (!razorpayKeyId || razorpayKeyId === 'placeholder_key_id' || razorpayKeyId === 'dummy_id') {
                    toast.error('Razorpay Key is not configured. Please contact the administrator.');
                    setIsProcessing(false);
                    return;
                }

                // Create placeholder order for razorpay amount calculation
                const { data: orderData } = await axios.post('/api/payment/create', { amount: total });

                const options = {
                    key: razorpayKeyId,
                    amount: orderData.amount,
                    currency: orderData.currency,
                    name: 'FoodCourt Restaurant',
                    description: 'Order Payment',
                    order_id: orderData.id,
                    handler: async function (response) {
                        try {
                            const verifyData = {
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature,
                            };
                            
                            // Verify the payment signature on backend
                            const { data: verifyResponse } = await axios.post('/api/payment/verify', verifyData);
                            
                            if (verifyResponse.message === 'Payment verified successfully') {
                                const foodOrderRes = await axios.post('/api/orders', {
                                    items: cart.map(item => ({ menuItem: item.menuItem, name: item.name, quantity: item.quantity, price: item.price })),
                                    totalAmount: total,
                                    type: orderType,
                                    paymentMethod: 'Online',
                                    restaurant: cart[0]?.restaurant,
                                    customerPhone
                                });
                                
                                // Set to Paid
                                await axios.put(`/api/orders/${foodOrderRes.data._id}`, { paymentStatus: 'Paid' });
                                
                                clearCart();
                                navigate(`/order/${foodOrderRes.data._id}`, { state: { order: foodOrderRes.data } });
                            } else {
                                toast.error('Payment verification failed');
                            }
                            
                        } catch (err) {
                            toast.error('Order creation failed after payment');
                        }
                    },
                    prefill: { name: 'Customer', email: 'customer@example.com' },
                    theme: { color: '#ef4444' }
                };
                
                const paymentObject = new window.Razorpay(options);
                paymentObject.open();
                
                paymentObject.on('payment.failed', function (response){
                    toast.error('Payment failed: ' + response.error.description);
                    setIsProcessing(false);
                });

            } else {
                // Cash Payment
                const { data } = await axios.post('/api/orders', {
                    items: cart.map(item => ({ menuItem: item.menuItem, name: item.name, quantity: item.quantity, price: item.price })),
                    totalAmount: total,
                    type: orderType,
                    paymentMethod: 'Cash',
                    restaurant: cart[0]?.restaurant,
                    customerPhone
                });
                
                clearCart();
                navigate(`/order/${data._id}`, { state: { order: data } });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Checkout failed');
        } finally {
            if (paymentMethod !== 'Online') setIsProcessing(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md w-full border border-gray-100 transform transition-all">
                    <div className="w-28 h-28 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 border-[8px] border-white shadow-inner">
                        <FaShoppingCart className="text-5xl text-gray-300" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 mb-3">Your cart is empty</h2>
                    <p className="text-gray-500 mb-10 font-medium">Looks like you haven't added any delicious food to your cart yet.</p>
                    <Link to="/menu" className="block w-full bg-brand-primary text-white font-bold text-lg py-4 rounded-2xl hover:bg-brand-secondary hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                        Browse Menu
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-32 animate-fade-in">
            <div className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center bg-white/80 backdrop-blur-md">
                    <Link to="/menu" className="p-2 -ml-2 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-full transition-colors mr-4">
                        <FaArrowLeft className="text-lg" />
                    </Link>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Checkout</h1>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
                {/* Order Items */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
                    <h3 className="text-xl font-black text-gray-900 mb-6 tracking-tight flex items-center justify-between border-b border-gray-100 pb-4">
                        <span>Your Order</span>
                        <span className="text-sm text-brand-primary bg-red-50 px-3 py-1 rounded-full">{cart.length} items</span>
                    </h3>
                    <div className="space-y-6">
                        {cart.map(item => (
                            <div key={item.menuItem} className="flex items-center gap-5">
                                <img src={item.image} alt={item.name} className="w-24 h-24 rounded-2xl object-cover bg-gray-100 border border-gray-50 shadow-sm" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-gray-900 text-lg leading-tight pr-4">{item.name}</h4>
                                        <button onClick={() => removeFromCart(item.menuItem)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                                            <FaTrash className="text-sm" />
                                        </button>
                                    </div>
                                    <p className="text-gray-500 font-bold mb-3">₹{item.price}</p>
                                    
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1 shadow-inner">
                                            <button onClick={() => updateQuantity(item.menuItem, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-gray-600 font-bold hover:text-gray-900 hover:bg-white rounded-lg transition-all shadow-sm"><FaMinus className="text-xs" /></button>
                                            <span className="w-10 text-center font-bold text-gray-900">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.menuItem, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-gray-600 font-bold hover:text-gray-900 hover:bg-white rounded-lg transition-all shadow-sm"><FaPlus className="text-xs" /></button>
                                        </div>
                                        <div className="font-black text-gray-900">₹{item.price * item.quantity}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Preferences */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-8">
                    <div>
                        <h3 className="text-xl font-black text-gray-900 mb-4 tracking-tight">Dining Preference</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {['Dine-in', 'Takeaway'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setOrderType(type)}
                                    className={`py-4 px-2 rounded-2xl font-bold border-2 transition-all duration-300 flex items-center justify-center gap-2 ${orderType === type ? 'border-brand-primary text-brand-primary bg-red-50 shadow-sm shadow-red-100' : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-black text-gray-900 mb-4 tracking-tight">Payment Method</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { id: 'Online', label: 'Pay Online', icon: <FaCreditCard /> },
                                { id: 'Cash', label: 'Cash at Counter', icon: <FaMoneyBillWave /> }
                            ].map(method => (
                                <button
                                    key={method.id}
                                    onClick={() => setPaymentMethod(method.id)}
                                    className={`py-4 px-2 rounded-2xl font-bold border-2 transition-all duration-300 flex flex-col items-center justify-center gap-2 ${paymentMethod === method.id ? 'border-brand-primary text-brand-primary bg-red-50 shadow-sm shadow-red-100' : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'}`}
                                >
                                    <span className="text-2xl">{method.icon}</span>
                                    <span>{method.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Summary */}
                <div className="bg-gray-900 text-white rounded-3xl shadow-xl p-6 md:p-8 space-y-4">
                    <h3 className="text-xl font-bold mb-4 tracking-tight border-b border-gray-700 pb-4">Bill Summary</h3>
                    <div className="flex justify-between text-gray-300 font-medium">
                        <span>Item Total</span>
                        <span className="text-white">₹{total}</span>
                    </div>
                    <div className="flex justify-between text-gray-300 font-medium pb-4 border-b border-gray-700">
                        <span>Taxes & Fees</span>
                        <span className="text-white">₹0</span>
                    </div>
                    <div className="flex justify-between text-2xl font-black text-white pt-2">
                        <span>Grand Total</span>
                        <span className="text-brand-primary">₹{total}</span>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 pb-6 bg-white/90 backdrop-blur-md border-t border-gray-100 z-40 lg:hidden">
                <button 
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="w-full bg-brand-primary text-white font-bold text-xl py-4 rounded-2xl shadow-lg shadow-red-200 hover:bg-brand-secondary transition-all disabled:opacity-70 disabled:cursor-not-allowed justify-center flex"
                >
                    {isProcessing ? 'Processing...' : `Place Order (₹${total})`}
                </button>
            </div>
            
            <div className="hidden lg:block fixed bottom-0 left-0 right-0 p-4 pb-6 z-40 pointer-events-none">
                <div className="max-w-3xl mx-auto flex justify-end pointer-events-auto">
                    <button 
                        onClick={handleCheckout}
                        disabled={isProcessing}
                        className="w-80 bg-brand-primary text-white font-bold text-xl py-4 rounded-2xl shadow-2xl shadow-red-300 hover:bg-brand-secondary transform hover:-translate-y-1 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex justify-center"
                    >
                        {isProcessing ? 'Processing...' : `Place Order (₹${total})`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
