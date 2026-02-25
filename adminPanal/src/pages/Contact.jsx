import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [status, setStatus] = useState(null); // 'success', 'error', null

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically send the data to an API
        console.log('Form Submitted', formData);
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });

        setTimeout(() => setStatus(null), 5000);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="bg-gray-50 dark:bg-[#0a0d14] min-h-screen py-12 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
                        Contact <span className="text-orange-500">Us</span>
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Have a question, feedback, or need support? Our team is here to help you around the clock. Fill out the form below or reach us directly.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Information */}
                    <div className="space-y-8">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                            Get In Touch
                        </h2>

                        <div className="bg-white dark:bg-slate-900/40 p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl hover:-translate-y-1 transition-transform duration-300 flex items-start gap-6">
                            <div className="w-14 h-14 bg-orange-100 dark:bg-orange-500/10 shrink-0 rounded-2xl flex items-center justify-center">
                                <Phone className="text-orange-500" size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Phone</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-1">Call us directly during working hours.</p>
                                <a href="tel:+919876543210" className="text-orange-500 font-semibold hover:underline">+91 98765 43210</a>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900/40 p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl hover:-translate-y-1 transition-transform duration-300 flex items-start gap-6">
                            <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-500/10 shrink-0 rounded-2xl flex items-center justify-center">
                                <Mail className="text-indigo-500" size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Email</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-1">We typically reply within 24 hours.</p>
                                <a href="mailto:support@nakaeworks.com" className="text-indigo-500 font-semibold hover:underline">support@nakaeworks.com</a>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900/40 p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl hover:-translate-y-1 transition-transform duration-300 flex items-start gap-6">
                            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-500/10 shrink-0 rounded-2xl flex items-center justify-center">
                                <MapPin className="text-emerald-500" size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Location</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    NakaeWorks Headquarters, <br />
                                    Hisar Road, Sirsa, Haryana - 125055, India
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white dark:bg-slate-900/40 p-10 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-orange-600/5 blur-[60px] pointer-events-none"></div>

                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                            Send us a Message
                        </h2>

                        {status === 'success' && (
                            <div className="mb-6 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400 p-4 rounded-2xl flex items-center gap-3">
                                <span>Message sent successfully! We'll get back to you soon.</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Your Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 dark:bg-slate-950/50 border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 dark:bg-slate-950/50 border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    required
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 dark:bg-slate-950/50 border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                                    placeholder="How can we help?"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Message</label>
                                <textarea
                                    name="message"
                                    required
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows="5"
                                    className="w-full bg-gray-50 dark:bg-slate-950/50 border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors resize-none"
                                    placeholder="Type your message here..."
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="w-full text-center px-8 py-4 bg-orange-500 text-slate-900 font-extrabold uppercase tracking-widest rounded-2xl hover:bg-orange-600 transition-all shadow-xl hover:shadow-orange-500/20 flex items-center justify-center gap-3 group"
                            >
                                Send Message
                                <Send size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
