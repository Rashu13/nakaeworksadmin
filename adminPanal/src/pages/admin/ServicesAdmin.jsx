import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Search, Check, AlertCircle, Eye, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminService, uploadService } from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';

const ServicesAdmin = () => {
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null);
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', type: 'info' });
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [formData, setFormData] = useState({
        name: '',
        categoryId: '',
        providerId: '',
        description: '',
        price: '',
        discount: 0,
        duration: 60,
        thumbnail: '',
        type: 'fixed',
        status: true,
        faqs: []
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, categoryFilter, itemsPerPage]);

    const fetchData = async () => {
        try {
            const [servicesData, categoriesData, usersData] = await Promise.all([
                adminService.getServices({ limit: 1000 }),
                adminService.getCategories(),
                adminService.getUsers('provider')
            ]);
            console.log("Services Data:", servicesData);
            console.log("Categories Data:", categoriesData);
            console.log("Users Data (Providers):", usersData);

            // Robust handling for various response structures
            // Services: can be { services: [] } or just []
            const servicesList = servicesData.services || (Array.isArray(servicesData) ? servicesData : []);

            // Categories: can be { categories: [] } or just []
            // Based on curl, it's just []
            const categoriesList = Array.isArray(categoriesData) ? categoriesData : (categoriesData.categories || []);

            // Providers: can be { users: [] } or just []
            // expected from previous logs: { users: [...] }
            const providersList = usersData.users || (Array.isArray(usersData) ? usersData : []);

            console.log("Processed Lists:", { servicesList, categoriesList, providersList });

            setServices(servicesList);
            setCategories(categoriesList);
            setProviders(providersList);
        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Failed to load data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const data = {
                ...formData,
                price: parseFloat(formData.price),
                discount: parseFloat(formData.discount) || 0,
                duration: parseInt(formData.duration),
                categoryId: parseInt(formData.categoryId),
                providerId: formData.providerId ? parseInt(formData.providerId) : null
            };

            if (editingService) {
                await adminService.updateService(editingService.id, data);
                setSuccess('Service updated successfully!');
            } else {
                await adminService.createService(data);
                setSuccess('Service created successfully!');
            }
            fetchData();
            closeModal();
        } catch (error) {
            setError(error.message);
        }
    };

    const confirmDelete = (id) => {
        setServiceToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!serviceToDelete) return;

        try {
            await adminService.deleteService(serviceToDelete);
            setSuccess('Service deleted successfully!');
            fetchData();
        } catch (error) {
            setError(error.message);
        } finally {
            setDeleteModalOpen(false);
            setServiceToDelete(null);
        }
    };

    const openModal = (service = null) => {
        if (service) {
            setEditingService(service);
            setFormData({
                name: service.name,
                // Handle both casing possibilities from API (PascalCase vs camelCase)
                categoryId: service.categoryId || service.category?.id || service.Category?.id || '',
                providerId: service.providerId || service.provider?.id || service.Provider?.id || '',
                description: service.description || '',
                price: service.price,
                discount: service.discount || 0,
                duration: service.duration || 60,
                thumbnail: service.thumbnail || '',
                type: service.type || 'fixed',
                status: service.status,
                faqs: Array.isArray(service.faqs) ? service.faqs : []
            });
        } else {
            setEditingService(null);
            setFormData({
                name: '', categoryId: '', providerId: '', description: '',
                price: '', discount: 0, duration: 60, thumbnail: '', type: 'fixed', status: true, faqs: []
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingService(null);
    };

    const filteredServices = services.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' ? s.status === true : s.status === false);

        // Robust category check handling nested objects and different casing
        const serviceCategoryId = s.categoryId || s.category?.id || s.Category?.id;
        const matchesCategory = categoryFilter === 'all' ||
            String(serviceCategoryId) === String(categoryFilter);

        return matchesSearch && matchesStatus && matchesCategory;
    });

    const totalPages = Math.ceil(filteredServices.length / (itemsPerPage === 'all' ? filteredServices.length : itemsPerPage));

    const paginatedServices = itemsPerPage === 'all'
        ? filteredServices
        : filteredServices.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-900 dark:text-white">Services</h1>
                    <p className="text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400">Manage your services</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-slate-900 dark:text-white rounded-lg font-medium transition-colors"
                >
                    <Plus size={20} />
                    Add Service
                </button>
            </div>

            {/* Alerts */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-2">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}
            {success && (
                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 rounded-lg flex items-center gap-2">
                    <Check size={20} />
                    {success}
                </div>
            )}

            {/* Table */}
            <div className="bg-white dark:bg-gray-100 dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                <div className="p-4 border-b border-gray-100 dark:border-slate-700">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400" size={20} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search services..."
                                className="w-full pl-12 pr-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-900 dark:text-white placeholder-gray-400"
                            />
                        </div>

                        <div className="flex gap-4">
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-900 dark:text-white min-w-[150px]"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-900 dark:text-white min-w-[120px]"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto overflow-y-auto h-[600px] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-600">
                    <table className="w-full relative">
                        <thead className="bg-gray-50 dark:bg-slate-700/50 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 uppercase">Service</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 uppercase">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 uppercase">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 uppercase">Duration</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center">
                                        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    </td>
                                </tr>
                            ) : filteredServices.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400">
                                        No services found
                                    </td>
                                </tr>
                            ) : (
                                paginatedServices.map((service) => (
                                    <tr key={service.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={service.thumbnail || 'https://via.placeholder.com/60'}
                                                    alt={service.name}
                                                    className="w-12 h-12 rounded-lg object-cover bg-gray-100 dark:bg-slate-700"
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-slate-900 dark:text-white">{service.name}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400">{service.provider?.name || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-700 dark:text-gray-300">
                                            {service.category?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <span className="font-medium text-gray-900 dark:text-slate-900 dark:text-white">₹{service.price}</span>
                                                {service.discount > 0 && (
                                                    <span className="text-xs text-green-600 dark:text-green-400 ml-1">-{service.discount}%</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-700 dark:text-gray-300">{service.duration} min</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${service.status === true ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-700 dark:text-gray-300'
                                                }`}>
                                                {service.status === true ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-2 text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => openModal(service)}
                                                    className="p-2 text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(service.id)}
                                                    className="p-2 text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-100 dark:bg-slate-800 rounded-b-xl">
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                            <span>Rows per page:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setItemsPerPage(val === 'all' ? 'all' : Number(val));
                                    setCurrentPage(1);
                                }}
                                className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-slate-900 dark:text-white"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={30}>30</option>
                                <option value={50}>50</option>
                                <option value="all">All</option>
                            </select>
                        </div>
                        <span className="hidden sm:inline">
                            Showing {itemsPerPage === 'all' ? 1 : (currentPage - 1) * itemsPerPage + 1}-
                            {itemsPerPage === 'all' ? filteredServices.length : Math.min(currentPage * itemsPerPage, filteredServices.length)} of {filteredServices.length}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1 || itemsPerPage === 'all'}
                            className="p-2 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600 dark:text-gray-700 dark:text-gray-300"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-sm font-medium text-gray-900 dark:text-slate-900 dark:text-white min-w-[80px] text-center">
                            Page {currentPage} of {itemsPerPage === 'all' ? 1 : totalPages || 1}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || itemsPerPage === 'all' || totalPages === 0}
                            className="p-2 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600 dark:text-gray-700 dark:text-gray-300"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal}></div>
                    <div className="relative bg-white dark:bg-gray-100 dark:bg-slate-800 rounded-xl w-full max-w-5xl shadow-2xl transform transition-all flex flex-col max-h-[90vh] border border-gray-100 dark:border-slate-700">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-700 flex-none">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-900 dark:text-white">
                                    {editingService ? 'Edit Service' : 'Add New Service'}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 mt-1">Fill in the details below</p>
                            </div>
                            <button onClick={closeModal} className="text-gray-600 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-700 dark:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                {/* Section 1: Basic Information */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-1 h-4 bg-primary-600 rounded-full"></span>
                                        Basic Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-700 dark:text-gray-300 mb-2">Service Name *</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="e.g., Full Home Deep Cleaning"
                                                className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-shadow bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-900 dark:text-white placeholder-gray-400"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-700 dark:text-gray-300 mb-2">Category *</label>
                                            <select
                                                value={formData.categoryId}
                                                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-shadow bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-900 dark:text-white"
                                                required
                                            >
                                                <option value="">Select Category</option>
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-700 dark:text-gray-300 mb-2">Provider</label>
                                            <select
                                                value={formData.providerId}
                                                onChange={(e) => setFormData({ ...formData, providerId: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-shadow bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-900 dark:text-white"
                                            >
                                                <option value="">Select Provider (Optional)</option>
                                                {providers.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Pricing & Details */}
                                <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-slate-700">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-1 h-4 bg-primary-600 rounded-full"></span>
                                        Pricing & Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-700 dark:text-gray-300 mb-2">Price (₹) *</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 font-medium">₹</span>
                                                <input
                                                    type="number"
                                                    value={formData.price}
                                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                    placeholder="0.00"
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-shadow bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-900 dark:text-white placeholder-gray-400"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-700 dark:text-gray-300 mb-2">Discount (%)</label>
                                            <input
                                                type="number"
                                                value={formData.discount}
                                                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                                                placeholder="0"
                                                min="0"
                                                max="100"
                                                className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-shadow bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-900 dark:text-white placeholder-gray-400"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-700 dark:text-gray-300 mb-2">Duration (mins)</label>
                                            <input
                                                type="number"
                                                value={formData.duration}
                                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                                placeholder="60"
                                                className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-shadow bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-900 dark:text-white placeholder-gray-400"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-700 dark:text-gray-300 mb-2">Status</label>
                                            <select
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value === 'true' })}
                                                className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-shadow bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-900 dark:text-white"
                                            >
                                                <option value={true}>Active</option>
                                                <option value={false}>Inactive</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Media & Description */}
                                <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-slate-700">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-1 h-4 bg-primary-600 rounded-full"></span>
                                        Media & Description
                                    </h3>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-700 dark:text-gray-300 mb-2">Service Thumbnail</label>
                                            <div className="flex items-start gap-4">
                                                {/* Preview */}
                                                {formData.thumbnail && (
                                                    <div className="relative group shrink-0">
                                                        {formData.thumbnail.startsWith('http') || formData.thumbnail.includes('/') ? (
                                                            <img
                                                                src={formData.thumbnail}
                                                                alt="Thumbnail"
                                                                className="w-24 h-24 object-cover rounded-lg border border-gray-200 dark:border-slate-600 shadow-sm bg-white dark:bg-slate-700"
                                                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                            />
                                                        ) : (
                                                            <div className="w-24 h-24 flex items-center justify-center bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-600 dark:text-gray-400">
                                                                <AlertCircle size={32} />
                                                            </div>
                                                        )}
                                                        <div className="hidden w-24 h-24 items-center justify-center bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-600 dark:text-gray-400">
                                                            <AlertCircle size={32} />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, thumbnail: '' })}
                                                            className="absolute -top-2 -right-2 p-1 bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:text-red-500 rounded-full shadow-md border border-gray-100 dark:border-slate-600 transition-colors"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Upload Area */}
                                                <div className="flex-1">
                                                    <div className="relative group">
                                                        <input
                                                            type="file"
                                                            id="thumbnail-upload"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={async (e) => {
                                                                const file = e.target.files[0];
                                                                if (!file) return;

                                                                const uploadData = new FormData();
                                                                uploadData.append('image', file);

                                                                try {
                                                                    setUploading(true);
                                                                    const { data } = await uploadService.uploadImage(uploadData);
                                                                    setFormData(prev => ({ ...prev, thumbnail: data.imageUrl }));
                                                                } catch (err) {
                                                                    console.error(err);
                                                                    setAlertConfig({
                                                                        isOpen: true,
                                                                        title: 'Error',
                                                                        message: err.message || 'Error uploading image',
                                                                        type: 'danger'
                                                                    });
                                                                } finally {
                                                                    setUploading(false);
                                                                }
                                                            }}
                                                        />
                                                        <label
                                                            htmlFor="thumbnail-upload"
                                                            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all ${uploading
                                                                ? 'border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                                                                : 'border-gray-200 dark:border-slate-600 hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50/30 dark:hover:bg-primary-900/20 text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'
                                                                }`}
                                                        >
                                                            {uploading ? (
                                                                <div className="flex flex-col items-center gap-2">
                                                                    <div className="w-8 h-8 border-3 border-gray-300 border-t-primary-600 rounded-full animate-spin"></div>
                                                                    <span className="text-sm font-medium">Uploading image...</span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex flex-col items-center gap-2">
                                                                    <div className="p-3 bg-gray-100 dark:bg-slate-700 rounded-full group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
                                                                        <Upload size={24} className="group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                                                                    </div>
                                                                    <div className="text-center">
                                                                        <span className="text-sm font-semibold text-gray-900 dark:text-slate-900 dark:text-white">Click to upload</span>
                                                                        <span className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400"> or drag and drop</span>
                                                                    </div>
                                                                    <span className="text-xs text-gray-600 dark:text-gray-400">PNG, JPG, GIF up to 5MB</span>
                                                                </div>
                                                            )}
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-700 dark:text-gray-300 mb-2">Description</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="Write a detailed description of the service..."
                                                rows={4}
                                                className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-shadow resize-none bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-900 dark:text-white placeholder-gray-400"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 4: FAQs */}
                                <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-slate-700">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                            <span className="w-1 h-4 bg-primary-600 rounded-full"></span>
                                            Frequently Asked Questions
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({
                                                ...formData,
                                                faqs: [...formData.faqs, { question: '', answer: '' }]
                                            })}
                                            className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                                        >
                                            <Plus size={16} />
                                            Add Question
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {formData.faqs.map((faq, index) => (
                                            <div key={index} className="p-4 bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-700 rounded-lg relative group hover:border-primary-100 dark:hover:border-primary-900/50 transition-colors">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({
                                                        ...formData,
                                                        faqs: formData.faqs.filter((_, i) => i !== index)
                                                    })}
                                                    className="absolute top-2 right-2 p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                                >
                                                    <X size={16} />
                                                </button>
                                                <div className="grid gap-3">
                                                    <input
                                                        type="text"
                                                        placeholder="Question (e.g. What is included?)"
                                                        value={faq.question}
                                                        onChange={(e) => {
                                                            const newFaqs = [...formData.faqs];
                                                            newFaqs[index].question = e.target.value;
                                                            setFormData({ ...formData, faqs: newFaqs });
                                                        }}
                                                        className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm font-medium focus:border-primary-500 outline-none text-gray-900 dark:text-slate-900 dark:text-white placeholder-gray-400"
                                                    />
                                                    <textarea
                                                        placeholder="Answer"
                                                        value={faq.answer}
                                                        onChange={(e) => {
                                                            const newFaqs = [...formData.faqs];
                                                            newFaqs[index].answer = e.target.value;
                                                            setFormData({ ...formData, faqs: newFaqs });
                                                        }}
                                                        rows={2}
                                                        className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-600 dark:text-gray-700 dark:text-gray-300 focus:border-primary-500 outline-none resize-none placeholder-gray-400"
                                                    />
                                                </div>
                                            </div>
                                        ))}

                                        {formData.faqs.length === 0 && (
                                            <div className="text-center py-8 bg-gray-50 dark:bg-slate-700/30 rounded-xl border border-dashed border-gray-200 dark:border-slate-600">
                                                <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400">No FAQs added yet.</p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Add common questions to help customers understand the service.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer Buttons */}
                            <div className="flex gap-4 p-6 border-t border-gray-100 dark:border-slate-700 bg-white dark:bg-gray-100 dark:bg-slate-800 flex-none">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 py-3.5 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3.5 bg-primary-600 hover:bg-primary-700 text-slate-900 dark:text-white font-semibold rounded-lg shadow-lg shadow-primary-200 dark:shadow-none hover:shadow-xl transition-all"
                                >
                                    {editingService ? 'Update Service' : 'Create Service'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Service?"
                message="Are you sure you want to delete this service? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                icon={<Trash2 size={48} className="text-red-500 mb-4" />}
            />

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

export default ServicesAdmin;
