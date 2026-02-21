import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ConfirmationModal from '../../components/ConfirmationModal';
import { contentService, serviceService } from '../../services/api';
import { Plus, Image as ImageIcon, Layers, Edit2, Trash2, Eye, EyeOff, Link, Save, X } from 'lucide-react';

const ContentAdmin = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'banners';

    // Helper to update tab and URL
    const setActiveTab = (tab) => {
        setSearchParams({ tab });
    };

    const [banners, setBanners] = useState([]);
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({});
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    useEffect(() => {
        if (activeTab === 'banners') fetchBanners();
        else fetchCollections();
    }, [activeTab]);

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const data = await contentService.getBanners();
            setBanners(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCollections = async () => {
        setLoading(true);
        try {
            const data = await contentService.getCollections();
            setCollections(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (activeTab === 'banners') {
                if (editingItem) {
                    await contentService.updateBanner(editingItem.id, formData);
                } else {
                    await contentService.createBanner(formData);
                }
                fetchBanners();
            } else {
                if (editingItem) {
                    await contentService.updateCollection(editingItem.id, formData);
                } else {
                    await contentService.createCollection(formData);
                }
                fetchCollections();
            }
            setShowModal(false);
            setFormData({});
            setEditingItem(null);
            setMessage({ type: 'success', text: 'Saved successfully' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to save' });
        }
    };

    const confirmDelete = (id) => {
        setItemToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        try {
            if (activeTab === 'banners') {
                await contentService.deleteBanner(itemToDelete);
                fetchBanners();
            } else {
                await contentService.deleteCollection(itemToDelete);
                fetchCollections();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    const [availableServices, setAvailableServices] = useState([]);

    useEffect(() => {
        if (activeTab === 'collections') {
            fetchServices();
        }
    }, [activeTab]);

    const fetchServices = async () => {
        try {
            const data = await serviceService.getAll();
            setAvailableServices(data);
        } catch (error) {
            console.error('Failed to fetch services', error);
        }
    };

    const openModal = (item = null) => {
        setEditingItem(item);
        if (item) {
            // map item.items to serviceIds if needed, but backend returns items as object array.
            // We need to map it back to IDs for the form.
            const serviceIds = item.items ? item.items.map(i => i.serviceId) : [];
            setFormData({ ...item, serviceIds });
        } else {
            setFormData(activeTab === 'banners'
                ? { title: '', imageUrl: '', link: '', position: 0, isActive: true }
                : { title: '', type: 'manual', position: 0, isActive: true, serviceIds: [] });
        }
        setShowModal(true);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
                    <p className="text-gray-500">Manage home page banners and collections</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                >
                    <Plus size={18} />
                    Add {activeTab === 'banners' ? 'Banner' : 'Collection'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('banners')}
                    className={`pb-3 px-4 font-medium transition-colors relative ${activeTab === 'banners' ? 'text-slate-900' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <ImageIcon size={18} /> Banners
                    </div>
                    {activeTab === 'banners' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-900"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('collections')}
                    className={`pb-3 px-4 font-medium transition-colors relative ${activeTab === 'collections' ? 'text-slate-900' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Layers size={18} /> Collections
                    </div>
                    {activeTab === 'collections' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-900"></div>}
                </button>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            {/* Banners List */}
            {activeTab === 'banners' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {banners.map((banner) => (
                        <div key={banner.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
                            <div className="relative h-48 bg-gray-100">
                                <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openModal(banner)} className="p-1.5 bg-white text-gray-700 rounded-lg hover:text-slate-900 shadow-sm">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => confirmDelete(banner.id)} className="p-1.5 bg-white text-red-600 rounded-lg hover:bg-red-50 shadow-sm">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                {!banner.isActive && (
                                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                        <span className="px-3 py-1 bg-gray-800 text-white rounded-full text-xs font-bold flex items-center gap-1">
                                            <EyeOff size={12} /> Hidden
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-gray-900">{banner.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                    <Link size={14} />
                                    <span className="truncate">{banner.link}</span>
                                </div>
                                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                                    <span className="text-xs text-gray-400">Position: {banner.position}</span>
                                    {banner.isActive ? (
                                        <span className="text-xs font-bold text-green-600 flex items-center gap-1"><Eye size={12} /> Active</span>
                                    ) : (
                                        <span className="text-xs font-bold text-gray-400">Inactive</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Collections List */}
            {activeTab === 'collections' && (
                <div className="space-y-4">
                    {collections.map((col) => (
                        <div key={col.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold">
                                    {col.position}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{col.title}</h3>
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs uppercase font-bold tracking-wide">
                                        {col.type}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`flex items-center gap-1 text-sm font-bold ${col.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                                    {col.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                                    {col.isActive ? 'Active' : 'Hidden'}
                                </span>
                                <div className="flex gap-2">
                                    <button onClick={() => openModal(col)} className="p-2 text-gray-400 hover:text-slate-900 hover:bg-gray-50 rounded-lg">
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={() => confirmDelete(col.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white rounded-2xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingItem ? 'Edit' : 'Add'} {activeTab === 'banners' ? 'Banner' : 'Collection'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={formData.title || ''}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    required
                                />
                            </div>

                            {activeTab === 'banners' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                        <input
                                            type="text"
                                            value={formData.imageUrl || ''}
                                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
                                        <input
                                            type="text"
                                            value={formData.link || ''}
                                            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                            placeholder="/services/category-slug"
                                        />
                                    </div>
                                </>
                            )}

                            {activeTab === 'collections' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                        <select
                                            value={formData.type || 'manual'}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        >
                                            <option value="manual">Manual Selection</option>
                                            <option value="auto-new">New Arrivals (Auto)</option>
                                            <option value="auto-featured">Featured (Auto)</option>
                                            <option value="auto-bestseller">Best Sellers (Auto)</option>
                                        </select>
                                    </div>

                                    {formData.type === 'manual' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Services ({formData.serviceIds?.length || 0})</label>
                                            <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto p-2 space-y-1">
                                                {availableServices.length > 0 ? (
                                                    availableServices.map(service => (
                                                        <label key={service.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={(formData.serviceIds || []).includes(service.id)}
                                                                onChange={(e) => {
                                                                    const currentIds = formData.serviceIds || [];
                                                                    let newIds;
                                                                    if (e.target.checked) {
                                                                        newIds = [...currentIds, service.id];
                                                                    } else {
                                                                        newIds = currentIds.filter(id => id !== service.id);
                                                                    }
                                                                    setFormData({ ...formData, serviceIds: newIds });
                                                                }}
                                                                className="w-4 h-4 text-slate-900 rounded focus:ring-slate-900"
                                                            />
                                                            <span className="ml-2 text-sm text-gray-700">{service.name}</span>
                                                        </label>
                                                    ))
                                                ) : (
                                                    <div className="text-sm text-gray-500 p-2">No services available</div>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Selected services will appear in this collection</p>
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                                    <input
                                        type="number"
                                        value={formData.position || 0}
                                        onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div className="flex items-center pt-6">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive !== false}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                                        />
                                        <span className="ml-2 text-gray-700 font-medium">Active</span>
                                    </label>
                                </div>
                            </div>

                            <button type="submit" className="w-full py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800">
                                <Save size={18} className="inline mr-2" /> Save Changes
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title={`Delete ${activeTab === 'banners' ? 'Banner' : 'Collection'}?`}
                message={`Are you sure you want to delete this ${activeTab === 'banners' ? 'banner' : 'collection'}? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                icon={<Trash2 size={48} className="text-red-500 mb-4" />}
            />
        </div>
    );
};

export default ContentAdmin;
