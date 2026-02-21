import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, ShoppingBag, Heart, MapPin, ChevronDown, LogOut, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [userLocation, setUserLocation] = useState('New Delhi');
    const { user, logout, isAuthenticated } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY;
            if (offset > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const saved = localStorage.getItem('user_location');
        if (saved) setUserLocation(saved);

        // Listen for custom event from Hero check (optional, but good for immediate update)
        const handleLocationUpdate = () => {
            const newLoc = localStorage.getItem('user_location');
            if (newLoc) setUserLocation(newLoc);
        };

        window.addEventListener('storage', handleLocationUpdate); // Cross-tab
        // We can also dispatch a custom window event if we want same-tab sync

        return () => window.removeEventListener('storage', handleLocationUpdate);
    }, []);

    const isHome = location.pathname === '/';
    // Use transparent navbar only if on home AND not scrolled
    const isTransparent = isHome && !scrolled;

    const handleLogout = () => {
        logout();
        navigate('/');
        setShowUserMenu(false);
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isTransparent ? 'bg-transparent' : 'bg-white dark:bg-slate-900 shadow-sm border-b dark:border-slate-800'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <img
                            src={isTransparent ? "/logo-white-footer.png" : "/logo.png"}
                            alt="NakaeWorks"
                            className="h-10 w-auto object-contain"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link
                            to="/services"
                            className={`font-medium transition-colors ${isTransparent ? 'text-white/90 hover:text-white' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            Services
                        </Link>
                        <Link
                            to="/providers"
                            className={`font-medium transition-colors ${isTransparent ? 'text-white/90 hover:text-white' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            Providers
                        </Link>
                        <Link
                            to="/about"
                            className={`font-medium transition-colors ${isTransparent ? 'text-white/90 hover:text-white' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            About
                        </Link>
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-4">
                        {/* Location */}
                        <button className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-lg ${isTransparent ? 'bg-white/10 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200'
                            }`}>
                            <MapPin size={16} />
                            <span className="text-sm font-medium">{userLocation}</span>
                            <ChevronDown size={14} />
                        </button>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className={`p-2 rounded-full transition-all ${isTransparent ? 'text-white hover:bg-white/10' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {isAuthenticated ? (
                            <>
                                {/* Favorites */}
                                <button className={`p-2 rounded-full ${isTransparent ? 'text-white hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'}`}>
                                    <Heart size={20} />
                                </button>

                                {/* Cart/Bookings */}
                                <button
                                    onClick={() => navigate('/profile', { state: { activeTab: 'bookings' } })}
                                    className={`p-2 rounded-full relative ${isTransparent ? 'text-white hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    <ShoppingBag size={20} />
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                        2
                                    </span>
                                </button>

                                {/* User Menu */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center gap-2"
                                    >
                                        <img
                                            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}`}
                                            alt="Profile"
                                            className="w-9 h-9 rounded-full object-cover border-2 border-slate-900"
                                        />
                                    </button>

                                    {showUserMenu && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl py-2 border border-gray-100 dark:border-slate-700">
                                            <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700">
                                                <p className="font-medium text-gray-800 dark:text-white">{user?.name}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                                            </div>
                                            {user?.role === 'admin' && (
                                                <Link
                                                    to="/admin"
                                                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 text-slate-800 dark:text-gray-200 font-medium"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    <User size={16} />
                                                    Admin Panel
                                                </Link>
                                            )}
                                            <Link
                                                to="/profile"
                                                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                <User size={16} />
                                                Profile
                                            </Link>
                                            <Link
                                                to="/profile"
                                                state={{ activeTab: 'bookings' }}
                                                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                <ShoppingBag size={16} />
                                                My Bookings
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 text-red-600 w-full"
                                            >
                                                <LogOut size={16} />
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/login"
                                    className={`font-medium ${isTransparent ? 'text-white' : 'text-gray-700'}`}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className={`md:hidden p-2 ${isTransparent ? 'text-white' : 'text-gray-700'}`}
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden bg-white rounded-2xl shadow-xl mt-2 p-4 border border-gray-100">
                        <div className="flex flex-col gap-2">
                            <Link
                                to="/services"
                                className="px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                                onClick={() => setIsOpen(false)}
                            >
                                Services
                            </Link>
                            <Link
                                to="/providers"
                                className="px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                                onClick={() => setIsOpen(false)}
                            >
                                Providers
                            </Link>
                            <Link
                                to="/about"
                                className="px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                                onClick={() => setIsOpen(false)}
                            >
                                About
                            </Link>
                            {!isAuthenticated && (
                                <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
                                    <Link
                                        to="/login"
                                        className="flex-1 py-3 text-center text-gray-700 border border-gray-200 rounded-lg"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="flex-1 py-3 text-center text-white bg-indigo-600 rounded-lg"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
