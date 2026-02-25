import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BASE_URL } from '../services/api';

const BannerSlider = ({ banners }) => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (!banners || banners.length <= 1) return;
        const timer = setInterval(() => {
            setCurrent(prev => (prev === banners.length - 1 ? 0 : prev + 1));
        }, 6000);
        return () => clearInterval(timer);
    }, [banners]);

    if (!banners || banners.length === 0) return null;

    const next = () => setCurrent(prev => (prev === banners.length - 1 ? 0 : prev + 1));
    const prev = () => setCurrent(prev => (prev === 0 ? banners.length - 1 : prev - 1));

    return (
        <div className="relative w-full h-[320px] md:h-[500px] overflow-hidden rounded-[32px] md:rounded-[48px] group bg-slate-900 shadow-2xl">
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="absolute inset-0"
                >
                    <img
                        src={banners[current].imageUrl ? (banners[current].imageUrl.startsWith('http') ? banners[current].imageUrl : `${BASE_URL}${banners[current].imageUrl}`) : ''}
                        alt={banners[current].title}
                        className="w-full h-full object-cover"
                    />

                    {/* Immersive Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60" />

                    {/* Content Layer */}
                    <div className="absolute inset-0 flex items-center px-10 md:px-24">
                        <div className="max-w-2xl">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                            >
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full mb-6 border border-white/10">
                                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Premium Service</span>
                                </div>
                                <h2 className="text-4xl md:text-7xl font-black text-white mb-6 leading-none tracking-tighter">
                                    {banners[current].title.split(' ').map((word, i) => (
                                        <span key={i} className={i === 1 ? 'text-primary-400' : ''}>
                                            {word}{' '}
                                        </span>
                                    ))}
                                </h2>
                                <p className="text-lg text-white/70 font-medium mb-10 max-w-md leading-relaxed hidden md:block">
                                    Experience excellence with our verified professionals. Quality service guaranteed at your doorstep.
                                </p>

                                {banners[current].link && (
                                    <div className="flex items-center gap-6">
                                        <Link
                                            to={banners[current].link}
                                            className="px-10 py-4 bg-white text-slate-950 font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-primary-500 hover:text-white transition-all duration-500 shadow-xl shadow-white/5 active:scale-95"
                                        >
                                            Book Now
                                        </Link>
                                        <button className="text-white font-bold text-sm underline-offset-8 hover:underline decoration-white/30 hidden sm:block">
                                            View Details
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Premium Controls */}
            {banners.length > 1 && (
                <>
                    <div className="absolute left-6 md:left-10 bottom-10 flex gap-4 z-20">
                        <button
                            onClick={prev}
                            className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-slate-950 transition-all duration-500 group/btn"
                        >
                            <ChevronLeft size={24} className="group-hover/btn:-translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={next}
                            className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-slate-950 transition-all duration-500 group/btn"
                        >
                            <ChevronRight size={24} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* Minimalist Progress Indicators */}
                    <div className="absolute right-10 bottom-10 flex flex-col gap-3 z-20">
                        {banners.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                className={`w-1.5 rounded-full transition-all duration-500 ${current === i ? 'h-10 bg-white' : 'h-1.5 bg-white/20 hover:bg-white/40'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default BannerSlider;
