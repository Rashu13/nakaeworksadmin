import React from 'react';
import { Download, CheckCircle, Star, Shield } from 'lucide-react';

const AppDownload = () => {
    return (
        <section className="py-20 px-4 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-slate-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Content */}
                    <div className="text-white">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            Download Our App for a
                            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent"> Seamless Experience</span>
                        </h2>
                        <p className="text-gray-300 text-lg mb-8">
                            Get instant access to thousands of services, track your bookings in real-time,
                            and enjoy exclusive app-only offers.
                        </p>

                        {/* Features */}
                        <div className="space-y-4 mb-10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <CheckCircle size={18} className="text-green-400" />
                                </div>
                                <span className="text-gray-200">Book services in just 2 taps</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                    <Star size={18} className="text-yellow-400" />
                                </div>
                                <span className="text-gray-200">Real-time tracking & notifications</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                    <Shield size={18} className="text-blue-400" />
                                </div>
                                <span className="text-gray-200">100% secure payments</span>
                            </div>
                        </div>

                        {/* Download Buttons */}
                        <div className="flex flex-wrap gap-4">
                            <a
                                href="#"
                                className="flex items-center gap-3 px-6 py-3 bg-black rounded-xl hover:bg-gray-900 transition-colors"
                            >
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
                                    alt="Apple"
                                    className="w-6 h-6 invert"
                                />
                                <div className="text-left">
                                    <p className="text-xs text-gray-400">Download on the</p>
                                    <p className="font-semibold">App Store</p>
                                </div>
                            </a>
                            <a
                                href="#"
                                className="flex items-center gap-3 px-6 py-3 bg-black rounded-xl hover:bg-gray-900 transition-colors"
                            >
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/d/d0/Google_Play_Arrow_logo.svg"
                                    alt="Play Store"
                                    className="w-6 h-6"
                                />
                                <div className="text-left">
                                    <p className="text-xs text-gray-400">Get it on</p>
                                    <p className="font-semibold">Google Play</p>
                                </div>
                            </a>
                        </div>
                    </div>

                    {/* Phone Mockup */}
                    <div className="flex justify-center">
                        <div className="relative">
                            {/* Phone Frame */}
                            <div className="w-64 h-[500px] bg-gradient-to-b from-gray-800 to-gray-900 rounded-[3rem] p-3 shadow-2xl">
                                <div className="w-full h-full bg-gray-100 rounded-[2.5rem] overflow-hidden relative">
                                    {/* Screen Content */}
                                    <img
                                        src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=600&fit=crop"
                                        alt="App Screenshot"
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Notch */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-b-2xl"></div>
                                </div>
                            </div>

                            {/* Floating Elements */}
                            <div className="absolute -left-16 top-20 bg-white dark:bg-slate-900 rounded-xl p-3 shadow-xl animate-bounce border border-transparent dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                        <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Booking</p>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Confirmed!</p>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -right-12 bottom-32 bg-white dark:bg-slate-900 rounded-xl p-3 shadow-xl animate-pulse border border-transparent dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <Star size={18} className="fill-yellow-400 text-yellow-400" />
                                    <span className="font-bold text-gray-800 dark:text-gray-200">4.9</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Rating</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AppDownload;
