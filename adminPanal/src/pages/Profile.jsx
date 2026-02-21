import React, { useState, useEffect } from 'react';
import { User, Package, Key, Shield, LogOut, Mail, Lock, CheckCircle, AlertCircle, Calendar, MapPin, Loader, Clock, Camera, Plus, Trash2, Edit2, X, Star, LayoutDashboard, FileText, Download, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService, bookingService, addressService, uploadService, reviewService, BASE_URL } from '../services/api';
import ConfirmationModal from '../components/ConfirmationModal';
import { motion, AnimatePresence } from 'framer-motion';

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
        <div className="min-h-screen bg-[#0a0d14] pt-24 pb-12 transition-colors duration-300 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/5 rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12"
                >
                    <div>
                        <p className="text-orange-500 text-xs font-black uppercase tracking-[4px] mb-2 px-1">Control Center</p>
                        <h1 className="text-4xl font-black text-white tracking-tight">
                            MY ACCOUNT <span className="text-orange-500">PORTAL</span>
                        </h1>
                        <p className="text-gray-500 mt-2 font-medium">Manage your professional services and account configurations</p>
                    </div>
                    <button
                        onClick={() => { logout(); navigate('/'); }}
                        className="group flex items-center gap-2 px-8 py-3 bg-white/5 hover:bg-red-500 text-gray-400 hover:text-white border border-white/10 hover:border-red-500 rounded-xl transition-all font-black tracking-widest text-xs backdrop-blur-md"
                    >
                        <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                        TERMINATE SESSION
                    </button>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar / Tabs */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-slate-900/40 rounded-3xl border border-white/5 p-4 h-fit sticky top-28 shadow-2xl backdrop-blur-xl"
                    >
                        <div className="space-y-1.5">
                            {[
                                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                                { id: 'profile', label: 'User Intel', icon: User },
                                { id: 'bookings', label: 'Service History', icon: Package },
                                { id: 'addresses', label: 'Coordinates', icon: MapPin },
                                { id: 'security', label: 'Access Protocol', icon: Key }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-left font-bold transition-all relative group overflow-hidden ${activeTab === tab.id
                                        ? 'text-white bg-orange-600 shadow-[0_10px_20px_rgba(234,88,12,0.2)]'
                                        : 'text-gray-500 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <tab.icon size={20} className={`${activeTab === tab.id ? 'text-white' : 'text-gray-600'} group-hover:scale-110 transition-transform`} />
                                    <span className="tracking-widest uppercase text-[10px] font-black">{tab.label}</span>
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activeTabIndicator"
                                            className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>


                    {/* Content Area */}
                    <div className="lg:col-span-3">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {message && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`mb-8 p-5 rounded-2xl flex items-center gap-4 backdrop-blur-md ${message.type === 'success'
                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-full ${message.type === 'success' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                                            {message.type === 'success' ? <CheckCircle size={22} /> : <AlertCircle size={22} />}
                                        </div>
                                        <p className="font-bold tracking-wide uppercase text-sm">{message.text}</p>
                                    </motion.div>
                                )}


                                {activeTab === 'dashboard' && (
                                    <div className="space-y-8">
                                        {/* Welcome Section */}
                                        <motion.div
                                            initial={{ scale: 0.95 }}
                                            animate={{ scale: 1 }}
                                            className="bg-gradient-to-br from-slate-900 via-slate-950 to-black rounded-[2.5rem] p-12 text-white relative overflow-hidden border border-white/5 shadow-2xl mb-12 group"
                                        >
                                            <div className="relative z-10">
                                                <p className="text-orange-500 text-xs font-black uppercase tracking-[5px] mb-4">Account Status: Active</p>
                                                <h2 className="text-5xl font-black mb-4 tracking-tighter">WELCOME, <span className="text-orange-500">{authUser?.name?.split(' ')[0]?.toUpperCase()}</span></h2>
                                                <p className="text-gray-400 font-medium max-w-sm text-lg leading-relaxed">Your professional service management terminal is online and fully operational.</p>
                                            </div>
                                            <div className="absolute right-0 top-0 h-full w-[60%] bg-orange-600/5 blur-[120px] pointer-events-none group-hover:bg-orange-600/10 transition-all duration-700"></div>
                                            <LayoutDashboard className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 group-hover:rotate-12 transition-transform duration-1000" />
                                        </motion.div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                                            {[
                                                { label: 'Total Logs', val: stats.total, icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                                { label: 'Pending', val: stats.pending, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                                                { label: 'Processing', val: stats.active, icon: Loader, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                                { label: 'Completed', val: stats.completed, icon: CheckCircle, color: 'text-sky-500', bg: 'bg-sky-500/10' }
                                            ].map((stat, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    className="bg-slate-900/60 p-8 rounded-[2rem] border border-white/5 shadow-xl hover:border-orange-500/30 transition-all group relative overflow-hidden"
                                                >
                                                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 group-hover:bg-orange-500/5 transition-colors"></div>
                                                    <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10`}>
                                                        <stat.icon size={26} />
                                                    </div>
                                                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[2px] mb-2 relative z-10">{stat.label}</p>
                                                    <h3 className="text-4xl font-black text-white relative z-10">{stat.val}</h3>
                                                </motion.div>
                                            ))}
                                        </div>


                                        {/* Recent Activity */}
                                        <div className="pt-4">
                                            <div className="flex justify-between items-end mb-10">
                                                <div>
                                                    <p className="text-orange-500 text-[10px] font-black uppercase tracking-[3px] mb-2">Operation Logs</p>
                                                    <h3 className="text-3xl font-black text-white tracking-tight uppercase">RECENT SYSTEM ACTIVITY</h3>
                                                </div>
                                                <button
                                                    onClick={() => setActiveTab('bookings')}
                                                    className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all flex items-center gap-3 border border-white/10"
                                                >
                                                    Access All Logs <ChevronRight size={14} className="text-orange-500" />
                                                </button>
                                            </div>

                                            {loadingBookings ? (
                                                <div className="flex justify-center py-12">
                                                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                                </div>
                                            ) : bookings.length === 0 ? (
                                                <div className="bg-slate-900/60 shadow-2xl backdrop-blur-xl p-12 rounded-3xl text-center border border-white/10 border-dashed">
                                                    <Package size={48} className="mx-auto text-gray-600 mb-4" />
                                                    <p className="text-gray-500 font-bold tracking-wide uppercase text-sm">No premium activity yet</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {bookings.slice(0, 3).map((booking, i) => (
                                                        <motion.div
                                                            key={booking.id}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: i * 0.1 }}
                                                            className="bg-slate-900/60 shadow-2xl backdrop-blur-xl p-6 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center gap-6 hover:bg-white/[0.08] transition-all cursor-pointer group shadow-lg"
                                                            onClick={() => handleViewDetails(booking)}
                                                        >
                                                            <div className="relative shrink-0">
                                                                <img
                                                                    src={booking.service?.thumbnail}
                                                                    alt={booking.service?.name}
                                                                    className="w-20 h-20 rounded-2xl object-cover border border-white/10 group-hover:scale-105 transition-transform"
                                                                />
                                                                {booking.bookingStatus?.slug === 'completed' && (
                                                                    <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-1 rounded-full shadow-lg">
                                                                        <CheckCircle size={14} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 text-center sm:text-left">
                                                                <h4 className="font-black text-white text-lg tracking-tight uppercase group-hover:text-orange-500 transition-colors">{booking.service?.name}</h4>
                                                                <div className="flex items-center justify-center sm:justify-start gap-4 mt-2">
                                                                    <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold uppercase">
                                                                        <Calendar size={14} className="text-orange-500" />
                                                                        {new Date(booking.dateTime).toDateString()}
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold uppercase">
                                                                        <Clock size={14} className="text-orange-500" />
                                                                        {new Date(booking.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col items-center sm:items-end gap-3 shrink-0">
                                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[2px] shadow-sm ${getStatusColor(booking.bookingStatus)}`}>
                                                                    {booking.bookingStatus?.name}
                                                                </span>
                                                                <p className="text-xl font-black text-orange-500 tracking-tighter">₹{booking.totalAmount}</p>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                )}

                                {activeTab === 'profile' && (
                                    <div className="bg-slate-900/60 p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 blur-[100px] pointer-events-none"></div>

                                        {/* Photo Upload Section */}
                                        <div className="mb-12 flex flex-col items-center sm:flex-row gap-10 p-8 rounded-3xl bg-white/[0.03] border border-white/5 group">
                                            <div className="relative">
                                                <div className="w-32 h-32 rounded-[2.5rem] bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-orange-500/30 group-hover:border-orange-500 transition-colors shadow-2xl">
                                                    {profile.avatar ? (
                                                        <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    ) : (
                                                        <User size={50} className="text-gray-600" />
                                                    )}
                                                </div>
                                                <label className="absolute -bottom-3 -right-3 p-3 bg-orange-500 text-slate-900 rounded-2xl cursor-pointer hover:bg-orange-600 transition-all shadow-xl hover:scale-110">
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                                    {uploadingImage ? <Loader size={20} className="animate-spin" /> : <Camera size={20} />}
                                                </label>
                                            </div>
                                            <div className="text-center sm:text-left">
                                                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">MASTER PORTRAIT</h3>
                                                <p className="text-gray-400 font-medium max-w-xs">Upload a high-resolution portrait for your premium profile identity.</p>
                                            </div>
                                        </div>

                                        <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Name input */}
                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] font-black text-orange-500/70 uppercase tracking-[2.5px] mb-3">Operational Identity (Full Name)</label>
                                                <div className="relative group">
                                                    <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                                                    <input
                                                        type="text"
                                                        value={profile.name}
                                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                                        className="block w-full pl-14 pr-4 py-4 bg-white/5 border border-white/10 text-white rounded-2xl focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 outline-none transition-all placeholder:text-gray-600 font-bold"
                                                        placeholder="Enter your full name"
                                                    />
                                                </div>
                                            </div>

                                            {/* Phone input */}
                                            <div>
                                                <label className="block text-[10px] font-black text-orange-500/70 uppercase tracking-[2.5px] mb-3">Direct Contact (Phone)</label>
                                                <div className="relative group">
                                                    <Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                                                    <input
                                                        type="tel"
                                                        value={profile.phone}
                                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                                        placeholder="+91 98765 43210"
                                                        className="block w-full pl-14 pr-4 py-4 bg-white/5 border border-white/10 text-white rounded-2xl focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 outline-none transition-all font-bold"
                                                    />
                                                </div>
                                            </div>

                                            {/* Email input (Read Only) */}
                                            <div>
                                                <label className="block text-[10px] font-black text-orange-500/70 uppercase tracking-[2.5px] mb-3">Verified Intel (Email)</label>
                                                <div className="relative group">
                                                    <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                                                    <input
                                                        type="email"
                                                        value={profile.email}
                                                        disabled
                                                        className="block w-full pl-14 pr-4 py-4 bg-white/[0.02] border border-white/5 text-gray-500 rounded-2xl cursor-not-allowed font-bold"
                                                    />
                                                </div>
                                            </div>

                                            {/* About input */}
                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] font-black text-orange-500/70 uppercase tracking-[2.5px] mb-3">Briefing (About Your Profile)</label>
                                                <textarea
                                                    rows="4"
                                                    value={profile.about}
                                                    onChange={(e) => setProfile({ ...profile, about: e.target.value })}
                                                    placeholder="Write a brief professional summary..."
                                                    className="block w-full px-5 py-4 bg-white/5 border border-white/10 text-white rounded-2xl focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 outline-none transition-all resize-none font-bold"
                                                />
                                            </div>

                                            <div className="md:col-span-2 pt-4">
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="px-12 py-5 bg-orange-500 text-white font-black uppercase tracking-[3px] rounded-2xl hover:bg-orange-600 shadow-[0_15px_30px_rgba(249,115,22,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-4 group"
                                                >
                                                    {loading ? <Loader className="animate-spin" /> : <Shield size={22} className="group-hover:rotate-12 transition-transform" />}
                                                    Update Protocol Data
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}


                                {activeTab === 'bookings' && (
                                    <div className="space-y-8">
                                        <div className="flex justify-between items-center">
                                            <h2 className="text-3xl font-black text-white tracking-tight uppercase">Order History</h2>
                                            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                                <Package size={14} className="text-orange-500" />
                                                {bookings.length} Total
                                            </div>
                                        </div>

                                        {loadingBookings ? (
                                            <div className="flex justify-center py-20">
                                                <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        ) : bookings.length === 0 ? (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="bg-slate-900/60 shadow-2xl backdrop-blur-xl rounded-[2rem] p-16 text-center border border-white/10 border-dashed"
                                            >
                                                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                                    <Package size={48} className="text-gray-600" />
                                                </div>
                                                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">No services booked</h3>
                                                <p className="text-gray-500 font-medium mb-10 max-w-xs mx-auto">Explore our elite services and start your journey with us today.</p>
                                                <button
                                                    onClick={() => navigate('/services')}
                                                    className="px-10 py-4 bg-orange-500 text-slate-900 font-black uppercase tracking-widest rounded-2xl hover:bg-orange-600 transition-all shadow-xl hover:shadow-orange-500/20"
                                                >
                                                    Browse Services
                                                </button>
                                            </motion.div>
                                        ) : (
                                            <div className="space-y-6">
                                                {bookings.map((booking, i) => (
                                                    <motion.div
                                                        key={booking.id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        className="bg-slate-900/40 rounded-[2.5rem] p-8 flex flex-col lg:flex-row gap-8 border border-white/5 hover:bg-slate-900/60 transition-all group relative overflow-hidden shadow-2xl"
                                                    >
                                                        <div className="absolute right-0 top-0 w-32 h-32 bg-orange-600/5 blur-[60px] pointer-events-none group-hover:bg-orange-600/10 transition-all"></div>

                                                        <div className="shrink-0 relative">
                                                            <img
                                                                src={booking.service?.thumbnail}
                                                                alt={booking.service?.name}
                                                                className="w-32 h-32 rounded-[2rem] object-cover border border-white/10 shadow-xl group-hover:scale-105 transition-transform duration-500"
                                                            />
                                                            <div className="absolute -top-2 -left-2 bg-orange-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg">
                                                                ID: #{booking.bookingNumber}
                                                            </div>
                                                        </div>

                                                        <div className="flex-1">
                                                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                                                                <div>
                                                                    <p className="text-orange-500 text-[10px] font-black uppercase tracking-[2px] mb-1">Operational Task</p>
                                                                    <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-orange-500 transition-colors">{booking.service?.name}</h3>
                                                                    <div className="flex flex-wrap gap-4">
                                                                        <div className="flex items-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                                                                            <Calendar size={14} className="text-orange-500" />
                                                                            {new Date(booking.dateTime).toDateString()}
                                                                        </div>
                                                                        <div className="flex items-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                                                                            <Clock size={14} className="text-orange-500" />
                                                                            {new Date(booking.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[2px] shadow-sm border border-white/5 ${getStatusColor(booking.bookingStatus)}`}>
                                                                    {booking.bookingStatus?.name || 'LOGGED'}
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center gap-3 text-gray-500 text-xs font-bold p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                                                                <MapPin size={16} className="text-orange-500 shrink-0" />
                                                                <span className="truncate uppercase tracking-widest">{booking.address?.addressLine1}, {booking.address?.city}</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col justify-between items-center lg:items-end lg:border-l lg:pl-8 lg:border-white/5 gap-6">
                                                            <div className="text-center lg:text-right">
                                                                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Valuation</p>
                                                                <span className="text-4xl font-black text-white tracking-tighter">₹{booking.totalAmount}</span>
                                                            </div>
                                                            <button
                                                                onClick={() => handleViewDetails(booking)}
                                                                className="w-full lg:w-auto px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-orange-500/10 group/btn"
                                                            >
                                                                ACCESS INTEL
                                                                <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'addresses' && (
                                    <div className="space-y-8">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-orange-500 text-[10px] font-black uppercase tracking-[3px] mb-2">Base Operations</p>
                                                <h2 className="text-4xl font-black text-white tracking-tight uppercase">Coordinates</h2>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setAddressForm({ addressLine1: '', city: '', state: '', pincode: '', type: 'home' });
                                                    setEditingAddressId(null);
                                                    setShowAddressModal(true);
                                                }}
                                                className="flex items-center gap-3 px-8 py-4 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 transition-all font-black uppercase tracking-widest shadow-xl shadow-orange-500/20"
                                            >
                                                <Plus size={20} /> ESTABLISH NEW
                                            </button>
                                        </div>

                                        {loadingAddresses ? (
                                            <div className="flex justify-center py-20">
                                                <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        ) : addresses.length === 0 ? (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-slate-900/60 shadow-2xl backdrop-blur-xl rounded-[2rem] p-16 text-center border border-white/10 border-dashed"
                                            >
                                                <MapPin size={48} className="mx-auto text-gray-600 mb-6" />
                                                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">No coordinates saved</h3>
                                                <p className="text-gray-500 font-medium">Add your primary locations for efficient service delivery.</p>
                                            </motion.div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {addresses.map((addr, i) => (
                                                    <motion.div
                                                        key={addr.id}
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: i * 0.1 }}
                                                        className="bg-slate-900/60 p-8 rounded-[2rem] border border-white/5 shadow-2xl relative group hover:border-orange-500/30 transition-all overflow-hidden"
                                                    >
                                                        <div className="absolute top-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                                            <button
                                                                onClick={() => handleEditAddress(addr)}
                                                                className="p-2.5 bg-white/10 text-white hover:bg-orange-500 hover:text-slate-900 rounded-xl transition-all shadow-xl"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => confirmDeleteAddress(addr.id)}
                                                                className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-xl"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                        <div className="flex items-center gap-3 mb-6">
                                                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[2px] shadow-sm ${addr.type === 'home' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                                addr.type === 'work' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                                                    'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                                                                }`}>
                                                                {addr.type}
                                                            </div>
                                                        </div>
                                                        <p className="text-white text-xl font-black mb-2 tracking-tight uppercase group-hover:text-orange-500 transition-colors">{addr.addressLine1}</p>
                                                        <div className="flex items-start gap-2 text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-4">
                                                            <MapPin size={14} className="text-orange-500 shrink-0" />
                                                            <span>{addr.city}, {addr.state} - {addr.pincode}</span>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'security' && (
                                    <div className="bg-slate-900/60 rounded-[2.5rem] border border-white/5 p-10 shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] pointer-events-none"></div>

                                        <div className="flex items-center gap-6 mb-12">
                                            <div className="w-16 h-16 bg-orange-600/10 rounded-2xl flex items-center justify-center border border-orange-600/20 shadow-xl">
                                                <Key size={30} className="text-orange-500" />
                                            </div>
                                            <div>
                                                <p className="text-orange-500 text-[10px] font-black uppercase tracking-[3px] mb-1">Security Protocol</p>
                                                <h2 className="text-3xl font-black text-white uppercase tracking-tight">Access Protocol</h2>
                                            </div>
                                        </div>

                                        <form onSubmit={handlePasswordChange} className="space-y-8 max-w-xl relative z-10">
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-xs font-black text-orange-500/70 uppercase tracking-[2px] mb-3">Current Authorization</label>
                                                    <div className="relative group">
                                                        <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-orange-500 transition-colors" />
                                                        <input
                                                            type="password"
                                                            value={passwords.current}
                                                            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                                            placeholder="Enter current password"
                                                            className="block w-full pl-14 pr-4 py-4 bg-white/5 border border-white/10 text-white rounded-2xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all font-bold"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-xs font-black text-orange-500/70 uppercase tracking-[2px] mb-3">New Cipher</label>
                                                        <div className="relative group">
                                                            <Key size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-orange-500 transition-colors" />
                                                            <input
                                                                type="password"
                                                                value={passwords.new}
                                                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                                                placeholder="New password"
                                                                className="block w-full pl-14 pr-4 py-4 bg-white/5 border border-white/10 text-white rounded-2xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all font-bold"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-black text-orange-500/70 uppercase tracking-[2px] mb-3">Re-verify Cipher</label>
                                                        <div className="relative group">
                                                            <Shield size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-orange-500 transition-colors" />
                                                            <input
                                                                type="password"
                                                                value={passwords.confirm}
                                                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                                                placeholder="Confirm new password"
                                                                className="block w-full pl-14 pr-4 py-4 bg-white/5 border border-white/10 text-white rounded-2xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all font-bold"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-4">
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="px-12 py-5 bg-orange-500 text-white font-black uppercase tracking-[3px] rounded-2xl hover:bg-orange-600 shadow-[0_15px_30px_rgba(249,115,22,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-4 group"
                                                >
                                                    {loading ? <Loader className="animate-spin" /> : <Shield size={22} className="group-hover:rotate-12 transition-transform" />}
                                                    UPDATE AUTHORIZATION
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Address Modal */}
                <AnimatePresence>
                    {showAddressModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowAddressModal(false)}
                                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative bg-slate-900/90 rounded-[2.5rem] w-full max-w-md p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-xl overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 blur-[80px] pointer-events-none"></div>

                                <div className="flex justify-between items-center mb-8 relative z-10">
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                                        {editingAddressId ? 'Edit Coordinates' : 'New Coordinates'}
                                    </h2>
                                    <button
                                        onClick={() => setShowAddressModal(false)}
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all border border-white/5"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleAddressSubmit} className="space-y-6 relative z-10">
                                    <div>
                                        <label className="block text-xs font-black text-orange-500/70 uppercase tracking-[2px] mb-3">Address Line 1</label>
                                        <input
                                            type="text"
                                            value={addressForm.addressLine1}
                                            onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                                            placeholder="Enter street address"
                                            className="w-full px-5 py-4 bg-white/5 border border-white/10 text-white rounded-2xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all font-bold"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-black text-orange-500/70 uppercase tracking-[2px] mb-3">City</label>
                                            <input
                                                type="text"
                                                value={addressForm.city}
                                                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                                placeholder="City"
                                                className="w-full px-5 py-4 bg-white/5 border border-white/10 text-white rounded-2xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all font-bold"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-orange-500/70 uppercase tracking-[2px] mb-3">State</label>
                                            <input
                                                type="text"
                                                value={addressForm.state}
                                                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                                placeholder="State"
                                                className="w-full px-5 py-4 bg-white/5 border border-white/10 text-white rounded-2xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all font-bold"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-black text-orange-500/70 uppercase tracking-[2px] mb-3">Pincode</label>
                                            <input
                                                type="text"
                                                value={addressForm.pincode}
                                                onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                                                placeholder="123456"
                                                className="w-full px-5 py-4 bg-white/5 border border-white/10 text-white rounded-2xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all font-bold"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-orange-500/70 uppercase tracking-[2px] mb-3">Type</label>
                                            <select
                                                value={addressForm.type}
                                                onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value })}
                                                className="w-full px-5 py-4 bg-white/5 border border-white/10 text-white rounded-2xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all font-bold appearance-none cursor-pointer"
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
                                        className="w-full py-5 bg-orange-500 text-slate-900 font-black uppercase tracking-widest rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/10 flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
                                    >
                                        {loading ? <Loader className="animate-spin" /> : <MapPin size={20} />}
                                        Save Coordinates
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
                {/* Booking Details Modal */}
                <AnimatePresence>
                    {showBookingModal && selectedBooking && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowBookingModal(false)}
                                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative bg-slate-900/90 rounded-[2.5rem] w-full max-w-xl p-8 max-h-[90vh] overflow-y-auto border border-white/10 backdrop-blur-xl shadow-2xl custom-scrollbar"
                            >
                                <div className="flex justify-between items-center mb-8 sticky top-0 bg-slate-900/10 backdrop-blur-md py-2 z-20">
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Deployment Intel</h2>
                                    <button
                                        onClick={() => setShowBookingModal(false)}
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all border border-white/5"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-8">
                                    {/* Service Header */}
                                    <div className="flex gap-6 p-6 bg-white/5 rounded-3xl border border-white/10 relative overflow-hidden group">
                                        <div className="absolute right-0 top-0 w-32 h-32 bg-orange-500/5 blur-[40px] pointer-events-none"></div>
                                        <img
                                            src={selectedBooking.service?.thumbnail}
                                            alt={selectedBooking.service?.name}
                                            className="w-20 h-20 rounded-2xl object-cover border border-white/10 shadow-lg"
                                        />
                                        <div>
                                            <h3 className="font-black text-xl text-white uppercase tracking-tight mb-1">{selectedBooking.service?.name}</h3>
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 text-orange-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-orange-500/20">
                                                ID: #{selectedBooking.bookingNumber}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                                            <p className="text-[10px] text-orange-500/70 uppercase font-black tracking-widest mb-2">Schedule</p>
                                            <div className="flex items-center gap-3 text-white font-bold text-sm">
                                                <Calendar size={16} className="text-orange-500" />
                                                {new Date(selectedBooking.dateTime).toDateString()}
                                            </div>
                                            <div className="flex items-center gap-3 text-white font-bold text-sm mt-2">
                                                <Clock size={16} className="text-orange-500" />
                                                {new Date(selectedBooking.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                                            <p className="text-[10px] text-orange-500/70 uppercase font-black tracking-widest mb-2">status & Payment</p>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/10 ${getStatusColor(selectedBooking.bookingStatus)}`}>
                                                    {selectedBooking.bookingStatus?.name || 'Pending'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-white font-bold text-sm">
                                                <CheckCircle size={16} className="text-emerald-400" />
                                                <span className="capitalize">{selectedBooking.paymentMethod || 'Gold Membership'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Service Address */}
                                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                                        <p className="text-[10px] text-orange-500/70 uppercase font-black tracking-widest mb-3">Target Location</p>
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center shrink-0">
                                                <MapPin size={20} className="text-orange-500" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-sm mb-1">{selectedBooking.address?.addressLine1}</p>
                                                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{selectedBooking.address?.city}, {selectedBooking.address?.state}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                                        <p className="text-[10px] text-orange-500/70 uppercase font-black tracking-widest mb-6">Execution Log</p>
                                        {loadingTimeline ? (
                                            <div className="flex justify-center py-4">
                                                <Loader className="animate-spin text-orange-500" size={20} />
                                            </div>
                                        ) : timeline.length === 0 ? (
                                            <p className="text-xs text-gray-500 text-center py-2 font-bold uppercase tracking-widest">No log entries found</p>
                                        ) : (
                                            <div className="relative space-y-6">
                                                <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-white/10"></div>
                                                {timeline.map((item, index) => (
                                                    <div key={item.id} className="flex gap-4 relative z-10">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shadow-lg border-2 border-slate-900 ${['Completed', 'Confirmed'].includes(item.status) ? 'bg-emerald-500' :
                                                            ['Cancelled', 'Rejected'].includes(item.status) ? 'bg-red-500' : 'bg-orange-500'
                                                            }`}>
                                                            {index + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-black text-white text-sm uppercase tracking-tight">{item.status}</p>
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                                                                {new Date(item.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                            {item.note && <p className="text-xs text-gray-500 mt-2 p-2 bg-white/5 rounded-lg border border-white/5 italic">"{item.note}"</p>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Price Breakup */}
                                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                                        <p className="text-[10px] text-orange-500/70 uppercase font-black tracking-widest mb-2">Financial Summary</p>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
                                                <span>Base Premium</span>
                                                <span className="text-white">₹{selectedBooking.servicePrice || selectedBooking.service?.price}</span>
                                            </div>
                                            {(selectedBooking.discount > 0 || selectedBooking.discountAmount > 0) && (
                                                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-emerald-400">
                                                    <span>Privilege Discount</span>
                                                    <span>-₹{selectedBooking.discount || selectedBooking.discountAmount}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
                                                <span>Logistics & Platform</span>
                                                <span className="text-white">₹{selectedBooking.platformFees || 0}</span>
                                            </div>
                                            {selectedBooking.tax > 0 && (
                                                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
                                                    <span>Regulatory Tax (GST)</span>
                                                    <span className="text-white">₹{selectedBooking.tax}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center pt-4 border-t border-white/10">
                                                <span className="text-xs font-black uppercase tracking-[2px] text-orange-500">Total Settlement</span>
                                                <span className="text-2xl font-black text-white tracking-tighter">₹{selectedBooking.totalAmount}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Review Section */}
                                    {selectedBooking.bookingStatus?.slug === 'completed' && !selectedBooking.isReviewed && (
                                        <div className="p-6 bg-orange-500/5 border border-orange-500/20 rounded-3xl space-y-6">
                                            <p className="text-[10px] text-orange-500 uppercase font-black tracking-[3px] text-center">Protocol Evaluation</p>
                                            <div className="flex justify-center gap-3">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        onClick={() => setReviewState({ ...reviewState, rating: star })}
                                                        className={`transition-all transform hover:scale-110 ${reviewState.rating >= star ? 'text-orange-500' : 'text-white/10'}`}
                                                    >
                                                        <Star size={36} fill={reviewState.rating >= star ? 'currentColor' : 'none'} strokeWidth={1} />
                                                    </button>
                                                ))}
                                            </div>
                                            <textarea
                                                placeholder="Share your experience with the elite protocol..."
                                                className="w-full p-5 bg-slate-900 border border-white/10 rounded-2xl text-white text-sm font-bold outline-none focus:border-orange-500 transition-all h-28 resize-none"
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
                                                        setMessage({ type: 'success', text: 'Review logged in archives! 🎉' });
                                                        setShowBookingModal(false);
                                                        fetchBookings();
                                                    } catch (err) {
                                                        setMessage({ type: 'error', text: err.message });
                                                    } finally {
                                                        setReviewState({ ...reviewState, loading: false, comment: '' });
                                                    }
                                                }}
                                                disabled={reviewState.loading}
                                                className="w-full py-4 bg-orange-500 text-slate-900 font-black uppercase tracking-widest rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
                                            >
                                                {reviewState.loading ? <Loader className="animate-spin" /> : <Star size={18} />}
                                                Transmit Review
                                            </button>
                                        </div>
                                    )}

                                    {selectedBooking.bookingStatus?.slug === 'completed' && (
                                        <button
                                            onClick={() => downloadInvoice(selectedBooking)}
                                            className="w-full flex items-center justify-center gap-3 py-4 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all"
                                        >
                                            <FileText size={18} className="text-orange-500" />
                                            Acquire Invoice
                                        </button>
                                    )}

                                    {selectedBooking.isReviewed && (
                                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
                                            <div className="inline-flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                                                <CheckCircle size={14} />
                                                Review Successfully Logged
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => setShowBookingModal(false)}
                                        className="w-full py-4 bg-slate-800 text-white/50 font-black uppercase tracking-widest rounded-2xl hover:bg-slate-700 hover:text-white transition-all border border-white/5"
                                    >
                                        Exit Interface
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Confirmation Modal */}
                <ConfirmationModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={handleDeleteAddress}
                    title="ERASE COORDINATES?"
                    message="Are you sure you want to remove this location from the secure archives? This cannot be undone."
                    confirmText="ERASE"
                    cancelText="CANCEL"
                    icon={<Trash2 size={48} className="text-red-500 mb-4" />}
                />
            </div>
        </div>
    );
};

export default Profile;
