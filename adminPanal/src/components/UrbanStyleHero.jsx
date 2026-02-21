import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { serviceService, BASE_URL } from '../services/api';

// Icons using Lucide or similar, mapped like in original
import { Sparkles, Wrench, Zap, User, Droplets, Paintbrush, Scissors, Car, Shield } from 'lucide-react';

const iconMap = {
    'cleaning': Sparkles,
    'electrician': Zap,
    'plumber': Droplets,
    'carpenter': Wrench,
    'painting': Paintbrush,
    'salon': Scissors,
    'automotive': Car,
    'security': Shield,
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
        return <IconComponent size={26} strokeWidth={1.5} className="text-gray-800 dark:text-gray-200 mx-auto" />;
    };

    return (
        <div className="w-full bg-white dark:bg-[#0a0f1c] transition-colors duration-200 pt-10 pb-16">
            <div className="max-w-7xl mx-auto px-4 lg:flex lg:items-center lg:gap-12">

                {/* Left Side: Title and Categories Box */}
                <div className="lg:w-[45%] flex flex-col justify-center">
                    <h1 className="text-4xl md:text-5xl lg:text-[52px] font-black text-black dark:text-white leading-[1.1] tracking-tight mb-10">
                        Home services at your<br />doorstep
                    </h1>

                    <div className="bg-white dark:bg-[#111827] rounded-xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-gray-800">
                        <h2 className="text-xl font-bold text-black dark:text-white mb-6">
                            What are you looking for?
                        </h2>

                        {isLoading ? (
                            <div className="flex justify-center py-10">
                                <div className="w-8 h-8 border-4 border-gray-200 border-t-black dark:border-gray-700 dark:border-t-white rounded-full animate-spin"></div>
                            </div>
                        ) : isError ? (
                            <div className="text-red-500 py-4">Failed to load categories.</div>
                        ) : (
                            <div className="grid grid-cols-3 gap-y-6 gap-x-4">
                                {categories?.slice(0, 9).map((category, index) => (
                                    <div
                                        key={category.id}
                                        className="flex flex-col items-center justify-start cursor-pointer group"
                                        onClick={() => navigate(`/services?category=${category.slug || category.name}`)}
                                    >
                                        <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-gray-700 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:shadow-md mb-2 relative">
                                            {/* 'New' Badge for first item as a visual similar to screenshot */}
                                            {index === 1 && (
                                                <span className="absolute -top-2.5 right-0 bg-purple-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                                    New
                                                </span>
                                            )}
                                            {getIcon(category)}
                                        </div>
                                        <span className="text-[13px] text-center font-medium text-gray-800 dark:text-gray-300 leading-tight max-w-[90%] mx-auto">
                                            {category.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Image Grid Layout */}
                <div className="lg:w-[55%] mt-12 lg:mt-0 hidden md:block">
                    <div className="grid grid-cols-[1.2fr_1fr] gap-3 h-[500px]">
                        {/* Tall left image */}
                        <div className="h-full rounded-xl overflow-hidden shadow-sm">
                            <img
                                src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                alt="Salon at home"
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                            />
                        </div>
                        {/* Two stacked right images */}
                        <div className="flex flex-col gap-3 h-full">
                            <div className="flex-1 rounded-xl overflow-hidden shadow-sm">
                                <img
                                    src="https://images.unsplash.com/photo-1519823551278-64ac92734fb1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                                    alt="Massage service"
                                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                />
                            </div>
                            <div className="flex-1 rounded-xl overflow-hidden shadow-sm bg-gray-100">
                                <img
                                    src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                                    alt="AC Repair"
                                    className="w-full h-full object-cover transition-transform duration-700 mx-auto"
                                    style={{ objectPosition: 'center' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
