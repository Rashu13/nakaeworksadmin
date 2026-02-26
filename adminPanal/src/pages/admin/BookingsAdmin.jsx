import React, { useState, useEffect } from 'react';
import { Search, Eye, Filter, Calendar, DollarSign, User, Briefcase, FileText } from 'lucide-react';
import { bookingService, adminService } from '../../services/api';
import { format } from 'date-fns';
import Toast from '../../components/Toast';

const BookingsAdmin = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [providers, setProviders] = useState([]);
    const [showProviderSelect, setShowProviderSelect] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState('');
    const [loadingProviders, setLoadingProviders] = useState(false);

    const [statusUpdating, setStatusUpdating] = useState(false);
    const [toast, setToast] = useState(null); // { message, type }

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await adminService.getBookings();
            setBookings(response.bookings || response || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProviders = async () => {
        if (providers.length > 0) return;
        try {
            setLoadingProviders(true);
            const data = await bookingService.getAll(); // Using getAll approach but filtering for providers might be better done via adminService.getUsers('provider')
            // Actually, let's use adminService if available, or just fetch all providers
            // Assuming adminService.getUsers('provider') is the best way
            // We need to import adminService
        } catch (error) {
            console.error(error);
        }
    };

    const handleAssignProvider = async () => {
        if (!selectedProvider || !selectedBooking) return;
        try {
            await adminService.assignProvider(selectedBooking.id, selectedProvider);
            // Refresh bookings
            fetchBookings();
            setShowModal(false);
            setShowProviderSelect(false);
            setSelectedProvider('');
            setToast({ message: 'Provider assigned successfully', type: 'success' });
        } catch (error) {
            console.error(error);
            setToast({ message: error.message || 'Failed to assign provider', type: 'error' });
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        if (!selectedBooking) return;
        try {
            setStatusUpdating(true);
            await adminService.updateBookingStatus(selectedBooking.id, newStatus);
            // Refresh bookings and close modal or update local state
            fetchBookings();
            // Optional: update selectedBooking locally if keeping modal open
            setSelectedBooking(prev => ({
                ...prev,
                status: { ...prev.status, slug: newStatus, name: newStatus.charAt(0).toUpperCase() + newStatus.slice(1) } // quick hack for name
            }));

            // Or just close modal
            // setShowModal(false); 
            setToast({ message: 'Status updated successfully', type: 'success' });
        } catch (error) {
            console.error(error);
            setToast({ message: error.message || 'Failed to update status', type: 'error' });
        } finally {
            setStatusUpdating(false);
        }
    };

    const handleViewDetails = async (booking) => {
        setSelectedBooking(booking);
        setShowModal(true);
        // Pre-fetch providers when modal opens
        try {
            const data = await adminService.getUsers('provider');
            setProviders(data.users || []);
        } catch (error) {
            console.error("Failed to fetch providers", error);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
        };
        return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-700 dark:text-gray-300';
    };

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch =
            booking.bookingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.consumer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.provider?.name.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === '' || booking.status?.slug === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-900 dark:text-white">Bookings</h1>
                    <p className="text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400">Manage all service bookings</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-100 dark:bg-slate-800 rounded-xl shadow-sm mb-6 border border-gray-100 dark:border-slate-700">
                <div className="p-4 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by ID, customer or provider..."
                            className="w-full pl-12 pr-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-900 dark:text-white placeholder-gray-400"
                        />
                    </div>
                    <div className="flex gap-2 relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none appearance-none pr-10 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-700 dark:text-gray-300"
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none" size={16} />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 uppercase">Booking ID</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 uppercase">Service</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 uppercase">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 uppercase">Provider</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 uppercase">Amount</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-10 text-center">
                                        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    </td>
                                </tr>
                            ) : filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400">
                                        No bookings found
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-900 dark:text-white">
                                            {booking.bookingNumber}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-700 dark:text-gray-300">
                                            {booking.service?.name}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-700 dark:text-gray-300">
                                            {booking.consumer?.name}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-700 dark:text-gray-300">
                                            {booking.provider?.name}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-600 dark:text-gray-400 space-y-1">
                                            <div className="text-sm">
                                                {format(new Date(booking.dateTime), 'MMM dd, yyyy')}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400">
                                                {format(new Date(booking.dateTime), 'hh:mm a')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {booking.provider ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-700 dark:text-gray-300">
                                                        {booking.provider.name.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-700 dark:text-gray-300">{booking.provider.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-red-500 italic">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-md capitalize ${getStatusColor(booking.status?.slug)}`}>
                                                {booking.status?.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-slate-900 dark:text-white">
                                            ₹{booking.totalAmount}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleViewDetails(booking)}
                                                className="p-2 text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Details Modal */}
            {showModal && selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white dark:bg-gray-100 dark:bg-slate-800 rounded-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-slate-700 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-900 dark:text-white">Booking Details</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-600 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-700 dark:text-gray-300">
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Service Info */}
                            <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg border border-gray-100 dark:border-slate-600">
                                <h3 className="font-semibold text-gray-900 dark:text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                    <Briefcase size={18} /> Service Info
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <p><span className="text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400">Service:</span> <span className="text-gray-700 dark:text-gray-200">{selectedBooking.service?.name}</span></p>
                                    <p><span className="text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400">Booking ID:</span> <span className="text-gray-700 dark:text-gray-200">{selectedBooking.bookingNumber}</span></p>
                                    <p><span className="text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400">Date:</span> <span className="text-gray-700 dark:text-gray-200">{format(new Date(selectedBooking.dateTime), 'PPpp')}</span></p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400">Status:</span>
                                        <select
                                            value={selectedBooking.status?.slug}
                                            onChange={(e) => handleStatusUpdate(e.target.value)}
                                            disabled={statusUpdating}
                                            className={`px-3 py-1 text-sm border border-transparent font-medium rounded-lg capitalize outline-none cursor-pointer ${getStatusColor(selectedBooking.status?.slug)}`}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="in_progress">On Going</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg border border-gray-100 dark:border-slate-600">
                                <h3 className="font-semibold text-gray-900 dark:text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                    <DollarSign size={18} /> Payment
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <p><span className="text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400">Total Amount:</span> <span className="font-medium text-gray-900 dark:text-slate-900 dark:text-white">₹{selectedBooking.totalAmount}</span></p>
                                    <p><span className="text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400">Subtotal:</span> <span className="text-gray-700 dark:text-gray-200">₹{selectedBooking.subtotal}</span></p>
                                    <p><span className="text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400">Discount:</span> <span className="text-gray-700 dark:text-gray-200">₹{selectedBooking.discount}</span></p>
                                    <p><span className="text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400">Method:</span> <span className="uppercase text-gray-700 dark:text-gray-200">{selectedBooking.paymentMethod}</span></p>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg border border-gray-100 dark:border-slate-600">
                                <h3 className="font-semibold text-gray-900 dark:text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                    <User size={18} /> Customer
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <p><span className="text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400">Name:</span> <span className="text-gray-700 dark:text-gray-200">{selectedBooking.consumer?.name}</span></p>
                                    <p><span className="text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400">Email:</span> <span className="text-gray-700 dark:text-gray-200">{selectedBooking.consumer?.email}</span></p>
                                    <p><span className="text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400">Phone:</span> <span className="text-gray-700 dark:text-gray-200">{selectedBooking.consumer?.phone || 'N/A'}</span></p>
                                </div>
                            </div>

                            {/* Address Info */}
                            <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg border border-gray-100 dark:border-slate-600">
                                <h3 className="font-semibold text-gray-900 dark:text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                    <FileText size={18} /> Location
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <p><span className="text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400">Address:</span> <span className="text-gray-700 dark:text-gray-200">{selectedBooking.address?.addressLine1}</span></p>
                                    <p><span className="text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400">City:</span> <span className="text-gray-700 dark:text-gray-200">{selectedBooking.address?.city}, {selectedBooking.address?.state}</span></p>
                                    <p><span className="text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400">Pincode:</span> <span className="text-gray-700 dark:text-gray-200">{selectedBooking.address?.pincode}</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Provider Assignment Section */}
                        <div className="mt-6 bg-slate-50 dark:bg-slate-900/20 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-gray-900 dark:text-slate-900 dark:text-white flex items-center gap-2">
                                    <Briefcase size={18} /> Assigned Provider
                                </h3>
                                {!showProviderSelect && (
                                    <button
                                        onClick={() => setShowProviderSelect(true)}
                                        className="text-sm text-slate-900 font-medium hover:underline"
                                    >
                                        {selectedBooking.provider ? 'Change Provider' : 'Assign Provider'}
                                    </button>
                                )}
                            </div>

                            {!showProviderSelect ? (
                                <div className="text-sm">
                                    {selectedBooking.provider ? (
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${selectedBooking.provider.name}&background=random`}
                                                className="w-10 h-10 rounded-full"
                                                alt=""
                                            />
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-slate-900 dark:text-white">{selectedBooking.provider.name}</p>
                                                <p className="text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400">{selectedBooking.provider.phone}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 italic">No provider assigned yet.</p>
                                    )}
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <select
                                        value={selectedProvider}
                                        onChange={(e) => setSelectedProvider(e.target.value)}
                                        className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-900 dark:text-white"
                                    >
                                        <option value="">Select a provider...</option>
                                        {providers.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handleAssignProvider}
                                        disabled={!selectedProvider}
                                        className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium disabled:opacity-50"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setShowProviderSelect(false)}
                                        className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        {selectedBooking.description && (
                            <div className="mt-6 bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg border border-gray-100 dark:border-slate-600">
                                <h3 className="font-semibold text-gray-900 dark:text-slate-900 dark:text-white mb-2">Description / Notes</h3>
                                <p className="text-sm text-gray-700 dark:text-gray-700 dark:text-gray-300">{selectedBooking.description}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default BookingsAdmin;
