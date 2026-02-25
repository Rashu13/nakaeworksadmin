import React, { useState, useEffect } from 'react';
import { Search, MapPin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [location, setLocation] = useState(''); // Changed default state to empty string
    const navigate = useNavigate();

    const [loadingLocation, setLoadingLocation] = useState(false);

    // Auto-detect on mount if not already set
    useEffect(() => {
        const savedLocation = localStorage.getItem('user_location');
        if (savedLocation) {
            setLocation(savedLocation);
        } else {
            // Trigger auto-detection
            detectLocation();
        }
    }, []);

    const handleSearch = () => {
        if (searchQuery.trim()) {
            navigate(`/services?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    const detectLocation = () => {
        if (!navigator.geolocation) {
            console.warn('Geolocation not supported');
            return;
        }

        setLoadingLocation(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await response.json();

                // Extract city/district
                const city = data.address.city || data.address.state_district || data.address.town || data.address.village;

                if (city) {
                    setLocation(city);
                    localStorage.setItem('user_location', city);
                }
            } catch (error) {
                console.error('Location error:', error);
            } finally {
                setLoadingLocation(false);
            }
        }, (error) => {
            console.error('Geolocation error:', error);
            setLoadingLocation(false);
        });
    };

    return (
        <section className="relative min-h-[500px] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-slate-900 dark:text-white overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-72 h-72 bg-slate-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-500"></div>
            </div>

            {/* Dot Pattern */}
            <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '30px 30px'
            }}></div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 sm:py-28">
                <div className="text-center mb-12">
                    {/* Animated Title */}
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
                        Home Services,{' '}
                        <span className="relative inline-block">
                            <span className="bg-gradient-to-r from-blue-200 via-cyan-200 to-white bg-clip-text text-transparent">
                                On Demand
                            </span>
                            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                                <path d="M2 10C50 2 150 2 198 10" stroke="url(#gradient)" strokeWidth="4" strokeLinecap="round" />
                                <defs>
                                    <linearGradient id="gradient" x1="0" y1="0" x2="200" y2="0">
                                        <stop offset="0%" stopColor="#60A5FA" />
                                        <stop offset="50%" stopColor="#22D3EE" />
                                        <stop offset="100%" stopColor="#94A3B8" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-10 font-light">
                        Book trusted professionals for all your home service needs.
                        Expert care, just a tap away.
                    </p>

                    {/* Search Box */}
                    <div className="bg-gray-200 dark:bg-white/10 backdrop-blur-xl rounded-2xl p-3 max-w-3xl mx-auto border border-white/20 shadow-2xl">
                        <div className="flex flex-col md:flex-row items-stretch gap-3">
                            {/* Location Selector */}
                            <div className="flex items-center gap-3 px-4 py-3 bg-gray-200 dark:bg-white/10 rounded-xl md:w-56 relative group">
                                <MapPin className="text-yellow-400 flex-shrink-0" size={20} />
                                <div className="flex-1 min-w-0">
                                    <select
                                        value={location}
                                        onChange={(e) => {
                                            if (e.target.value === 'detect') {
                                                detectLocation();
                                            } else {
                                                setLocation(e.target.value);
                                                localStorage.setItem('user_location', e.target.value);
                                            }
                                        }}
                                        className="bg-transparent outline-none font-medium w-full cursor-pointer text-slate-900 dark:text-white appearance-none"
                                    >
                                        {/* Show current location if detected and not in standard list */}
                                        {location && !['New Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad'].includes(location) && (
                                            <option className="text-gray-900" value={location}>{location}</option>
                                        )}
                                        <option className="text-gray-900" value="New Delhi">New Delhi</option>
                                        <option className="text-gray-900" value="Mumbai">Mumbai</option>
                                        <option className="text-gray-900" value="Bangalore">Bangalore</option>
                                        <option className="text-gray-900" value="Chennai">Chennai</option>
                                        <option className="text-gray-900" value="Hyderabad">Hyderabad</option>
                                        <option className="text-gray-900 font-bold" value="detect">📍 Detect My Location</option>
                                    </select>
                                </div>
                                {loadingLocation && (
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                        <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>

                            {/* Search Input */}
                            <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-white rounded-xl">
                                <Search className="text-gray-600 dark:text-gray-400 flex-shrink-0" size={20} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="Search for AC Repair, Cleaning, Salon..."
                                    className="bg-transparent outline-none flex-1 text-gray-800 placeholder-gray-400 font-medium"
                                />
                            </div>

                            {/* Search Button */}
                            <button
                                onClick={handleSearch}
                                className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-yellow-400 to-primary-500 hover:from-yellow-500 hover:to-primary-600 text-gray-900 font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg"
                            >
                                <span className="hidden sm:inline">Find Service</span>
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex flex-wrap justify-center gap-8 mt-12 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                <span className="text-green-400">✓</span>
                            </div>
                            <span className="text-gray-700 dark:text-gray-300">50k+ Services Done</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                <span className="text-yellow-400">★</span>
                            </div>
                            <span className="text-gray-700 dark:text-gray-300">4.8 Average Rating</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <span className="text-blue-400">👤</span>
                            </div>
                            <span className="text-gray-700 dark:text-gray-300">5k+ Expert Providers</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
