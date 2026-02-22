import React, { useState, useEffect } from 'react';
import { Sparkles, Wrench, Zap, User, Droplets, Paintbrush, Scissors, Car, Lock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { serviceService } from '../services/api';

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

const colorMap = {
    'cleaning': 'from-blue-500 to-cyan-400',
    'electrician': 'from-yellow-500 to-orange-400',
    'plumber': 'from-cyan-500 to-blue-400',
    'carpenter': 'from-amber-500 to-yellow-400',
    'painting': 'from-purple-500 to-pink-400',
    'salon': 'from-pink-500 to-rose-400',
    'automotive': 'from-gray-600 to-gray-500',
    'security': 'from-green-500 to-emerald-400',
    'default': 'from-indigo-500 to-purple-400'
};

const CategoryGrid = () => {
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const data = await serviceService.getCategories();
                if (data && data.length > 0) {
                    setCategories(data);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const getIcon = (category) => {
        if (category.icon && (category.icon.startsWith('http') || category.icon.startsWith('/'))) {
            return <img src={category.icon} alt={category.name} className="w-12 h-12 object-contain rounded-lg" />;
        }
        const slug = category.slug?.toLowerCase() || category.name?.toLowerCase() || 'default';
        const IconComponent = iconMap[slug] || iconMap['default'];
        return <IconComponent size={32} className="text-white" />;
    };

    const getGradient = (category) => {
        const slug = category.slug?.toLowerCase() || category.name?.toLowerCase() || 'default';
        return colorMap[slug] || colorMap['default'];
    };

    return (
        <section className="py-16 px-4 bg-gray-50 dark:bg-slate-950/50 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            What are you looking for?
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">Browse from our popular categories</p>
                    </div>
                    <button
                        onClick={() => navigate('/services')}
                        className="hidden md:flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors"
                    >
                        Browse All Categories
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Category Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-x-6 md:gap-y-10">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            onClick={() => {
                                setActiveCategory(category.id);
                                navigate(`/services?category=${category.slug || category.name}`);
                            }}
                            className={`
                                group relative flex flex-col items-center gap-4 transition-all duration-300 cursor-pointer
                                ${activeCategory === category.id ? 'scale-95' : 'hover:-translate-y-1'}
                            `}
                        >
                            {/* Icon Container - Ultra Minimalist & Premium */}
                            <div className={`
                                relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center
                                p-4 transition-all duration-500 z-10
                                bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800
                                group-hover:border-indigo-500/30 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]
                                dark:group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)]
                                ${activeCategory === category.id ? 'ring-2 ring-indigo-500 border-transparent' : ''}
                            `}>
                                {/* Decorative background glow on hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-indigo-500/5 opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-500"></div>

                                {category.icon && (category.icon.startsWith('http') || category.icon.startsWith('/')) ? (
                                    <div className="w-full h-full flex items-center justify-center rounded-xl overflow-hidden transition-transform duration-500 group-hover:scale-110">
                                        <img
                                            src={category.icon}
                                            alt={category.name}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className={`
                                        w-full h-full rounded-2xl flex items-center justify-center text-white transition-transform duration-500 group-hover:scale-110
                                        bg-gradient-to-br ${getGradient(category)} shadow-lg shadow-indigo-500/10
                                    `}>
                                        {getIcon(category)}
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="text-center z-10 space-y-1">
                                <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300 uppercase tracking-widest px-2">
                                    {category.name}
                                </h3>
                                <p className="text-[9px] sm:text-[10px] font-medium text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors duration-300">
                                    {category.servicesCount || 0} services
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mobile View All Button */}
                <button
                    onClick={() => navigate('/services')}
                    className="md:hidden w-full mt-6 py-3 text-center text-indigo-600 dark:text-indigo-400 font-semibold border-2 border-indigo-100 dark:border-indigo-900 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                >
                    View All Categories
                </button>
            </div>
        </section>
    );
};

export default CategoryGrid;
