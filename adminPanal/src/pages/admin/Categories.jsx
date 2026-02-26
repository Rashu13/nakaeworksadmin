import { motion, AnimatePresence } from 'framer-motion';

const Categories = () => {
    // ... existing state ...
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

    return (
        <div className="space-y-8 pb-20">
            {/* Header Strategy */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-8 h-[2px] bg-primary-500"></span>
                        <span className="text-[10px] font-black text-primary-500 uppercase tracking-[4px]">Operations Index</span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Category <span className="text-primary-500">Archives</span></h1>
                    <p className="text-gray-500 dark:text-gray-500 text-sm font-bold mt-2 uppercase tracking-[1px]">Manage and classify professional service protocols.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-[1.25rem] font-black text-sm uppercase tracking-[2px] shadow-lg shadow-primary-500/20 transition-all hover:scale-105 active:scale-95"
                >
                    <Plus size={20} />
                    Deploy New Category
                </button>
            </div>

            {/* Notification Surface */}
            <AnimatePresence>
                {(error || success) && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`p-5 rounded-[1.5rem] border ${error ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'} flex items-center gap-4`}
                    >
                        {error ? <AlertCircle size={20} /> : <Check size={20} />}
                        <p className="text-[10px] font-black uppercase tracking-[2px]">{error || success}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Search Grid */}
            <div className="bg-white dark:bg-white/5 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                <div className="p-8 border-b border-gray-100 dark:border-white/5 relative bg-gray-50/30 dark:bg-transparent">
                    <div className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={22} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="FILTER REGISTRY BY NAME OR PROTOCOL..."
                            className="w-full pl-16 pr-8 py-5 border border-gray-100 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none bg-white dark:bg-black/20 text-gray-900 dark:text-white placeholder-gray-400 text-xs font-black tracking-[1px] transition-all"
                        />
                    </div>
                </div>

                {/* Registry Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[3px]">
                                <th className="py-8 px-8">Identifier</th>
                                <th className="py-8 px-8">Registry Slug</th>
                                <th className="py-8 px-8">Visual Index</th>
                                <th className="py-8 px-8">Authorization</th>
                                <th className="py-8 px-8 text-right">System Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] mt-4">Retrieving Archives...</p>
                                    </td>
                                </tr>
                            ) : filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center bg-gray-50/50 dark:bg-white/[0.01]">
                                        <div className="max-w-[200px] mx-auto opacity-20 filter grayscale mb-6">
                                            <Search size={64} className="mx-auto" />
                                        </div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[3px]">Zero match in registry frequency</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredCategories.map((category) => (
                                    <tr key={category.id} className="group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="py-6 px-8">
                                            <span className="font-black text-gray-900 dark:text-white text-sm tracking-tight">{category.name}</span>
                                        </td>
                                        <td className="py-6 px-8">
                                            <code className="text-[10px] font-bold text-primary-500 bg-primary-500/5 px-2 py-1 rounded-md uppercase tracking-wider">{category.slug}</code>
                                        </td>
                                        <td className="py-6 px-8">
                                            {category.icon ? (
                                                <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100 dark:border-white/10 group-hover:scale-110 transition-transform">
                                                    <img src={category.icon} alt={category.name} className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic text-[10px]">NO VISUAL</span>
                                            )}
                                        </td>
                                        <td className="py-6 px-8">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${category.status ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${category.status ? 'text-emerald-500' : 'text-gray-400'}`}>
                                                    {category.status ? 'AUTHORIZED' : 'DEACTIVATED'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-6 px-8">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => openModal(category)}
                                                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-primary-500 hover:bg-primary-500/10 rounded-xl transition-all"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(category.id)}
                                                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
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

            {/* Premium Modal Surface */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
                            onClick={closeModal}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white dark:bg-[#0f172a] rounded-[3rem] w-full max-w-xl p-10 border border-gray-100 dark:border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 blur-[80px] pointer-events-none" />

                            <div className="flex items-center justify-between mb-10 relative z-10">
                                <div>
                                    <p className="text-[10px] font-black text-primary-500 uppercase tracking-[4px] mb-2">Registry Command</p>
                                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase whitespace-nowrap">
                                        {editingCategory ? 'Modify Protocol' : 'Deploy Protocol'}
                                    </h2>
                                </div>
                                <button onClick={closeModal} className="w-12 h-12 flex items-center justify-center bg-gray-50 dark:bg-white/5 hover:bg-red-500 hover:text-white rounded-2xl transition-all text-gray-400">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[2px] ml-1">Protocol Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="E.G. TECHNICAL REPAIR"
                                        className="w-full px-6 py-4 border border-gray-100 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none bg-white dark:bg-black/20 text-gray-900 dark:text-white font-bold tracking-tight transition-all"
                                        required
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[2px] ml-1">Visual Encryption (Icon/Image)</label>
                                    <div className="space-y-3">
                                        {formData.icon ? (
                                            <div className="flex items-center gap-5 p-4 border border-primary-500/20 rounded-2xl bg-primary-500/5">
                                                <img src={formData.icon} alt="Preview" className="w-14 h-14 object-cover rounded-xl border-2 border-primary-500/30 shadow-lg" />
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="text-[10px] font-black text-gray-900 dark:text-white truncate uppercase tracking-[1px]">{formData.icon.split('/').pop()}</p>
                                                    <p className="text-[8px] font-black text-emerald-500 uppercase tracking-[2px] mt-1">Status: Linked</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, icon: '' })}
                                                    className="p-2 hover:bg-red-500 hover:text-white text-gray-400 rounded-xl transition-all"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="relative group">
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
                                                            setAlertConfig({ isOpen: true, title: 'Error', message: 'Encryption Failed', type: 'danger' });
                                                        } finally {
                                                            setUploading(false);
                                                        }
                                                    }}
                                                />
                                                <label
                                                    htmlFor="icon-upload"
                                                    className={`flex flex-col items-center justify-center gap-2 w-full py-8 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all ${uploading
                                                        ? 'bg-gray-50 dark:bg-white/5 border-gray-300'
                                                        : 'border-gray-200 dark:border-white/10 hover:border-primary-500 hover:bg-primary-500/5'}`}
                                                >
                                                    {uploading ? (
                                                        <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                        <>
                                                            <Upload size={32} className="text-gray-300 group-hover:text-primary-500 transition-colors" />
                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[3px]">Upload Visual Data</span>
                                                        </>
                                                    )}
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[2px] ml-1">Protocol Intelligence (Description)</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Brief strategic briefing for this category..."
                                        rows={3}
                                        className="w-full px-6 py-4 border border-gray-100 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none bg-white dark:bg-black/20 text-gray-900 dark:text-white font-medium transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[2px] ml-1">Access Level</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value === 'true' })}
                                            className="w-full px-6 py-4 border border-gray-100 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none bg-white dark:bg-black/20 text-gray-900 dark:text-white font-bold uppercase text-[10px] tracking-[2px] transition-all"
                                        >
                                            <option value={true}>AUTHORIZED</option>
                                            <option value={false}>DEACTIVATED</option>
                                        </select>
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            type="submit"
                                            className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-black text-xs uppercase tracking-[3px] rounded-2xl shadow-xl shadow-primary-500/20 transition-all hover:scale-[1.02]"
                                        >
                                            {editingCategory ? 'Update Protocol' : 'Sync Protocol'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Standard Modals */}
            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Wipe Protocol?"
                message="This will permanently delete the category from the operational registry. Strategic data loss imminent."
                confirmText="PURGE"
                cancelText="ABORT"
                icon={<Trash2 size={48} className="text-red-500 mb-6" />}
            />

            {/* Alert System */}
            <ConfirmationModal
                isOpen={alertConfig.isOpen}
                onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
                onConfirm={() => setAlertConfig({ ...alertConfig, isOpen: false })}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                confirmText="ACKNOWLEDGE"
                cancelText={null}
            />
        </div>
    );
};

export default Categories;
