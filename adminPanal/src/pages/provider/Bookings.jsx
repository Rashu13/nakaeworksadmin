import React, { useState, useEffect } from 'react';
import {
    Calendar, Clock, MapPin, Phone, User, CheckCircle, XCircle,
    Play, Loader, ChevronDown, Search, Filter, AlertTriangle
} from 'lucide-react';
import { providerService, BASE_URL } from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';

const statusTabs = [
    { key: 'all', label: 'All Bookings' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' }
];

const Bookings = () => {
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [actionLoading, setActionLoading] = useState(null);

    // Modal states
    const [completionModalOpen, setCompletionModalOpen] = useState(false);
    const [bookingToComplete, setBookingToComplete] = useState(null);

    const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
    const [bookingToReject, setBookingToReject] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', type: 'info' });

    useEffect(() => {
        fetchBookings();
    }, [activeTab]);

    const fetchBookings = async (page = 1) => {
        setLoading(true);
        try {
            const status = activeTab === 'all' ? '' : activeTab;
            const response = await providerService.getBookings({ status, page });
            if (response.data) {
                setBookings(response.data.bookings);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error('Fetch bookings error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (bookingId) => {
        setActionLoading(bookingId);
        try {
            await providerService.acceptBooking(bookingId);
            fetchBookings();
        } catch (error) {
            console.error('Accept error:', error);
            setAlertConfig({
                isOpen: true,
                title: 'Accept Failed',
                message: 'Failed to accept booking. Please try again.',
                type: 'danger'
            });
        } finally {
            setActionLoading(null);
        }
    };

    const confirmReject = (bookingId) => {
        setBookingToReject(bookingId);
        setRejectionReason('');
        setRejectionModalOpen(true);
    };

    const handleReject = async () => {
        if (!bookingToReject) return;

        setActionLoading(bookingToReject);
        try {
            await providerService.rejectBooking(bookingToReject, rejectionReason);
            fetchBookings();
        } catch (error) {
            console.error('Reject error:', error);
            setAlertConfig({
                isOpen: true,
                title: 'Reject Failed',
                message: 'Failed to reject booking. Please try again.',
                type: 'danger'
            });
        } finally {
            setActionLoading(null);
            setRejectionModalOpen(false);
            setBookingToReject(null);
        }
    };

    const handleStart = async (bookingId) => {
        setActionLoading(bookingId);
        try {
            await providerService.startService(bookingId);
            fetchBookings();
        } catch (error) {
            console.error('Start error:', error);
            setAlertConfig({
                isOpen: true,
                title: 'Start Failed',
                message: 'Failed to start service. Please try again.',
                type: 'danger'
            });
        } finally {
            setActionLoading(null);
        }
    };

    const confirmComplete = (bookingId) => {
        setBookingToComplete(bookingId);
        setCompletionModalOpen(true);
    };

    const handleComplete = async () => {
        if (!bookingToComplete) return;

        setActionLoading(bookingToComplete);
        try {
            await providerService.completeBooking(bookingToComplete);
            fetchBookings();
        } catch (error) {
            console.error('Complete error:', error);
            setAlertConfig({
                isOpen: true,
                title: 'Complete Failed',
                message: 'Failed to complete booking. Please try again.',
                type: 'danger'
            });
        } finally {
            setActionLoading(null);
            setCompletionModalOpen(false);
            setBookingToComplete(null);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'confirmed': 'bg-blue-100 text-blue-700 border-blue-200',
            'in_progress': 'bg-purple-100 text-purple-700 border-purple-200',
            'completed': 'bg-green-100 text-green-700 border-green-200',
            'cancelled': 'bg-red-100 text-red-700 border-red-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const renderActions = (booking) => {
        const isLoading = actionLoading === booking.id;
        const statusSlug = booking.status?.slug;

        if (statusSlug === 'pending') {
            return (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleAccept(booking.id)}
                        disabled={isLoading}
                        className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Accept
                    </button>
                    <button
                        onClick={() => confirmReject(booking.id)}
                        disabled={isLoading}
                        className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        <XCircle className="w-4 h-4" />
                        Reject
                    </button>
                </div>
            );
        }

        if (statusSlug === 'confirmed') {
            return (
                <button
                    onClick={() => handleStart(booking.id)}
                    disabled={isLoading}
                    className="flex items-center gap-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                    {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    Start Service
                </button>
            );
        }

        if (statusSlug === 'in_progress') {
            return (
                <button
                    onClick={() => confirmComplete(booking.id)}
                    disabled={isLoading}
                    className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                    {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Complete
                </button>
            );
        }

        return null;
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
                <p className="text-gray-600">Manage your service bookings</p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1 flex overflow-x-auto">
                {statusTabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.key
                            ? 'bg-emerald-500 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Bookings List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader className="w-8 h-8 animate-spin text-emerald-600" />
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
                        <p className="text-gray-500">Bookings will appear here when customers book your services</p>
                    </div>
                ) : (
                    bookings.map((booking) => (
                        <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    {/* Customer Info */}
                                    <div className="flex items-start gap-4">
                                        <img
                                            src={booking.consumer?.avatar
                                                ? (booking.consumer.avatar.startsWith('http')
                                                    ? booking.consumer.avatar
                                                    : `${BASE_URL}${booking.consumer.avatar}`)
                                                : `https://ui-avatars.com/api/?name=${booking.consumer?.name}&background=10b981&color=fff`
                                            }
                                            alt={booking.consumer?.name}
                                            className="w-14 h-14 rounded-xl object-cover"
                                        />
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-gray-900">{booking.consumer?.name}</h3>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(booking.status?.slug)}`}>
                                                    {booking.status?.name}
                                                </span>
                                            </div>
                                            <p className="text-emerald-600 font-medium">{booking.service?.name}</p>
                                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Phone className="w-4 h-4" />
                                                    {booking.consumer?.phone || 'Not provided'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(booking.dateTime).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {new Date(booking.dateTime).toLocaleTimeString('en-IN', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price & Actions */}
                                    <div className="flex flex-col lg:items-end gap-3">
                                        <p className="text-2xl font-bold text-gray-900">₹{parseFloat(booking.totalAmount).toLocaleString()}</p>
                                        {renderActions(booking)}
                                    </div>
                                </div>

                                {/* Address */}
                                {booking.address && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <div className="flex items-start gap-2 text-gray-600">
                                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">
                                                {booking.address.addressLine1}, {booking.address.city}
                                                {booking.address.state && `, ${booking.address.state}`}
                                                {booking.address.pincode && ` - ${booking.address.pincode}`}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex justify-center gap-2">
                    {Array.from({ length: pagination.pages }, (_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => fetchBookings(i + 1)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${pagination.page === i + 1
                                ? 'bg-emerald-500 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}
            {/* Completion Modal */}
            <ConfirmationModal
                isOpen={completionModalOpen}
                onClose={() => setCompletionModalOpen(false)}
                onConfirm={handleComplete}
                title="Complete Booking?"
                message="Are you sure you want to mark this booking as complete? This will calculate the final amount."
                confirmText="Complete"
                cancelText="Cancel"
                type="info"
                icon={<CheckCircle size={48} className="text-emerald-500 mb-4" />}
            />

            {/* Rejection Modal */}
            {rejectionModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setRejectionModalOpen(false)}></div>
                    <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                                <AlertTriangle size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Reject Booking?</h3>
                            <p className="text-gray-500 mt-2">
                                Please provide a reason for rejecting this booking. This will be visible to the customer.
                            </p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Reason (Optional)</label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none resize-none"
                                rows={3}
                                placeholder="e.g., Schedule conflict, Service not available..."
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setRejectionModalOpen(false)}
                                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors shadow-sm shadow-red-200"
                            >
                                Reject Booking
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Alert Modal */}
            <ConfirmationModal
                isOpen={alertConfig.isOpen}
                onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
                onConfirm={() => setAlertConfig({ ...alertConfig, isOpen: false })}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                confirmText="OK"
                cancelText={null}
            />
        </div>
    );
};

export default Bookings;
