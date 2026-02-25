import React from 'react';
import { RefreshCw, Clock, AlertCircle, Mail } from 'lucide-react';

const RefundPolicy = () => {
    return (
        <div className="bg-gray-50 min-h-screen pt-32 pb-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">
                        Refund & Cancellation Policy
                    </h1>
                    <p className="text-lg text-gray-600">
                        Last updated: December 25, 2024
                    </p>
                </div>

                <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                    {/* Introduction */}
                    <div className="p-8 border-b border-gray-100">
                        <p className="text-gray-600 leading-relaxed">
                            At NakaeWorks, we strive to ensure our customers are 100% satisfied with the services provided.
                            However, if you are not satisfied with the service, or if there has been an error, this policy outlines how we handle refunds and cancellations.
                        </p>
                    </div>

                    {/* Content Sections */}
                    <div className="p-8 space-y-8">
                        {/* 1. Cancellations */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-red-100 rounded-lg text-red-600">
                                    <Clock size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">1. Cancellation Policy</h2>
                            </div>
                            <div className="pl-14">
                                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                                    <li>You may cancel a booked service up to 2 hours before the scheduled time for a full refund.</li>
                                    <li>Cancellations made within 2 hours of the scheduled time may attract a cancellation fee of ₹50 or 10% of the service value, whichever is higher.</li>
                                    <li>To cancel a service, please visit the 'My Bookings' section of the app or website.</li>
                                </ul>
                            </div>
                        </section>

                        {/* 2. Refunds */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                                    <RefreshCw size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">2. Refund Policy</h2>
                            </div>
                            <div className="pl-14">
                                <p className="text-gray-600 mb-4">
                                    We offer refunds in the following circumstances:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                                    <li><strong>Service Not Delivered:</strong> If the provider fails to show up for the scheduled service.</li>
                                    <li><strong>Service Quality Issue:</strong> If you are unsatisfied with the quality of service, please raise a complaint within 24 hours. We will investigate and may offer a partial or full refund or a re-service.</li>
                                    <li><strong>Double Payment:</strong> If you were charged twice for the same service.</li>
                                </ul>
                                <p className="text-gray-600 mt-4">
                                    Refunds will be processed to the original payment method within 5-7 business days.
                                </p>
                            </div>
                        </section>

                        {/* 3. Disputes */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
                                    <AlertCircle size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">3. Disputes</h2>
                            </div>
                            <div className="pl-14">
                                <p className="text-gray-600">
                                    If you have any disputes regarding a transaction, please contact our support team immediately. We will aim to resolve all disputes amicably within 48 hours.
                                </p>
                            </div>
                        </section>

                        {/* 4. Contact Us */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                    <Mail size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">4. Contact Us</h2>
                            </div>
                            <div className="pl-14">
                                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                    <p className="font-semibold text-gray-900">NakaeWorks Support</p>
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

export default RefundPolicy;
