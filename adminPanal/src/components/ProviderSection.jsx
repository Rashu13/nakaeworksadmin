import React, { useState, useEffect } from 'react';
import { Star, MapPin, CheckCircle, ChevronRight, Award, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { providerService, BASE_URL } from '../services/api';

const ProviderCard = ({ provider, index }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            onClick={() => navigate(`/provider/${provider.id}`)}
            className="group relative bg-white/5 backdrop-blur-md rounded-[32px] p-8 border border-white/10 text-white cursor-pointer hover:bg-white/10 hover:border-amber-500/30 transition-all duration-500 hover:-translate-y-2 shadow-2xl shadow-black/40"
        >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-colors" />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start gap-5 mb-8">
                    <div className="relative">
                        <div className="absolute inset-0 bg-amber-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity" />
                        <img
                            src={provider.avatar ? (provider.avatar.startsWith('http') ? provider.avatar : `${BASE_URL}${provider.avatar}`) : `https://ui-avatars.com/api/?name=${provider.name}&background=1f2937&color=fff`}
                            alt={provider.name}
                            className="w-20 h-20 rounded-2xl object-cover border border-white/10 relative z-10"
                        />
                        {provider.isVerified && (
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center border-4 border-[#0a0f1c] z-20">
                                <ShieldCheck size={16} className="text-black" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 pt-1">
                        <h3 className="font-bold text-xl group-hover:text-amber-400 transition-colors line-clamp-1 italic tracking-tight">
                            {provider.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                <Star size={12} className="fill-amber-500 text-amber-500" />
                                <span className="text-amber-500 text-xs font-black">{parseFloat(provider.rating || 4.5).toFixed(1)}</span>
                            </div>
                            <span className="text-gray-500 text-xs font-medium">({provider.reviewsCount || 0} reviews)</span>
                        </div>
                    </div>
                </div>

                {/* Location & Tags */}
                <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-2 text-gray-400">
                        <MapPin size={16} className="text-amber-500" />
                        <span className="text-sm font-semibold tracking-wide">{provider.location || 'New Delhi'}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                            {provider.isVerified ? 'Top Verification' : 'Professional'}
                        </span>
                        <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                            Expert Pro
                        </span>
                    </div>
                </div>

                {/* Stats & Footer */}
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-white">{provider.served || 0}+</span>
                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Tasks Done</span>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center group-hover:bg-amber-400 transition-colors shadow-xl"
                    >
                        <ChevronRight size={20} />
                    </motion.button>
                </div>
            </div>
        </motion.div>
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
        <section className="py-24 px-4 bg-[#0a0f1c] relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Section Header */}
                <div className="flex items-end justify-between mb-16">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <Award className="text-amber-500" size={24} />
                            <span className="text-amber-500 text-xs font-black uppercase tracking-[0.3em]">Excellence</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                            Meet Our Masters
                        </h2>
                        <p className="text-gray-400 mt-4 text-lg font-medium max-w-xl leading-relaxed">Top-tier experts vetted for quality, reliability, and exceptional craftsmanship.</p>
                    </motion.div>

                    <button
                        onClick={() => navigate('/providers')}
                        className="group flex items-center gap-3 text-white font-bold text-sm tracking-widest uppercase hover:text-amber-400 transition-colors"
                    >
                        View All Masters <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Providers Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-white">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-[32px] h-[380px] animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {providers.slice(0, 4).map((provider, index) => (
                            <ProviderCard key={provider.id} provider={provider} index={index} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default ProviderSection;

