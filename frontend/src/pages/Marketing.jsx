import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaBullhorn, FaUsers, FaPaperPlane } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';

const Marketing = () => {
    const [message, setMessage] = useState('');
    const [audienceSize, setAudienceSize] = useState(0);
    const [isSending, setIsSending] = useState(false);
    const [results, setResults] = useState(null);
    const { token } = useContext(AuthContext);

    useEffect(() => {
        const fetchAudience = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get('/api/marketing/audience', config);
                setAudienceSize(data.count);
            } catch (error) {
                console.error('Failed to fetch audience size');
            }
        };
        fetchAudience();
    }, [token]);

    const handleBroadcast = async (e) => {
        e.preventDefault();
        if (!message) return toast.error('Please enter a message.');
        if (audienceSize === 0) return toast.error('You have no customers to send messages to.');
        
        const confirmSend = window.confirm(`Are you sure you want to send this SMS to ${audienceSize} customers?`);
        if (!confirmSend) return;

        setIsSending(true);
        setResults(null);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.post('/api/marketing/broadcast', { message }, config);
            
            setResults(data);
            toast.success(`Successfully sent ${data.successCount} messages!`);
            setMessage('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send broadcast');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto font-sans animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <FaBullhorn className="text-brand-primary" /> SMS Marketing
                    </h2>
                    <p className="text-gray-500 font-medium mt-1">Send announcements and promotions directly to your customers' phones.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="col-span-1 md:col-span-2 space-y-6">
                    <form onSubmit={handleBroadcast} className="bg-white rounded-3xl p-8 shadow-xl shadow-brand-primary/5 border border-red-50 relative overflow-hidden">
                        
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-bl-full pointer-events-none"></div>

                        <label className="block text-gray-700 font-bold mb-3 text-lg">Broadcast Message</label>
                        <textarea 
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-5 text-gray-800 outline-none focus:ring-4 focus:ring-brand-primary/20 focus:border-brand-primary transition-all shadow-inner resize-none h-40"
                            placeholder="e.g. Try our new weekend special! Get 20% off all orders today using code SPECIAL20."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            maxLength={160}
                        ></textarea>
                        
                        <div className="flex justify-between items-center mt-3 mb-8 text-sm font-bold text-gray-400 px-2">
                            <span>{message.length} / 160 characters</span>
                            <span className={message.length > 150 ? 'text-brand-primary' : 'text-green-500'}>1 SMS Segment</span>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSending || audienceSize === 0}
                            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-white transition-all ${
                                isSending || audienceSize === 0 
                                ? 'bg-gray-300 cursor-not-allowed' 
                                : 'bg-brand-primary hover:bg-brand-secondary hover:shadow-lg hover:shadow-brand-primary/30 active:scale-95'
                            }`}
                        >
                            {isSending ? (
                                <span className="animate-pulse">Sending Broadcast...</span>
                            ) : (
                                <>Send to {audienceSize} Customers <FaPaperPlane /></>
                            )}
                        </button>
                    </form>

                    {results && (
                        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 shadow-sm animate-slide-up">
                            <h3 className="text-green-800 font-bold text-lg mb-2 flex items-center gap-2">
                                <FaCheckCircle className="text-green-600" /> Broadcast Summary
                            </h3>
                            <ul className="space-y-2 text-green-700 font-medium">
                                <li><strong>Total Delivered:</strong> {results.successCount}</li>
                                {results.failCount > 0 && <li className="text-red-600"><strong>Failed to Deliver:</strong> {results.failCount}</li>}
                                <li><strong>Total Reached:</strong> {results.total}</li>
                            </ul>
                        </div>
                    )}
                </div>

                <div className="col-span-1 space-y-6">
                    <div className="bg-gradient-to-br from-brand-primary to-brand-secondary rounded-3xl p-8 text-white shadow-xl shadow-brand-primary/20">
                        <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-6 text-2xl backdrop-blur-md border border-white/20">
                            <FaUsers />
                        </div>
                        <h3 className="text-lg font-bold text-white/80 mb-1">Total Audience</h3>
                        <p className="text-5xl font-black">{audienceSize}</p>
                        <p className="text-sm font-medium text-white/70 mt-4 leading-relaxed">
                            These are unique customers who have ordered from your QR menu previously.
                        </p>
                    </div>

                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                        <h4 className="font-bold text-gray-800 mb-3 block">Pro Tips</h4>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li className="flex gap-2">
                                <span className="text-brand-primary">•</span> 
                                Keep messages under 160 characters to send exactly one SMS segment.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-brand-primary">•</span> 
                                Include special discount codes to track ROI on your broadcasts.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-brand-primary">•</span> 
                                Don't spam! Send max 1-2 messages per week before meal times.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Marketing;
