import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaImage, FaQrcode, FaCheck } from 'react-icons/fa';

const MenuManagement = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ id: '', name: '', price: '', category: '', isAvailable: true, isVeg: true });
    const [imageFile, setImageFile] = useState(null);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [showQRModal, setShowQRModal] = useState(false);

    const fetchMenu = async () => {
        try {
            const token = localStorage.getItem('ownerToken');
            const { data } = await axios.get('/api/menu/owner', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMenuItems(data);
        } catch (error) {
            toast.error('Failed to load menu');
        }
    };

    useEffect(() => { fetchMenu(); }, []);

    const generateQR = async () => {
        try {
            const token = localStorage.getItem('ownerToken');
            const { data } = await axios.get('/api/qr', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQrCodeUrl(data.qrCodeUrl);
            setShowQRModal(true);
        } catch (error) {
            toast.error('Failed to generate QR Code');
        }
    };

    const existingCategories = [...new Set(menuItems.map(item => item.category))];

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('ownerToken');
        const uploadData = new FormData();
        uploadData.append('name', formData.name);
        uploadData.append('price', formData.price);
        uploadData.append('category', formData.category);
        uploadData.append('isAvailable', formData.isAvailable);
        uploadData.append('isVeg', formData.isVeg);
        if (imageFile) uploadData.append('image', imageFile);

        try {
            if (isEditing) {
                await axios.put(`/api/menu/${formData.id}`, uploadData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Item updated successfully');
            } else {
                if (!imageFile) return toast.error('Please select an image');
                await axios.post('/api/menu', uploadData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Item added successfully');
            }
            setFormData({ id: '', name: '', price: '', category: '', isAvailable: true, isVeg: true });
            setImageFile(null);
            setIsEditing(false);
            fetchMenu();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        }
    };

    const handleEdit = (item) => {
        setIsEditing(true);
        setFormData({ id: item._id, name: item.name, price: item.price, category: item.category, isAvailable: item.isAvailable, isVeg: item.isVeg !== undefined ? item.isVeg : true });
        setImageFile(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                const token = localStorage.getItem('ownerToken');
                await axios.delete(`/api/menu/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Item deleted');
                fetchMenu();
            } catch (error) {
                toast.error('Failed to delete');
            }
        }
    };

    return (
        <div className="space-y-10 animate-fade-in pb-12">
            <div className="flex justify-between items-center sm:flex-row flex-col gap-5 bg-gradient-to-r from-gray-900 to-gray-800 p-8 sm:p-10 rounded-[2rem] shadow-xl text-white relative overflow-hidden border border-gray-800">
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-brand-primary/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10">
                    <h2 className="text-4xl font-black tracking-tight mb-2">Menu Management</h2>
                    <p className="text-gray-400 font-medium">Curate your offerings and get your storefront QR.</p>
                </div>
                <div className="relative z-10 flex items-center space-x-4">
                    <button onClick={generateQR} className="flex items-center space-x-3 bg-white text-gray-900 px-6 py-3.5 rounded-2xl font-black hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                        <FaQrcode className="text-xl text-brand-primary" /> <span>Store QR Code</span>
                    </button>
                    <button onClick={generateQR} className="flex items-center space-x-3 bg-brand-primary text-white px-6 py-3.5 rounded-2xl font-black hover:bg-brand-secondary transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                        <FaCheck className="text-xl" /> <span>Complete</span>
                    </button>
                </div>
            </div>

            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative transition-all">
                <div className="flex items-center space-x-4 mb-8 border-b border-gray-100 pb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold ${isEditing ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-brand-primary'}`}>
                        {isEditing ? <FaEdit /> : <FaPlus />}
                    </div>
                    <h3 className="text-2xl font-black text-gray-900">{isEditing ? 'Edit Menu Item' : 'Add New Item'}</h3>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Item Name</label>
                            <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-brand-primary focus:bg-white outline-none transition-all font-medium text-gray-900" placeholder="E.g., Margherita Pizza" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Price (₹)</label>
                            <input type="number" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-brand-primary focus:bg-white outline-none transition-all font-medium text-gray-900" placeholder="0" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Category</label>
                            <input 
                                type="text" list="category-options" required value={formData.category} 
                                onChange={e => setFormData({ ...formData, category: e.target.value })} 
                                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-brand-primary focus:bg-white outline-none transition-all font-medium text-gray-900"
                                placeholder="E.g., Combos, Pizza"
                            />
                            <datalist id="category-options">{existingCategories.map(cat => <option key={cat} value={cat} />)}</datalist>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Image {isEditing && <span className="normal-case font-normal text-gray-400">(Optional)</span>}</label>
                            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-red-50 file:text-brand-primary hover:file:bg-red-100 cursor-pointer text-gray-500 transition-all font-medium focus:border-brand-primary focus:bg-white" />
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-2">
                        <label htmlFor="veg" className={`flex-1 flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all ${formData.isVeg ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-100'}`}>
                            <input type="checkbox" id="veg" checked={formData.isVeg} onChange={e => setFormData({ ...formData, isVeg: e.target.checked })} className="w-6 h-6 text-green-500 rounded focus:ring-green-500 mr-4 accent-green-600" />
                            <div>
                                <p className={`font-bold text-lg ${formData.isVeg ? 'text-green-800' : 'text-gray-600'}`}>Vegetarian</p>
                                <p className="text-xs text-gray-500 font-medium">100% pure veg</p>
                            </div>
                        </label>
                        {isEditing && (
                            <label htmlFor="available" className={`flex-1 flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all ${formData.isAvailable ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-100'}`}>
                                <input type="checkbox" id="available" checked={formData.isAvailable} onChange={e => setFormData({ ...formData, isAvailable: e.target.checked })} className="w-6 h-6 text-blue-500 rounded focus:ring-blue-500 mr-4 accent-blue-600" />
                                <div>
                                    <p className={`font-bold text-lg ${formData.isAvailable ? 'text-blue-800' : 'text-gray-600'}`}>In Stock</p>
                                    <p className="text-xs text-gray-500 font-medium">Currently available</p>
                                </div>
                            </label>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-100">
                        <button type="submit" className="flex-1 flex justify-center items-center space-x-2 bg-brand-primary text-white py-4 rounded-2xl font-black text-lg hover:bg-brand-secondary hover:shadow-lg hover:-translate-y-0.5 transition-all w-full">
                            {isEditing ? <FaEdit /> : <FaPlus />} <span>{isEditing ? 'Save Changes' : 'Add to Menu'}</span>
                        </button>
                        {isEditing && (
                            <button type="button" onClick={() => { setIsEditing(false); setFormData({ id: '', name: '', price: '', category: '', isAvailable: true, isVeg: true }); }} className="flex-[0.5] py-4 rounded-2xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all w-full text-center">
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {menuItems.map(item => (
                    <div key={item._id} className={`bg-white rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden hover:shadow-[0_10px_40px_rgba(0,0,0,0.08)] transition-all duration-500 transform hover:-translate-y-1 ${!item.isAvailable && 'opacity-60 grayscale hover:grayscale-0'}`}>
                        <div className="h-64 w-full bg-gray-100 relative group overflow-hidden">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                            
                            {!item.isAvailable && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900/90 backdrop-blur-md text-white px-6 py-2 rounded-full font-black tracking-widest uppercase text-sm z-20 shadow-2xl border border-gray-700/50">
                                    Sold Out
                                </div>
                            )}
                            
                            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                                <span className="bg-white/95 backdrop-blur-md text-gray-900 text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg border border-white/20 inline-block w-fit">
                                    {item.category}
                                </span>
                            </div>

                            <div className="absolute bottom-4 left-4 right-4 z-10">
                                <div className="flex items-center space-x-2 text-white/90 text-xs font-bold uppercase tracking-wider mb-1 drop-shadow-md">
                                    <div className={`w-3 h-3 rounded-full flex items-center justify-center border-2 ${item.isVeg === false ? 'bg-red-500 border-red-700' : 'bg-green-500 border-green-700'}`}></div>
                                    <span>{item.isVeg === false ? 'Non-Veg' : 'Veg'}</span>
                                </div>
                                <h4 className="text-2xl font-black text-white line-clamp-2 leading-tight drop-shadow-lg">
                                    {item.name}
                                </h4>
                            </div>
                        </div>
                        
                        <div className="p-6 relative">
                            <div className="absolute -top-10 right-6 z-20 bg-white p-2 rounded-2xl shadow-xl border border-gray-100">
                                <div className="bg-brand-primary/10 text-brand-primary font-black text-xl px-5 py-2 rounded-xl">
                                    ₹{item.price}
                                </div>
                            </div>

                            <div className="flex space-x-3 mt-6 pt-4">
                                <button onClick={() => handleEdit(item)} className="flex-[1.5] flex justify-center items-center space-x-2 bg-gray-50 text-gray-700 py-3 rounded-2xl hover:bg-blue-600 hover:text-white font-bold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30">
                                    <FaEdit /> <span>Edit</span>
                                </button>
                                <button onClick={() => handleDelete(item._id)} className="flex-1 flex justify-center items-center bg-gray-50 text-gray-500 py-3 rounded-2xl hover:bg-red-600 hover:text-white font-bold transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30 group/del">
                                    <FaTrash className="group-hover/del:animate-bounce" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showQRModal && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
                    <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center relative pointer-events-auto transform scale-100 overflow-hidden">
                        <div className="absolute -top-32 -right-32 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none"></div>
                        <button onClick={() => setShowQRModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 text-xl font-bold transition-colors w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 z-10">×</button>
                        
                        <div className="w-20 h-20 bg-brand-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 relative z-10">
                            <FaQrcode className="text-4xl text-brand-primary" />
                        </div>
                        
                        <h3 className="text-3xl font-black text-gray-900 mb-2 tracking-tight relative z-10">Store QR</h3>
                        <p className="text-gray-500 font-medium mb-8 text-sm px-4 relative z-10">Customers can scan this to view your menu and place orders directly.</p>
                        
                        <div className="bg-gray-50 p-6 rounded-[2rem] border-2 border-gray-100 shadow-inner mb-8 mx-auto inline-block relative z-10 group">
                            <img src={qrCodeUrl} alt="Store QR Code" className="w-48 h-48 object-contain transition-transform duration-500 group-hover:scale-105" />
                        </div>
                        
                        <a href={qrCodeUrl} download="store-qr.png" className="w-full relative z-10 bg-gray-900 text-white font-bold py-4 rounded-full hover:bg-brand-primary hover:shadow-[0_8px_30px_rgba(239,68,68,0.4)] hover:-translate-y-1 transition-all flex justify-center uppercase tracking-wider text-sm">
                            Download QR Code
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MenuManagement;
