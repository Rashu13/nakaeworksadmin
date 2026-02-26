import React, { useState, useEffect } from 'react';
import { ChevronRight, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ServiceCard from './ServiceCard';
import { serviceService } from '../services/api';

// Sample services for demo


const ServiceSection = ({ title, subtitle, showTrending = false }) => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);
                const data = await serviceService.getAll();
                if (data && data.length > 0) {
                    setServices(data);
                } else {
                    setServices([]);
                }
            } catch (error) {
                console.error('Error fetching services:', error);
                setServices([]);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    return (
        <section className="py-10 px-4 bg-gray-50 dark:bg-[#0a0f1c] transition-colors duration-300 border-t dark:border-white/5">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                        {showTrending && (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-red-500 flex items-center justify-center">
                                <TrendingUp size={20} className="text-slate-900 dark:text-white" />
                            </div>
                        )}
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                                {title || 'Popular Services'}
                            </h2>
                            {subtitle && (
                                <p className="text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/services')}
                        className="hidden md:flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors"
                    >
                        View All
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Services Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-gray-200 dark:bg-white/5 rounded-2xl h-80 animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {services.slice(0, 8).map((service) => (
                            <ServiceCard key={service.id} service={service} />
                        ))}
                    </div>
                )}

                {/* Mobile View All Button */}
                <button
                    onClick={() => navigate('/services')}
                    className="md:hidden w-full mt-8 py-3 text-center text-primary-600 dark:text-primary-400 font-semibold border-2 border-primary-100 dark:border-primary-900 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                >
                    View All Services
                </button>
            </div>
        </section>
    );
};

export default ServiceSection;
