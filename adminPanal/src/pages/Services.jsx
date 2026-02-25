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
    const [allServices, setAllServices] = useState([]); // Store all fetched services
    const [categories, setCategories] = useState([]); // To store categories for filter pills
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [filters, setFilters] = useState({
        category: searchParams.get('category') || 'All',
        search: searchParams.get('search') || '',
        sort: 'popular',
        rating: 0
    });

    const navigate = useNavigate();

    // Fetch Services and Categories
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

    // Fetch Services whenever filters change (memory efficient - fetch only what's needed)
    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);
                const params = {};
                if (filters.category !== 'All') params.category = filters.category;
                if (filters.search) params.search = filters.search;

                const data = await serviceService.getAll(params);
                setAllServices(data || []);
            } catch (error) {
                console.error('Error fetching services:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, [filters.category, filters.search]);

    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchTerm }));
        }, 300);

        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Sorting - Memory Efficient using useMemo on the fetched subset
    const filteredServices = useMemo(() => {
        let sorted = [...allServices];

        // Rating Filter (Client-side secondary filter if needed, or already handled by backend)
        if (filters.rating > 0) {
            sorted = sorted.filter(s => (s.rating || 0) >= filters.rating);
        }

        // Sort
        switch (filters.sort) {
            case 'rating':
                sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'price_low':
                sorted.sort((a, b) => a.price - b.price);
                break;
            case 'price_high':
                sorted.sort((a, b) => b.price - a.price);
                break;
            default:
                sorted.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
        }

        return sorted;
    }, [allServices, filters.sort, filters.rating]);

    // Sync searchParams with filters when navigating directly
    useEffect(() => {
        const category = searchParams.get('category');
        const search = searchParams.get('search');

        if (category || search) {
            setFilters(prev => ({
                ...prev,
                category: category || 'All',
                search: search || ''
            }));
            if (search) setSearchTerm(search);
        }
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-20 transition-colors duration-300">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-16 z-40">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search services..."
                                className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-transparent outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                            />
                        </div>

                        {/* Category Pills */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                            {categories.slice(0, 5).map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setFilters({ ...filters, category: cat })}
                                    className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${filters.category === cat
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20'
                                        : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'
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
                                className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-slate-800 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300"
                            >
                                <SlidersHorizontal size={18} />
                                <span className="hidden sm:inline">Filters</span>
                            </button>
                            <div className="flex border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                                >
                                    <Grid size={18} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
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
                    <div className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-slate-900 shadow-2xl p-6 overflow-y-auto border-l border-gray-200 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Filters</h3>
                            <button
                                onClick={() => setShowFilters(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
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
                                value={filters.sort}
                                onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                                className="w-full p-3 border border-gray-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                {sortOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900">{opt.label}</option>
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
                                        onClick={() => setFilters({ ...filters, rating: r })}
                                        className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border transition-all ${filters.rating === r
                                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold'
                                            : 'border-gray-200 dark:border-slate-800 text-gray-600 dark:text-gray-400 hover:border-indigo-400 dark:hover:border-indigo-500'
                                            }`}
                                    >
                                        {r > 0 ? (
                                            <>
                                                <Star size={14} className={filters.rating === r ? 'fill-indigo-600' : 'fill-yellow-400 text-yellow-400'} />
                                                <span>{r}</span>
                                            </>
                                        ) : 'All'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setShowFilters(false)}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all"
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
                        {filters.category !== 'All' && (
                            <> in <span className="text-indigo-600 dark:text-indigo-400 font-medium">{filters.category}</span></>
                        )}
                    </p>
                    <select
                        value={filters.sort}
                        onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                        className="hidden md:block px-4 py-2 border border-gray-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                    >
                        {sortOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {/* Services Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl h-80 animate-pulse"></div>
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
                    <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[3rem] border border-gray-100 dark:border-slate-800 shadow-sm">
                        <div className="w-24 h-24 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search size={40} className="text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No services found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto">We couldn't find any services matching your current filters. Try adjusting them!</p>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilters({ ...filters, category: 'All', search: '', rating: 0 });
                            }}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium"
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
