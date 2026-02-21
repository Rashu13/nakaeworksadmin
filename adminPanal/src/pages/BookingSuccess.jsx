import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, MapPin, ArrowRight, Home, FileText } from 'lucide-react';

const BookingSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { bookingNumber, service, date, time, amount } = location.state || {};

    if (!bookingNumber) {
        navigate('/');
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 pt-20 flex items-center justify-center p-4 transition-colors duration-200">
            <div className="max-w-md w-full">
                {/* Success Card */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 text-center border border-gray-100 dark:border-gray-700 transition-colors duration-200">
                    {/* Success Icon */}
                    <div className="w-20 h-20 mx-auto mb-6 relative">
                        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-25"></div>
                        <div className="relative w-full h-full bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="text-white" size={40} />
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Booking Confirmed!</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Your service has been successfully booked</p>

                    {/* Booking Number */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 mb-6 border border-gray-100 dark:border-gray-700">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Booking Number</span>
                        <p className="text-2xl font-bold text-slate-900 dark:text-blue-400 tracking-wider font-mono">{bookingNumber}</p>
                    </div>

                    {/* Booking Details */}
                    <div className="text-left space-y-4 mb-8">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-700">
                            <div className="w-10 h-10 bg-slate-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                <FileText size={20} className="text-slate-900 dark:text-white" />
                            </div>
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Service</span>
                                <p className="font-medium text-gray-900 dark:text-white">{service?.name}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-700">
                            <div className="w-10 h-10 bg-slate-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                <Calendar size={20} className="text-slate-900 dark:text-white" />
                            </div>
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Date & Time</span>
                                <p className="font-medium text-gray-900 dark:text-white">{date} at {time}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400">Total Amount</span>
                            <span className="text-xl font-bold text-slate-900 dark:text-white font-mono">₹{amount}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <Link
                            to="/profile"
                            state={{ activeTab: 'bookings' }}
                            className="flex items-center justify-center gap-2 w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                        >
                            View My Bookings
                            <ArrowRight size={18} />
                        </Link>
                        <Link
                            to="/"
                            className="flex items-center justify-center gap-2 w-full py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-[0.98]"
                        >
                            <Home size={18} />
                            Back to Home
                        </Link>
                    </div>
                </div>

                {/* Help Text */}
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6 translate-y-2">
                    A confirmation has been sent to your email and phone.
                    <br />
                    <Link to="/help" className="text-slate-900 dark:text-blue-400 font-medium hover:underline">Need help?</Link>
                </p>
            </div>
        </div>
    );
};

export default BookingSuccess;
