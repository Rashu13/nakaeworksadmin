import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import api from '../services/api';

const Footer = () => {
    const [settings, setSettings] = useState({
        support_email: 'support@nakaeworks.com',
        support_phone: '+91 98765 43210'
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await api.settings.getAll();
                const settingsMap = {};
                data.forEach(item => {
                    settingsMap[item.key] = item.value;
                });
                setSettings(prev => ({
                    ...prev,
                    ...settingsMap
                }));
            } catch (err) {
                console.error("Failed to load footer settings:", err);
            }
        };
        fetchSettings();
    }, []);

    return (
        <footer className="bg-[#0a0f1c] text-gray-400 border-t border-white/5">
            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Company Info */}
                    <div>
                        <Link to="/" className="flex items-center gap-2 mb-6">
                            <img src="/logo-white-footer.png" alt="NakaeWorks" className="h-12 w-auto object-contain" />
                        </Link>
                        <p className="text-gray-400 mb-6 font-medium leading-relaxed">
                            Your trusted platform for all home services. Book professional help for cleaning,
                            repair, beauty, and more.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 bg-white/5 hover:bg-primary-500 rounded-full flex items-center justify-center transition-colors text-white hover:text-black">
                                <Facebook size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 bg-white/5 hover:bg-primary-500 rounded-full flex items-center justify-center transition-colors text-white hover:text-black">
                                <Twitter size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 bg-white/5 hover:bg-primary-500 rounded-full flex items-center justify-center transition-colors text-white hover:text-black">
                                <Instagram size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 bg-white/5 hover:bg-primary-500 rounded-full flex items-center justify-center transition-colors text-white hover:text-black">
                                <Linkedin size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-6 tracking-wide">Quick Links</h3>
                        <ul className="space-y-3 font-medium">
                            <li><Link to="/services" className="hover:text-primary-400 transition-colors">All Services</Link></li>
                            <li><Link to="/providers" className="hover:text-primary-400 transition-colors">Our Providers</Link></li>
                            <li><Link to="/about" className="hover:text-primary-400 transition-colors">About Us</Link></li>
                            <li><Link to="/contact" className="hover:text-primary-400 transition-colors">Contact Us</Link></li>
                            <li><Link to="/blog" className="hover:text-primary-400 transition-colors">Blog</Link></li>
                        </ul>
                    </div>

                    {/* Popular Services */}
                    <div>
                        <h3 className="text-white font-semibold mb-6 tracking-wide">Popular Services</h3>
                        <ul className="space-y-3 font-medium">
                            <li><Link to="/services?category=cleaning" className="hover:text-primary-400 transition-colors">Home Cleaning</Link></li>
                            <li><Link to="/services?category=electrician" className="hover:text-primary-400 transition-colors">AC Repair</Link></li>
                            <li><Link to="/services?category=salon" className="hover:text-primary-400 transition-colors">Salon at Home</Link></li>
                            <li><Link to="/services?category=plumber" className="hover:text-primary-400 transition-colors">Plumbing</Link></li>
                            <li><Link to="/services?category=carpenter" className="hover:text-primary-400 transition-colors">Carpentry</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-white font-semibold mb-6 tracking-wide">Contact Us</h3>
                        <ul className="space-y-4 font-medium">
                            <li className="flex items-start gap-3">
                                <MapPin size={18} className="text-primary-400 mt-1 flex-shrink-0" />
                                <span className="text-gray-300">Hisar Road, Sirsa, Haryana - 125055</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={18} className="text-primary-400 flex-shrink-0" />
                                <span className="text-gray-300">{settings.support_phone}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={18} className="text-primary-400 flex-shrink-0" />
                                <span className="break-all text-gray-300">{settings.support_email}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-500 font-medium">
                        © 2024 NakaeWorks. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm font-semibold">
                        <Link to="/privacy" className="hover:text-primary-400 transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-primary-400 transition-colors">Terms of Service</Link>
                        <Link to="/refund" className="hover:text-primary-400 transition-colors">Refund Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
