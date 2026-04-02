import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FaMoneyBillWave, FaListOl, FaSpinner } from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const OwnerDashboard = () => {
    const [stats, setStats] = useState({ revenue: 0, totalOrders: 0, activeOrders: 0 });
    const [orders, setOrders] = useState([]);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('ownerToken');
                const { data } = await axios.get('/api/orders', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrders(data);
                
                const revenue = data.reduce((acc, order) => acc + (order.paymentStatus === 'Paid' ? order.totalAmount : 0), 0);
                const active = data.filter(order => !['Completed', 'Cancelled'].includes(order.orderStatus)).length;
                
                setStats({
                    revenue,
                    totalOrders: data.length,
                    activeOrders: active
                });
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };
        fetchDashboardData();
    }, []);

    const chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
            {
                label: 'Revenue (₹)',
                data: [0, 0, 0, 0, 0, 0, stats.revenue],
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                borderColor: 'rgb(239, 68, 68)',
                borderWidth: 0,
                borderRadius: 6,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: false },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: '#f3f4f6',
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome back, {user?.name || 'Owner'}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-5 hover:shadow-md transition-shadow">
                    <div className="p-4 bg-red-50 rounded-2xl text-red-500">
                        <FaMoneyBillWave className="text-2xl" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
                        <p className="text-3xl font-bold text-gray-900">₹{stats.revenue}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-5 hover:shadow-md transition-shadow">
                    <div className="p-4 bg-orange-50 rounded-2xl text-orange-500">
                        <FaListOl className="text-2xl" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Total Orders</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-5 hover:shadow-md transition-shadow">
                    <div className="p-4 bg-blue-50 rounded-2xl text-blue-500">
                        <FaSpinner className="text-2xl" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Active Orders</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.activeOrders}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Revenue Overview</h3>
                    <Bar options={chartOptions} data={chartData} />
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[450px] overflow-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800">Recent Active Orders</h3>
                    </div>
                    {stats.activeOrders === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-500">
                            No active orders currently.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.filter(o => !['Completed', 'Cancelled'].includes(o.orderStatus)).slice(0, 6).map(order => (
                                <div key={order._id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center hover:bg-gray-100 transition-colors">
                                    <div>
                                        <p className="font-bold text-gray-900 text-lg">Token: <span className="text-brand-primary">{order.tokenNumber}</span></p>
                                        <p className="text-sm text-gray-500 mt-1">{order.items.length} items | {order.type}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900 mb-2">₹{order.totalAmount}</p>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            order.orderStatus === 'Preparing' ? 'bg-orange-100 text-orange-700' :
                                            order.orderStatus === 'Ready' ? 'bg-green-100 text-green-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                            {order.orderStatus}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OwnerDashboard;
