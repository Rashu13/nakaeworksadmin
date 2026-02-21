import React, { useState, useEffect } from 'react';
import {
    Plus, Edit2, Trash2, Loader, Search, X, Image as ImageIcon,
    Clock, IndianRupee, Tag
} from 'lucide-react';
import { providerService, categoryService } from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';

const Services = () => {
    const [loading, setLoading] = useState(true);
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        categoryId: '',
        description: '',
        price: '',
        discount: '',
        duration: '60',
        type: 'fixed',
        thumbnail: ''
    });
    const [saving, setSaving] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null);
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', type: 'info' });

    useEffect(() => {
        fetchServices();
        fetchCategories();
    }, []);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const response = await providerService.getServices();
            if (response.data.success) {
                setServices(response.data.data);
            }
        } catch (error) {
            console.error('Fetch services error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await categoryService.getAll();
            setCategories(response.data || []);
        } catch (error) {
            console.error('Fetch categories error:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingService) {
                await providerService.updateService(editingService.id, formData);
            } else {
                await providerService.addService(formData);
            }
            setShowModal(false);
            setEditingService(null);
            resetForm();
            fetchServices();
        } catch (error) {
            console.error('Save error:', error);
            setAlertConfig({
                isOpen: true,
                title: 'Save Failed',
                message: 'Failed to save service details. Please try again.',
                type: 'danger'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (service) => {
        setEditingService(service);
        setFormData({
            name: service.name,
            categoryId: service.categoryId,
            description: service.description || '',
            price: service.price,
            discount: service.discount || '',
            duration: service.duration || '60',
            type: service.type || 'fixed',
            thumbnail: service.thumbnail || ''
        });
        setShowModal(true);
    };

    const confirmDelete = (id) => {
        setServiceToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!serviceToDelete) return;

        try {
            await providerService.deleteService(serviceToDelete);
            fetchServices();
        } catch (error) {
            console.error('Delete error:', error);
            setAlertConfig({
                isOpen: true,
                title: 'Delete Failed',
                message: 'Failed to delete service. Please try again.',
                type: 'danger'
            });
        } finally {
            setDeleteModalOpen(false);
            setServiceToDelete(null);
        }
    };

    const handleToggleStatus = async (service) => {
        try {
            await providerService.updateService(service.id, { status: service.status ? 0 : 1 });
            fetchServices();
        } catch (error) {
            console.error('Toggle error:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            categoryId: '',
            description: '',
            price: '',
            discount: '',
            duration: '60',
            type: 'fixed',
            thumbnail: ''
        });
    };

    const handleImageError = (e) => {
        e.target.onerror = null;
        e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Services</h1>
                    <p className="text-gray-600">Manage your service offerings</p>
                </div>
                <button
                    onClick={() => { resetForm(); setEditingService(null); setShowModal(true); }}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Service
                </button>
            </div>

            {/* Services Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader className="w-8 h-8 animate-spin text-emerald-600" />
                </div>
            ) : services.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                    <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No services yet</h3>
                    <p className="text-gray-500 mb-4">Add your first service to start receiving bookings</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-xl font-medium transition-colors"
                    >
                        Add Your First Service
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service) => (
                        <div key={service.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            {/* Thumbnail */}
                            <div className="relative h-48 bg-gray-100">
                                <img
                                    src={service.thumbnail
                                        ? (service.thumbnail.startsWith('http')
                                            ? service.thumbnail
                                            : `https://service.pathostar.in${service.thumbnail}`)
                                        : 'https://via.placeholder.com/300x200?text=No+Image'
                                    }
                                    alt={service.name}
                                    className="w-full h-full object-cover"
                                    onError={handleImageError}
                                />
                                {!service.status && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">Inactive</span>
                                    </div>
                                )}
                                {service.discount > 0 && (
                                    <span className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                                        {Math.round((service.discount / service.price) * 100)}% OFF
                                    </span>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{service.name}</h3>
                                        <p className="text-emerald-600 text-sm">{service.category?.name}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {service.duration}min
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Tag className="w-4 h-4" />
                                        {service.type}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        {service.discount > 0 ? (
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-bold text-gray-900">₹{(service.price - service.discount).toLocaleString()}</span>
                                                <span className="text-sm text-gray-400 line-through">₹{parseFloat(service.price).toLocaleString()}</span>
                                            </div>
                                        ) : (
                                            <span className="text-lg font-bold text-gray-900">₹{parseFloat(service.price).toLocaleString()}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEdit(service)}
                                            className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => confirmDelete(service.id)}
                                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Toggle Status */}
                                <button
                                    onClick={() => handleToggleStatus(service)}
                                    className={`w-full mt-3 py-2 rounded-lg text-sm font-medium transition-colors ${service.status
                                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                        }`}
                                >
                                    {service.status ? 'Deactivate' : 'Activate'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingService ? 'Edit Service' : 'Add New Service'}
                            </h2>
                            <button
                                onClick={() => { setShowModal(false); setEditingService(null); }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Service Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="e.g., AC Repair Service"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                                <select
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="Describe your service..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount (₹)</label>
                                    <input
                                        type="number"
                                        value={formData.discount}
                                        onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                                    <input
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        min="15"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    >
                                        <option value="fixed">Fixed</option>
                                        <option value="provider_site">At Provider Site</option>
                                        <option value="remotely">Remotely</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
                                <input
                                    type="text"
                                    value={formData.thumbnail}
                                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); setEditingService(null); }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {saving && <Loader className="w-4 h-4 animate-spin" />}
                                    {editingService ? 'Update' : 'Add Service'}
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

export default Services;
