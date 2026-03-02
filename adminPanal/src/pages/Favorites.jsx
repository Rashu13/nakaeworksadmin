import React from 'react';
import { useFavorites } from '../context/FavoriteContext';
import ServiceCard from '../components/ServiceCard';
import { Heart, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Favorites = () => {
    const { favorites } = useFavorites();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0f1c] pt-24 pb-16 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                        <Heart className="text-red-500 fill-current" size={32} />
                        FAVORITE PROTOCOLS
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mt-2">
                        {favorites.length} {favorites.length === 1 ? 'service' : 'services'} saved in your private catalog
                    </p>
                </div>

                {favorites.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {favorites.map((service) => (
                            <ServiceCard key={service.id} service={service} viewMode="grid" />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white dark:bg-slate-900/60 rounded-[2.5rem] border border-gray-200 dark:border-white/10 shadow-2xl backdrop-blur-xl mt-8">
                        <div className="w-24 h-24 bg-red-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Heart size={40} className="text-red-400" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">No Favorites Found</h3>
                        <p className="text-gray-500 dark:text-gray-400 font-medium mb-8 max-w-sm mx-auto">
                            Start exploring our professional services and save your favorites here for quick access.
                        </p>
                        <button
                            onClick={() => navigate('/services')}
                            className="px-6 py-3 bg-[#0a2357] hover:bg-[#0c2d6e] text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-[#0a2357]/20 transition-all inline-flex items-center gap-2"
                        >
                            <Search size={16} />
                            BROWSE SERVICES
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Favorites;
