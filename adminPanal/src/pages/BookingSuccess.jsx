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
                    className="bg-white dark:bg-slate-900/60 rounded-[2.5rem] shadow-2xl p-8 md:p-12 text-center border border-gray-200 dark:border-white/10 backdrop-blur-xl"
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
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">
                            Booking Confirmed!
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">
                            Your elite protocol has been scheduled. Intel sent to your comms channel.
                        </p>
                    </motion.div>

                    {/* Booking Reference */}
                    <div className="bg-primary-500/5 dark:bg-primary-500/10 rounded-2xl p-6 mb-8 border border-primary-500/20">
                        <span className="text-[10px] font-black text-primary-500 uppercase tracking-[3px] mb-2 block">Mission Reference</span>
                        <p className="text-2xl font-black text-slate-900 dark:text-white tracking-widest uppercase">
                            #{bookingNumber}
                        </p>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="text-left p-5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10">
                            <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[2px] block mb-2">Assigned Target</span>
                            <p className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">
                                {services?.length > 1 ? `${services.length} Tasks` : service?.name}
                            </p>
                        </div>
                        <div className="text-left p-5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10">
                            <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[2px] block mb-2">Execute At</span>
                            <p className="font-bold text-gray-900 dark:text-white text-sm">
                                {new Date(date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}, {time}
                            </p>
                        </div>
                    </div>

                    {/* Total Amount */}
                    <div className="flex items-center justify-between py-6 border-t border-b border-gray-200 dark:border-white/10 mb-10">
                        <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[2px]">Total Valuation</span>
                        <div className="flex items-center text-primary-500">
                            <span className="text-3xl font-black tracking-tighter">₹{Math.round(amount)}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            to="/profile"
                            state={{ activeTab: 'bookings' }}
                            className="flex-1 py-4 bg-[#0a2357] text-white font-black uppercase tracking-widest rounded-xl hover:bg-[#0c2d6e] transition-all shadow-xl hover:shadow-[#0a2357]/20 flex items-center justify-center text-xs"
                        >
                            Track Mission
                        </Link>
                        <Link
                            to="/"
                            className="flex-1 py-4 bg-gray-100 dark:bg-white/5 text-slate-900 dark:text-white font-black uppercase tracking-widest rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all border border-gray-200 dark:border-white/10 flex items-center justify-center text-xs"
                        >
                            Return To Base
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
