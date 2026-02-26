import React, { useState } from 'react';
import { Star, ChevronRight, ShoppingCart, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';

const CollectionSection = ({ title, services }) => {
    const { addToCart } = useCart();
    const [addedIds, setAddedIds] = useState([]);

    if (!services || services.length === 0) return null;

    const handleAddToCart = (e, service) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(service);
        setAddedIds(prev => [...prev, service.id]);
        setTimeout(() => {
            setAddedIds(prev => prev.filter(id => id !== service.id));
        }, 1500);
    };

    return (
        <section className="py-10 bg-gray-50 dark:bg-[#0a0f1c] overflow-hidden transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-end justify-between mb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h2>
                        <div className="h-1.5 w-12 bg-amber-500 rounded-full mt-4"></div>
                    </motion.div>
                    <Link to="/services" className="group flex items-center gap-2 text-amber-500 font-bold text-sm tracking-widest uppercase hover:text-amber-400 transition-colors">
                        Explore All <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="flex overflow-x-auto gap-8 pb-10 scrollbar-hide snap-x pt-4">
                    {services.map((service, index) => (
                        <motion.div
                            key={service.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="snap-start"
                        >
                            <Link
                                to={`/service/${service.slug || service.id}`}
                                className="block min-w-[300px] md:min-w-[360px] bg-gray-100 dark:bg-white/5 backdrop-blur-sm rounded-[32px] border border-gray-200 dark:border-white/10 overflow-hidden hover:bg-gray-200 dark:bg-white/10 hover:border-white/20 transition-all duration-500 group shadow-2xl shadow-black/40"
                            >
                                <div className="relative h-56 overflow-hidden">
                                    <img
                                        src={service.thumbnail || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069&auto=format&fit=crop'}
                                        alt={service.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                                    {service.discount > 0 && (
                                        <div className="absolute top-6 left-6 bg-amber-500 text-black text-[10px] font-black px-3 py-1.5 rounded-full shadow-xl">
                                            SAVE ₹{service.discount}
                                        </div>
                                    )}

                                    <div className="absolute bottom-6 left-6 flex items-center gap-1.5 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-gray-200 dark:border-white/10">
                                        <Star size={12} className="fill-amber-500 text-amber-500" />
                                        <span className="text-white text-xs font-bold">{service.rating}</span>
                                        <span className="text-white/80 text-[10px] font-medium">({service.reviewCount})</span>
                                    </div>
                                </div>

                                <div className="p-8">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-amber-400 transition-colors line-clamp-1 italic tracking-tight">
                                        {service.name}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-2 font-medium">
                                        Professional {service.categoryName || 'home service'} tailored for your needs.
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-black text-slate-900 dark:text-white">₹{service.price - (service.discount || 0)}</span>
                                            {service.discount > 0 && (
                                                <span className="text-xs text-slate-900 dark:text-white/30 line-through">₹{service.price}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={(e) => handleAddToCart(e, service)}
                                                className={`p-2.5 rounded-full border transition-all duration-300 shadow-lg ${addedIds.includes(service.id)
                                                    ? 'bg-emerald-500 border-emerald-400 text-slate-900 dark:text-white'
                                                    : 'bg-gray-200 dark:bg-white/10 border-white/20 text-slate-900 dark:text-white hover:bg-amber-500/20 hover:border-amber-500/40'
                                                    }`}
                                            >
                                                {addedIds.includes(service.id) ? <Check size={16} /> : <ShoppingCart size={16} />}
                                            </motion.button>
                                            <motion.button
                                                whileHover={{
                                                    scale: 1.05,
                                                    backgroundColor: "#fbbf24", // amber-400
                                                    boxShadow: "0 0 20px rgba(251, 191, 36, 0.4)"
                                                }}
                                                whileTap={{ scale: 0.95 }}
                                                className="px-6 py-2.5 bg-white text-black text-xs font-black uppercase tracking-widest rounded-full transition-all shadow-lg"
                                            >
                                                Book Now
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CollectionSection;

