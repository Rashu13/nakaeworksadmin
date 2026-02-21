import React, { useState, useEffect } from 'react';
import { Search, Star, MapPin, Shield, CheckCircle } from 'lucide-react';
import { providerService } from '../services/api';

const Providers = () => {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchProviders();
    }, []);

    const fetchProviders = async () => {
        try {
            const data = await providerService.getAll();
            setProviders(data);
        } catch (error) {
            console.error('Failed to fetch providers:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProviders = providers.filter(provider =>
        provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">

                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Our Professional Providers</h1>
                    <p className="text-lg text-gray-600">
                        Connect with top-rated experts for all your home service needs.
                        Verified professionals ready to help.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-xl mx-auto mb-12 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for providers..."
                        className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 shadow-sm focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all"
                    />
                </div>

                {/* Providers Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                            <div key={n} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredProviders.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <Search size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No providers found</h3>
                        <p className="text-gray-500">Try adjusting your search criteria</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProviders.map((provider) => (
                            <div key={provider.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={provider.avatar || `https://ui-avatars.com/api/?name=${provider.name}&background=0f172a&color=fff`}
                                            alt={provider.name}
                                            className="w-16 h-16 rounded-full object-cover border-2 border-slate-50 group-hover:border-slate-200 transition-colors"
                                        />
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-1">
                                                {provider.name}
                                                {provider.isVerified && (
                                                    <Shield size={16} className="text-slate-900 fill-current" />
                                                )}
                                            </h3>
                                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                                <span>Provider</span>
                                                <span>•</span>
                                                <span className="text-green-600 font-medium">{provider.served || 0} Jobs Done</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-2 rounded-lg">
                                        <div className="flex items-center gap-1 text-slate-900 font-bold text-sm">
                                            <Star size={14} className="fill-current text-yellow-400" />
                                            <span>4.8</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    {provider.about && (
                                        <p className="text-gray-600 text-sm line-clamp-2">
                                            {provider.about}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <MapPin size={16} />
                                        <span>Serving New Delhi Area</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <CheckCircle size={16} className="text-green-500" />
                                        <span>Background Verified</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                        Available Today
                                    </span>
                                    <button className="text-sm font-bold text-slate-900 hover:text-slate-700 transition-colors">
                                        View Profiles →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Providers;
