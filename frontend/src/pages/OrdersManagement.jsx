import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaCheck, FaExclamationCircle, FaPhoneAlt } from 'react-icons/fa';

const OrdersManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('ownerToken');
            const { data } = await axios.get('/api/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(data);
        } catch (error) {
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    const updateStatus = async (id, status, extraData = {}) => {
        try {
            const token = localStorage.getItem('ownerToken');
            const body = { orderStatus: status, ...extraData };
            
            await axios.put(`/api/orders/${id}`, body, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Order updated');
            fetchOrders();
        } catch (error) {
            toast.error('Failed to update order');
        }
    };

    if (loading) return <div className="flex h-64 items-center justify-center text-xl font-bold text-gray-500 tracking-wider animate-pulse">Loading orders...</div>;

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Preparing': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'Ready': return 'bg-green-100 text-green-800 border-green-200';
            case 'Completed': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Live Orders</h2>
                <div className="flex items-center space-x-2 text-sm font-medium text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span>Auto-updating</span>
                </div>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {orders.map((order) => (
                    <div key={order._id} className={`bg-white rounded-2xl p-5 shadow-sm border ${order.orderStatus === 'Pending' ? 'border-red-300 ring-2 ring-red-50 ring-opacity-50' : 'border-gray-100'} hover:shadow-md transition-all duration-300`}>
                        <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-4">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                    Token: <span className="text-brand-primary bg-red-50 px-3 py-0.5 rounded-md">{order.tokenNumber}</span>
                                </h3>
                                <p className="text-xs text-gray-500 font-medium mt-2 flex items-center">
                                    <span className="bg-gray-100 px-2 py-0.5 rounded-full">{order.type}</span>
                                    <span className="mx-2">•</span>
                                    <span>{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    <span className="mx-2">•</span>
                                    <span className="font-bold text-gray-700 flex items-center gap-1.5"><FaPhoneAlt className="text-[10px]" /> {order.customerPhone}</span>
                                    
                                    {order.paymentMethod === 'Cash' && order.paymentStatus === 'Pending' && (
                                        <span className="ml-3 inline-flex items-center text-red-700 bg-red-100 px-2 py-0.5 rounded-full text-[10px] font-bold border border-red-200">
                                            <FaExclamationCircle className="mr-1" /> Cash Pending
                                        </span>
                                    )}
                                    {order.paymentStatus === 'Paid' && (
                                        <span className="ml-3 inline-flex items-center text-green-700 bg-green-100 px-2 py-0.5 rounded-full text-[10px] font-bold border border-green-200">
                                            <FaCheck className="mr-1" /> Paid via {order.paymentMethod}
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(order.orderStatus)}`}>
                                    {order.orderStatus}
                                </span>
                                <p className="mt-2 text-xl font-black text-gray-900">₹{order.totalAmount}</p>
                            </div>
                        </div>

                        <div className="space-y-2 mb-4 bg-gray-50 p-4 rounded-xl max-h-48 overflow-auto border border-gray-100">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 border-b border-gray-200 pb-1">Order Items</h4>
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-gray-800">
                                    <div className="font-medium text-sm flex items-center">
                                        <span className="text-brand-primary bg-red-100 w-6 h-6 flex items-center justify-center rounded mr-2 text-xs font-bold">{item.quantity}x</span> 
                                        {item.name}
                                    </div>
                                    <div className="text-gray-900 font-bold text-sm">₹{item.price * item.quantity}</div>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-2 justify-end items-center pt-1">
                            {order.orderStatus === 'Pending' && (
                                <button onClick={() => updateStatus(order._id, 'Confirmed')} className="w-full sm:w-auto flex items-center justify-center space-x-1.5 bg-blue-600 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 hover:shadow transition-all">
                                    <FaCheck className="text-xs" /> <span>Confirm Order</span>
                                </button>
                            )}
                            {order.orderStatus === 'Confirmed' && (
                                <button onClick={() => {
                                    const time = window.prompt("Estimated prep time in minutes?", "15");
                                    if(time) updateStatus(order._id, 'Preparing', { estimatedTime: parseInt(time) });
                                }} className="w-full sm:w-auto flex items-center justify-center bg-orange-500 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-orange-600 hover:shadow transition-all">
                                    Start Preparing
                                </button>
                            )}
                            {order.orderStatus === 'Preparing' && (
                                <button onClick={() => updateStatus(order._id, 'Ready')} className="w-full sm:w-auto flex items-center justify-center bg-green-500 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-green-600 hover:shadow transition-all">
                                    Mark as Ready
                                </button>
                            )}
                            {order.orderStatus === 'Ready' && (
                                <button onClick={() => updateStatus(order._id, 'Completed')} className="w-full sm:w-auto flex items-center justify-center bg-gray-800 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-gray-900 hover:shadow transition-all">
                                    Complete & Archive
                                </button>
                            )}
                            {order.paymentStatus === 'Pending' && order.orderStatus !== 'Cancelled' && (
                                <button onClick={() => {
                                    const reason = window.prompt("Please provide a reason for cancellation:", "Item unavailable");
                                    if(reason !== null) updateStatus(order._id, 'Cancelled', { cancellationReason: reason });
                                }} className="w-full sm:w-auto flex items-center justify-center bg-red-100 text-red-700 px-5 py-2 rounded-lg font-bold text-sm hover:bg-red-200 hover:shadow border border-red-200 transition-all">
                                    Cancel Order
                                </button>
                            )}
                            {(order.paymentStatus === 'Pending' && order.paymentMethod === 'Cash') && (
                                <button onClick={async () => {
                                    const token = localStorage.getItem('ownerToken');
                                    await axios.put(`/api/orders/${order._id}`, { paymentStatus: 'Paid' }, { headers: { Authorization: `Bearer ${token}` } });
                                    toast.success('Payment Received');
                                    fetchOrders();
                                }} className="w-full sm:w-auto flex items-center justify-center bg-white text-green-600 px-4 py-2 rounded-lg font-bold text-sm border-2 border-green-600 hover:bg-green-50 transition-all ml-auto">
                                    Mark Cash Paid
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrdersManagement;
