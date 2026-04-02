import { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (item) => {
        if (cart.length > 0 && cart[0].restaurant !== item.owner) {
            alert('You cannot add items from different restaurants to the same cart. Please clear your cart first.');
            return;
        }
        const existing = cart.find(i => i.menuItem === item._id);
        if (existing) {
            setCart(cart.map(i => i.menuItem === item._id ? { ...i, quantity: i.quantity + 1 } : i));
        } else {
            setCart([...cart, { menuItem: item._id, name: item.name, price: item.price, image: item.image, quantity: 1, restaurant: item.owner }]);
        }
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(i => i.menuItem !== id));
    };

    const updateQuantity = (id, quantity) => {
        if (quantity < 1) return removeFromCart(id);
        setCart(cart.map(i => i.menuItem === id ? { ...i, quantity } : i));
    };

    const clearCart = () => setCart([]);

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, total }}>
            {children}
        </CartContext.Provider>
    );
};
