import React from 'react';
import { Star, Clock, MapPin, User, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../services/api';

const ServiceCard = ({ service, viewMode }) => {
    const navigate = useNavigate();
    const [isFavorite, setIsFavorite] = React.useState(false);

    const {
        id,
        name,
        thumbnail,
        price,
        discount,
        duration,
        provider: _provider,
        Provider,
        rating,
        reviewsCount,
        category: _category,
        Category
    } = service;

    const provider = _provider || Provider;
    const category = _category || Category;

    const discountedPrice = discount ? price - (price * discount / 100) : price;
    const fullThumbnail = thumbnail ? (thumbnail.startsWith('http') ? thumbnail : `${BASE_URL}${thumbnail}`) : `https://images.unsplash.com/photo-1581578731117-104f8a746950?w=400`;
    const fullAvatar = provider?.avatar ? (provider.avatar.startsWith('http') ? provider.avatar : `${BASE_URL}${provider.avatar}`) : `https://ui-avatars.com/api/?name=${provider?.name || 'User'}`;

    // LIST VIEW
    if (viewMode === 'list') {
        return (
            <div className="group bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-none hover:shadow-xl dark:hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden border border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row h-auto sm:h-[13rem]">
                {/* Image Container */}
                <div className="relative w-full sm:w-72 h-48 sm:h-full flex-shrink-0 p-3">
                    <img
                        src={fullThumbnail}
                        alt={name}
                        className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Discount Badge */}
                    {discount > 0 && (
                        <div className="absolute top-5 left-5 px-2.5 py-1 bg-gradient-to-r from-red-600 to-pink-600 text-white text-[10px] font-bold rounded-lg shadow-sm">
                            {discount}% OFF
                        </div>
                    )}

                    {/* Category Tag */}
                    <div className="absolute bottom-5 left-5 px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium rounded-lg">
                        {category?.name || 'Service'}
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1 h-full min-w-0">
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <h3
                                onClick={() => navigate(`/service/${id}`)}
                                className="text-lg font-bold text-gray-900 hover:text-blue-600 cursor-pointer line-clamp-1 mb-1"
                            >
                                {name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="font-bold text-slate-800 dark:text-indigo-300 text-lg">₹{discountedPrice}</span>
                                {discount > 0 && (
                                    <span className="text-gray-400 dark:text-gray-500 line-through text-xs">₹{price}</span>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsFavorite(!isFavorite);
                            }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isFavorite ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-gray-50 dark:bg-slate-800 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-600 dark:hover:text-gray-200'}`}
                        >
                            <Heart size={16} className={isFavorite ? 'fill-current' : ''} />
                        </button>
                    </div>

                    <div className="flex items-center gap-3 mt-3 mb-4 text-xs text-gray-500 font-medium">
                        {duration && (
                            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-slate-800/50 px-2.5 py-1 rounded-md">
                                <Clock size={14} className="text-gray-400" />
                                <span>{duration} min</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-slate-800/50 px-2.5 py-1 rounded-md">
                            <Star size={14} className="fill-amber-400 text-amber-400" />
                            <span className="text-gray-700 dark:text-gray-300">{rating || '4.8'}</span>
                            <span className="text-gray-400">({reviewsCount || 120})</span>
                        </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-800">
                        {provider ? (
                            <div className="flex items-center gap-2.5">
                                <img
                                    src={fullAvatar}
                                    alt={provider.name}
                                    className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-slate-800 shadow-sm"
                                />
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-gray-900 dark:text-white">{provider.name}</span>
                                    <span className="text-[10px] text-gray-500">{provider.role || 'Service Provider'}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <User size={14} />
                                <span>Multiple Providers</span>
                            </div>
                        )}

                        <button
                            onClick={() => navigate(`/service/${id}`)}
                            className="px-5 py-2 bg-slate-900 dark:bg-indigo-600 hover:bg-blue-600 dark:hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
                        >
                            Book Now
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // GRID VIEW (Default)
    return (
        <div
            className="group bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-xl dark:shadow-none dark:hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden border border-gray-100 dark:border-slate-800 flex flex-col h-full"
        >
            {/* Image Container */}
            <div className="relative aspect-[4/3] overflow-hidden p-3">
                <img
                    src={fullThumbnail}
                    alt={name}
                    className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                />

                {/* Discount Badge */}
                {discount > 0 && (
                    <div className="absolute top-5 left-5 px-2.5 py-1 bg-gradient-to-r from-red-600 to-pink-600 text-white text-[10px] font-bold rounded-lg shadow-sm">
                        {discount}% OFF
                    </div>
                )}

                {/* Favorite Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsFavorite(!isFavorite);
                    }}
                    className="absolute top-5 right-5 w-9 h-9 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                >
                    <Heart
                        size={18}
                        className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500 dark:text-gray-400'}
                    />
                </button>

                {/* Category Tag */}
                <div className="absolute bottom-5 left-5 px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium rounded-lg">
                    {category?.name || 'Service'}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
                {/* Title & Price */}
                <div className="flex items-start justify-between gap-2 mb-3">
                    <h3
                        onClick={() => navigate(`/service/${id}`)}
                        className="font-semibold text-gray-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer line-clamp-2 flex-1 transition-colors"
                    >
                        {name}
                    </h3>
                    <div className="text-right flex-shrink-0">
                        {discount > 0 && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 line-through block">
                                ₹{price}
                            </span>
                        )}
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            ₹{discountedPrice}
                        </span>
                    </div>
                </div>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {duration && (
                        <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{duration}min</span>
                        </div>
                    )}
                    {rating && (
                        <div className="flex items-center gap-1">
                            <Star size={14} className="fill-yellow-400 text-yellow-400" />
                            <span>{rating}</span>
                            {reviewsCount && (
                                <span className="text-gray-400 dark:text-gray-500">({reviewsCount})</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Provider Info & Book Button */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-800 mt-auto">
                    {provider ? (
                        <div className="flex items-center gap-2">
                            <img
                                src={fullAvatar}
                                alt={provider.name}
                                className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-slate-800 shadow-sm"
                            />
                            <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 line-clamp-1">
                                    {provider.name}
                                </p>
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                    <Star size={10} className="fill-yellow-400 text-yellow-400" />
                                    <span>{provider.rating || '4.5'}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <User size={16} />
                            <span>Multiple Providers</span>
                        </div>
                    )}

                    <button
                        onClick={() => navigate(`/service/${id}`)}
                        className="px-4 py-2 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-all transform hover:scale-105"
                    >
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ServiceCard;
