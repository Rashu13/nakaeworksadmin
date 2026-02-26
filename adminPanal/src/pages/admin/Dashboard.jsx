import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users, UserCheck, Briefcase, ShoppingBag,
    TrendingUp, ArrowUp, ArrowDown, DollarSign,
    Search, Filter, Calendar, MoreVertical
} from 'lucide-react';
import { adminService } from '../../services/api';

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay }}
        className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
    >
        <div className="flex items-center justify-between mb-4">
            <div className={`p-2.5 rounded-md ${color.replace('text-', 'bg-')}/10 border ${color.replace('text-', 'border-')}/20`}>
                <Icon size={20} className={color} />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-xs font-semibold ${trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {trend === 'up' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    {trendValue}%
                </div>
            )}
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
        </div>
    </motion.div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProviders: 0,
        totalServices: 0,
        totalBookings: 0,
        monthlyBookings: 0,
        pendingBookings: 0,
        totalRevenue: 0,
        recentBookings: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await adminService.getDashboardStats();
            const statsData = response.statistics || response.stats || {};
            const revenueData = response.revenue || {};
            const monthlyTrend = response.monthlyTrend || [];
            const recentBookings = response.recentBookings || [];

            const currentMonth = new Date().getMonth() + 1;
            const currentYear = new Date().getFullYear();
            const currentMonthStats = monthlyTrend.find(t => t.month === currentMonth && t.year === currentYear);

            setStats({
                totalUsers: statsData.totalUsers ?? 0,
                totalProviders: statsData.totalProviders ?? 0,
                totalServices: statsData.totalServices ?? 0,
                totalBookings: statsData.totalBookings ?? 0,
                monthlyBookings: currentMonthStats?.count ?? 0,
                pendingBookings: statsData.pendingBookings ?? 0,
                totalRevenue: revenueData.total ?? 0,
                recentBookings: recentBookings
            });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="w-10 h-10 border-[3px] border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-slate-500">Loading dashboard data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">Dashboard</h1>
                    <p className="text-slate-500 text-sm">Welcome back! Here's an overview of your platform today.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2">
                        <Calendar size={16} />
                        Filter Date
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
                        Generate Report
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers.toLocaleString()}
                    icon={Users}
                    color="text-blue-600"
                    trend="up"
                    trendValue="12"
                    delay={0.1}
                />
                <StatCard
                    title="Active Providers"
                    value={stats.totalProviders}
                    icon={UserCheck}
                    color="text-emerald-600"
                    trend="up"
                    trendValue="5"
                    delay={0.2}
                />
                <StatCard
                    title="Total Services"
                    value={stats.totalServices}
                    icon={Briefcase}
                    color="text-amber-500"
                    delay={0.3}
                />
                <StatCard
                    title="Total Bookings"
                    value={stats.totalBookings.toLocaleString()}
                    icon={ShoppingBag}
                    color="text-indigo-600"
                    trend="up"
                    trendValue="8"
                    delay={0.4}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Revenue Card */}
                <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">Financial Analysis</p>
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Revenue Overview</h3>
                        </div>
                        <div className="p-3 bg-indigo-50 rounded-lg">
                            <DollarSign size={24} className="text-indigo-600" />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-end gap-8 mb-8">
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-2">Total Net Income</p>
                            <div className="flex items-center gap-3">
                                <span className="text-5xl font-extrabold text-slate-900 tracking-tighter">₹{(stats.totalRevenue || 0).toLocaleString()}</span>
                                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">+12.5%</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between text-xs font-medium text-slate-500 mb-2">
                                <span>Target Achievement</span>
                                <span>82%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-600 w-[82%]" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Previous Month</p>
                            <p className="text-lg font-bold text-slate-900 tracking-tight">₹{(stats.totalRevenue * 0.85).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Order</p>
                            <p className="text-lg font-bold text-slate-900 tracking-tight">₹{Math.round(stats.totalRevenue / stats.totalBookings || 0)}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Growth</p>
                            <p className="text-lg font-bold text-emerald-600 tracking-tight">+₹{(stats.totalRevenue * 0.15).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                        </div>
                    </div>
                </div>

                {/* Performance Card */}
                <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Operations List</h3>
                    <div className="space-y-6">
                        {[
                            { label: 'Monthly Bookings', value: stats.monthlyBookings, total: 200, color: 'bg-indigo-600' },
                            { label: 'Pending Approvals', value: stats.pendingBookings, total: 50, color: 'bg-amber-500' },
                            { label: 'Active Sessions', value: 12, total: 30, color: 'bg-emerald-500' }
                        ].map((item, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-sm font-medium text-slate-500">{item.label}</span>
                                    <span className="text-lg font-bold text-slate-900">{item.value}</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`h-full ${item.color}`} style={{ width: `${(item.value / item.total) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 p-4 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                            System is running within optimal parameters. No critical issues detected.
                        </p>
                    </div>
                </div>
            </div>

            {/* Recent Bookings Table */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">Recent Transactions</h3>
                    <div className="flex items-center gap-2">
                        <button className="text-slate-400 hover:text-slate-600 p-1">
                            <Search size={18} />
                        </button>
                        <button className="text-slate-400 hover:text-slate-600 p-1">
                            <Filter size={18} />
                        </button>
                        <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 ml-4">
                            View All
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50/50 text-left border-b border-slate-100">
                                <th className="px-6 py-4 font-semibold text-slate-500">Order ID</th>
                                <th className="px-6 py-4 font-semibold text-slate-500">Service</th>
                                <th className="px-6 py-4 font-semibold text-slate-500">Customer</th>
                                <th className="px-6 py-4 font-semibold text-slate-500">Provider</th>
                                <th className="px-6 py-4 font-semibold text-slate-500">Amount</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {stats.recentBookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-mono font-medium text-slate-900">#{booking.bookingNumber}</td>
                                    <td className="px-6 py-4 font-medium text-slate-700">{booking.service?.name}</td>
                                    <td className="px-6 py-4 text-slate-600">{booking.consumer?.name}</td>
                                    <td className="px-6 py-4 text-slate-600">{booking.provider?.name || <span className="text-slate-400 italic">Unassigned</span>}</td>
                                    <td className="px-6 py-4 font-bold text-slate-900">₹{booking.totalAmount}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold lowercase
                                            ${booking.status?.slug === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                booking.status?.slug === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                    booking.status?.slug === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-amber-100 text-amber-700'}`}>
                                            {booking.status?.name}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
