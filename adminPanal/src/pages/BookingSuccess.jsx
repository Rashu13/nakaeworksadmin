import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, MapPin, ArrowRight, Home, FileText, IndianRupee, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const BookingSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { bookingNumber, service, date, time, amount, services } = location.state || {};

    if (!bookingNumber) {
        navigate('/');
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0f1c] pt-32 pb-24 flex items-center justify-center p-4 transition-colors duration-300">
            <div className="max-w-xl w-full">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 md:p-12 text-center border border-gray-100 dark:border-white/5"
                >
                    {/* Success Icon */}
                    <div className="relative w-20 h-20 mx-auto mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                            className="w-full h-full bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center"
                        >
                            <CheckCircle className="text-emerald-600 dark:text-emerald-500" size={40} />
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Booking Confirmed!
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mb-8">
                            Your service has been successfully scheduled. We've sent the details to your email.
                        </p>
                    </motion.div>

                    {/* Booking Reference */}
                    <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-6 mb-8 border border-gray-100 dark:border-white/5">
                        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 block">Booking Reference</span>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-widest uppercase">
                            {bookingNumber}
                        </p>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="text-left p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Service</span>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">
                                {services?.length > 1 ? `${services.length} Items` : service?.name}
                            </p>
                        </div>
                        <div className="text-left p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Scheduled For</span>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                {new Date(date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}, {time}
                            </p>
                        </div>
                    </div>

                    {/* Total Amount */}
                    <div className="flex items-center justify-between py-4 border-t border-b border-gray-100 dark:border-white/5 mb-10">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Amount Paid</span>
                        <div className="flex items-center gap-1 text-gray-900 dark:text-white">
                            <IndianRupee size={18} className="text-gray-400" />
                            <span className="text-2xl font-bold">{amount}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            to="/profile"
                            state={{ activeTab: 'bookings' }}
                            className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition-all shadow-lg active:scale-95 text-sm"
                        >
                            Track Booking
                        </Link>
                        <Link
                            to="/"
                            className="flex-1 py-4 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-white font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all active:scale-95 text-sm"
                        >
                            Return Home
                        </Link>
                    </div>
                </motion.div>

                {/* Footer Note */}
                <div className="flex items-center justify-center gap-2 mt-8 text-gray-400 dark:text-gray-600">
                    <ShieldCheck size={16} />
                    <p className="text-[10px] font-semibold uppercase tracking-widest">Secure Reservation</p>
                </div>
            </div>
        </div>
    );
};

export default BookingSuccess;
