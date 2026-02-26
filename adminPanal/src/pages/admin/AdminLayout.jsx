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
        section: 'General', items: [
            { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
            { name: 'Bookings', path: '/admin/bookings', icon: ShoppingBag },
        ]
    },
    {
        section: 'Resources', items: [
            { name: 'Categories', path: '/admin/categories', icon: FolderTree },
            { name: 'Services', path: '/admin/services', icon: Briefcase },
            { name: 'Users', path: '/admin/users', icon: Users },
        ]
    },
    {
        section: 'Marketing', items: [
            { name: 'Banners', path: '/admin/content?tab=banners', icon: LayoutDashboard },
            { name: 'Sections', path: '/admin/content?tab=collections', icon: FolderTree },
            { name: 'Coupons', path: '/admin/coupons', icon: Ticket },
            { name: 'Testimonials', path: '/admin/reviews', icon: MessageSquare },
        ]
    },
    {
        section: 'Administration', items: [
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

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-700">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 ${sidebarOpen ? 'w-64' : 'w-20'} bg-white transition-all duration-300 border-r border-slate-200`}>
                {/* Logo Section */}
                <div className="h-16 flex items-center px-6 mb-6">
                    <Link to="/admin" className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                            <span className="text-white font-bold text-lg lowercase">n</span>
                        </div>
                        {sidebarOpen && (
                            <span className="text-slate-900 font-extrabold text-xl tracking-tight">Nakae<span className="text-indigo-600">works</span></span>
                        )}
                    </Link>
                </div>

                {/* Navigation Menu */}
                <nav className="px-3 space-y-6 overflow-y-auto max-h-[calc(100vh-160px)] custom-scrollbar">
                    {menuItems.map((section, idx) => (
                        <div key={idx} className="space-y-1">
                            {sidebarOpen && section.section && (
                                <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 mb-2">
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
                                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                                                ? 'bg-indigo-50 text-indigo-700'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                                }`}
                                        >
                                            <Icon size={18} className={`${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                            {sidebarOpen && <span className="font-medium text-sm">{item.name}</span>}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Logout Action */}
                <div className="absolute bottom-6 left-3 right-3">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 w-full text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                    >
                        <LogOut size={18} />
                        {sidebarOpen && <span className="font-medium text-sm">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <div className={`${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
                {/* Header */}
                <header className="h-16 bg-white/70 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                        <h1 className="text-sm font-semibold text-slate-900 hidden sm:block">
                            {menuItems.flatMap(s => s.items).find(i => i.path === location.pathname)?.name || 'Admin Panel'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors">
                            <Bell size={18} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="h-6 w-[1px] bg-slate-200 mx-2" />

                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-3 p-1 rounded-full hover:bg-slate-100 transition-colors"
                            >
                                <img
                                    src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=4f46e5&color=fff&bold=true`}
                                    alt="Admin"
                                    className="w-8 h-8 rounded-full shadow-sm"
                                />
                                <ChevronDown size={14} className={`text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                            </button>

                            {showUserMenu && (
                                <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                                    <div className="px-4 py-3 border-b border-slate-100 mb-1">
                                        <p className="text-xs font-medium text-slate-500 capitalize">{user?.role || 'Administrator'}</p>
                                        <p className="text-sm font-semibold text-slate-900 truncate">{user?.email}</p>
                                    </div>
                                    <Link to="/admin/profile" className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors">
                                        <User size={16} />
                                        Profile
                                    </Link>
                                    <Link to="/admin/settings" className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors">
                                        <Settings size={16} />
                                        Settings
                                    </Link>
                                    <div className="mt-1 pt-1 border-t border-slate-100">
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 w-full px-4 py-2 hover:bg-red-50 text-red-600 text-sm font-semibold transition-colors"
                                        >
                                            <LogOut size={16} />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="p-8 max-w-[1600px] mx-auto min-h-[calc(100vh-64px)]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
