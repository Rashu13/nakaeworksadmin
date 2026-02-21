import React, { useState, useEffect } from 'react';
import { User, Package, Key, Shield, LogOut, Mail, Lock, CheckCircle, AlertCircle, Calendar, MapPin, Loader, Clock, Camera, Plus, Trash2, Edit2, X, Star, LayoutDashboard, FileText, Download } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService, bookingService, addressService, uploadService, reviewService } from '../services/api';
import ConfirmationModal from '../components/ConfirmationModal';

const Profile = () => {
    const { user: authUser, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'dashboard');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    // Profile State
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        avatar: '',
        about: ''
    });
    const [uploadingImage, setUploadingImage] = useState(false);

    // Password State
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

    // Bookings State
    const [bookings, setBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(false);

    // Address State
    const [addresses, setAddresses] = useState([]);
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [addressForm, setAddressForm] = useState({
        addressLine1: '',
        city: '',
        state: '',
        pincode: '',
        type: 'home'
    });
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [timeline, setTimeline] = useState([]);
    const [loadingTimeline, setLoadingTimeline] = useState(false);
    const [reviewState, setReviewState] = useState({ rating: 5, comment: '', loading: false });

    // Confirmation Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (authUser) {
            fetchProfile();
        }

        if (activeTab === 'bookings' || activeTab === 'dashboard') fetchBookings();
        if (activeTab === 'addresses') fetchAddresses();

    }, [isAuthenticated, activeTab]); // Re-fetch when tab changes

    // Auto-clear messages after 4 seconds
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const fetchProfile = async () => {
        try {
            const data = await authService.getProfile();
            setProfile({
                name: data.name || '',
                email: data.email || '',
                phone: data.phone || '',
                avatar: data.avatar || '',
                about: data.about || ''
            });
        } catch (error) {
            console.error(error);
        }
    };

    const fetchBookings = async () => {
        try {
            setLoadingBookings(true);
            const data = await bookingService.getAll();
            setBookings(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingBookings(false);
        }
    };

    const fetchAddresses = async () => {
        try {
            setLoadingAddresses(true);
            const data = await addressService.getAll();
            setAddresses(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingAddresses(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            await authService.updateProfile(profile);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            const data = await uploadService.uploadImage(file);
            setProfile(prev => ({ ...prev, avatar: data.imageUrl }));

            // Auto save after upload
            await authService.updateProfile({ ...profile, avatar: data.imageUrl });
            setMessage({ type: 'success', text: 'Profile photo updated!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to upload image' });
        } finally {
            setUploadingImage(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }
        setLoading(true);
        setMessage(null);
        try {
            await authService.changePassword({
                currentPassword: passwords.current,
                newPassword: passwords.new
            });
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to change password' });
        } finally {
            setLoading(false);
        }
    };

    // Address Handlers
    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingAddressId) {
                await addressService.update(editingAddressId, addressForm);
                setMessage({ type: 'success', text: 'Address updated' });
            } else {
                await addressService.add(addressForm);
                setMessage({ type: 'success', text: 'Address added' });
            }
            setShowAddressModal(false);
            fetchAddresses();
            setAddressForm({ addressLine1: '', city: '', state: '', pincode: '', type: 'home' });
            setEditingAddressId(null);
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleEditAddress = (addr) => {
        setAddressForm({
            addressLine1: addr.addressLine1,
            city: addr.city,
            state: addr.state,
            pincode: addr.pincode,
            type: addr.type
        });
        setEditingAddressId(addr.id);
        setShowAddressModal(true);
    };

    const confirmDeleteAddress = (id) => {
        setItemToDelete(id);
        setShowDeleteModal(true);
    };

    const handleDeleteAddress = async () => {
        if (!itemToDelete) return;
        try {
            await addressService.delete(itemToDelete);
            setMessage({ type: 'success', text: 'Address deleted successfully' });
            fetchAddresses();
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Failed to delete address' });
        } finally {
            setShowDeleteModal(false);
            setItemToDelete(null);
        }
    };

    const handleViewDetails = async (booking) => {
        setSelectedBooking(booking);
        setShowBookingModal(true);
        setTimeline([]);
        setLoadingTimeline(true);
        try {
            const data = await bookingService.getTimeline(booking.id);
            setTimeline(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch timeline:', err);
        } finally {
            setLoadingTimeline(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.slug) {
            case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'confirmed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    const downloadInvoice = (booking) => {
        // In a real app, this would call an API to generate a PDF
        // For now, we'll simulate it
        const invoiceContent = `
        INVOICE
        ----------------
        Booking #: ${booking.bookingNumber}
        Date: ${new Date(booking.dateTime).toDateString()}
        Service: ${booking.Service?.name}
        Amount: ₹${booking.totalAmount}
        ----------------
        Thank you for your business!
        `;

        const blob = new Blob([invoiceContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Invoice-${booking.bookingNumber}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const stats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status?.slug === 'pending').length,
        completed: bookings.filter(b => b.status?.slug === 'completed').length,
        active: bookings.filter(b => ['confirmed', 'in_progress', 'assigned'].includes(b.status?.slug)).length
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-24 pb-12 transition-colors duration-300">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account and bookings</p>
                    </div>
                    <button
                        onClick={() => { logout(); navigate('/'); }}
                        className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar / Tabs */}
                    <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-4 h-fit">
                        <div className="space-y-1">
                            <button
                                onClick={() => setActiveTab('dashboard')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-l-4 border-slate-900 dark:border-indigo-500' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-900'
                                    }`}
                            >
                                <LayoutDashboard size={20} />
                                Dashboard
                            </button>
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-colors ${activeTab === 'profile' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-l-4 border-slate-900 dark:border-indigo-500' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-900'
                                    }`}
                            >
                                <User size={20} />
                                Profile Details
                            </button>
                            <button
                                onClick={() => setActiveTab('bookings')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-colors ${activeTab === 'bookings' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-l-4 border-slate-900 dark:border-indigo-500' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-900'
                                    }`}
                            >
                                <Package size={20} />
                                Past Orders
                            </button>
                            <button
                                onClick={() => setActiveTab('addresses')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-colors ${activeTab === 'addresses' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-l-4 border-slate-900 dark:border-indigo-500' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-900'
                                    }`}
                            >
                                <MapPin size={20} />
                                Addresses
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-colors ${activeTab === 'security' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-l-4 border-slate-900 dark:border-indigo-500' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-900'
                                    }`}
                            >
                                <Key size={20} />
                                Security
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-3">
                        {message && (
                            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                }`}>
                                {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                {message.text}
                            </div>
                        )}

                        {activeTab === 'dashboard' && (
                            <div className="space-y-8">
                                {/* Welcome Section */}
                                <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-2xl p-8 text-white relative overflow-hidden">
                                    <div className="relative z-10">
                                        <h2 className="text-3xl font-bold mb-2">Hello, {authUser?.name} 👋</h2>
                                        <p className="text-indigo-100">Here's what's happening with your service requests.</p>
                                    </div>
                                    <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12 transform translate-x-12"></div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4">
                                            <Package size={24} />
                                        </div>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Bookings</p>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</h3>
                                    </div>
                                    <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                                        <div className="w-12 h-12 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-xl flex items-center justify-center mb-4">
                                            <Clock size={24} />
                                        </div>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Pending</p>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</h3>
                                    </div>
                                    <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                                        <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-4">
                                            <Loader size={24} />
                                        </div>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Active</p>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</h3>
                                    </div>
                                    <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                                        <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center mb-4">
                                            <CheckCircle size={24} />
                                        </div>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Completed</p>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</h3>
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h3>
                                        <button
                                            onClick={() => setActiveTab('bookings')}
                                            className="text-indigo-600 font-medium hover:text-indigo-700"
                                        >
                                            View All
                                        </button>
                                    </div>

                                    {loadingBookings ? (
                                        <div className="flex justify-center py-8">
                                            <Loader className="animate-spin text-slate-900" size={24} />
                                        </div>
                                    ) : bookings.length === 0 ? (
                                        <div className="bg-white p-8 rounded-2xl text-center border border-gray-100">
                                            <p className="text-gray-500">No recent activity</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {bookings.slice(0, 3).map((booking) => (
                                                <div key={booking.id} className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewDetails(booking)}>
                                                    <img
                                                        src={booking.service?.thumbnail}
                                                        alt={booking.service?.name}
                                                        className="w-16 h-16 rounded-xl object-cover bg-gray-100 dark:bg-slate-800"
                                                    />
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-gray-900 dark:text-white">{booking.service?.name}</h4>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(booking.dateTime).toDateString()}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(booking.bookingStatus)}`}>
                                                            {booking.bookingStatus?.name}
                                                        </span>
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">₹{booking.totalAmount}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-sm p-6 md:p-8 border border-gray-100 dark:border-slate-800">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Personal Information</h2>

                                {/* Photo Upload */}
                                <div className="mb-8 flex flex-col items-center sm:flex-row gap-6">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-slate-200">
                                            {profile.avatar ? (
                                                <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={40} className="text-slate-400" />
                                            )}
                                        </div>
                                        <label className="absolute bottom-0 right-0 p-1.5 bg-slate-900 text-white rounded-full cursor-pointer hover:bg-slate-800 transition-colors">
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                            {uploadingImage ? <Loader size={14} className="animate-spin" /> : <Camera size={14} />}
                                        </label>
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Profile Photo</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Update your profile picture.</p>
                                    </div>
                                </div>

                                <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-lg">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                                        <div className="relative">
                                            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                value={profile.name}
                                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-xl focus:ring-slate-500 focus:border-slate-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={profile.phone}
                                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                            placeholder="+91 98765 43210"
                                            className="block w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-xl focus:ring-slate-500 focus:border-slate-500"
                                        />
                                    </div>

                                    {/* About */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">About Me</label>
                                        <textarea
                                            rows="3"
                                            value={profile.about}
                                            onChange={(e) => setProfile({ ...profile, about: e.target.value })}
                                            placeholder="Tell us a bit about yourself..."
                                            className="block w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-xl focus:ring-slate-500 focus:border-slate-500 max-h-32"
                                        />
                                    </div>

                                    {/* Email (Read Only) */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                                        <div className="relative">
                                            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="email"
                                                value={profile.email}
                                                disabled
                                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 text-gray-500 dark:text-gray-400 rounded-xl cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
                                    >
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'bookings' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Bookings</h2>
                                {loadingBookings ? (
                                    <div className="flex justify-center py-12">
                                        <Loader className="animate-spin text-slate-900" size={32} />
                                    </div>
                                ) : bookings.length === 0 ? (
                                    <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-sm p-8 text-center border border-gray-100 dark:border-slate-800">
                                        <Package size={48} className="mx-auto text-gray-300 dark:text-slate-700 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No bookings yet</h3>
                                        <p className="text-gray-500 dark:text-gray-400 mb-6">Looks like you haven't booked any services yet.</p>
                                        <button
                                            onClick={() => navigate('/services')}
                                            className="px-6 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800"
                                        >
                                            Book a Service
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {bookings.map((booking) => (
                                            <div key={booking.id} className="bg-white dark:bg-slate-950 rounded-2xl shadow-sm p-6 flex flex-col md:flex-row gap-6 border border-gray-100 dark:border-slate-800">
                                                <div className="flex-shrink-0">
                                                    <img
                                                        src={booking.service?.thumbnail}
                                                        alt={booking.service?.name}
                                                        className="w-20 h-20 rounded-xl object-cover bg-gray-100 dark:bg-slate-800"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{booking.service?.name}</h3>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">Booking #{booking.bookingNumber}</p>
                                                        </div>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(booking.bookingStatus)}`}>
                                                            {booking.bookingStatus?.name || 'Pending'}
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar size={16} />
                                                            <span>{new Date(booking.dateTime).toDateString()}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Clock size={16} />
                                                            <span>{new Date(booking.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 col-span-2">
                                                            <MapPin size={16} />
                                                            <span className="truncate">{booking.address?.addressLine1}, {booking.address?.city}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col justify-between items-end border-l pl-6 border-gray-100 dark:border-slate-800">
                                                    <span className="text-xl font-bold text-gray-900 dark:text-white">₹{booking.totalAmount}</span>
                                                    <button
                                                        onClick={() => handleViewDetails(booking)}
                                                        className="text-slate-900 dark:text-indigo-400 font-medium text-sm hover:underline"
                                                    >
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'addresses' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Saved Addresses</h2>
                                    <button
                                        onClick={() => {
                                            setAddressForm({ addressLine1: '', city: '', state: '', pincode: '', type: 'home' });
                                            setEditingAddressId(null);
                                            setShowAddressModal(true);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800"
                                    >
                                        <Plus size={18} /> Add New
                                    </button>
                                </div>

                                {loadingAddresses ? (
                                    <div className="flex justify-center py-12">
                                        <Loader className="animate-spin text-slate-900" size={32} />
                                    </div>
                                ) : addresses.length === 0 ? (
                                    <div className="text-center py-12 bg-white dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800">
                                        <MapPin size={48} className="mx-auto text-gray-300 dark:text-slate-700 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No addresses saved</h3>
                                        <p className="text-gray-500 dark:text-gray-400">Add an address to make booking easier.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {addresses.map((addr) => (
                                            <div key={addr.id} className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm relative group">
                                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEditAddress(addr)}
                                                        className="p-1.5 text-gray-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => confirmDeleteAddress(addr.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${addr.type === 'home' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' :
                                                        addr.type === 'work' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400' :
                                                            'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {addr.type}
                                                    </span>
                                                </div>
                                                <p className="text-gray-900 dark:text-white font-medium mb-1">{addr.addressLine1}</p>
                                                <p className="text-gray-500 dark:text-gray-400 text-sm">{addr.city}, {addr.state} - {addr.pincode}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-sm p-6 md:p-8 border border-gray-100 dark:border-slate-800">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Change Password</h2>
                                <form onSubmit={handlePasswordChange} className="space-y-6 max-w-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                                        <div className="relative">
                                            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="password"
                                                value={passwords.current}
                                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-xl focus:ring-slate-500 focus:border-slate-500"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                                        <div className="relative">
                                            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="password"
                                                value={passwords.new}
                                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-xl focus:ring-slate-500 focus:border-slate-500"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                                        <div className="relative">
                                            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="password"
                                                value={passwords.confirm}
                                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-xl focus:ring-slate-500 focus:border-slate-500"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
                                    >
                                        {loading ? 'Updating...' : 'Update Password'}
                                    </button>
                                </form>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* Address Modal */}
            {showAddressModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddressModal(false)}></div>
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-xl border border-gray-100 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingAddressId ? 'Edit Address' : 'Add New Address'}</h2>
                            <button onClick={() => setShowAddressModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleAddressSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address Line 1</label>
                                <input
                                    type="text"
                                    value={addressForm.addressLine1}
                                    onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-white rounded-xl focus:ring-slate-500 focus:border-slate-500"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City</label>
                                    <input
                                        type="text"
                                        value={addressForm.city}
                                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-white rounded-xl focus:ring-slate-500 focus:border-slate-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">State</label>
                                    <input
                                        type="text"
                                        value={addressForm.state}
                                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-white rounded-xl focus:ring-slate-500 focus:border-slate-500"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pincode</label>
                                    <input
                                        type="text"
                                        value={addressForm.pincode}
                                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-white rounded-xl focus:ring-slate-500 focus:border-slate-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                                    <select
                                        value={addressForm.type}
                                        onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-white rounded-xl focus:ring-slate-500 focus:border-slate-500"
                                    >
                                        <option value="home">Home</option>
                                        <option value="work">Work</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-slate-900 dark:bg-indigo-600 text-white font-medium rounded-xl hover:bg-slate-800 dark:hover:bg-indigo-700 transition-colors mt-2"
                            >
                                {loading ? 'Saving...' : 'Save Address'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {/* Booking Details Modal */}
            {showBookingModal && selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowBookingModal(false)}></div>
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-slate-800 shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Booking Details</h2>
                            <button onClick={() => setShowBookingModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Service Header */}
                            <div className="flex gap-4 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                                <img
                                    src={selectedBooking.service?.thumbnail}
                                    alt={selectedBooking.service?.name}
                                    className="w-16 h-16 rounded-lg object-cover bg-gray-200 dark:bg-slate-700"
                                />
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{selectedBooking.service?.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Booking ID: #{selectedBooking.bookingNumber}</p>
                                </div>
                            </div>

                            {/* Date & Time */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 border border-gray-200 dark:border-slate-700 rounded-xl">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Date</p>
                                    <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
                                        <Calendar size={16} />
                                        {new Date(selectedBooking.dateTime).toDateString()}
                                    </div>
                                </div>
                                <div className="p-3 border border-gray-200 dark:border-slate-700 rounded-xl">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Time</p>
                                    <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
                                        <Clock size={16} />
                                        {new Date(selectedBooking.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>

                            {/* Status & Payment */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 border border-gray-200 dark:border-slate-700 rounded-xl">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Status</p>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusColor(selectedBooking.bookingStatus)}`}>
                                        {selectedBooking.bookingStatus?.name || 'Pending'}
                                    </span>
                                </div>
                                <div className="p-3 border border-gray-200 dark:border-slate-700 rounded-xl">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Payment</p>
                                    <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium capitalize">
                                        <CheckCircle size={16} className="text-green-500" />
                                        {selectedBooking.paymentMethod || 'Online'}
                                    </div>
                                </div>
                            </div>

                            {/* Service Address */}
                            <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-2">Service Address</p>
                                <div className="flex gap-3">
                                    <MapPin size={18} className="text-gray-400 dark:text-gray-500 mt-0.5" />
                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                        <p className="font-medium text-gray-900 dark:text-white">{selectedBooking.address?.addressLine1}</p>
                                        <p>{selectedBooking.address?.city}, {selectedBooking.address?.state}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Booking Timeline */}
                            <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-4">Booking Timeline</p>
                                {loadingTimeline ? (
                                    <div className="flex justify-center py-4">
                                        <Loader className="animate-spin text-indigo-500" size={20} />
                                    </div>
                                ) : timeline.length === 0 ? (
                                    <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-2">No timeline data available</p>
                                ) : (
                                    <div className="relative">
                                        {timeline.map((item, index) => {
                                            const isLast = index === timeline.length - 1;
                                            const statusIcon = {
                                                'Booking Placed': '📋',
                                                'Confirmed': '✅',
                                                'In Progress': '🔧',
                                                'Completed': '🎉',
                                                'Cancelled': '❌',
                                                'Rejected': '❌'
                                            }[item.status] || '📌';
                                            const statusColor = {
                                                'Booking Placed': 'bg-blue-500',
                                                'Confirmed': 'bg-green-500',
                                                'In Progress': 'bg-yellow-500',
                                                'Completed': 'bg-emerald-500',
                                                'Cancelled': 'bg-red-500',
                                                'Rejected': 'bg-red-500'
                                            }[item.status] || 'bg-gray-400';
                                            return (
                                                <div key={item.id} className="flex gap-3 mb-0">
                                                    <div className="flex flex-col items-center">
                                                        <div className={`w-8 h-8 rounded-full ${statusColor} flex items-center justify-center text-white text-sm shadow-md`}>
                                                            {statusIcon}
                                                        </div>
                                                        {!isLast && <div className="w-0.5 h-8 bg-gradient-to-b from-gray-300 to-gray-200 dark:from-slate-600 dark:to-slate-700"></div>}
                                                    </div>
                                                    <div className={`pb-4 ${isLast ? '' : ''}`}>
                                                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{item.status}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                            {' at '}
                                                            {new Date(item.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                        {item.note && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{item.note}</p>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Price Breakup */}
                            <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-slate-700">
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-2">Price Breakdown</p>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Service Price</span>
                                    <span className="text-gray-900 dark:text-white font-medium">₹{selectedBooking.servicePrice || selectedBooking.service?.price}</span>
                                </div>
                                {(selectedBooking.discount > 0 || selectedBooking.discountAmount > 0) && (
                                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                                        <span>Discount</span>
                                        <span>-₹{selectedBooking.discount || selectedBooking.discountAmount}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Platform Fee</span>
                                    <span className="text-gray-900 dark:text-white font-medium">₹{selectedBooking.platformFees || 0}</span>
                                </div>
                                {selectedBooking.tax > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Tax (GST)</span>
                                        <span className="text-gray-900 dark:text-white font-medium">₹{selectedBooking.tax}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200 dark:border-slate-700">
                                    <span className="text-gray-900 dark:text-white">Total Amount</span>
                                    <span className="text-indigo-600 dark:text-indigo-400">₹{selectedBooking.totalAmount}</span>
                                </div>
                            </div>

                            {/* Rate & Review Section */}
                            {selectedBooking.bookingStatus?.slug === 'completed' && !selectedBooking.isReviewed && (
                                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-4">Rate your experience</p>
                                    <div className="flex gap-2 mb-4">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onClick={() => setReviewState({ ...reviewState, rating: star })}
                                                className={`p-1 transition-colors ${reviewState.rating >= star ? 'text-yellow-400' : 'text-gray-200'}`}
                                            >
                                                <Star size={32} fill={reviewState.rating >= star ? 'currentColor' : 'none'} />
                                            </button>
                                        ))}
                                    </div>
                                    <textarea
                                        placeholder="Share your feedback..."
                                        className="w-full p-4 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 h-24 resize-none mb-4"
                                        value={reviewState.comment}
                                        onChange={(e) => setReviewState({ ...reviewState, comment: e.target.value })}
                                    ></textarea>
                                    <button
                                        onClick={async () => {
                                            if (reviewState.loading) return;
                                            try {
                                                setReviewState({ ...reviewState, loading: true });
                                                await reviewService.create({
                                                    bookingId: selectedBooking.id,
                                                    rating: reviewState.rating,
                                                    comment: reviewState.comment
                                                });
                                                setMessage({ type: 'success', text: 'Review submitted successfully! 🎉' });
                                                setShowBookingModal(false);
                                                fetchBookings(); // Refresh list to update isReviewed status
                                            } catch (err) {
                                                setMessage({ type: 'error', text: err.message });
                                            } finally {
                                                setReviewState({ ...reviewState, loading: false, comment: '' });
                                            }
                                        }}
                                        disabled={reviewState.loading}
                                        className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg disabled:opacity-50"
                                    >
                                        {reviewState.loading ? 'Submitting...' : 'Submit Review'}
                                    </button>
                                </div>
                            )}

                            {selectedBooking.bookingStatus?.slug === 'completed' && (
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                                    <button
                                        onClick={() => downloadInvoice(selectedBooking)}
                                        className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <FileText size={18} />
                                        Download Invoice
                                    </button>
                                </div>
                            )}

                            {selectedBooking.isReviewed && (
                                <div className="mt-6 pt-6 border-t text-center">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-full text-sm font-bold">
                                        <CheckCircle size={16} />
                                        Review Submitted
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => setShowBookingModal(false)}
                                className="w-full py-3 bg-slate-900 dark:bg-slate-700 text-white font-medium rounded-xl hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors mt-2"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteAddress}
                title="Delete Address?"
                message="Are you sure you want to delete this address? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                icon={<Trash2 size={48} className="text-red-500 mb-4" />}
            />
        </div>
    );
};

export default Profile;
