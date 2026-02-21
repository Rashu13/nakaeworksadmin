import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Search, Check, AlertCircle, Upload } from 'lucide-react';
import { adminService, uploadService } from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        icon: '',
        description: '',
        status: true
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', type: 'info' });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await adminService.getCategories();
            setCategories(data);
        } catch (error) {
            // Demo data if API fails
            setCategories([
                { id: 1, name: 'Cleaning', slug: 'cleaning', icon: 'sparkles', description: 'Home cleaning services', status: true },
                { id: 2, name: 'Electrician', slug: 'electrician', icon: 'zap', description: 'Electrical repair services', status: true },
                { id: 3, name: 'Plumber', slug: 'plumber', icon: 'droplet', description: 'Plumbing services', status: true },
                { id: 4, name: 'Salon', slug: 'salon', icon: 'scissors', description: 'Beauty & salon services', status: true },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            if (editingCategory) {
                await adminService.updateCategory(editingCategory.id, formData);
                setSuccess('Category updated successfully!');
            } else {
                await adminService.createCategory(formData);
                setSuccess('Category created successfully!');
            }
            fetchCategories();
            closeModal();
        } catch (error) {
            setError(error.message);
        }
    };

    const confirmDelete = (id) => {
        setCategoryToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!categoryToDelete) return;

        try {
            await adminService.deleteCategory(categoryToDelete);
            setSuccess('Category deleted successfully!');
            fetchCategories();
        } catch (error) {
            setError(error.message);
        } finally {
            setDeleteModalOpen(false);
            setCategoryToDelete(null);
        }
    };

    const openModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                icon: category.icon || '',
                description: category.description || '',
                status: category.status
            });
        } else {
            setEditingCategory(null);
            setFormData({ name: '', icon: '', description: '', status: true });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingCategory(null);
        setFormData({ name: '', icon: '', description: '', status: true });
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const iconOptions = [
        'sparkles', 'zap', 'droplet', 'hammer', 'paintbrush', 'scissors',
        'car', 'shield', 'home', 'wrench', 'thermometer', 'wind'
    ];

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage service categories</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
                >
                    <Plus size={20} />
                    Add Category
                </button>
            </div>

            {/* Alerts */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}
            {success && (
                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 rounded-xl flex items-center gap-2">
                    <Check size={20} />
                    {success}
                </div>
            )}

            {/* Search */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm mb-6 border border-gray-100 dark:border-slate-700">
                <div className="p-4 border-b border-gray-100 dark:border-slate-700">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search categories..."
                            className="w-full pl-12 pr-4 py-2 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Slug</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Icon</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center">
                                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    </td>
                                </tr>
                            ) : filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                                        No categories found
                                    </td>
                                </tr>
                            ) : (
                                filteredCategories.map((category) => (
                                    <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-gray-900 dark:text-white">{category.name}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{category.slug}</td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{category.icon || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${category.status === true
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                                }`}>
                                                {category.status === true ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openModal(category)}
                                                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(category.id)}
                                                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
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
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal}></div>
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6 border border-gray-100 dark:border-slate-700 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {editingCategory ? 'Edit Category' : 'Add Category'}
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Category Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Home Cleaning"
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Category Icon / Image
                                </label>

                                <div className="space-y-3">
                                    {/* Preview */}
                                    {formData.icon && (
                                        <div className="flex items-center gap-4 p-3 border border-gray-100 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-700/50">
                                            {formData.icon.startsWith('http') || formData.icon.includes('/') ? (
                                                <img
                                                    src={formData.icon}
                                                    alt="Category Icon"
                                                    className="w-12 h-12 object-cover rounded-lg bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-600"
                                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                                                />
                                            ) : (
                                                <div className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-600 rounded-lg text-indigo-600 dark:text-indigo-400">
                                                    {/* Fallback for simple icon names if any */}
                                                    <span className="text-xs font-bold">{formData.icon}</span>
                                                </div>
                                            )}
                                            {/* Fallback hidden img */}
                                            <div className="hidden w-12 h-12 items-center justify-center bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-400">
                                                <AlertCircle size={20} />
                                            </div>

                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{formData.icon.split('/').pop()}</p>
                                                <p className="text-xs text-green-600 dark:text-green-400">Image successfully linked</p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, icon: '' })}
                                                className="p-1 hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-full transition-colors"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    )}

                                    {/* Upload Input */}
                                    <div className="relative">
                                        <input
                                            type="file"
                                            id="icon-upload"
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
                                                    setFormData(prev => ({ ...prev, icon: data.imageUrl }));
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
                                            htmlFor="icon-upload"
                                            className={`flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${uploading
                                                ? 'border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 text-gray-400 cursor-not-allowed'
                                                : 'border-gray-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                                                }`}
                                        >
                                            {uploading ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                                    <span>Uploading...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload size={20} />
                                                    <span>{formData.icon ? 'Change Image' : 'Upload Image'}</span>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Supported: JPG, PNG, GIF (Max 5MB)</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of the category"
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value === 'true' })}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                >
                                    <option value={true}>Active</option>
                                    <option value={false}>Inactive</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 py-3 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl"
                                >
                                    {editingCategory ? 'Update' : 'Create'}
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
                title="Delete Category?"
                message="Are you sure you want to delete this category? This action cannot be undone."
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

export default Categories;
