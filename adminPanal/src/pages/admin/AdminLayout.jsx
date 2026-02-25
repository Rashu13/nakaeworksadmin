import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, FolderTree, Briefcase, Users, ShoppingBag,
    Settings, LogOut, Menu, X, ChevronDown, Bell, User, Ticket, Moon, Sun, MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const menuItems = [
    {
        section: 'Overview', items: [
            { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
            { name: 'Bookings', path: '/admin/bookings', icon: ShoppingBag },
        ]
    },
    {
        section: 'Management', items: [
            { name: 'Categories', path: '/admin/categories', icon: FolderTree },
            { name: 'Services', path: '/admin/services', icon: Briefcase },
            { name: 'Users', path: '/admin/users', icon: Users },
        ]
    },
    {
        section: 'Marketing & Advertising', items: [
            { name: 'Banners', path: '/admin/content?tab=banners', icon: LayoutDashboard },
            { name: 'Sections', path: '/admin/content?tab=collections', icon: FolderTree },
            { name: 'Coupons', path: '/admin/coupons', icon: Ticket },
            { name: 'Testimonials', path: '/admin/reviews', icon: MessageSquare },
            // { name: 'Plans', path: '/admin/plans', icon: CreditCard }, // Future
        ]
    },
    {
        section: 'System', items: [
            { name: 'Settings', path: '/admin/settings', icon: Settings },
        ]
    }
];

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-slate-900 transition-colors duration-300">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 ${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 dark:bg-slate-950 transition-all duration-300`}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800 dark:border-slate-800">
                    <Link to="/admin" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-bold text-xl">N</span>
                        </div>
                        {sidebarOpen && <span className="text-white font-bold text-lg">Admin Panel</span>}
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="text-gray-400 hover:text-white lg:hidden"
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Menu */}
                <nav className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-180px)] custom-scrollbar">
                    {menuItems.map((section, idx) => (
                        <div key={idx}>
                            {sidebarOpen && section.section && (
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-4">
                                    {section.section}
                                </h3>
                            )}
                            <div className="space-y-1">
                                {section.items.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.path;

                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${isActive
                                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                                }`}
                                        >
                                            <Icon size={20} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'} />
                                            {sidebarOpen && <span className="font-medium text-sm">{item.name}</span>}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Bottom */}
                <div className="absolute bottom-4 left-4 right-4">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-xl transition-all"
                    >
                        <LogOut size={20} />
                        {sidebarOpen && <span className="font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
                {/* Top Header */}
                <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-40 transition-colors duration-300">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="flex items-center gap-4">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {/* Notifications */}
                        <button className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors"
                            >
                                <img
                                    src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=6366f1&color=fff`}
                                    alt="Admin"
                                    className="w-8 h-8 rounded-full"
                                />
                                <span className="font-medium text-gray-700 dark:text-gray-200">{user?.name || 'Admin'}</span>
                                <ChevronDown size={16} className="text-gray-400" />
                            </button>

                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-slate-800 py-2 z-50">
                                    <Link to="/admin/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200">
                                        <User size={16} />
                                        Profile
                                    </Link>
                                    <Link to="/admin/settings" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-200">
                                        <Settings size={16} />
                                        Settings
                                    </Link>
                                    <hr className="my-2 border-gray-100 dark:border-slate-800" />
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-800 text-red-600 w-full"
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

export default AdminLayout;
