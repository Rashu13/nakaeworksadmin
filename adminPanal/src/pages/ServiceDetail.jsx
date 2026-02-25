import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { serviceService, reviewService, BASE_URL } from '../services/api';
import { useCart } from '../context/CartContext';
import { Star, Lock, Clock, Heart, ChevronRight, ChevronDown, ChevronUp, Minus, Plus, AlertCircle, ShoppingCart } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';

const ServiceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { addToCart } = useCart();

    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedTime, setSelectedTime] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [openFaq, setOpenFaq] = useState(null);
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', type: 'info' });

    // Fetch Service Data
    useEffect(() => {
        const fetchServiceData = async () => {
            try {
                setLoading(true);
                const [serviceData, reviewsData] = await Promise.all([
                    serviceService.getById(id),
                    reviewService.getByServiceId(id)
                ]);

                if (serviceData) {
                    setService(serviceData);
                }
                setReviews(reviewsData || []);
            } catch (error) {
                console.error('Error fetching service data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchServiceData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!service) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex flex-col justify-center items-center text-gray-500 dark:text-gray-400">
                <AlertCircle size={48} className="mb-4 text-gray-600 dark:text-gray-400" />
                <h2 className="text-xl font-semibold">Service not found</h2>
                <button
                    onClick={() => navigate('/services')}
                    className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
                >
                    Browse all services
                </button>
            </div>
        );
    }

    // Determine fields from real data
    const categoryName = service.category?.name || service.Category?.name || 'Service';
    const providerName = service.provider?.name || service.Provider?.name || 'Provider';
    const providerAvatar = service.provider?.avatar || service.Provider?.avatar;
    const providerRating = service.provider?.rating || service.Provider?.rating || 4.5;
    const providerServed = service.provider?.served || service.Provider?.served || 0;
    const fullThumbnail = service.thumbnail ? (service.thumbnail.startsWith('http') ? service.thumbnail : `${BASE_URL}${service.thumbnail}`) : null;
    const fullProviderAvatar = providerAvatar ? (providerAvatar.startsWith('http') ? providerAvatar : `${BASE_URL}${providerAvatar}`) : `https://ui-avatars.com/api/?name=${providerName}`;

    // Calculate Pricing
    const price = Number(service.price) || 0;
    const discount = Number(service.discount) || 0;
    const discountedPrice = discount > 0
        ? price - (price * discount / 100)
        : price;
    const totalPrice = discountedPrice * quantity;

    // Time Slots (Static for now)
    const timeSlots = [
        '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
        '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
    ];

    const handleAddToCart = () => {
        addToCart(service, quantity);
        setAlertConfig({
            isOpen: true,
            title: 'Added to Cart',
            message: `${service.name} has been added to your cart successfully.`,
            type: 'success'
        });
    };

    const handleBooking = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (!selectedDate) {
            setAlertConfig({
                isOpen: true,
                title: 'Selection Required',
                message: 'Please select a date to proceed.',
                type: 'warning'
            });
            return;
        }

        const bookingTime = selectedTime || "10:00 AM"; // Default time

        navigate('/booking/confirm', {
            state: {
                service,
                quantity,
                date: selectedDate,
                time: bookingTime,
                totalPrice
            }
        });
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 pt-24 pb-12 font-sans transition-colors duration-200">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">

                {/* Breadcrumb / Back Navigation */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-slate-900 dark:text-white transition-colors font-medium text-sm"
                >
                    <ChevronRight className="rotate-180 mr-1" size={18} />
                    Back
                </button>

                <div className="grid lg:grid-cols-12 gap-10 items-start">

                    {/* LEFT COLUMN: Main Content (8 cols) */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* 1. Hero / Main Info Card */}
                        <div className="border-b border-gray-200 dark:border-gray-800 pb-8">
                            <div className="flex flex-col md:flex-row gap-6">

                                {/* Image / Thumbnail */}
                                <div className="w-full md:w-1/3 flex-shrink-0">
                                    <div className="relative aspect-square md:aspect-[4/3] rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                                        {fullThumbnail ? (
                                            <img
                                                src={fullThumbnail}
                                                alt={service.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : null}

                                        <div
                                            className={`absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800 ${fullThumbnail ? 'hidden' : 'flex'}`}
                                        >
                                            <Lock size={24} className="text-gray-700 dark:text-gray-300 dark:text-gray-600" />
                                        </div>

                                        {discount > 0 && (
                                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-green-600 text-slate-900 dark:text-white text-[10px] uppercase font-bold tracking-wide rounded-sm">
                                                {Math.round((discount / service.price) * 100)}% OFF
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Title & Meta */}
                                <div className="flex-1 pt-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-xs font-bold tracking-wider text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 uppercase mb-1 block">
                                                {categoryName}
                                            </span>
                                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-slate-900 dark:text-white mb-3 tracking-tight">
                                                {service.name}
                                            </h1>

                                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 mb-6">
                                                <div className="flex items-center gap-1.5">
                                                    <Star size={16} className="fill-black text-black dark:fill-yellow-400 dark:text-yellow-400" />
                                                    <span className="font-semibold text-gray-900 dark:text-slate-900 dark:text-white">{parseFloat(service.rating || 0).toFixed(1)}</span>
                                                    <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400">({service.reviewCount || 0})</span>
                                                </div>
                                                <div className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock size={16} />
                                                    <span>{service.duration || 60} mins</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setIsFavorite(!isFavorite)}
                                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-full"
                                            >
                                                <Heart size={22} className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400'} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="text-2xl font-bold text-gray-900 dark:text-slate-900 dark:text-white">₹{Math.round(discountedPrice)}</span>
                                        {discount > 0 && (
                                            <span className="text-base text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 line-through">₹{Math.round(price)}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Description & Details */}
                        <div className="border-b border-gray-200 dark:border-gray-800 pb-8">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-900 dark:text-white mb-4">About the Service</h2>
                            <p className="text-gray-600 dark:text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line text-base">
                                {service.description || "No description available for this service."}
                            </p>
                        </div>

                        {/* FAQs Section */}
                        {service.faqs && service.faqs.length > 0 && (
                            <div className="border-b border-gray-200 dark:border-gray-800 pb-8">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                                <div className="space-y-4">
                                    {service.faqs.map((faq, index) => (
                                        <div key={index} className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
                                            <button
                                                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors text-left"
                                            >
                                                <span className="font-semibold text-gray-900 dark:text-slate-900 dark:text-white">{faq.question}</span>
                                                {openFaq === index ? <ChevronUp size={20} className="text-gray-500 dark:text-gray-400" /> : <ChevronDown size={20} className="text-gray-500 dark:text-gray-400" />}
                                            </button>
                                            {openFaq === index && (
                                                <div className="p-4 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-700 dark:text-gray-300 text-sm leading-relaxed border-t border-gray-100 dark:border-gray-700">
                                                    {faq.answer}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Reviews Section */}
                        <div className="pb-8">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                Reviews & Ratings
                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm text-gray-600 dark:text-gray-600 dark:text-gray-400 font-normal">
                                    {reviews.length} reviews
                                </span>
                            </h2>

                            {reviews.length > 0 ? (
                                <div className="space-y-6">
                                    {reviews.map((review) => (
                                        <div key={review.id} className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-transparent dark:border-gray-800">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={review.consumer?.avatar ? (review.consumer.avatar.startsWith('http') ? review.consumer.avatar : `${BASE_URL}${review.consumer.avatar}`) : `https://ui-avatars.com/api/?name=${review.consumer?.name}`}
                                                        alt={review.consumer?.name}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-slate-900 dark:text-white">{review.consumer?.name}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 bg-white dark:bg-gray-700 px-2 py-1 rounded-lg border border-gray-100 dark:border-gray-600">
                                                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                                    <span className="text-sm font-bold text-gray-900 dark:text-slate-900 dark:text-white">{parseFloat(review.rating).toFixed(1)}</span>
                                                </div>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                                {review.comment}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                    <p className="text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400">No reviews yet for this service.</p>
                                </div>
                            )}
                        </div>

                        {/* 3. Provider Info */}
                        <div className="flex items-center justify-between py-4 border-t border-gray-200 dark:border-gray-800">
                            <div className="flex items-center gap-4">
                                <img
                                    src={fullProviderAvatar}
                                    alt={providerName}
                                    className="w-12 h-12 rounded-full object-cover border border-gray-100 dark:border-gray-700"
                                />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-gray-900 dark:text-slate-900 dark:text-white">{providerName}</h3>
                                        <Lock size={14} className="text-blue-600 fill-blue-50 dark:fill-blue-900/30" />
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400">{providerServed}+ jobs completed</p>
                                </div>
                            </div>
                            <Link
                                to={`/provider-detail/${service.providerId || service.ProviderId || service.provider?.id || service.Provider?.id}`}
                                className="text-black dark:text-primary-400 font-semibold text-sm hover:underline"
                            >
                                View Profile
                            </Link>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Sticky Booking Card (4 cols) */}
                    <div className="lg:col-span-4 pl-0 lg:pl-4">
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 sticky top-28 bg-white dark:bg-gray-800 shadow-sm dark:shadow-none">
                            <h3 className="font-bold text-gray-900 dark:text-slate-900 dark:text-white text-lg mb-6">Booking Summary</h3>

                            {/* Quantity */}
                            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                                <span className="text-gray-600 dark:text-gray-700 dark:text-gray-300 font-medium">Quantity</span>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-700 dark:text-gray-300"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="text-lg font-semibold w-6 text-center text-gray-900 dark:text-slate-900 dark:text-white">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-700 dark:text-gray-300"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Date & Time */}
                            <div className="space-y-6 mb-8">
                                <div>
                                    <label className="block text-xs font-bold text-gray-900 dark:text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">Date</label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-slate-900 dark:text-white focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-900 dark:text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">Time Slot</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {timeSlots.map(t => {
                                            const isToday = selectedDate === new Date().toISOString().split('T')[0];
                                            let isDisabled = false;

                                            if (isToday) {
                                                const now = new Date();
                                                const [time, modifier] = t.split(' ');
                                                let [hours, minutes] = time.split(':').map(Number);
                                                if (modifier === 'PM' && hours < 12) hours += 12;
                                                if (modifier === 'AM' && hours === 12) hours = 0;
                                                const slotTime = new Date();
                                                slotTime.setHours(hours, minutes, 0, 0);
                                                isDisabled = slotTime < now;
                                            }

                                            return (
                                                <button
                                                    key={t}
                                                    disabled={isDisabled}
                                                    onClick={() => setSelectedTime(t)}
                                                    className={`py-2 px-1 text-xs font-medium border rounded-md transition-all ${selectedTime === t
                                                        ? 'bg-slate-900 dark:bg-primary-600 text-slate-900 dark:text-white border-slate-900 dark:border-primary-600 shadow-sm'
                                                        : isDisabled
                                                            ? 'bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 dark:text-gray-600 border-gray-100 dark:border-gray-700 cursor-not-allowed'
                                                            : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600'
                                                        }`}
                                                >
                                                    {t}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {!selectedTime && (
                                        <p className="text-[10px] text-red-500 mt-1.5">* Please select a time slot</p>
                                    )}
                                </div>
                            </div>

                            {/* Trust Markers */}
                            <div className="bg-gray-50 dark:bg-gray-700/30 rounded p-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <Lock size={18} className="text-gray-900 dark:text-slate-900 dark:text-white mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-gray-600 dark:text-gray-600 dark:text-gray-400 leading-relaxed">
                                        <span className="font-bold text-gray-900 dark:text-slate-900 dark:text-white block mb-0.5">Our Promise</span>
                                        Verified professionals, secure payment & insurance.
                                    </p>
                                </div>
                            </div>

                            {/* Total & Action */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-gray-900 dark:text-slate-900 dark:text-white font-bold text-xl">
                                    <span>₹{Math.round(totalPrice)}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={handleAddToCart}
                                        className="py-4 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-slate-900 dark:text-white font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <ShoppingCart size={18} />
                                        Cart
                                    </button>
                                    <button
                                        onClick={handleBooking}
                                        className="py-4 bg-black dark:bg-primary-600 text-slate-900 dark:text-white font-bold rounded-lg hover:bg-gray-800 dark:hover:bg-primary-700 transition-colors shadow-lg"
                                    >
                                        Buy Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            {/* Alert Modal */}
            <ConfirmationModal
                isOpen={alertConfig.isOpen}
                onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
                onConfirm={() => setAlertConfig({ ...alertConfig, isOpen: false })}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                confirmText="OK"
                cancelText={null}
            />
        </div>
    );
};

export default ServiceDetail;
