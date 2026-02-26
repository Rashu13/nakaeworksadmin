import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, ShoppingBag, Heart, MapPin, ChevronDown, LogOut, Moon, Sun, Lock, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
    const { totalItems } = useCart();
    const [isOpen, setIsOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [userLocation, setUserLocation] = useState('New Delhi');
    const { user, logout, isAuthenticated } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const [scrolled, setScrolled] = useState(false);
    const [searchNavbar, setSearchNavbar] = useState('');

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const saved = localStorage.getItem('user_location');
        if (saved) setUserLocation(saved);
        const handleLocationUpdate = () => {
            const newLoc = localStorage.getItem('user_location');
            if (newLoc) setUserLocation(newLoc);
        };
        window.addEventListener('storage', handleLocationUpdate);
        return () => window.removeEventListener('storage', handleLocationUpdate);
    }, []);

    const isHome = location.pathname === '/';
    const isTransparent = isHome && !scrolled;

    const handleLogout = () => {
        logout();
        navigate('/');
        setShowUserMenu(false);
    };

    const fetchLocation = async () => {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                // Using a more reliable zoom level and city detection
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=12&addressdetails=1`);
                const data = await response.json();

                // Comprehensive city/town detection for Indian addresses
                const city = data.address.city ||
                    data.address.town ||
                    data.address.village ||
                    data.address.suburb ||
                    data.address.city_district ||
                    data.address.county ||
                    data.address.state_district ||
                    'New Delhi';

                setUserLocation(city);
                localStorage.setItem('user_location', city);
            } catch (error) {
                console.error("Error fetching location:", error);
            }
        }, (error) => {
            console.error("Geolocation error:", error);
        }, { enableHighAccuracy: true });
    };

    useEffect(() => {
        const savedLocation = localStorage.getItem('user_location');
        // If no location saved, or if it's the default "New Delhi", try to detect
        if (!savedLocation || savedLocation === 'New Delhi') {
            fetchLocation();
        }
    }, []);

    const navLinks = [
        { name: 'Services', path: '/services' },
        { name: 'Providers', path: '/providers' },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isTransparent
                ? 'bg-transparent py-6'
                : 'bg-gray-50 dark:bg-[#0a0f1c]/80 backdrop-blur-xl py-3 border-b border-gray-200 dark:border-white/5 shadow-2xl shadow-black/20'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group relative z-10">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                            <img
                                src={isDarkMode ? "/logo-white-footer.png" : "/logo.png"}
                                alt="NakaeWorks"
                                className="h-12 w-auto object-contain"
                            />
                        </motion.div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-10">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`relative text-sm font-semibold tracking-wide transition-all duration-300 group ${isTransparent ? 'text-slate-900 dark:text-white hover:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:text-primary-400'
                                    }`}
                            >
                                {link.name}
                                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full ${location.pathname === link.path ? 'w-full' : ''}`} />
                            </Link>
                        ))}

                        {/* Search Bar */}
                        <div className="relative group ml-2">
                            <div className="absolute inset-0 bg-primary-500/5 rounded-full blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className={`relative flex items-center gap-3 px-5 py-2.5 rounded-full border transition-all duration-500 ${isTransparent ? 'bg-gray-200/50 dark:bg-white/5 border-gray-200 dark:border-white/10 w-64' : 'bg-gray-200/50 dark:bg-white/5 border-gray-200 dark:border-white/10 w-80'
                                } group-focus-within:w-[400px] group-focus-within:border-primary-500/50 group-focus-within:bg-gray-100 dark:bg-white/10 backdrop-blur-md`}>
                                <Search size={16} className="text-primary-500 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Search services..."
                                    value={searchNavbar}
                                    onChange={(e) => setSearchNavbar(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            navigate(`/services?search=${encodeURIComponent(searchNavbar)}`);
                                            setSearchNavbar('');
                                        }
                                    }}
                                    className="bg-transparent border-none focus:ring-0 text-[13px] font-bold text-slate-900 dark:text-white placeholder:text-gray-500 w-full tracking-wider"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-6">
                        {/* Location */}
                        <button
                            onClick={fetchLocation}
                            className={`hidden lg:flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${isTransparent
                                ? 'bg-gray-200/50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-slate-900 dark:text-white hover:bg-gray-200 dark:bg-white/10'
                                : 'bg-gray-200/50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-slate-800 dark:text-gray-200 hover:bg-gray-200 dark:bg-white/10'
                                }`}>
                            <MapPin size={14} className="text-primary-500" />
                            <span className="text-xs font-bold tracking-tight uppercase">{userLocation}</span>
                            <ChevronDown size={12} className="text-gray-400" />
                        </button>

                        <div className="flex items-center gap-3">


                            {isAuthenticated ? (
                                <div className="flex items-center gap-4 pl-4 border-l border-gray-200 dark:border-white/10">
                                    <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:text-white transition-colors relative">
                                        <Heart size={20} />
                                    </button>

                                    <button
                                        onClick={() => navigate('/cart')}
                                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:text-white transition-colors relative"
                                    >
                                        <ShoppingBag size={20} />
                                        {totalItems > 0 && (
                                            <span className="absolute top-1 right-1 w-4 h-4 bg-primary-500 text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                                                {totalItems}
                                            </span>
                                        )}
                                    </button>

                                    <div className="relative">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setShowUserMenu(!showUserMenu)}
                                            className="relative flex items-center gap-2 p-0.5 rounded-full border-2 border-primary-500/30"
                                        >
                                            <img
                                                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=FFBF00&color=000`}
                                                alt="Profile"
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        </motion.button>

                                        <AnimatePresence>
                                            {showUserMenu && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    className="absolute right-0 mt-4 w-56 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl py-3 overflow-hidden"
                                                >
                                                    <div className="px-5 py-3 border-b border-gray-200 dark:border-white/5 mb-2">
                                                        <p className="font-bold text-slate-900 dark:text-white text-sm">{user?.name}</p>
                                                        <p className="text-[11px] text-gray-600 dark:text-gray-400 font-medium truncate">{user?.email}</p>
                                                    </div>

                                                    <div className="px-2 space-y-1">
                                                        {[
                                                            { label: 'Profile', icon: User, path: '/profile', action: null },
                                                            { label: 'My Bookings', icon: ShoppingBag, path: '/profile', state: { activeTab: 'bookings' } },
                                                            { label: 'Admin Panel', icon: Lock, path: '/admin', condition: user?.role === 'admin' }
                                                        ].map((item, idx) => (
                                                            (!item.hasOwnProperty('condition') || item.condition) && (
                                                                <button
                                                                    key={idx}
                                                                    onClick={() => {
                                                                        navigate(item.path, { state: item.state });
                                                                        setShowUserMenu(false);
                                                                    }}
                                                                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-slate-900 dark:text-white hover:bg-gray-100 dark:bg-white/5 rounded-xl transition-all"
                                                                >
                                                                    <item.icon size={16} className="text-primary-500" />
                                                                    {item.label}
                                                                </button>
                                                            )
                                                        ))}

                                                        <button
                                                            onClick={handleLogout}
                                                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-xl transition-all mt-2 pt-2 border-t border-gray-200 dark:border-white/5"
                                                        >
                                                            <LogOut size={16} />
                                                            Logout
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4 pl-4 border-l border-gray-200 dark:border-white/10">
                                    <Link
                                        to="/login"
                                        className={`text-sm font-bold tracking-tight uppercase transition-colors ${isTransparent ? 'text-slate-900 dark:text-white/80 hover:text-slate-900 dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:text-slate-900 dark:text-white'
                                            }`}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-[#0a0f1c] text-xs font-black tracking-widest uppercase rounded-full transition-all shadow-[0_0_20px_rgba(251,191,36,0.2)] hover:shadow-[0_0_30px_rgba(251,191,36,0.4)]"
                                    >
                                        Join Now
                                    </Link>
                                </div>
                            )}

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className={`md:hidden p-2 rounded-xl transition-colors ${isTransparent ? 'text-slate-900 dark:text-white hover:bg-gray-200 dark:bg-white/10' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:bg-white/5'
                                    }`}
                            >
                                {isOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden overflow-hidden bg-white dark:bg-[#161b22] rounded-3xl mt-4 border border-gray-200 dark:border-white/10 shadow-2xl"
                        >
                            <div className="flex flex-col p-4 gap-2">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        to={link.path}
                                        className="px-6 py-4 text-gray-700 dark:text-gray-300 hover:text-slate-900 dark:text-white hover:bg-gray-100 dark:bg-white/5 rounded-2xl transition-all"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                                {!isAuthenticated && (
                                    <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-white/5">
                                        <Link
                                            to="/login"
                                            className="w-full py-4 text-center text-slate-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl font-bold"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            to="/register"
                                            className="w-full py-4 text-center text-[#0a0f1c] bg-amber-400 hover:bg-amber-300 rounded-2xl font-black uppercase transition-colors"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Sign Up
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
};

export default Navbar;

