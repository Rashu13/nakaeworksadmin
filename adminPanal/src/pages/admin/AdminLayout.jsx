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
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] transition-colors duration-500">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 ${sidebarOpen ? 'w-72' : 'w-24'} bg-white dark:bg-[#0f172a] transition-all duration-500 border-r border-gray-200/60 dark:border-white/5 shadow-[20px_0_40px_rgba(0,0,0,0.02)] dark:shadow-none`}>
                {/* Logo Section */}
                <div className="h-20 flex items-center justify-between px-6 mb-4">
                    <Link to="/admin" className="flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-br from-[#1c3866] to-[#2d4d80] flex items-center justify-center shadow-lg shadow-blue-500/10 group-hover:scale-110 transition-transform duration-500">
                            <span className="text-white font-black text-2xl tracking-tighter">N</span>
                        </div>
                        {sidebarOpen && (
                            <div className="flex flex-col">
                                <span className="text-gray-900 dark:text-white font-black text-lg tracking-tight leading-none uppercase">NAKAE</span>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[3px] mt-1">Strategic Command</span>
                            </div>
                        )}
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="text-gray-400 hover:text-gray-900 dark:hover:text-white lg:hidden"
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Navigation Menu */}
                <nav className="px-4 py-4 space-y-8 overflow-y-auto max-h-[calc(100vh-180px)] custom-scrollbar">
                    {menuItems.map((section, idx) => (
                        <div key={idx} className="space-y-2">
                            {sidebarOpen && section.section && (
                                <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[4px] px-4 mb-4">
                                    {section.section}
                                </h3>
                            )}
                            <div className="space-y-1.5">
                                {section.items.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.path;

                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group relative ${isActive
                                                ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 shadow-sm shadow-primary-500/10'
                                                : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                                                }`}
                                        >
                                            <Icon size={22} className={`${isActive ? 'text-primary-600 dark:text-primary-400 scale-110' : 'text-gray-400 group-hover:scale-110'} transition-transform duration-300`} />
                                            {sidebarOpen && <span className="font-bold text-sm tracking-tight">{item.name}</span>}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Logout Action */}
                <div className="absolute bottom-8 left-4 right-4">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 px-6 py-4 w-full text-gray-500 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all duration-300 group"
                    >
                        <LogOut size={22} className="group-hover:translate-x-1 transition-transform" />
                        {sidebarOpen && <span className="font-bold text-sm tracking-tight uppercase tracking-[2px]">Systems Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Operational Surface */}
            <div className={`${sidebarOpen ? 'ml-72' : 'ml-24'} transition-all duration-500`}>
                {/* Tactical Header */}
                <header className="h-20 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-white/5 flex items-center justify-between px-10 sticky top-0 z-40 transition-all duration-500">
                    <div className="flex items-center gap-8">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-3 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-all"
                        >
                            <Menu size={24} />
                        </button>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Status Grid */}
                        <div className="hidden lg:flex items-center gap-4 mr-6 pr-6 border-r border-gray-100 dark:border-white/5">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Network Secure</span>
                                <span className="text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase">Gateway 4.2.1-X</span>
                            </div>
                        </div>

                        {/* Theme Controller */}
                        <button
                            onClick={toggleTheme}
                            className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-2xl transition-all bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5"
                        >
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {/* Intel Notifications */}
                        <button className="relative w-12 h-12 flex items-center justify-center text-gray-400 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-2xl transition-all bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                            <Bell size={20} />
                            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-[#0f172a] animate-pulse"></span>
                        </button>

                        {/* Command Profile */}
                        <div className="relative group/user">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-4 pl-2 pr-4 py-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-[1.25rem] transition-all border border-transparent hover:border-gray-200/60 dark:hover:border-white/10"
                            >
                                <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100 dark:border-white/20">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=1c3866&color=fff&bold=true`}
                                        alt="Admin"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="hidden md:flex flex-col items-start translate-y-[-1px]">
                                    <span className="font-black text-sm text-gray-900 dark:text-white tracking-tight leading-none truncate max-w-[100px]">{user?.name?.toUpperCase() || 'MASTER ADMIN'}</span>
                                    <span className="text-[9px] font-bold text-primary-500 uppercase tracking-[2px] mt-1">Superuser</span>
                                </div>
                                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
                            </button>

                            {showUserMenu && (
                                <div className="absolute right-0 mt-4 w-64 bg-white dark:bg-[#0f172a] rounded-3xl shadow-2xl border border-gray-100 dark:border-white/10 py-3 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <div className="px-6 py-4 border-b border-gray-50 dark:border-white/5 mb-2">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] mb-1">Authenticated As</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.email}</p>
                                    </div>
                                    <Link to="/admin/profile" className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-sm font-bold transition-colors">
                                        <User size={18} className="text-gray-400" />
                                        Protocol Profile
                                    </Link>
                                    <Link to="/admin/settings" className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-sm font-bold transition-colors">
                                        <Settings size={18} className="text-gray-400" />
                                        System Configuration
                                    </Link>
                                    <div className="px-4 mt-2">
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 w-full px-4 py-3 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl text-sm font-black uppercase tracking-[2px] transition-all group"
                                        >
                                            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                                            Terminate Session
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Tactical Surface */}
                <main className="p-10 max-w-[1600px] mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
