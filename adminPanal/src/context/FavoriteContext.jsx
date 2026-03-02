import React, { createContext, useContext, useState, useEffect } from 'react';

const FavoriteContext = createContext();

export const useFavorites = () => useContext(FavoriteContext);

export const FavoriteProvider = ({ children }) => {
    const [favorites, setFavorites] = useState(() => {
        const savedFavorites = localStorage.getItem('favorites');
        return savedFavorites ? JSON.parse(savedFavorites) : [];
    });

    useEffect(() => {
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }, [favorites]);

    const toggleFavorite = (item) => {
        setFavorites((prev) => {
            const isFav = prev.find((fav) => fav.id === item.id);
            if (isFav) {
                return prev.filter((fav) => fav.id !== item.id);
            } else {
                return [...prev, item];
            }
        });
    };

    const isFavorite = (id) => {
        return favorites.some((item) => item.id === id);
    };

    return (
        <FavoriteContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
            {children}
        </FavoriteContext.Provider>
    );
};
