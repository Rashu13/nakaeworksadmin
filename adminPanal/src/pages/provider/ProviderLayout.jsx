import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Calendar, Briefcase, Wallet,
    Settings, LogOut, Menu, X, ChevronDown, Bell, User, Star, Home
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BASE_URL } from '../../services/api';

const menuItems = [
    { name: 'Dashboard', path: '/provider', icon: LayoutDashboard },
    { name: 'Bookings', path: '/provider/bookings', icon: Calendar },
    { name: 'Earnings', path: '/provider/earnings', icon: Wallet },
    { name: 'Reviews', path: '/provider/reviews', icon: Star },
    { name: 'Profile', path: '/provider/profile', icon: User },
];

const ProviderLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 ${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-emerald-900 to-emerald-800 transition-all duration-300`}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-emerald-700">
                    <Link to="/provider" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                            <span className="text-slate-900 dark:text-white font-bold text-xl">N</span>
                        </div>
                        {sidebarOpen && <span className="text-slate-900 dark:text-white font-bold text-lg">Provider Panel</span>}
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="text-emerald-300 hover:text-slate-900 dark:text-white lg:hidden"
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Menu */}
                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-emerald-600 text-slate-900 dark:text-white shadow-lg'
                                    : 'text-emerald-200 hover:bg-emerald-700/50 hover:text-slate-900 dark:text-white'
                                    }`}
                            >
                                <Icon size={20} />
                                {sidebarOpen && <span className="font-medium">{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom */}
                <div className="absolute bottom-4 left-4 right-4 space-y-2">
                    <Link
                        to="/"
                        className="flex items-center gap-3 px-4 py-3 w-full text-emerald-200 hover:text-slate-900 dark:text-white hover:bg-emerald-700/50 rounded-xl transition-all"
                    >
                        <Home size={20} />
                        {sidebarOpen && <span className="font-medium">Back to Home</span>}
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-emerald-200 hover:text-red-400 hover:bg-emerald-700/50 rounded-xl transition-all"
                    >
                        <LogOut size={20} />
                        {sidebarOpen && <span className="font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="flex items-center gap-4">
                        {/* Notifications */}
                        <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        </button>

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-3 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                            >
                                {user?.avatar ? (
                                    <img
                                        src={user.avatar.startsWith('http') ? user.avatar : `${BASE_URL}${user.avatar}`}
                                        alt={user?.name}
                                        className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500"
                                    />
                                ) : (
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${user?.name || 'Provider'}&background=10b981&color=fff`}
                                        alt="Provider"
                                        className="w-8 h-8 rounded-full"
                                    />
                                )}
                                <div className="text-left hidden sm:block">
                                    <span className="font-medium text-gray-700 block">{user?.name || 'Provider'}</span>
                                    <span className="text-xs text-emerald-600">Service Provider</span>
                                </div>
                                <ChevronDown size={16} className="text-gray-600 dark:text-gray-400" />
                            </button>

                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                                    <Link to="/provider/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700">
                                        <User size={16} />
                                        Profile
                                    </Link>
                                    <Link to="/provider/earnings" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700">
                                        <Wallet size={16} />
                                        Earnings
                                    </Link>
                                    <hr className="my-2" />
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-red-600 w-full"
                                    >
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default ProviderLayout;
