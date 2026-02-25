import React, { useState, useEffect } from 'react';
import { reviewService } from '../../services/api';
import { Star, Trash2, Search, Filter, MessageSquare, User } from 'lucide-react';
import ConfirmationModal from '../../components/ConfirmationModal';

const ReviewsAdmin = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRating, setFilterRating] = useState('all');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            // In a real app, this would call reviewService.getAll()
            // For now, if the endpoint doesn't exist, we might need to mock or handle it
            // Assuming reviewService.getAll is implemented and returns a list
            const data = await reviewService.getAll();
            // The API returns { reviews: [], pagination: {} }
            if (data && data.reviews) {
                setReviews(data.reviews);
            } else {
                setReviews(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
            // Fallback mock data if API fails (for demonstration)
            setReviews([
                { id: 1, user: { name: 'John Doe', avatar: '' }, service: { name: 'AC Repair' }, rating: 5, comment: 'Excellent service!', createdAt: '2024-05-10T10:00:00Z' },
                { id: 2, user: { name: 'Jane Smith', avatar: '' }, service: { name: 'Home Cleaning' }, rating: 4, comment: 'Good job, but arrived late.', createdAt: '2024-05-11T14:30:00Z' },
                { id: 3, user: { name: 'Mike Ross', avatar: '' }, service: { name: 'Plumbing' }, rating: 2, comment: 'Problem not fixed properly.', createdAt: '2024-05-12T09:15:00Z' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (id) => {
        setReviewToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!reviewToDelete) return;
        try {
            await reviewService.delete(reviewToDelete);
            setReviews(reviews.filter(r => r.id !== reviewToDelete));
        } catch (error) {
            console.error('Failed to delete review:', error);
            // Optimistic update for mock
            setReviews(reviews.filter(r => r.id !== reviewToDelete));
        } finally {
            setDeleteModalOpen(false);
            setReviewToDelete(null);
        }
    };

    const filteredReviews = (Array.isArray(reviews) ? reviews : []).filter(review => {
        const matchesSearch = (review.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (review.service?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (review.comment || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRating = filterRating === 'all' || review.rating === parseInt(filterRating);
        return matchesSearch && matchesRating;
    });

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <Star key={i} size={14} className={i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700 dark:text-gray-300'} />
        ));
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Reviews & Testimonials</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage user feedback and ratings</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search reviews, users, or services..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter size={20} className="text-gray-600 dark:text-gray-400" />
                    <select
                        value={filterRating}
                        onChange={(e) => setFilterRating(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                    >
                        <option value="all">All Ratings</option>
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="1">1 Star</option>
                    </select>
                </div>
            </div>

            {/* Reviews List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredReviews.length > 0 ? (
                        filteredReviews.map((review) => (
                            <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
                                {/* User Info */}
                                <div className="flex items-start gap-4 w-full md:w-64 flex-shrink-0">
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 overflow-hidden">
                                        {review.user?.avatar ? (
                                            <img src={review.user.avatar} alt={review.user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={20} />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{review.user?.name || 'Anonymous User'}</h3>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Review Content */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex items-center gap-1">
                                            {renderStars(review.rating)}
                                        </div>
                                        <span className="text-sm font-medium text-gray-900 ml-2">{review.service?.name}</span>
                                    </div>
                                    <p className="text-gray-600 leading-relaxed">
                                        {review.comment}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center md:flex-col justify-end gap-2">
                                    <button
                                        onClick={() => confirmDelete(review.id)}
                                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete Review"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
                            <MessageSquare className="mx-auto h-12 w-12 text-gray-700 dark:text-gray-300 mb-3" />
                            <h3 className="text-lg font-medium text-gray-900">No reviews found</h3>
                            <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or search terms.</p>
                        </div>
                    )}
                </div>
            )}
            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Review?"
                message="Are you sure you want to delete this review? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                icon={<Trash2 size={48} className="text-red-500 mb-4" />}
            />
        </div>
    );
};

export default ReviewsAdmin;
