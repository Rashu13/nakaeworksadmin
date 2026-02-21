import React from 'react';
import { Star, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CollectionSection = ({ title, services }) => {
    if (!services || services.length === 0) return null;

    return (
        <section className="py-12 bg-white dark:bg-slate-950 overflow-hidden transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
                        <div className="h-1 w-20 bg-indigo-600 rounded-full mt-2"></div>
                    </div>
                    <Link to="/services" className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                        View All <ChevronRight size={18} />
                    </Link>
                </div>

                <div className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide snap-x">
                    {services.map((service) => (
                        <Link
                            key={service.id}
                            to={`/service/${service.slug || service.id}`}
                            className="min-w-[280px] md:min-w-[320px] bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden hover:shadow-xl dark:hover:shadow-indigo-500/10 transition-all group snap-start"
                        >
                            <div className="relative h-48">
                                <img
                                    src={service.thumbnail || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069&auto=format&fit=crop'}
                                    alt={service.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                {service.discount > 0 && (
                                    <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
                                        ₹{service.discount} OFF
                                    </div>
                                )}
                            </div>

                            <div className="p-5">
                                <div className="flex items-center gap-1 text-yellow-500 mb-2">
                                    <Star size={14} fill="currentColor" />
                                    <span className="text-sm font-bold">{service.rating}</span>
                                    <span className="text-gray-400 dark:text-gray-500 text-xs font-normal">({service.reviewCount})</span>
                                </div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">{service.name}</h3>

                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">₹{service.price - (service.discount || 0)}</span>
                                        {service.discount > 0 && (
                                            <span className="text-sm text-gray-400 dark:text-gray-500 line-through">₹{service.price}</span>
                                        )}
                                    </div>
                                    <button className="px-4 py-2 bg-slate-900 dark:bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors">
                                        Book
                                    </button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CollectionSection;
