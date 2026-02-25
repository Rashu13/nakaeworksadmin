const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (window.location.origin + '/api');
export const BASE_URL = API_BASE_URL.replace(/\/api$/, '');
import { compressImage } from '../utils/compressor';

// Helper to normalize keys from PascalCase to camelCase
const normalizeKeys = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(v => normalizeKeys(v));
    } else if (obj !== null && obj.constructor === Object) {
        return Object.keys(obj).reduce((result, key) => {
            const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
            result[camelKey] = normalizeKeys(obj[key]);
            return result;
        }, {});
    }
    return obj;
};

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');

    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    });

    const text = await response.text();
    let data;
    try {
        data = text ? JSON.parse(text) : {};
    } catch (e) {
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText || 'Internal Server Error'}`);
        }
        throw new Error('Invalid response format from server');
    }

    if (!response.ok) {
        // Auto-logout on 401 (unauthorized / token expired)
        if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/verify-otp')) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            localStorage.removeItem('tokenExpiry');
            // Redirect to login if not already there
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        throw new Error(data.message || data.error || 'Something went wrong');
    }

    // Handle .NET Backend response wrapper (Success, Data/data)
    let result = data;
    if (data.hasOwnProperty('Success') || data.hasOwnProperty('success')) {
        result = data.Data || data.data || data;
    }

    return normalizeKeys(result);
};

// Auth Services
export const authService = {
    register: (userData) => apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
    }),

    login: (credentials) => apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    }),

    getProfile: () => apiCall('/auth/profile'),

    updateProfile: (data) => apiCall('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
    }),

    changePassword: (data) => apiCall('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify(data),
    }),

    logout: () => {
        const token = localStorage.getItem('token');
        if (token) {
            // Fire and forget backend logout
            fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            }).catch(() => { });
        }
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('tokenExpiry');
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated: () => !!localStorage.getItem('token'),

    sendOtp: (phone) => apiCall('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phone }),
    }),

    verifyOtp: (phone, otp, name) => apiCall('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phone, otp, name }),
    }),

    refreshToken: () => apiCall('/auth/refresh-token', {
        method: 'POST',
    }),
};

// Service Services
export const serviceService = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/services${query ? `?${query}` : ''}`);
    },
    getCategories: () => apiCall('/services/categories'),
    getById: (id) => apiCall(`/services/${id}`),
    create: (serviceData) => apiCall('/services', {
        method: 'POST',
        body: JSON.stringify(serviceData),
    }),
};

// Booking Services
export const bookingService = {
    create: (bookingData) => apiCall('/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData),
    }),

    getAll: () => apiCall('/bookings'),

    getById: (id) => apiCall(`/bookings/${id}`),

    updateStatus: (id, statusSlug) => apiCall(`/bookings/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ statusSlug }),
    }),

    cancel: (id) => apiCall(`/bookings/${id}/cancel`, {
        method: 'PUT',
    }),

    getTimeline: (id) => apiCall(`/bookings/${id}/timeline`),
};

// Address Services
export const addressService = {
    getAll: () => apiCall('/addresses'),

    add: (addressData) => apiCall('/addresses', {
        method: 'POST',
        body: JSON.stringify(addressData),
    }),

    update: (id, addressData) => apiCall(`/addresses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(addressData),
    }),

    delete: (id) => apiCall(`/addresses/${id}`, {
        method: 'DELETE',
    }),
};

export const couponService = {
    validate: (code, orderValue) => apiCall('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code, orderValue }),
    }),
};

// Review Services
export const reviewService = {
    create: (reviewData) => apiCall('/reviews', {
        method: 'POST',
        body: JSON.stringify(reviewData),
    }),
    getByServiceId: (serviceId) => apiCall(`/reviews/service/${serviceId}`),
    getByProviderId: (id, params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/providers/${id}/reviews${query ? `?${query}` : ''}`);
    },
    // Admin
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/admin/reviews${query ? `?${query}` : ''}`);
    },
    delete: (id) => apiCall(`/admin/reviews/${id}`, { method: 'DELETE' }),
};

// Provider Services
export const providerService = {
    // Public
    getAll: () => apiCall('/providers'),
    getById: (id) => apiCall(`/providers/${id}`),

    // Provider Panel APIs
    getDashboard: async () => {
        const data = await apiCall('/providers/dashboard');
        return { data };
    },

    getBookings: async ({ status = '', page = 1 } = {}) => {
        const data = await apiCall(`/providers/bookings?status=${status}&page=${page}`);
        return { data };
    },

    acceptBooking: (id) => apiCall(`/providers/bookings/${id}/accept`, { method: 'PUT' }),

    rejectBooking: (id, reason) => apiCall(`/providers/bookings/${id}/reject`, {
        method: 'PUT',
        body: JSON.stringify({ reason })
    }),

    startService: (id) => apiCall(`/providers/bookings/${id}/start`, { method: 'PUT' }),

    completeBooking: (id) => apiCall(`/providers/bookings/${id}/complete`, { method: 'PUT' }),

    // Services (Admin only now - these might be unused here but keeping for auth context if needed)

    // Earnings
    getEarnings: async (period = 'month') => {
        const data = await apiCall(`/providers/earnings?period=${period}`);
        return { data };
    },

    getTransactions: async (page = 1) => {
        const data = await apiCall(`/providers/transactions?page=${page}`);
        return { data };
    },

    // Reviews
    getReviews: async ({ page = 1 } = {}) => {
        const data = await apiCall(`/providers/reviews?page=${page}`);
        return { data };
    },
};

