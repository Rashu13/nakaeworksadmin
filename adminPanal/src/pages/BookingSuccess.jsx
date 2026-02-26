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
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0d14] pt-32 pb-24 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
            {/* Background Aesthetic Elements */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-2xl w-full relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="bg-white dark:bg-white/[0.02] backdrop-blur-xl rounded-[3rem] shadow-2xl p-10 md:p-14 text-center border border-gray-100 dark:border-white/10 relative overflow-hidden"
                >
                    {/* Inner Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] pointer-events-none" />

                    {/* Success Animation Container */}
                    <div className="relative w-32 h-32 mx-auto mb-10">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                            className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl"
                        />
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                            className="relative w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_40px_rgba(16,185,129,0.3)] border-2 border-white/20"
                        >
                            <CheckCircle className="text-white" size={60} strokeWidth={2.5} />
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter">
                            MISSION <span className="text-emerald-500">ACCOMPLISHED</span>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium text-lg mb-12 max-w-sm mx-auto leading-relaxed">
                            Your professional service deployment has been successfully scheduled and encrypted.
                        </p>
                    </motion.div>

                    {/* Booking Identity */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-gray-50 dark:bg-white/5 rounded-3xl p-8 mb-10 border border-gray-100 dark:border-white/10 relative group"
                    >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#1a1c22] px-6 py-1 rounded-full border border-gray-100 dark:border-white/10">
                            <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[3px]">Protocol ID</span>
                        </div>
                        <p className="text-4xl md:text-5xl font-black text-emerald-500 tracking-widest font-mono group-hover:scale-105 transition-transform duration-500">
                            {bookingNumber}
                        </p>
                    </motion.div>

                    {/* Deployment Parameters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="text-left p-6 bg-gray-50 dark:bg-white/5 rounded-[2rem] border border-gray-100 dark:border-white/10 flex items-start gap-5"
                        >
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/20">
                                <FileText className="text-emerald-500" size={24} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-1">Booked Units</p>
                                {services?.length > 1 ? (
                                    <div className="space-y-1">
                                        {services.map((s, idx) => (
                                            <p key={idx} className="font-black text-gray-900 dark:text-white text-sm truncate uppercase tracking-tight">{s.name}</p>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="font-black text-gray-900 dark:text-white text-sm truncate uppercase tracking-tight">{service?.name}</p>
                                )}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 }}
                            className="text-left p-6 bg-gray-50 dark:bg-white/5 rounded-[2rem] border border-gray-100 dark:border-white/10 flex items-start gap-5"
                        >
                            <div className="w-12 h-12 bg-primary-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-primary-500/20">
                                <Calendar className="text-primary-500" size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-1">Execution Slot</p>
                                <p className="font-black text-gray-900 dark:text-white text-sm uppercase tracking-tight leading-snug">
                                    {new Date(date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                    <br />
                                    <span className="text-primary-500">{time}</span>
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Financial Summary */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="flex items-center justify-between p-8 bg-gray-900 dark:bg-black rounded-[2rem] border border-white/5 shadow-2xl mb-12 shadow-emerald-500/5"
                    >
                        <div className="text-left">
                            <p className="text-[10px] font-black text-primary-500 uppercase tracking-[3px] mb-1">Total Settlement</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Dynamic Pricing Applied</p>
                        </div>
                        <div className="text-right flex items-center gap-2 text-white">
                            <IndianRupee size={28} className="text-primary-500" />
                            <span className="text-4xl font-black tracking-tighter">{amount}</span>
                        </div>
                    </motion.div>

                    {/* Strategic Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
                            <Link
                                to="/profile"
                                state={{ activeTab: 'bookings' }}
                                className="group flex items-center justify-center gap-3 w-full py-5 bg-emerald-500 text-slate-900 font-black uppercase text-xs tracking-[2px] rounded-2xl hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                            >
                                Track Progress
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}>
                            <Link
                                to="/"
                                className="flex items-center justify-center gap-3 w-full py-5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-black uppercase text-xs tracking-[2px] rounded-2xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all active:scale-95"
                            >
                                <Home size={18} />
                                Back to Base
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Footer Security Note */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="flex items-center justify-center gap-3 mt-10 text-gray-400 dark:text-gray-500"
                >
                    <ShieldCheck size={16} className="text-emerald-500" />
                    <p className="text-[10px] font-black uppercase tracking-[3px]">Encrypted Confirmation Sent to Terminal</p>
                </motion.div>
            </div>
        </div>
    );
};

export default BookingSuccess;
