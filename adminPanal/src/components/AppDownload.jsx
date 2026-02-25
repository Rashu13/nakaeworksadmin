import React from 'react';
import { Download, CheckCircle, Star, Lock, Smartphone, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';

const AppDownload = () => {
    return (
        <section className="py-24 px-4 bg-[#0a0f1c] relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-500 rounded-full mix-blend-screen filter blur-[150px] animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600 rounded-full mix-blend-screen filter blur-[120px] animate-pulse"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="text-white"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <Smartphone className="text-primary-500" size={24} />
                            <span className="text-primary-500 text-xs font-black uppercase tracking-[0.3em]">Nakae Mobile</span>
                        </div>

                        <h2 className="text-4xl md:text-6xl font-black mb-8 leading-[1.1] tracking-tight">
                            The future of home services is
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-200 block mt-2">in your pocket.</span>
                        </h2>

                        <p className="text-gray-400 text-lg mb-10 max-w-lg leading-relaxed font-medium">
                            Book instantly, track pros in real-time, and manage everything from the simplest app ever built for home maintenance.
                        </p>

                        {/* Features */}
                        <div className="grid sm:grid-cols-2 gap-6 mb-12">
                            {[
                                { icon: Lock, text: "Verified Protection", color: "text-primary-400", bg: "bg-primary-400/10" },
                                { icon: CheckCircle, text: "2-Tap Booking", color: "text-blue-400", bg: "bg-blue-400/10" },
                                { icon: Star, text: "Exclusive Rewards", color: "text-purple-400", bg: "bg-purple-400/10" },
                                { icon: QrCode, text: "Instant Service", color: "text-green-400", bg: "bg-green-400/10" }
                            ].map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-4 group">
                                    <div className={`w-12 h-12 rounded-2xl ${feature.bg} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                                        <feature.icon size={20} className={feature.color} />
                                    </div>
                                    <span className="text-gray-200 font-bold tracking-tight">{feature.text}</span>
                                </div>
                            ))}
                        </div>

                        {/* Download Buttons */}
                        <div className="flex flex-wrap gap-6 items-center">
                            <motion.a
                                whileHover={{ y: -5 }}
                                href="#"
                                className="flex items-center gap-4 px-8 py-4 bg-white text-black rounded-2xl transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:bg-primary-400"
                            >
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
                                    alt="Apple"
                                    className="w-6 h-6"
                                />
                                <div className="text-left">
                                    <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Store</p>
                                    <p className="font-bold text-lg leading-none">App Store</p>
                                </div>
                            </motion.a>
                            <motion.a
                                whileHover={{ y: -5 }}
                                href="#"
                                className="flex items-center gap-4 px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl transition-all hover:bg-white/10"
                            >
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/d/d0/Google_Play_Arrow_logo.svg"
                                    alt="Play Store"
                                    className="w-6 h-6"
                                />
                                <div className="text-left">
                                    <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Android</p>
                                    <p className="font-bold text-lg leading-none">Play Store</p>
                                </div>
                            </motion.a>
                        </div>
                    </motion.div>

                    {/* Phone Mockup Section */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="flex justify-center relative"
                    >
                        {/* Glow Behind Phone */}
                        <div className="absolute inset-0 bg-primary-500/10 blur-[100px] rounded-full scale-125 pointer-events-none" />

                        <div className="relative">
                            {/* Premium Phone Frame */}
                            <div className="w-[300px] h-[600px] bg-black rounded-[50px] p-4 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-4 border-white/10 relative z-10 overflow-hidden">
                                <div className="w-full h-full bg-[#161b22] rounded-[38px] overflow-hidden relative border border-white/5">
                                    {/* App UI Simulation */}
                                    <img
                                        src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=800&fit=crop"
                                        alt="App Screenshot"
                                        className="w-full h-full object-cover opacity-80"
                                    />
                                    {/* Notch */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-8 bg-black rounded-b-3xl" />
                                </div>
                            </div>

                            {/* Floating Dynamic Elements */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -left-20 top-24 bg-white/10 backdrop-blur-xl rounded-3xl p-4 shadow-2xl border border-white/10 z-20"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-500 rounded-2xl flex items-center justify-center">
                                        <CheckCircle size={20} className="text-black" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Status</p>
                                        <p className="text-sm font-black text-white">Pro on the way!</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -right-16 bottom-40 bg-white/10 backdrop-blur-xl rounded-3xl p-5 shadow-2xl border border-white/10 z-20"
                            >
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} className="fill-primary-500 text-primary-500" />)}
                                    </div>
                                    <p className="text-xs text-white font-bold italic">"Best service experience!"</p>
                                    <p className="text-[10px] text-gray-400 font-medium">- Rahul S.</p>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default AppDownload;

