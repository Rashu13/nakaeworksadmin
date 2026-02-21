import React, { useState, useEffect } from 'react';
import { Star, Loader, User, Calendar, MessageSquare } from 'lucide-react';
import { providerService, BASE_URL } from '../../services/api';

const Reviews = () => {
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async (page = 1) => {
        setLoading(true);
        try {
            const response = await providerService.getReviews({ page });
            if (response.data.success) {
                setReviews(response.data.data.reviews);
                setPagination(response.data.data.pagination);
            }
        } catch (error) {
            console.error('Fetch reviews error:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
            />
        ));
    };

    const getAverageRating = () => {
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        return (sum / reviews.length).toFixed(1);
    };

    const getRatingDistribution = () => {
        const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => {
            dist[r.rating] = (dist[r.rating] || 0) + 1;
        });
        return dist;
    };

    const handleImageError = (e) => {
        e.target.onerror = null;
        e.target.src = 'https://ui-avatars.com/api/?name=User&background=10b981&color=fff';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    const distribution = getRatingDistribution();

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
                <p className="text-gray-600">See what customers say about your services</p>
            </div>

            {/* Rating Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Average Rating */}
                    <div className="text-center md:text-left">
                        <p className="text-6xl font-bold text-gray-900">{getAverageRating()}</p>
                        <div className="flex items-center justify-center md:justify-start gap-1 mt-2">
                            {renderStars(Math.round(getAverageRating()))}
                        </div>
                        <p className="text-gray-500 mt-2">Based on {pagination.total} reviews</p>
                    </div>

                    {/* Rating Distribution */}
                    <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => {
                            const count = distribution[rating] || 0;
                            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                            return (
                                <div key={rating} className="flex items-center gap-3">
                                    <span className="text-sm text-gray-600 w-8">{rating}★</span>
                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-yellow-500 rounded-full transition-all"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-gray-500 w-8">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
                    <p className="text-gray-500">Reviews will appear here after customers rate your services</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-start gap-4">
                                <img
                                    src={review.consumer?.avatar
                                        ? (review.consumer.avatar.startsWith('http')
                                            ? review.consumer.avatar
                                            : `${BASE_URL}${review.consumer.avatar}`)
                                        : `https://ui-avatars.com/api/?name=${review.consumer?.name}&background=10b981&color=fff`
                                    }
                                    alt={review.consumer?.name}
                                    className="w-12 h-12 rounded-full object-cover"
                                    onError={handleImageError}
                                />
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{review.consumer?.name}</h4>
                                            <p className="text-sm text-emerald-600">{review.Service?.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-1">
                                                {renderStars(review.rating)}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(review.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    {review.comment && (
                                        <p className="text-gray-600 mt-3">{review.comment}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex justify-center gap-2">
                    {Array.from({ length: pagination.pages }, (_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => fetchReviews(i + 1)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${pagination.page === i + 1
                                ? 'bg-emerald-500 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Reviews;
