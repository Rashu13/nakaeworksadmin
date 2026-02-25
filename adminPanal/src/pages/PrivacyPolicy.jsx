import React from 'react';
import { Lock, Eye, FileText, Mail } from 'lucide-react';

const PrivacyPolicy = () => {
    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">
                        Privacy Policy
                    </h1>
                    <p className="text-lg text-gray-600">
                        Last updated: December 25, 2024
                    </p>
                </div>

                <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                    {/* Introduction */}
                    <div className="p-8 border-b border-gray-100">
                        <p className="text-gray-600 leading-relaxed mb-6">
                            At NakaeWorks, we take your privacy seriously. This Privacy Policy explains how we collect, use,
                            disclose, and safeguard your information when you use our mobile application and website.
                            Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy,
                            please do not access the application.
                        </p>
                    </div>

                    {/* Content Sections */}
                    <div className="p-8 space-y-8">
                        {/* 1. Information We Collect */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
                                    <Eye size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">1. Information We Collect</h2>
                            </div>
                            <div className="pl-14">
                                <p className="text-gray-600 mb-4">
                                    We collect information that identifies, relates to, describes, references, is capable of being associated with,
                                    or could reasonably be linked, directly or indirectly, with a particular consumer or device.
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                                    <li><strong>Personal Data:</strong> Name, shipping address, email address, and telephone number.</li>
                                    <li><strong>Derivative Data:</strong> IP address, browser type, operating system, and access times.</li>
                                    <li><strong>Financial Data:</strong> Data related to your payment method (e.g., valid credit card number, card brand, expiration date) is collected by our payment processor. We store only very limited, if any, financial information.</li>
                                    <li><strong>Mobile Device Data:</strong> Mobile device ID, model, and manufacturer, and information about the location of your device, if you grant permission.</li>
                                </ul>
                            </div>
                        </section>

                        {/* 2. Use of Your Information */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                                    <FileText size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">2. Use of Your Information</h2>
                            </div>
                            <div className="pl-14">
                                <p className="text-gray-600 mb-4">
                                    Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                                    <li>Create and manage your account.</li>
                                    <li>Process your payments and refunds.</li>
                                    <li>Email you regarding your account or order.</li>
                                    <li>Fulfill and manage purchases, orders, payments, and other transactions related to the Application.</li>
                                    <li>Generate a personal profile about you to make future visits to the Application more personalized.</li>
                                    <li>Monitor and analyze usage and trends to improve your experience.</li>
                                </ul>
                            </div>
                        </section>

                        {/* 3. Disclosure of Your Information */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                    <Lock size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">3. Disclosure of Your Information</h2>
                            </div>
                            <div className="pl-14">
                                <p className="text-gray-600 mb-4">
                                    We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                                    <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others.</li>
                                    <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.</li>
                                </ul>
                            </div>
                        </section>

                        {/* 4. Security of Your Information */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-red-100 rounded-lg text-red-600">
                                    <Lock size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">4. Security of Your Information</h2>
                            </div>
                            <div className="pl-14">
                                <p className="text-gray-600">
                                    We use administrative, technical, and physical security measures to help protect your personal information.
                                    While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts,
                                    no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                                </p>
                            </div>
                        </section>

                        {/* 5. Contact Us */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                    <Mail size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">5. Contact Us</h2>
                            </div>
                            <div className="pl-14">
                                <p className="text-gray-600 mb-4">
                                    If you have questions or comments about this Privacy Policy, please contact us at:
                                </p>
                                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                    <p className="font-semibold text-gray-900">NakaeWorks Support</p>
                                    <p className="text-gray-600 mt-1">Hisar Road, Sirsa, Haryana - 125055</p>
                                    <p className="text-gray-600 mt-1">Email: support@nakaeworks.com</p>
                                    <p className="text-gray-600 mt-1">Phone: +91 98765 43210</p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
