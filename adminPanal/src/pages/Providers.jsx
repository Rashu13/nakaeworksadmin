import React, { useState, useEffect } from 'react';
import { Search, Star, MapPin, Lock, CheckCircle, ChevronRight, Award } from 'lucide-react';
import { providerService, BASE_URL } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

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
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0f1c] pt-32 pb-24 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">

                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-center gap-3 mb-6"
                    >
                        <Award className="text-primary-500" size={24} />
                        <span className="text-primary-500 text-xs font-black uppercase tracking-[0.4em]">Verified Expertise</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight"
                    >
                        Experience the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">Mastery</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-gray-600 dark:text-gray-400 font-medium leading-relaxed"
                    >
                        Connect with top-tier professionals vetted for quality, reliability, and exceptional craftsmanship. Your trusted partners for every home need.
                    </motion.p>
                </div>

                {/* Search Bar */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="max-w-2xl mx-auto mb-20 relative group"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/20 to-primary-300/20 rounded-[2rem] blur opacity-50 group-hover:opacity-100 transition duration-1000"></div>
                    <div className="relative flex items-center bg-white dark:bg-[#161b22]/80 border border-gray-200 dark:border-white/10 rounded-[2rem] p-2 pr-4 shadow-2xl backdrop-blur-xl">
                        <div className="pl-6 text-gray-500 dark:text-gray-400">
                            <Search size={22} className="group-focus-within:text-primary-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Find your service master..."
                            className="w-full bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white py-4 px-4 font-medium placeholder:text-gray-500"
                        />
                        <button className="bg-primary-500 hover:bg-primary-600 text-slate-900 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-primary-500/20 active:scale-95">
                            Search
                        </button>
                    </div>
                </motion.div>

                {/* Providers Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                            <div key={n} className="bg-gray-100 dark:bg-white/5 rounded-[32px] h-[400px] border border-gray-200 dark:border-white/10 animate-pulse" />
                        ))}
                    </div>
                ) : filteredProviders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-24 bg-gray-100 dark:bg-white/5 rounded-[32px] border border-dashed border-gray-200 dark:border-white/10"
                    >
                        <div className="bg-primary-500/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                            <Search size={40} className="text-primary-500" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">No Masters Found</h3>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Try broadening your search criteria.</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProviders.map((provider, index) => (
                            <motion.div
                                key={provider.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group relative bg-gray-100 dark:bg-white/5 backdrop-blur-md rounded-[32px] p-8 border border-gray-200 dark:border-white/10 hover:border-primary-500/30 transition-all duration-500 hover:-translate-y-2 shadow-2xl"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl group-hover:bg-primary-500/10 transition-colors" />

                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-8">
                                        <div className="flex items-center gap-5">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-primary-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity" />
                                                <img
                                                    src={provider.avatar ? (provider.avatar.startsWith('http') ? provider.avatar : `${BASE_URL}${provider.avatar}`) : `https://ui-avatars.com/api/?name=${provider.name}&background=1f2937&color=fff`}
                                                    alt={provider.name}
                                                    className="w-20 h-20 rounded-2xl object-cover border border-gray-200 dark:border-white/10 relative z-10"
                                                />
                                                {provider.isVerified && (
                                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center border-4 border-[#0a0f1c] z-20 shadow-lg">
                                                        <Lock size={14} className="text-black" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-xl text-gray-900 dark:text-white group-hover:text-primary-400 transition-colors tracking-tight line-clamp-1">
                                                    {provider.name}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className="flex items-center gap-1 bg-primary-500/10 px-2 py-0.5 rounded-full border border-primary-500/20">
                                                        <Star size={12} className="fill-primary-500 text-primary-500" />
                                                        <span className="text-primary-500 text-[10px] font-black">{parseFloat(provider.rating || 4.5).toFixed(1)}</span>
                                                    </div>
                                                    <span className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest">({provider.reviewsCount || 0} reviews)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        {provider.about ? (
                                            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium line-clamp-2 leading-relaxed h-10">
                                                {provider.about}
                                            </p>
                                        ) : (
                                            <p className="text-gray-600 text-sm font-medium italic h-10">Expert in home services and maintenance.</p>
                                        )}
                                        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                                            <MapPin size={16} className="text-primary-500" />
                                            <span className="text-xs font-bold tracking-wide uppercase">Serving New Delhi</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-white/5">
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-black text-gray-900 dark:text-white">{provider.served || 0}+</span>
                                            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest">Jobs Done</span>
                                        </div>
                                        <Link
                                            to={`/provider-detail/${provider.id}`}
                                            className="px-6 py-3 bg-gray-50 dark:bg-white text-gray-900 dark:text-slate-900 hover:bg-primary-500 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2"
                                        >
                                            Profile <ChevronRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Providers;
