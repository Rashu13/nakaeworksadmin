import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Calendar, CreditCard, Wallet, CheckCircle, Plus, ChevronRight, Lock, ArrowLeft, AlertCircle } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { bookingService, addressService, couponService } from '../services/api';

const BookingConfirm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const { cartItems, cartTotal, clearCart } = useCart();

    // Support both single service and cart flow
    const state = location.state || {};
    const isCartFlow = state.cartFlow;

    // Fallback for single service
    const { service, quantity, date: singleDate, time: singleTime, totalPrice: singleTotalPrice } = state;

    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('online');
    const [loading, setLoading] = useState(false);
    const [showAddAddress, setShowAddAddress] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [discountAmt, setDiscountAmt] = useState(0);
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', type: 'info' });

    // Effective values
    const effectiveTotalPrice = isCartFlow ? cartTotal : (singleTotalPrice || 0);
    const effectiveDate = isCartFlow ? new Date().toISOString().split('T')[0] : (singleDate || new Date().toISOString().split('T')[0]); // Default to today for cart
    const effectiveTime = isCartFlow ? "10:00 AM" : (singleTime || "10:00 AM"); // Default for cart

    const platformFee = 49;
    const tax = Math.round(((effectiveTotalPrice || 0) + platformFee) * 0.18);
    const finalAmount = (effectiveTotalPrice || 0) + platformFee + tax - discountAmt;

    const applyCoupon = async () => {
        if (!couponCode) return;

        try {
            setLoading(true);
            const response = await couponService.validate(couponCode, effectiveTotalPrice);

            if (response.valid) {
                setDiscountAmt(parseFloat(response.calculatedDiscount));
                showAlert('Coupon Applied', `Success: ${response.message}`, 'success');
            } else {
                setDiscountAmt(0);
                showAlert('Invalid Coupon', response.message || 'Invalid coupon', 'danger');
            }
        } catch (error) {
            setDiscountAmt(0);
            showAlert('Error', error.message || 'Error applying coupon', 'danger');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const data = await addressService.getAll();
                setAddresses(data);
                if (data.length > 0) {
                    setSelectedAddress(data.find(a => a.isPrimary)?.id || data[0].id);
                }
            } catch (error) {
                console.error('Failed to fetch addresses:', error);
            }
        };

        if (isAuthenticated) {
            fetchAddresses();
        }
    }, [isAuthenticated]);

    const showAlert = (title, message, type = 'info') => {
        setAlertConfig({
            isOpen: true,
            title,
            message,
            type,
            onConfirm: () => setAlertConfig(prev => ({ ...prev, isOpen: false }))
        });
    };

    const handleBooking = async () => {
        if (!selectedAddress) {
            showAlert('Address Required', 'Please select or add an address to proceed.', 'warning');
            return;
        }

        setLoading(true);

        try {
            // Parse time to 24-hour format
            const [timePart, modifier] = effectiveTime.split(' ');
            let [hours, minutes] = timePart.split(':');
            hours = parseInt(hours, 10);
            if (hours === 12 && modifier === 'AM') hours = 0;
            if (modifier === 'PM' && hours < 12) hours += 12;

            const formattedDateTime = `${effectiveDate}T${hours.toString().padStart(2, '0')}:${minutes}:00`;

            const bookingData = {
                addressId: selectedAddress,
                providerId: isCartFlow ? cartItems[0]?.providerId : service.providerId, // In legacy, it takes from one
                dateTime: formattedDateTime,
                description: '',
                paymentMethod,
                couponCode: discountAmt > 0 ? couponCode : null,
                items: isCartFlow
                    ? cartItems.map(i => ({ serviceId: i.id, quantity: i.quantity }))
                    : [{ serviceId: service.id, quantity: quantity }]
            };

            const response = await bookingService.create(bookingData);

            if (isCartFlow) clearCart();

            navigate('/booking/success', {
                state: {
                    bookingNumber: response.bookingNumber,
                    service: isCartFlow ? cartItems[0] : service,
                    services: isCartFlow ? cartItems : null,
                    date: effectiveDate,
                    time: effectiveTime,
                    amount: response.totalAmount,
                    isMultiItem: isCartFlow && cartItems.length > 1
                }
            });
        } catch (error) {
            console.error(error);
            showAlert('Booking Failed', error.message || 'Booking failed. Please try again.', 'danger');
        } finally {
            setLoading(false);
        }
    };

    if (!isCartFlow && !service) return null;
    if (isCartFlow && cartItems.length === 0) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 transition-colors duration-200">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-slate-900 dark:text-white mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </button>

                <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-900 dark:text-white mb-8">Confirm Your Booking</h1>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left - Forms */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Service Summary */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-900 dark:text-white mb-4">
                                {isCartFlow ? `${cartItems.length} Services Selected` : 'Service Details'}
                            </h2>
                            <div className="space-y-4">
                                {(isCartFlow ? cartItems : [service]).map((item, idx) => (
                                    <div key={item.id || idx} className="flex gap-4 pb-4 border-b border-gray-50 dark:border-gray-700 last:border-0 last:pb-0">
                                        <img
                                            src={item.thumbnail ? (item.thumbnail.startsWith('http') ? item.thumbnail : `${BASE_URL}${item.thumbnail}`) : `https://ui-avatars.com/api/?name=${item.name}`}
                                            alt={item.name}
                                            className="w-20 h-20 rounded-xl object-cover bg-gray-100 dark:bg-gray-700"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900 dark:text-slate-900 dark:text-white">{item.name}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400">{item.category?.name || 'Service'}</p>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-600 dark:text-gray-400">
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    <span>{isCartFlow ? effectiveDate : singleDate}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock size={14} />
                                                    <span>{isCartFlow ? effectiveTime : singleTime}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-semibold text-gray-900 dark:text-slate-900 dark:text-white">
                                                ₹{(Number(item.price) - Number(item.discount || 0)) * (isCartFlow ? item.quantity : quantity)}
                                            </span>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400">Qty: {isCartFlow ? item.quantity : quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Address Selection */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-900 dark:text-white">Service Address</h2>
                                <button
                                    onClick={() => setShowAddAddress(true)}
                                    className="flex items-center gap-1 text-slate-900 dark:text-primary-400 text-sm font-medium hover:text-blue-600 dark:hover:text-primary-300"
                                >
                                    <Plus size={16} />
                                    Add New
                                </button>
                            </div>
                            <div className="space-y-3">
                                {addresses.map((addr) => (
                                    <label
                                        key={addr.id}
                                        className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddress === addr.id
                                            ? 'border-slate-900 dark:border-primary-500 bg-slate-50 dark:bg-primary-900/10'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="address"
                                            checked={selectedAddress === addr.id}
                                            onChange={() => setSelectedAddress(addr.id)}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900 dark:text-slate-900 dark:text-white capitalize">{addr.type}</span>
                                                {addr.isPrimary && (
                                                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
                                                        Primary
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-600 dark:text-gray-400 text-sm mt-1">
                                                {addr.addressLine1}, {addr.city}, {addr.state}
                                            </p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-900 dark:text-white mb-4">Payment Method</h2>
                            <div className="space-y-3">
                                <label
                                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod'
                                        ? 'border-slate-900 dark:border-primary-500 bg-slate-50 dark:bg-primary-900/10'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="payment"
                                        checked={paymentMethod === 'cod'}
                                        onChange={() => setPaymentMethod('cod')}
                                    />
                                    <Wallet size={20} className="text-gray-600 dark:text-gray-600 dark:text-gray-400" />
                                    <div className="flex-1">
                                        <span className="font-medium text-gray-900 dark:text-slate-900 dark:text-white">Cash on Delivery</span>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400">Pay after service completion</p>
                                    </div>
                                </label>

                                <label
                                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'online'
                                        ? 'border-slate-900 dark:border-primary-500 bg-slate-50 dark:bg-primary-900/10'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="payment"
                                        checked={paymentMethod === 'online'}
                                        onChange={() => setPaymentMethod('online')}
                                    />
                                    <CreditCard size={20} className="text-gray-600 dark:text-gray-600 dark:text-gray-400" />
                                    <div className="flex-1">
                                        <span className="font-medium text-gray-900 dark:text-slate-900 dark:text-white">Pay Online</span>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400">UPI, Cards, Net Banking</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Right - Price Summary */}
                    <div className="md:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg sticky top-24 border border-gray-100 dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-900 dark:text-white mb-8">Price Details</h2>

                            {/* Coupon */}
                            <div className="relative mb-8">
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    placeholder="Enter Coupon Code"
                                    className="w-full px-4 py-3 pr-24 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:border-slate-900 dark:focus:border-primary-500 outline-none transition-colors bg-gray-50/50 dark:bg-gray-700 text-gray-900 dark:text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                />
                                <button
                                    onClick={applyCoupon}
                                    style={{ color: 'white' }}
                                    className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-slate-900 dark:bg-primary-600 !text-white rounded-lg text-xs font-bold hover:bg-gray-800 dark:hover:bg-primary-700 transition-colors shadow-sm"
                                >
                                    Apply
                                </button>
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-4 text-base text-gray-600 dark:text-gray-700 dark:text-gray-300">
                                <div className="flex justify-between">
                                    <span>{isCartFlow ? 'Items Subtotal' : 'Service Price'}</span>
                                    <span className="text-gray-900 dark:text-slate-900 dark:text-white font-medium">₹{effectiveTotalPrice}</span>
                                </div>
                                {discountAmt > 0 && (
                                    <div className="flex justify-between text-green-600 dark:text-green-400 font-medium">
                                        <span>Coupon Discount</span>
                                        <span>-₹{discountAmt}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-600 dark:text-gray-400">Platform Fee</span>
                                    <span className="text-gray-900 dark:text-slate-900 dark:text-white">₹{platformFee}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-600 dark:text-gray-400">Tax (18% GST)</span>
                                    <span className="text-gray-900 dark:text-slate-900 dark:text-white">₹{tax}</span>
                                </div>
                                <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700 text-base font-semibold">
                                    <span className="text-gray-900 dark:text-slate-900 dark:text-white">Total Amount</span>
                                    <span className="text-gray-900 dark:text-slate-900 dark:text-white">₹{finalAmount}</span>
                                </div>
                            </div>

                            {/* Confirm Button */}
                            <button
                                onClick={handleBooking}
                                style={{ color: 'white' }}
                                disabled={loading}
                                className="w-full mt-6 py-4 bg-slate-900 dark:bg-primary-600 hover:bg-gray-800 dark:hover:bg-primary-700 !text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Confirm Booking
                                        <ChevronRight size={18} />
                                    </>
                                )}
                            </button>

                            {/* Trust */}
                            <div className="flex items-center gap-2 mt-4 text-xs text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 justify-center">
                                <Lock size={14} className="text-green-500" />
                                <span>100% Secure & Safe Payments</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Add Address Modal */}
            {showAddAddress && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 border border-gray-100 dark:border-gray-700 shadow-xl">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-slate-900 dark:text-white mb-4">Add New Address</h2>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const newAddress = {
                                AddressLine1: formData.get('address'),
                                City: formData.get('city'),
                                State: formData.get('state'),
                                Pincode: formData.get('zipCode'),
                                Type: formData.get('type'),
                                IsPrimary: false
                            };

                            try {
                                await addressService.add(newAddress);
                                const data = await addressService.getAll();
                                setAddresses(data);
                                setShowAddAddress(false);
                            } catch (err) {
                                showAlert('Error', err.message, 'danger');
                            }
                        }}>
                            <div className="space-y-4">
                                <input name="address" placeholder="Address Line" required className="w-full px-4 py-2 border dark:border-gray-600 rounded-xl bg-transparent dark:bg-gray-700 text-gray-900 dark:text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-slate-900 dark:focus:border-primary-500 outline-none transition-colors" />
                                <div className="grid grid-cols-2 gap-4">
                                    <input name="city" placeholder="City" required className="w-full px-4 py-2 border dark:border-gray-600 rounded-xl bg-transparent dark:bg-gray-700 text-gray-900 dark:text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-slate-900 dark:focus:border-primary-500 outline-none transition-colors" />
                                    <input name="state" placeholder="State" required className="w-full px-4 py-2 border dark:border-gray-600 rounded-xl bg-transparent dark:bg-gray-700 text-gray-900 dark:text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-slate-900 dark:focus:border-primary-500 outline-none transition-colors" />
                                </div>
                                <input name="zipCode" placeholder="Pincode" required className="w-full px-4 py-2 border dark:border-gray-600 rounded-xl bg-transparent dark:bg-gray-700 text-gray-900 dark:text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-slate-900 dark:focus:border-primary-500 outline-none transition-colors" />
                                <select name="type" className="w-full px-4 py-2 border dark:border-gray-600 rounded-xl bg-transparent dark:bg-gray-700 text-gray-900 dark:text-slate-900 dark:text-white focus:border-slate-900 dark:focus:border-primary-500 outline-none transition-colors appearance-none">
                                    <option value="home">Home</option>
                                    <option value="work">Work</option>
                                    <option value="other">Other</option>
                                </select>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowAddAddress(false)} className="flex-1 py-2 border dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-700 dark:text-gray-300 transition-colors">Cancel</button>
                                    <button type="submit" className="flex-1 py-2 bg-slate-900 dark:bg-primary-600 text-white font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-primary-700 transition-colors shadow-lg">Save</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Alert Modal */}
            <ConfirmationModal
                isOpen={alertConfig.isOpen}
                onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
                onConfirm={() => setAlertConfig({ ...alertConfig, isOpen: false })}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type === 'success' ? 'info' : alertConfig.type}
                confirmText="OK"
                cancelText={null}
                icon={alertConfig.type === 'success' ? <CheckCircle size={48} className="text-green-500 mb-4" /> : null}
            />
        </div>
    );
};

export default BookingConfirm;
