import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Search, Check, AlertCircle, Eye, Lock, Upload, Camera } from 'lucide-react';
import { adminService, uploadService } from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';

const UsersAdmin = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'consumer',
        status: true,
        avatar: ''
    });
    const [uploadingImage, setUploadingImage] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchUsers();
    }, [roleFilter]);

    const fetchUsers = async () => {
        try {
            const data = await adminService.getUsers(roleFilter);
            setUsers(data.users || []);
        } catch (error) {
            // Demo data
            setUsers([
                { id: 1, name: 'Admin User', email: 'admin@nakaeworks.com', phone: '9876543210', role: 'admin', status: true, isVerified: true },
                { id: 2, name: 'Rajesh Kumar', email: 'rajesh@gmail.com', phone: '9876543211', role: 'provider', status: true, isVerified: true },
                { id: 3, name: 'Priya Sharma', email: 'priya@gmail.com', phone: '9876543212', role: 'consumer', status: true, isVerified: false },
                { id: 4, name: 'CleanPro Services', email: 'cleanpro@gmail.com', phone: '9876543213', role: 'provider', status: true, isVerified: true },
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
            if (editingUser) {
                const updateData = { ...formData };
                if (!updateData.password) delete updateData.password;
                await adminService.updateUser(editingUser.id, updateData);
                setSuccess('User updated successfully!');
            } else {
                await adminService.createUser(formData);
                setSuccess('User created successfully!');
            }
            fetchUsers();
            closeModal();
        } catch (error) {
            setError(error.message);
        }
    };

    const confirmDelete = (id) => {
        setUserToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!userToDelete) return;

        try {
            await adminService.deleteUser(userToDelete);
            setSuccess('User deleted successfully!');
            fetchUsers();
        } catch (error) {
            setError(error.message);
        } finally {
            setDeleteModalOpen(false);
            setUserToDelete(null);
        }
    };

    const openModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                password: '',
                role: user.role,
                status: user.status,
                avatar: user.avatar || ''
            });
        } else {
            setEditingUser(null);
            setFormData({
                name: '', email: '', phone: '', password: '', role: 'consumer', status: true, avatar: ''
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingUser(null);
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getRoleBadge = (role) => {
        const colors = {
            admin: 'bg-purple-100 text-purple-700',
            provider: 'bg-blue-100 text-blue-700',
            consumer: 'bg-gray-100 text-gray-700'
        };
        return colors[role] || colors.consumer;
    };

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-900 dark:text-white">Users</h1>
                    <p className="text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400">Manage users and providers</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-slate-900 dark:text-white rounded-lg font-medium transition-colors"
                >
                    <Plus size={20} />
                    Add User
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

            {/* Filters */}
            <div className="bg-white dark:bg-gray-100 dark:bg-slate-800 rounded-xl shadow-sm mb-6 border border-gray-100 dark:border-slate-700">
                <div className="p-4 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search users..."
                            className="w-full pl-12 pr-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-900 dark:text-white placeholder-gray-400"
                        />
                    </div>
                    <div className="flex gap-2">
                        {['', 'consumer', 'provider', 'admin'].map((role) => (
                            <button
                                key={role}
                                onClick={() => setRoleFilter(role)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${roleFilter === role
                                    ? 'bg-primary-600 text-slate-900 dark:text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-700 dark:text-gray-300 dark:hover:bg-slate-600'
                                    }`}
                            >
                                {role === '' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 uppercase">Contact</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 uppercase">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center">
                                        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={`https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`}
                                                    alt={user.name}
                                                    className="w-10 h-10 rounded-full"
                                                />
                                                <div>
                                                    <div className="flex items-center gap-1">
                                                        <p className="font-medium text-gray-900 dark:text-slate-900 dark:text-white">{user.name}</p>
                                                        {user.isVerified && (
                                                            <Lock size={14} className="text-green-500" />
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-700 dark:text-gray-300">
                                            {user.phone || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-md capitalize ${getRoleBadge(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-md ${user.status === true ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                {user.status === true ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-2 text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => openModal(user)}
                                                    className="p-2 text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                {user.role !== 'admin' && (
                                                    <button
                                                        onClick={() => confirmDelete(user.id)}
                                                        className="p-2 text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
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
                    <div className="relative bg-white dark:bg-gray-100 dark:bg-slate-800 rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-slate-700 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-900 dark:text-white">
                                {editingUser ? 'Edit User' : 'Add User'}
                            </h2>
                            <button onClick={closeModal} className="text-gray-600 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-700 dark:text-gray-300">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Avatar Upload */}
                            <div className="flex flex-col items-center mb-6">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-2 border-slate-200 dark:border-slate-600">
                                        {formData.avatar ? (
                                            <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <Camera size={40} className="text-slate-400" />
                                        )}
                                    </div>
                                    <label className="absolute bottom-0 right-0 p-1.5 bg-primary-600 text-slate-900 dark:text-white rounded-full cursor-pointer hover:bg-primary-700 transition-colors shadow-sm">
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;
                                                setUploadingImage(true);
                                                try {
                                                    const data = await uploadService.uploadImage(file);
                                                    setFormData(prev => ({ ...prev, avatar: data.imageUrl }));
                                                } catch (err) {
                                                    setError('Failed to upload image');
                                                } finally {
                                                    setUploadingImage(false);
                                                }
                                            }}
                                        />
                                        {uploadingImage ? (
                                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <Upload size={14} />
                                        )}
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Allowed: JPG, PNG (Max 5MB)</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 dark:text-gray-300 mb-2">Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Full name"
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-900 dark:text-white placeholder-gray-400"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 dark:text-gray-300 mb-2">Email *</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="email@example.com"
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-900 dark:text-white placeholder-gray-400"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+91 98765 43210"
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-900 dark:text-white placeholder-gray-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 dark:text-gray-300 mb-2">
                                    Password {editingUser ? '(leave empty to keep current)' : '*'}
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-900 dark:text-white placeholder-gray-400"
                                    required={!editingUser}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 dark:text-gray-300 mb-2">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-900 dark:text-white"
                                >
                                    <option value="consumer">Consumer</option>
                                    <option value="provider">Provider</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-700 dark:text-gray-300 mb-2">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value === 'true' })}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-900 dark:text-white"
                                >
                                    <option value={true}>Active</option>
                                    <option value={false}>Inactive</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 py-3 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-slate-900 dark:text-white font-medium rounded-lg"
                                >
                                    {editingUser ? 'Update' : 'Create'}
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
                title="Delete User?"
                message="Are you sure you want to delete this user? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                icon={<Trash2 size={48} className="text-red-500 mb-4" />}
            />
        </div>
    );
};

export default UsersAdmin;
