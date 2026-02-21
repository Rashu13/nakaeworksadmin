import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Calendar, Clock, IndianRupee, Star, TrendingUp, Users,
    ArrowUpRight, ArrowDownRight, CheckCircle, XCircle, Play, Loader
} from 'lucide-react';
import { providerService, BASE_URL } from '../../services/api';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [recentBookings, setRecentBookings] = useState([]);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await providerService.getDashboard();
            if (response.data) {
                setStats(response.data.stats);
                setRecentBookings(response.data.recentBookings);
            }
        } catch (error) {
            console.error('Dashboard error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-700',
            'confirmed': 'bg-blue-100 text-blue-700',
            'in_progress': 'bg-purple-100 text-purple-700',
            'completed': 'bg-green-100 text-green-700',
            'cancelled': 'bg-red-100 text-red-700'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    const statCards = [
        {
            title: "Today's Bookings",
            value: stats?.todaysBookings || 0,
            icon: Calendar,
            color: 'bg-blue-500',
            trend: '+12%'
        },
        {
            title: 'Pending Requests',
            value: stats?.pendingRequests || 0,
            icon: Clock,
            color: 'bg-yellow-500',
            trend: null
        },
        {
            title: 'Total Earnings',
            value: `₹${(stats?.totalEarnings || 0).toLocaleString()}`,
            icon: IndianRupee,
            color: 'bg-emerald-500',
            trend: '+8%'
        },
        {
            title: 'Rating',
            value: stats?.avgRating || '0.0',
            icon: Star,
            color: 'bg-purple-500',
            subtitle: `${stats?.totalReviews || 0} reviews`
        }
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Welcome back! Here's your overview</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                                    {stat.subtitle && (
                                        <p className="text-gray-400 text-sm mt-1">{stat.subtitle}</p>
                                    )}
                                    {stat.trend && (
                                        <div className="flex items-center gap-1 mt-2 text-emerald-600">
                                            <ArrowUpRight size={16} />
                                            <span className="text-sm font-medium">{stat.trend}</span>
                                        </div>
                                    )}
                                </div>
                                <div className={`${stat.color} p-3 rounded-xl`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Monthly Earnings Card */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold opacity-90">This Month's Earnings</h3>
                        <TrendingUp className="w-6 h-6 opacity-80" />
                    </div>
                    <p className="text-4xl font-bold">₹{(stats?.monthlyEarnings || 0).toLocaleString()}</p>
                    <p className="text-emerald-100 mt-2">From {stats?.completedBookings || 0} completed services</p>
                    <Link
                        to="/provider/earnings"
                        className="inline-flex items-center gap-2 mt-4 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                    >
                        View Details
                        <ArrowUpRight size={16} />
                    </Link>
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Completed Services</span>
                            <span className="font-semibold text-gray-900">{stats?.completedBookings || 0}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Average Rating</span>
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="font-semibold text-gray-900">{stats?.avgRating || '0.0'}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Total Reviews</span>
                            <span className="font-semibold text-gray-900">{stats?.totalReviews || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
                    <Link to="/provider/bookings" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">
                        View All →
                    </Link>
                </div>

                {recentBookings.length === 0 ? (
                    <div className="p-12 text-center">
                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No bookings yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {recentBookings.map((booking) => (
                            <div key={booking.id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={booking.consumer?.avatar
                                                ? (booking.consumer.avatar.startsWith('http')
                                                    ? booking.consumer.avatar
                                                    : `${BASE_URL}${booking.consumer.avatar}`)
                                                : `https://ui-avatars.com/api/?name=${booking.consumer?.name}&background=10b981&color=fff`
                                            }
                                            alt={booking.consumer?.name}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <div>
                                            <p className="font-medium text-gray-900">{booking.consumer?.name}</p>
                                            <p className="text-sm text-gray-500">{booking.service?.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status?.slug)}`}>
                                            {booking.status?.name}
                                        </span>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {new Date(booking.dateTime).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
