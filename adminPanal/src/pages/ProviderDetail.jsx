import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { providerService, reviewService, BASE_URL } from '../services/api';
import { Star, MapPin, CheckCircle, Clock, Shield, Award, MessageSquare, ChevronRight, Loader, IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';

const ProviderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [provider, setProvider] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('services');

    useEffect(() => {
        const fetchProviderData = async () => {
            try {
                setLoading(true);
                const [providerData, reviewsResponse] = await Promise.all([
                    providerService.getById(id),
                    reviewService.getByProviderId(id)
                ]);

                if (providerData) {
                    setProvider(providerData);
                }

                if (reviewsResponse && reviewsResponse.success) {
                    setReviews(reviewsResponse.data.reviews);
                }
            } catch (error) {
                console.error('Error fetching provider data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProviderData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0a0f1c] pt-32 flex justify-center items-center">
                <Loader className="w-10 h-10 animate-spin text-primary-500" />
            </div>
        );
    }

    if (!provider) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0a0f1c] pt-32 flex flex-col justify-center items-center text-gray-500 dark:text-gray-400">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Master not found</h2>
                <button
                    onClick={() => navigate('/providers')}
                    className="text-primary-500 hover:text-primary-400 font-bold uppercase tracking-widest text-sm"
                >
                    Back to all masters
                </button>
            </div>
        );
    }

    const fullAvatar = provider.avatar ? (provider.avatar.startsWith('http') ? provider.avatar : `${BASE_URL}${provider.avatar}`) : `https://ui-avatars.com/api/?name=${provider.name}&background=1f2937&color=fff`;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0f1c] pt-32 pb-24 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                {/* Header Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
                    {/* Left: Bio & Profile */}
                    <div className="lg:col-span-2 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex flex-col md:flex-row gap-10 items-center md:items-start p-2"
                        >
                            <div className="relative group/avatar">
                                <div className="absolute inset-0 bg-primary-500 rounded-[3rem] blur-2xl opacity-10 group-hover/avatar:opacity-30 transition-opacity" />
                                <img
                                    src={fullAvatar}
                                    alt={provider.name}
                                    className="w-44 h-44 rounded-[3rem] object-cover border-4 border-white dark:border-white/5 relative z-10 shadow-2xl transition-transform duration-500 group-hover/avatar:scale-[1.02]"
                                />
                                {provider.isVerified && (
                                    <div className="absolute -bottom-2 -right-2 bg-primary-500 p-3 rounded-2xl border-4 border-white dark:border-[#0a0f1c] z-20 shadow-2xl">
                                        <CheckCircle size={24} className="text-white" />
                                    </div>
                                )}
                            </div>

                            <div className="text-center md:text-left pt-4">
                                <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                                    <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">{provider.name}</h1>
                                </div>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-5 text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-[3px] mb-8">
                                    <div className="flex items-center gap-2 bg-primary-500/10 px-4 py-2 rounded-xl border border-primary-500/20 shadow-sm">
                                        <Star size={16} className="fill-primary-500 text-primary-500" />
                                        <span className="text-primary-500">{parseFloat(provider.rating || 4.5).toFixed(1)} Rating</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10">
                                        <MapPin size={16} className="text-primary-500" />
                                        <span>New Delhi</span>
                                    </div>
                                </div>
                                <p className="text-lg text-gray-600 dark:text-gray-400 font-medium leading-relaxed max-w-xl">
                                    {provider.about || "This master professional provides exceptional home services with a focus on quality, reliability, and precision. Vetted for excellence in their respective craft."}
                                </p>
                            </div>
                        </motion.div>

                        {/* Tabs */}
                        <div className="flex gap-8 border-b border-gray-200 dark:border-white/5 pb-4 overflow-x-auto">
                            {[
                                { id: 'services', label: 'Offerings', icon: Award },
                                { id: 'reviews', label: 'User Feedback', icon: MessageSquare }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 font-black uppercase tracking-[0.2em] text-[10px] pb-4 relative transition-colors ${activeTab === tab.id ? 'text-primary-500' : 'text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:text-white'
                                        }`}
                                >
                                    <tab.icon size={16} />
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-primary-500 shadow-[0_0_10px_#1c3866]"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="pt-4"
                        >
                            {activeTab === 'services' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {provider.services && provider.services.length > 0 ? (
                                        provider.services.map((service) => (
                                            <Link
                                                key={service.id}
                                                to={`/service/${service.id}`}
                                                className="group bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[2rem] p-6 hover:bg-gray-50 dark:hover:bg-white/[0.08] hover:border-primary-500/30 transition-all flex items-center gap-6 shadow-xl hover:shadow-2xl"
                                            >
                                                <div className="relative shrink-0">
                                                    <img
                                                        src={service.thumbnail ? (service.thumbnail.startsWith('http') ? service.thumbnail : `${BASE_URL}${service.thumbnail}`) : `https://ui-avatars.com/api/?name=${service.name}`}
                                                        className="w-20 h-20 rounded-[1.5rem] object-cover border border-gray-100 dark:border-white/10 group-hover:scale-105 transition-transform duration-500"
                                                        alt={service.name}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-gray-900 dark:text-white font-black uppercase text-sm tracking-tight group-hover:text-primary-500 transition-colors mb-2">{service.name}</h4>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-primary-500 font-black tracking-tighter text-2xl flex items-center gap-1">
                                                            <IndianRupee size={18} />
                                                            {service.price}
                                                        </span>
                                                        <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-all">
                                                            <ChevronRight size={18} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="col-span-full py-12 text-center text-gray-600 font-bold uppercase tracking-widest text-xs border-2 border-dashed border-gray-200 dark:border-white/5 rounded-[2rem]">
                                            No explicit services listed under this master.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {reviews.length > 0 ? (
                                        reviews.map((review) => (
                                            <div key={review.id} className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[2rem] p-8">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="flex items-center gap-4">
                                                        <img
                                                            src={review.consumer?.avatar ? (review.consumer.avatar.startsWith('http') ? review.consumer.avatar : `${BASE_URL}${review.consumer.avatar}`) : `https://ui-avatars.com/api/?name=${review.consumer?.name}`}
                                                            alt={review.consumer?.name}
                                                            className="w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-white/10"
                                                        />
                                                        <div>
                                                            <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{review.consumer?.name}</p>
                                                            <p className="text-[10px] text-primary-500 font-black tracking-widest uppercase">Verified Order</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 bg-primary-500/10 px-3 py-1 rounded-lg border border-primary-500/20">
                                                        <Star size={14} className="fill-primary-500 text-primary-500" />
                                                        <span className="text-primary-500 text-xs font-black">{parseFloat(review.rating).toFixed(1)}</span>
                                                    </div>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed italic">"{review.comment}"</p>
                                                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/5 flex justify-between items-center">
                                                    <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">
                                                        {new Date(review.createdAt).toLocaleDateString()}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full">
                                                        {review.service?.name || "Premium Service"}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-20 text-center bg-gray-100 dark:bg-white/5 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-white/10">
                                            <MessageSquare size={40} className="text-gray-700 mx-auto mb-4" />
                                            <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs">No user feedback archives found.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Right: Master Stats & Contact */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-[#0a0f1c] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/5 blur-3xl rounded-full group-hover:bg-primary-500/10 transition-all duration-700" />

                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-10 border-b border-gray-100 dark:border-white/5 pb-4">Performance Archives</h3>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-white/5 rounded-[1.5rem] border border-gray-100 dark:border-white/5 hover:border-primary-500/20 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                                            <Award className="text-primary-500" size={20} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[2px] text-gray-500 dark:text-gray-400">Total Served</span>
                                    </div>
                                    <span className="text-gray-900 dark:text-white font-black text-xl tracking-tighter">{provider.served || 0}+</span>
                                </div>
                                <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-white/5 rounded-[1.5rem] border border-gray-100 dark:border-white/5 hover:border-primary-500/20 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                                            <Clock className="text-primary-500" size={20} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[2px] text-gray-500 dark:text-gray-400">Efficiency Index</span>
                                    </div>
                                    <span className="text-gray-900 dark:text-white font-black text-xl tracking-tighter">98.4%</span>
                                </div>
                                <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-white/5 rounded-[1.5rem] border border-gray-100 dark:border-white/5 hover:border-primary-500/20 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                                            <Shield className="text-primary-500" size={20} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[2px] text-gray-500 dark:text-gray-400">Quality Lock</span>
                                    </div>
                                    <span className="text-gray-900 dark:text-white font-black text-xl tracking-tighter">Elite</span>
                                </div>
                            </div>

                            <button className="w-full mt-10 py-5 bg-primary-500 text-slate-900 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/20 active:scale-95 flex items-center justify-center gap-3">
                                Request Consultation <ChevronRight size={18} />
                            </button>
                        </div>

                        {/* Badges */}
                        <div className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-3xl p-6">
                            <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">Elite Endorsements</h4>
                            <div className="flex flex-wrap gap-3">
                                <div className="bg-primary-500/10 border border-primary-500/20 px-3 py-1.5 rounded-xl text-[10px] font-black text-primary-500 uppercase tracking-widest">Top Rated</div>
                                <div className="bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-xl text-[10px] font-black text-blue-400 uppercase tracking-widest">Rapid Response</div>
                                <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-[10px] font-black text-emerald-400 uppercase tracking-widest">Verified Master</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProviderDetail;
