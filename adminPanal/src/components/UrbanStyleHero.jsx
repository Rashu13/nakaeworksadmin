import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { serviceService, BASE_URL } from '../services/api';

// Icons using Lucide or similar, mapped like in original
import { Sparkles, Wrench, Zap, User, Droplets, Paintbrush, Scissors, Car, Lock, Search } from 'lucide-react';

const iconMap = {
    'cleaning': Sparkles,
    'electrician': Zap,
    'plumber': Droplets,
    'carpenter': Wrench,
    'painting': Paintbrush,
    'salon': Scissors,
    'automotive': Car,
    'security': Lock,
    'default': User
};

export default function UrbanStyleHero() {
    const navigate = useNavigate();

    // Use Tanstack Query for headless design
    const { data: categories, isLoading, isError } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const data = await serviceService.getCategories();
            return data || [];
        }
    });

    const getIcon = (category) => {
        if (category.icon && (category.icon.startsWith('http') || category.icon.startsWith('/'))) {
            const iconUrl = category.icon.startsWith('http') ? category.icon : `${BASE_URL}${category.icon}`;
            return <img src={iconUrl} alt={category.name} className="w-8 h-8 object-contain mx-auto" />;
        }
        const slug = category.slug?.toLowerCase() || category.name?.toLowerCase() || 'default';
        const IconComponent = iconMap[slug] || iconMap['default'];
        return <IconComponent size={26} strokeWidth={1.5} className="group-hover:text-orange-500 transition-colors duration-300" />;
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1 }
    };

    return (
        <div className="relative w-full bg-[#0a0f1c] pt-28 pb-24 overflow-hidden">
            {/* Abstract Background Decorations */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 lg:flex lg:items-center lg:gap-16 relative z-10">

                {/* Left Side: Title and Categories Box */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="lg:w-[50%] flex flex-col justify-center"
                >
                    <motion.h1
                        variants={itemVariants}
                        className="text-5xl md:text-6xl lg:text-[72px] font-extrabold text-white leading-[1.05] tracking-tight mb-8"
                    >
                        Expert services,<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-200">
                            at your doorstep
                        </span>
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className="text-lg text-gray-400 mb-8 max-w-lg leading-relaxed"
                    >
                        Quality home maintenance, cleaning, and wellness services delivered by verified professionals in minutes.
                    </motion.p>

                    {/* Prominent Search Bar */}
                    <motion.div
                        variants={itemVariants}
                        className="relative max-w-xl mb-12 group"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-orange-300 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative flex items-center bg-[#161b22] border border-white/10 rounded-[2rem] p-2 pr-4 shadow-2xl backdrop-blur-xl">
                            <div className="pl-6 text-gray-500">
                                <Search size={22} className="group-focus-within:text-orange-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search for 'AC Repair', 'Cleaning'..."
                                className="w-full bg-transparent border-none focus:ring-0 text-white py-4 px-4 font-medium placeholder:text-gray-600"
                            />
                            <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-orange-500/20 active:scale-95">
                                Search
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-semibold text-white">
                                Popular Categories
                            </h2>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center py-10">
                                <div className="w-10 h-10 border-4 border-white/5 border-t-orange-400 rounded-full animate-spin"></div>
                            </div>
                        ) : isError ? (
                            <div className="text-red-400 py-4 text-center bg-red-400/10 rounded-lg border border-red-400/20">
                                Failed to load categories. Please try again.
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-y-8 gap-x-4">
                                {categories?.slice(0, 8).map((category, index) => (
                                    <motion.div
                                        key={category.id}
                                        whileHover={{ y: -5 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="flex flex-col items-center justify-start cursor-pointer group"
                                        onClick={() => navigate(`/services?category=${category.slug || category.name}`)}
                                    >
                                        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:bg-orange-500/10 group-hover:border-orange-500/30 mb-3 relative overflow-hidden">
                                            {/* Glow effect on hover */}
                                            <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/5 transition-colors duration-300" />

                                            {/* 'New' Badge */}
                                            {index === 1 && (
                                                <span className="absolute top-0 right-0 bg-orange-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-bl-lg shadow-sm">
                                                    NEW
                                                </span>
                                            )}
                                            <div className="text-gray-400 transition-transform duration-300 group-hover:scale-110">
                                                {getIcon(category)}
                                            </div>
                                        </div>
                                        <span className="text-[13px] text-center font-semibold text-gray-300 group-hover:text-white transition-colors duration-200">
                                            {category.name}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </motion.div>

                {/* Right Side: Enhanced Image Layout */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="lg:w-[50%] mt-16 lg:mt-0 hidden md:block relative"
                >
                    {/* Decorative Ring */}
                    <div className="absolute -inset-4 border border-white/5 rounded-[40px] pointer-events-none" />

                    <div className="grid grid-cols-2 gap-4 h-[600px]">
                        <div className="space-y-4 pt-12">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="h-[280px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 group"
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80"
                                    alt="AC Gas Refill & Service"
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="h-[240px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 group"
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80"
                                    alt="Ceiling Fan Repair"
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                            </motion.div>
                        </div>
                        <div className="space-y-4">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="h-[320px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 group"
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=600&q=80"
                                    alt="Tubelight & Electrical Installation"
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="h-[200px] rounded-3xl overflow-hidden bg-orange-500/20 flex items-center justify-center border border-white/10 relative group"
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1581578731548-c64695ce6958?auto=format&fit=crop&w=600&q=80"
                                    alt="Home Cleaning"
                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500"
                                />
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                                    <Sparkles className="mb-2 text-orange-400 group-hover:rotate-12 transition-transform duration-300" size={32} />
                                    <span className="font-bold text-lg">Verified Help</span>
                                    <span className="text-xs text-white/70">Top rated pros only</span>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

