import React from 'react';
import { Users, Target, Shield, Zap } from 'lucide-react';

const About = () => {
    return (
        <div className="bg-gray-50 dark:bg-gray-50 dark:bg-[#0a0d14] min-h-screen pt-32 pb-12 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-slate-900 dark:text-white mb-6">
                        About <span className="text-primary-500">NakaeWorks</span>
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                        Your trusted platform for premium home services. We connect skilled professionals with customers who need elite, reliable, and swift service delivery.
                    </p>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-900 dark:text-white mb-4">
                            Our Mission
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-600 dark:text-gray-400 leading-relaxed">
                            At NakaeWorks, our mission is to redefine the home service industry by bringing transparency, quality, and professionalism to your doorstep. We carefully vet our service providers to ensure that every job meets the highest standards of excellence.
                        </p>
                        <p className="text-lg text-gray-600 dark:text-gray-600 dark:text-gray-400 leading-relaxed">
                            Whether it’s a quick repair, a deep cleaning, or a complex installation, our platform is designed to make the process as seamless and stress-free as possible for both our customers and our partners.
                        </p>
                    </div>
                    <div className="rounded-3xl overflow-hidden shadow-2xl relative group">
                        <div className="absolute inset-0 bg-primary-500/10 group-hover:bg-primary-500/0 transition-colors duration-500 z-10"></div>
                        <img
                            src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop"
                            alt="Professional Services"
                            className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                </div>

                {/* Values Section */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-slate-900 dark:text-white mb-12">
                        Why Choose Us
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Value 1 */}
                        <div className="bg-white dark:bg-white dark:bg-slate-900/40 p-8 rounded-3xl border border-gray-100 dark:border-gray-200 dark:border-white/5 shadow-xl hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-14 h-14 bg-primary-100 dark:bg-primary-500/10 rounded-2xl flex items-center justify-center mb-6">
                                <Shield className="text-primary-500" size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-slate-900 dark:text-white mb-3">Verified Experts</h3>
                            <p className="text-gray-600 dark:text-gray-600 dark:text-gray-400">Every professional on our platform undergoes strict background checks and skill assessments.</p>
                        </div>
                        {/* Value 2 */}
                        <div className="bg-white dark:bg-white dark:bg-slate-900/40 p-8 rounded-3xl border border-gray-100 dark:border-gray-200 dark:border-white/5 shadow-xl hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
                                <Zap className="text-blue-500" size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-slate-900 dark:text-white mb-3">Fast Response</h3>
                            <p className="text-gray-600 dark:text-gray-600 dark:text-gray-400">Get your tasks done quickly with our streamlined booking and rapid dispatch system.</p>
                        </div>
                        {/* Value 3 */}
                        <div className="bg-white dark:bg-white dark:bg-slate-900/40 p-8 rounded-3xl border border-gray-100 dark:border-gray-200 dark:border-white/5 shadow-xl hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6">
                                <Target className="text-emerald-500" size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-slate-900 dark:text-white mb-3">High Quality</h3>
                            <p className="text-gray-600 dark:text-gray-600 dark:text-gray-400">We guarantee satisfaction with a focus on meticulous attention to detail on every job.</p>
                        </div>
                        {/* Value 4 */}
                        <div className="bg-white dark:bg-white dark:bg-slate-900/40 p-8 rounded-3xl border border-gray-100 dark:border-gray-200 dark:border-white/5 shadow-xl hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6">
                                <Users className="text-purple-500" size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-slate-900 dark:text-white mb-3">Customer First</h3>
                            <p className="text-gray-600 dark:text-gray-600 dark:text-gray-400">Our customer support team is always ready to assist you, ensuring a seamless experience.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
