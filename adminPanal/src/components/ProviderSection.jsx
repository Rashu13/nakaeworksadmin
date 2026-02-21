import React, { useState, useEffect } from 'react';
import { Star, MapPin, CheckCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';



import { providerService } from '../services/api';

const ProviderCard = ({ provider }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/provider/${provider.id}`)}
            className="group bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 text-gray-900 dark:text-white cursor-pointer hover:shadow-xl dark:hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1"
        >
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
                <div className="relative">
                    <img
                        src={provider.avatar || `https://ui-avatars.com/api/?name=${provider.name}`}
                        alt={provider.name}
                        className="w-16 h-16 rounded-xl object-cover ring-2 ring-gray-50 dark:ring-slate-800"
                    />
                    {provider.isVerified && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                            <CheckCircle size={14} className="text-white" />
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {provider.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-gray-900 dark:text-white font-bold">{parseFloat(provider.rating || 4.5).toFixed(1)}</span>
                        <span className="text-gray-500 dark:text-gray-400 text-xs">({provider.reviewsCount || 0})</span>
                    </div>
                </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-4">
                <MapPin size={16} className="text-indigo-500" />
                <span className="text-sm font-medium">{provider.location || 'New Delhi'}</span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                    {provider.isVerified ? 'Verified Pro' : 'Professional'}
                </span>
                <span className="px-2.5 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                    Expert
                </span>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-800">
                <div className="flex flex-col">
                    <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{provider.served || 0}+</span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Jobs Completed</span>
                </div>
                <button className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all shadow-md">
                    Profile
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
};

const ProviderSection = () => {
    const navigate = useNavigate();
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProviders = async () => {
            try {
                const data = await providerService.getAll();
                if (data) {
                    setProviders(data);
                }
            } catch (error) {
                console.error('Error fetching providers:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProviders();
    }, []);

    return (
        <section className="py-16 px-4 bg-gray-50 dark:bg-slate-950/50 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                            Top Rated Providers
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Expert professionals with highest ratings</p>
                    </div>
                    <button
                        onClick={() => navigate('/providers')}
                        className="hidden md:flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors"
                    >
                        View All
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Providers Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-gray-200 dark:bg-slate-900 rounded-2xl h-64 animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {providers.slice(0, 4).map((provider) => (
                            <ProviderCard key={provider.id} provider={provider} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default ProviderSection;
