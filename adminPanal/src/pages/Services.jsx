import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, Grid, List, ChevronDown, Star, Clock, MapPin, SlidersHorizontal, X } from 'lucide-react';
import ServiceCard from '../components/ServiceCard';
import { serviceService } from '../services/api';

// Categories for filter pills (can be fetched dynamically later, static for now)
const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
];

const Services = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const getQueryParam = useCallback((name) => {
        return searchParams.get(name) || searchParams.get(name === 'search' ? 'q' : name);
    }, [searchParams]);

    const [searchTerm, setSearchTerm] = useState(getQueryParam('search') || '');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [allServices, setAllServices] = useState([]);

    // Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categoriesData = await serviceService.getCategories();
                if (categoriesData) {
                    setCategories(['All', ...categoriesData.map(c => c.name)]);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    const handleCategoryClick = useCallback((cat) => {
        setSearchParams(prev => {
            if (cat === 'All') prev.delete('category');
            else prev.set('category', cat);
            return prev;
        }, { replace: true });
    }, [setSearchParams]);

    // Fetch Services whenever URL params change
    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);
                const category = getQueryParam('category');
                const search = getQueryParam('search');

                const params = {};
                if (category && category !== 'All') params.category = category;
                if (search) params.search = search;

                const data = await serviceService.getAll(params);
                setAllServices(data || []);
            } catch (error) {
                console.error('Error fetching services:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, [searchParams, getQueryParam]);

    // Handle Search Input Debounce
    useEffect(() => {
        const handler = setTimeout(() => {
            const currentSearch = getQueryParam('search') || '';
            if (searchTerm !== currentSearch) {
                setSearchParams(prev => {
                    if (searchTerm) prev.set('search', searchTerm);
                    else prev.delete('search');
                    return prev;
                }, { replace: true });
            }
        }, 300);

        return () => clearTimeout(handler);
    }, [searchTerm, setSearchParams, getQueryParam]);

    // Sync input with URL if it changes from outside (e.g. Navbar)
    useEffect(() => {
        const urlSearch = getQueryParam('search') || '';
        if (urlSearch !== searchTerm) {
            setSearchTerm(urlSearch);
        }
    }, [searchParams, getQueryParam]); // We only do this when URL changes

    // Final filtering/sorting on client side (rating and sort)
    const filteredServices = useMemo(() => {
        let items = [...allServices];
        const rating = parseFloat(getQueryParam('rating') || '0');
        const sort = getQueryParam('sort') || 'popular';

        if (rating > 0) {
            items = items.filter(s => (s.rating || 0) >= rating);
        }

        switch (sort) {
            case 'rating':
                items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'price_low':
                items.sort((a, b) => a.price - b.price);
                break;
            case 'price_high':
                items.sort((a, b) => b.price - a.price);
                break;
            default:
                items.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
        }

        return items;
    }, [allServices, searchParams, getQueryParam]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0f1c] pt-20 transition-colors duration-300">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-16 z-40">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400" size={20} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setSearchParams(prev => {
                                            if (searchTerm) prev.set('search', searchTerm);
                                            else prev.delete('search');
                                            return prev;
                                        }, { replace: true });
                                    }
                                }}
                                placeholder="Search services..."
                                className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                            />
                        </div>

                        {/* Category Pills */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                            {categories.slice(0, 5).map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => handleCategoryClick(cat)}
                                    className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${(getQueryParam('category') || 'All') === cat
                                        ? 'bg-primary-500 text-slate-900 shadow-lg shadow-primary-500/20'
                                        : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* View & Filter Buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300"
                            >
                                <SlidersHorizontal size={18} />
                                <span className="hidden sm:inline">Filters</span>
                            </button>
                            <div className="flex border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-white/5">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary-500/10 text-primary-500' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                                >
                                    <Grid size={18} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-primary-500/10 text-primary-500' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                                >
                                    <List size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Sidebar (Mobile) */}
            {showFilters && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowFilters(false)}></div>
                    <div className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-[#0a0f1c] shadow-2xl p-6 overflow-y-auto border-l border-gray-200 dark:border-white/10">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Filters</h3>
                            <button
                                onClick={() => setShowFilters(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X size={24} className="text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        {/* Sort */}
                        <div className="mb-8">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-200 mb-4 flex items-center gap-2">
                                <SlidersHorizontal size={16} />
                                Sort By
                            </h4>
                            <select
                                value={getQueryParam('sort') || 'popular'}
                                onChange={(e) => setSearchParams(prev => { prev.set('sort', e.target.value); return prev; }, { replace: true })}
                                className="w-full p-3 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                {sortOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#0a0f1c]">{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Rating */}
                        <div className="mb-8">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-200 mb-4 flex items-center gap-2">
                                <Star size={16} />
                                Minimum Rating
                            </h4>
                            <div className="grid grid-cols-3 gap-2">
                                {[0, 3, 3.5, 4, 4.5].map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => setSearchParams(prev => {
                                            if (r === 0) prev.delete('rating');
                                            else prev.set('rating', r.toString());
                                            return prev;
                                        }, { replace: true })}
                                        className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border transition-all ${parseFloat(getQueryParam('rating') || '0') === r
                                            ? 'border-primary-500 bg-primary-500/10 text-primary-500 font-bold'
                                            : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-primary-400 dark:hover:border-primary-500'
                                            }`}
                                    >
                                        {r > 0 ? (
                                            <>
                                                <Star size={14} className={parseFloat(getQueryParam('rating') || '0') === r ? 'fill-primary-500' : 'fill-yellow-400 text-yellow-400'} />
                                                <span>{r}</span>
                                            </>
                                        ) : 'All'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setShowFilters(false)}
                            className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-slate-900 rounded-xl font-bold shadow-lg shadow-primary-500/20 transition-all uppercase tracking-widest text-xs"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Results Count */}
                <div className="flex items-center justify-between mb-8">
                    <p className="text-gray-600 dark:text-gray-400">
                        Showing <span className="font-bold text-gray-900 dark:text-white">{filteredServices.length}</span> services
                        {getQueryParam('category') && getQueryParam('category') !== 'All' && (
                            <> in <span className="text-primary-500 font-medium">{getQueryParam('category')}</span></>
                        )}
                    </p>
                    <select
                        value={getQueryParam('sort') || 'popular'}
                        onChange={(e) => setSearchParams(prev => { prev.set('sort', e.target.value); return prev; }, { replace: true })}
                        className="hidden md:block px-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#0a0f1c] text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                    >
                        {sortOptions.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#0a0f1c]">{opt.label}</option>
                        ))}
                    </select>
                </div>

                {/* Services Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl h-80 animate-pulse"></div>
                        ))}
                    </div>
                ) : filteredServices.length > 0 ? (
                    <div className={`grid gap-6 ${viewMode === 'grid'
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                        : 'grid-cols-1'
                        }`}>
                        {filteredServices.map((service) => (
                            <ServiceCard key={service.id} service={service} viewMode={viewMode} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white dark:bg-white/5 rounded-[3rem] border border-gray-100 dark:border-white/10 shadow-sm">
                        <div className="w-24 h-24 bg-gray-50 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search size={40} className="text-gray-600 dark:text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No services found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto">We couldn't find any services matching your current filters. Try adjusting them!</p>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSearchParams({}, { replace: true });
                            }}
                            className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-slate-900 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary-500/20"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Services;
