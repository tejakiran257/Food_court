import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaPlus, FaMinus, FaSearch, FaPhoneAlt } from 'react-icons/fa';

const UserMenu = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [dietPreference, setDietPreference] = useState('All'); // 'All', 'Veg', 'Non-Veg'
    const [customerPhone, setCustomerPhone] = useState(localStorage.getItem('customerPhone') || '');
    const [showPhoneModal, setShowPhoneModal] = useState(!localStorage.getItem('customerPhone'));
    const { addToCart, removeFromCart, updateQuantity, cart } = useContext(CartContext);
    const categoryRefs = useRef({});

    const handlePhoneSubmit = (e) => {
        e.preventDefault();
        if (customerPhone.length >= 10) {
            localStorage.setItem('customerPhone', customerPhone);
            setShowPhoneModal(false);
        }
    };

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const searchParams = new URLSearchParams(window.location.search);
                const ownerId = searchParams.get('restaurant');
                const { data } = await axios.get('/api/menu', { params: { restaurant: ownerId } });
                const availableItems = data.filter(item => item.isAvailable);
                setMenuItems(availableItems);
                
                const cats = [...new Set(availableItems.map(item => item.category))];
                setCategories(cats);
                if (cats.length > 0) setActiveCategory(cats[0]);
            } catch (error) {
                console.error('Failed to load menu');
            }
        };
        fetchMenu();
    }, []);

    const scrollToCategory = (cat) => {
        setActiveCategory(cat);
        const element = categoryRefs.current[cat];
        if (element) {
            const y = element.getBoundingClientRect().top + window.scrollY - 180;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    const filteredItems = menuItems.filter(item => {
        if (dietPreference === 'Veg' && item.isVeg === false) return false;
        if (dietPreference === 'Non-Veg' && item.isVeg !== false) return false;
        if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const groupedItems = categories.reduce((acc, cat) => {
        const itemsInCat = filteredItems.filter(item => item.category === cat);
        if (itemsInCat.length > 0) acc[cat] = itemsInCat;
        return acc;
    }, {});

    const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    const getItemQuantity = (id) => {
        const item = cart.find(i => i.menuItem === id);
        return item ? item.quantity : 0;
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-32 animate-fade-in">
            {/* Premium Header */}
            <div className="bg-white/95 backdrop-blur-xl sticky top-0 z-50 shadow-sm transition-all duration-300 border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md">
                                F
                            </div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">FoodCourt</h1>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center bg-gray-100 px-4 py-2.5 rounded-full border border-gray-200 transition-all focus-within:ring-2 focus-within:ring-brand-primary focus-within:bg-white">
                                <FaSearch className="text-gray-400 mr-2" />
                                <input 
                                    type="text" 
                                    placeholder="Search delicious food..." 
                                    className="bg-transparent border-none outline-none text-sm w-48 focus:w-64 transition-all duration-300"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <Link to="/cart" className="relative bg-red-50 p-3 rounded-full text-brand-primary hover:bg-brand-primary hover:text-white transition-all duration-300">
                                <FaShoppingCart className="text-xl" />
                                {cartItemsCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs font-black w-6 h-6 flex items-center justify-center rounded-full shadow-md ring-2 ring-white transform scale-110">
                                        {cartItemsCount}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>
                    
                    {/* Mobile Search */}
                    <div className="sm:hidden mb-4 flex items-center bg-gray-100 px-4 py-3 rounded-2xl border border-gray-200 focus-within:ring-2 focus-within:ring-brand-primary focus-within:bg-white transition-all">
                        <FaSearch className="text-gray-400 mr-2" />
                        <input 
                            type="text" 
                            placeholder="Search food..." 
                            className="bg-transparent border-none outline-none text-sm w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                        {/* Categories Horizontal Scroll */}
                        <div className="overflow-x-auto whitespace-nowrap hide-scrollbar flex space-x-2 pb-2 flex-1 scroll-smooth">
                            {Object.keys(groupedItems).map(cat => (
                                <button 
                                    key={cat}
                                    onClick={() => scrollToCategory(cat)}
                                    className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 border-2 ${
                                        activeCategory === cat 
                                        ? 'bg-gray-900 border-gray-900 text-white shadow-md transform -translate-y-0.5' 
                                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        
                        {/* Diet Filter Selection */}
                        <div className="ml-4 pl-4 border-l border-gray-200 flex-shrink-0 flex items-center bg-gray-50 p-1 rounded-xl space-x-1">
                            {['All', 'Veg', 'Non-Veg'].map(pref => (
                                <button
                                    key={pref}
                                    onClick={() => setDietPreference(pref)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        dietPreference === pref
                                        ? (pref === 'Veg' ? 'bg-green-500 text-white shadow-sm' : pref === 'Non-Veg' ? 'bg-red-500 text-white shadow-sm' : 'bg-gray-900 text-white shadow-sm')
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                                    }`}
                                >
                                    {pref}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Sections */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {Object.keys(groupedItems).length === 0 ? (
                    <div className="text-center mt-12 p-10 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-md mx-auto animate-slide-up">
                        <div className="text-6xl mb-4 opacity-50">🍽️</div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">No items found</h2>
                        <p className="text-gray-500 font-medium">Try adjusting your search or filters.</p>
                        {(searchQuery || dietPreference !== 'All') && (
                            <button onClick={() => { setSearchQuery(''); setDietPreference('All'); }} className="mt-6 px-8 py-3 bg-gray-900 text-white rounded-xl font-bold shadow-md hover:bg-gray-800 transition-colors hover:scale-105 active:scale-95">
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-12">
                        {Object.keys(groupedItems).map(cat => (
                            <div key={cat} ref={el => categoryRefs.current[cat] = el} className="scroll-mt-48">
                                <div className="flex items-center gap-4 mb-6">
                                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 capitalize tracking-tight">{cat}</h2>
                                    <div className="h-px bg-gray-200 flex-1 mt-2"></div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {groupedItems[cat].map(item => {
                                        const qty = getItemQuantity(item._id);
                                        return (
                                            <div key={item._id} className={`bg-white rounded-3xl p-4 sm:p-5 shadow-sm border transition-all duration-300 flex gap-4 sm:gap-5 group ${
                                                qty > 0 ? 'border-brand-primary/40 shadow-red-50' : 'border-gray-100 hover:shadow-xl hover:border-gray-200'
                                            }`}>
                                                {/* Image side */}
                                                <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-50">
                                                    <img src={item.image} alt={item.name} loading="lazy" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out" />
                                                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg shadow-sm">
                                                        <div className={`w-3 h-3 rounded-full ${item.isVeg === false ? 'bg-red-500 border border-red-700' : 'bg-green-500 border border-green-700'}`} title={item.isVeg === false ? 'Non-Veg' : 'Veg'}></div>
                                                    </div>
                                                </div>
                                                
                                                {/* Content side */}
                                                <div className="flex-1 flex flex-col justify-between py-1">
                                                    <div>
                                                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight mb-1 line-clamp-2">{item.name}</h3>
                                                        <span className="text-sm font-bold text-brand-primary bg-red-50 px-2 py-0.5 rounded text-xs inline-block tracking-wider uppercase">{item.category}</span>
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between mt-auto pt-2">
                                                        <div className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">₹{item.price}</div>
                                                        
                                                        {qty === 0 ? (
                                                            <button 
                                                                onClick={() => addToCart(item)}
                                                                className="px-6 py-2 sm:py-2.5 rounded-xl bg-brand-primary text-white font-bold text-sm shadow-md shadow-red-200 hover:bg-brand-secondary hover:shadow-lg hover:-translate-y-0.5 transition-all outline-none"
                                                            >
                                                                ADD
                                                            </button>
                                                        ) : (
                                                            <div className="flex items-center bg-red-50 rounded-xl p-1 border border-brand-primary/20 shadow-inner">
                                                                <button onClick={() => updateQuantity(item._id, qty - 1)} className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-brand-primary font-black hover:bg-white rounded-lg transition-colors shadow-sm"><FaMinus className="text-xs" /></button>
                                                                <span className="w-8 sm:w-10 text-center font-black text-gray-900 text-sm sm:text-base">{qty}</span>
                                                                <button onClick={() => addToCart(item)} className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-brand-primary font-black hover:bg-white rounded-lg transition-colors shadow-sm"><FaPlus className="text-xs" /></button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom Floating Checkout Banner */}
            {cartItemsCount > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 z-50">
                    <div className="max-w-4xl mx-auto bg-gray-900/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl flex justify-between items-center sm:px-8 border border-gray-700 animate-slide-up">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{cartItemsCount} item{cartItemsCount > 1 ? 's' : ''} added</span>
                            <span className="text-xl font-black">₹{cart.reduce((a,c)=>a+(c.price*c.quantity),0)}</span>
                        </div>
                        <Link to="/cart" className="flex items-center gap-2 bg-brand-primary text-white px-8 py-3.5 rounded-xl font-bold text-sm sm:text-base shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:bg-brand-secondary transition-all hover:scale-105 active:scale-95">
                            VIEW CART <FaShoppingCart className="text-lg" />
                        </Link>
                    </div>
                </div>
            )}

            {showPhoneModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center relative pointer-events-auto transform scale-100 opacity-100">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <FaPhoneAlt className="text-3xl text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">Welcome!</h3>
                        <p className="text-gray-500 font-medium mb-6 text-sm">Please enter your contact number to view the menu and receive order updates.</p>
                        <form onSubmit={handlePhoneSubmit}>
                            <input 
                                type="tel" 
                                required 
                                placeholder="Enter your 10-digit number" 
                                pattern="[0-9]{10,15}"
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all mb-4 text-center text-lg font-bold tracking-widest"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                            />
                            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all flex justify-center">
                                Continue to Menu
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
