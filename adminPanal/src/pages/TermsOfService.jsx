import React from 'react';
import { FileText, AlertTriangle, Scale, Lock, Mail } from 'lucide-react';

const TermsOfService = () => {
    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">
                        Terms of Service
                    </h1>
                    <p className="text-lg text-gray-600">
                        Last updated: December 25, 2024
                    </p>
                </div>

                <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                    {/* Introduction */}
                    <div className="p-8 border-b border-gray-100">
                        <p className="text-gray-600 leading-relaxed">
                            These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and NakaeWorks ("we," "us," or "our"), concerning your access to and use of the NakaeWorks application and website.
                        </p>
                    </div>

                    {/* Content Sections */}
                    <div className="p-8 space-y-8">
                        {/* 1. Agreement to Terms */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
                                    <FileText size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">1. Agreement to Terms</h2>
                            </div>
                            <div className="pl-14">
                                <p className="text-gray-600">
                                    By accessing the Site, you agree that you have read, understood, and agreed to be bound by all of these Terms of Use. If you do not agree with all of these terms of use, then you are expressly prohibited from using the Site and you must discontinue use immediately.
                                </p>
                            </div>
                        </section>

                        {/* 2. User Accounts */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                    <Lock size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">2. User Accounts</h2>
                            </div>
                            <div className="pl-14">
                                <p className="text-gray-600 mb-4">
                                    When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
                                </p>
                                <p className="text-gray-600">
                                    You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service.
                                </p>
                            </div>
                        </section>

                        {/* 3. Prohibited Activities */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-red-100 rounded-lg text-red-600">
                                    <AlertTriangle size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">3. Prohibited Activities</h2>
                            </div>
                            <div className="pl-14">
                                <p className="text-gray-600 mb-4">
                                    You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us. As a user of the Site, you agree not to:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                                    <li>Systematically retrieve data or other content from the Site to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</li>
                                    <li>Make any unauthorized use of the Site, including collecting usernames and/or email addresses of users by electronic or other means for the purpose of sending unsolicited email.</li>
                                    <li>Advertise or offer to sell goods and services without our express written consent.</li>
                                    <li>Engage in unauthorized framing of or linking to the Site.</li>
                                </ul>
                            </div>
                        </section>

                        {/* 4. Limitation of Liability */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
                                    <Scale size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">4. Limitation of Liability</h2>
                            </div>
                            <div className="pl-14">
                                <p className="text-gray-600">
                                    In no event shall NakaeWorks, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
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
                                    In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at:
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

export default TermsOfService;
