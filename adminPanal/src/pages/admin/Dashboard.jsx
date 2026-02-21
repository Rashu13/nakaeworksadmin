import React, { useState, useEffect } from 'react';
import { Users, Briefcase, ShoppingBag, TrendingUp, DollarSign, UserCheck, ArrowUp, ArrowDown } from 'lucide-react';
import { adminService } from '../../services/api';

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-gray-500 text-sm font-medium">{title}</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
                {trend && (
                    <div className={`flex items-center gap-1 mt-2 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {trend === 'up' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                        <span>{trendValue}% from last month</span>
                    </div>
                )}
            </div>
            <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
                <Icon size={24} className="text-white" />
            </div>
        </div>
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProviders: 0,
        totalServices: 0,
        totalBookings: 0,
        monthlyBookings: 0,
        pendingBookings: 0,
        totalRevenue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await adminService.getDashboardStats();
            // After api.js normalization: Success/Data wrapper is unwrapped, keys are camelCase
            const statsData = response.statistics || response.stats || {};
            const revenueData = response.revenue || {};
            const monthlyTrend = response.monthlyTrend || [];
            const recentBookings = response.recentBookings || [];

            // Calculate monthly bookings from trend if current month exists
            const currentMonth = new Date().getMonth() + 1;
            const currentYear = new Date().getFullYear();
            const currentMonthStats = monthlyTrend.find(t => t.month === currentMonth && t.year === currentYear);

            const normalizedData = {
                totalUsers: statsData.totalUsers ?? 0,
                totalProviders: statsData.totalProviders ?? 0,
                totalServices: statsData.totalServices ?? 0,
                totalBookings: statsData.totalBookings ?? 0,
                monthlyBookings: currentMonthStats?.count ?? 0,
                pendingBookings: statsData.pendingBookings ?? 0,
                totalRevenue: revenueData.total ?? 0,
                recentBookings: recentBookings
            };
            setStats(normalizedData);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400">Welcome back! Here's what's happening.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Users"
                    value={(stats.totalUsers || 0).toLocaleString()}
                    icon={Users}
                    color="bg-blue-500"
                    trend="up"
                    trendValue="12"
                />
                <StatCard
                    title="Providers"
                    value={stats.totalProviders}
                    icon={UserCheck}
                    color="bg-green-500"
                    trend="up"
                    trendValue="8"
                />
                <StatCard
                    title="Total Services"
                    value={stats.totalServices}
                    icon={Briefcase}
                    color="bg-purple-500"
                />
                <StatCard
                    title="Total Bookings"
                    value={(stats.totalBookings || 0).toLocaleString()}
                    icon={ShoppingBag}
                    color="bg-orange-500"
                    trend="up"
                    trendValue="15"
                />
            </div>

            {/* Revenue & Pending */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium opacity-90">Total Revenue</h3>
                        <DollarSign size={24} className="opacity-70" />
                    </div>
                    <p className="text-4xl font-bold">₹{(stats.totalRevenue || 0).toLocaleString()}</p>
                    <p className="text-sm opacity-70 mt-2">This month: ₹45,000</p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Monthly Bookings</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{stats.monthlyBookings}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Pending Bookings</span>
                            <span className="font-semibold text-orange-600 dark:text-orange-400">{stats.pendingBookings}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Avg. Order Value</span>
                            <span className="font-semibold text-gray-900 dark:text-white">₹{Math.round(stats.totalRevenue / stats.totalBookings || 0)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Bookings</h3>
                {!stats.recentBookings || stats.recentBookings.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <ShoppingBag size={48} className="mx-auto mb-4 opacity-30" />
                        <p>No recent bookings to show</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase border-b border-gray-100 dark:border-slate-700">
                                <tr>
                                    <th className="pb-3 pl-2">Booking ID</th>
                                    <th className="pb-3 text-center">Service</th>
                                    <th className="pb-3 text-center">Customer</th>
                                    <th className="pb-3 text-center">Provider</th>
                                    <th className="pb-3 text-right pr-2">Total</th>
                                    <th className="pb-3 text-right pr-2">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
                                {stats.recentBookings.map((booking) => (
                                    <tr key={booking.id} className="text-sm">
                                        <td className="py-3 pl-2 font-medium text-indigo-600 dark:text-indigo-400">{booking.bookingNumber}</td>
                                        <td className="py-3 text-center text-gray-600 dark:text-gray-300">{booking.service?.name}</td>
                                        <td className="py-3 text-center text-gray-600 dark:text-gray-300">{booking.consumer?.name}</td>
                                        <td className="py-3 text-center text-gray-600 dark:text-gray-300">{booking.provider?.name || <span className="text-gray-400 italic">Unassigned</span>}</td>
                                        <td className="py-3 text-right pr-2 font-medium text-gray-900 dark:text-white">₹{booking.totalAmount}</td>
                                        <td className="py-3 text-right pr-2">
                                            <span className={`px-2 py-1 text-xs rounded-full capitalize 
                                                ${booking.status?.slug === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                    booking.status?.slug === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                        booking.status?.slug === 'confirmed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                                {booking.status?.name}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
