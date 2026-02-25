import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('nakaeworks_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        localStorage.setItem('nakaeworks_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (service, quantity = 1) => {
        setCartItems(prev => {
            const existingItem = prev.find(item => item.id === service.id);
            if (existingItem) {
                return prev.map(item =>
                    item.id === service.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { ...service, quantity }];
        });
    };

    const removeFromCart = (serviceId) => {
        setCartItems(prev => prev.filter(item => item.id !== serviceId));
    };

    const updateQuantity = (serviceId, quantity) => {
        if (quantity < 1) return;
        setCartItems(prev =>
            prev.map(item =>
                item.id === serviceId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cartItems.reduce((sum, item) => {
        const price = item.price - (item.discount || 0); // Simplified calculation
        return sum + (price * item.quantity);
    }, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            totalItems,
            cartTotal
        }}>
            {children}
        </CartContext.Provider>
    );
};