// Category Services (for provider service form)
export const categoryService = {
    getAll: () => apiCall('/services/categories'),
};

// Admin Services
export const adminService = {
    // Dashboard
    getDashboardStats: () => apiCall('/admin/dashboard'),

    // Categories
    getCategories: () => apiCall('/admin/categories'),
    getCategoryById: (id) => apiCall(`/admin/categories/${id}`),
    createCategory: (data) => apiCall('/admin/categories', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateCategory: (id, data) => apiCall(`/admin/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    deleteCategory: (id) => apiCall(`/admin/categories/${id}`, {
        method: 'DELETE',
    }),

    // Services
    getServices: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/admin/services${query ? `?${query}` : ''}`);
    },
    getServiceById: (id) => apiCall(`/admin/services/${id}`),
    createService: (data) => apiCall('/admin/services', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateService: (id, data) => apiCall(`/admin/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    deleteService: (id) => apiCall(`/admin/services/${id}`, {
        method: 'DELETE',
    }),

    // Users
    getUsers: (role) => apiCall(`/admin/users${role ? `?role=${role}` : ''}`),
    getUserById: (id) => apiCall(`/admin/users/${id}`),
    createUser: (data) => apiCall('/admin/users', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateUser: (id, data) => apiCall(`/admin/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    deleteUser: (id) => apiCall(`/admin/users/${id}`, {
        method: 'DELETE',
    }),

    // Bookings
    getBookings: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/admin/bookings${query ? `?${query}` : ''}`);
    },
    getBookingById: (id) => apiCall(`/admin/bookings/${id}`),
    assignProvider: (bookingId, providerId) => apiCall(`/admin/bookings/${bookingId}/assign`, {
        method: 'PUT',
        body: JSON.stringify({ providerId }),
    }),
    updateBookingStatus: (id, statusSlug) => apiCall(`/admin/bookings/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: statusSlug }),
    }),

    // Coupons
    getCoupons: () => apiCall('/coupons'),
    createCoupon: (data) => apiCall('/coupons', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateCoupon: (id, data) => apiCall(`/coupons/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    deleteCoupon: (id) => apiCall(`/coupons/${id}`, {
        method: 'DELETE',
    }),
    toggleCouponStatus: (id, status) => apiCall(`/coupons/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    }),
};

// Upload Service
export const uploadService = {
    uploadImage: async (input) => {
        let finalFormData = new FormData();

        try {
            if (input instanceof File) {
                // If it's a direct File object, wrap it in FormData with key 'image'
                const compressedFile = await compressImage(input);
                finalFormData.append('image', compressedFile);
            } else if (input instanceof FormData) {
                // If it's already FormData, iterate and compress images if needed
                for (const [key, value] of input.entries()) {
                    if (value instanceof File && value.type.startsWith('image/')) {
                        const compressedFile = await compressImage(value);
                        finalFormData.append(key, compressedFile);
                    } else {
                        finalFormData.append(key, value);
                    }
                }
            } else {
                finalFormData.append('image', input);
            }
        } catch (error) {
            console.error('Compression failed, using original input:', error);
            if (input instanceof File) {
                finalFormData.append('image', input);
            } else {
                finalFormData = input;
            }
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
                // Note: Don't set Content-Type here; fetch sets it automatically with the boundary for FormData
            },
            body: finalFormData
        });

        const text = await response.text();
        let data;
        try {
            data = text ? JSON.parse(text) : {};
        } catch (e) {
            throw new Error('Invalid response format from server');
        }

        if (!response.ok) {
            throw new Error(data.message || data.error || 'Upload failed');
        }

        // Normalize keys and return to match frontend expectations
        return normalizeKeys(data);
    }
};


// Content Services
export const contentService = {
    getHome: () => apiCall('/content/home'),
    // Banners
    getBanners: () => apiCall('/content/banners'),
    createBanner: (data) => apiCall('/content/banners', { method: 'POST', body: JSON.stringify(data) }),
    updateBanner: (id, data) => apiCall(`/content/banners/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteBanner: (id) => apiCall(`/content/banners/${id}`, { method: 'DELETE' }),
    // Collections
    getCollections: () => apiCall('/content/collections'),
    createCollection: (data) => apiCall('/content/collections', { method: 'POST', body: JSON.stringify(data) }),
    updateCollection: (id, data) => apiCall(`/content/collections/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteCollection: (id) => apiCall(`/content/collections/${id}`, { method: 'DELETE' }),
};

export const settingService = {
    getAll: () => apiCall('/settings'),
    update: (key, data) => apiCall(`/settings/${key}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
};

export default {
    auth: authService,
    services: serviceService,
    bookings: bookingService,
    addresses: addressService,
    coupons: couponService,
    reviews: reviewService,
    providers: providerService,
    admin: adminService,
    upload: uploadService,
    content: contentService,
    settings: settingService
};
