import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('ownerToken');
            if (token) {
                try {
                    const { data } = await axios.get('/api/auth/profile', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUser(data);
                } catch (error) {
                    localStorage.removeItem('ownerToken');
                }
            }
            setLoading(false);
        };
        fetchUser();
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await axios.post('/api/auth/login', { email, password });
            localStorage.setItem('ownerToken', data.token);
            setUser(data);
            toast.success('Login Successful');
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login Failed');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('ownerToken');
        setUser(null);
        toast.success('Logged out');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
