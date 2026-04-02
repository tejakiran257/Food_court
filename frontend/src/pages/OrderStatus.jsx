import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { FaCheckCircle, FaClock, FaUtensils, FaArrowLeft, FaReceipt } from 'react-icons/fa';

const OrderStatus = () => {
    const { id } = useParams();
    const location = useLocation();
    const [order, setOrder] = useState(location.state?.order || null);
    const [loading, setLoading] = useState(!order);

    useEffect(() => {
        let isMounted = true;
        
        const fetchOrder = async () => {
            try {
                const { data } = await axios.get(`/api/orders/${id}`);
                if(isMounted) setOrder(data);
            } catch (error) {
                console.error("Could not fetch order");
            } finally {
                if(isMounted) setLoading(false);
            }
        };

        if (!order) fetchOrder();
        
        const interval = setInterval(() => {
            fetchOrder();
        }, 10000);
        
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [id, order]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-pulse text-xl font-bold text-gray-400">Loading Order Status...</div></div>;
    
    if (!order) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Order not found.</div>;

    const getStatusStep = (status) => {
        const steps = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Completed'];
        return steps.indexOf(status);
    };

    const currentStepIndex = getStatusStep(order.orderStatus);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden relative">
            {/* Premium Light Orbs Background */}
            <div className="fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] max-w-[500px] max-h-[500px] rounded-full bg-brand-primary/10 blur-[100px] pointer-events-none"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[400px] max-h-[400px] rounded-full bg-brand-secondary/10 blur-[100px] pointer-events-none"></div>
            <div className="fixed top-[30%] right-[10%] w-[30vw] h-[30vw] max-w-[300px] max-h-[300px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none"></div>
            
            <div className="max-w-md mx-auto min-h-screen flex flex-col pt-8 animate-fade-in relative z-10">
                <div className="px-6 flex items-center justify-between mb-8">
                    <Link to="/menu" className="w-12 h-12 bg-white border border-gray-100 rounded-full shadow-sm flex items-center justify-center hover:bg-gray-50 hover:scale-105 transition-all backdrop-blur-md">
                        <FaArrowLeft className="text-xl text-gray-700" />
                    </Link>
                    <h1 className="text-xl font-black tracking-widest uppercase text-gray-800">Order Status</h1>
                    <div className="w-12"></div>
                </div>

                <div className="flex-1 bg-white/90 backdrop-blur-2xl text-gray-900 rounded-t-[2rem] px-6 pt-12 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] border-t border-x border-gray-100 flex flex-col relative mt-12 animate-slide-up">
                    {/* Token Badge */}
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-white rounded-full p-1.5 shadow-[0_10px_30px_rgba(239,68,68,0.15)] border border-red-100 z-20">
                        <div className="w-full h-full border-2 border-dashed border-brand-primary/40 rounded-full flex flex-col items-center justify-center bg-red-50/50">
                            <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-0.5">Token</span>
                            <span className="text-3xl font-black text-gray-900">{order.tokenNumber}</span>
                        </div>
                    </div>

                    <div className="text-center mt-6 mb-10">
                        <h2 className="text-3xl font-black mb-3 text-gray-900">
                            {order.orderStatus === 'Cancelled' 
                                ? 'Order Cancelled' 
                                : (order.paymentMethod === 'Cash' && order.paymentStatus === 'Pending' ? 'Pay at Counter' : 'Order Received!')}
                        </h2>
                        <p className="text-gray-500 font-bold text-lg px-4 leading-relaxed">
                            {order.orderStatus === 'Cancelled'
                                ? "This order will not be processed."
                                : (order.paymentMethod === 'Cash' && order.paymentStatus === 'Pending' 
                                    ? "Please proceed to the counter to pay and collect your receipt." 
                                    : "Your delicious food is being prepared.")}
                        </p>
                    </div>

                    {order.orderStatus === 'Cancelled' ? (
                        <div className="bg-red-50 rounded-3xl p-6 mb-6 border border-red-100 shadow-inner text-center mx-2">
                            <div className="w-16 h-16 bg-white border-4 border-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl shadow-sm">
                                ❌
                            </div>
                            <h3 className="text-xl font-black text-red-600 mb-2">Order Cancelled</h3>
                            <p className="text-red-800/80 font-medium mb-6 text-sm">
                                We're sorry, but your order has been cancelled by the restaurant.
                            </p>
                            {order.cancellationReason && (
                                <div className="bg-white p-4 rounded-2xl border border-red-100 text-left shadow-sm">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-red-400 block mb-1.5">Reason</span>
                                    <p className="text-gray-800 font-bold text-sm leading-relaxed">{order.cancellationReason}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-3xl p-5 mb-6 border border-gray-100 shadow-inner relative overflow-hidden">
                            <div className="absolute -right-10 -top-10 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl"></div>
                            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gray-200">
                                {[
                                    { status: 'Pending', label: 'Order Placed', icon: <FaReceipt />, activeColor: 'text-white shadow-md', bg: 'bg-blue-500 ring-4 ring-blue-100' },
                                    { status: 'Confirmed', label: 'Confirmed', icon: <FaCheckCircle />, activeColor: 'text-white shadow-md', bg: 'bg-indigo-500 ring-4 ring-indigo-100' },
                                    { status: 'Preparing', label: 'Preparing', icon: <FaUtensils />, activeColor: 'text-white shadow-md', bg: 'bg-orange-500 ring-4 ring-orange-100' },
                                    { status: 'Ready', label: 'Ready for Pickup', icon: <FaClock />, activeColor: 'text-white shadow-md', bg: 'bg-green-500 ring-4 ring-green-100' }
                                ].map((step, index) => {
                                    const isCompleted = currentStepIndex >= index;
                                    const isCurrent = currentStepIndex === index;
                                    
                                    return (
                                        <div key={step.status} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active z-10">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-700 transform 
                                                ${isCompleted ? `${step.bg} ${step.activeColor} scale-110 z-10` : 'bg-white text-gray-300 border-2 border-gray-200 z-10'}`}>
                                                {step.icon}
                                            </div>
                                            <div className={`ml-4 flex-1 transition-all duration-500 ${isCurrent ? 'transform translate-x-2' : ''}`}>
                                                <h4 className={`font-black tracking-wide text-lg ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</h4>
                                                {isCurrent && order.estimatedTime && step.status === 'Preparing' && (
                                                    <p className="text-orange-600 font-bold mt-1 inline-flex items-center px-3 py-1 bg-orange-100 border border-orange-200 rounded-full text-xs shadow-sm">
                                                        ⏳ Est. {order.estimatedTime} mins
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="mt-auto z-10 pb-4">
                        <div className="bg-white text-gray-900 p-6 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-gray-100">
                            <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-100">
                                <span className="font-bold text-gray-500">Order Amount</span>
                                <span className="text-2xl font-black text-gray-900">₹{order.totalAmount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-500">Payment Status</span>
                                <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${
                                    order.paymentStatus === 'Paid' ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-yellow-50 text-yellow-600 border border-yellow-200'
                                }`}>
                                    {order.paymentStatus}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderStatus;
