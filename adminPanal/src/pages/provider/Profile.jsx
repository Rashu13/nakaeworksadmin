import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Camera, Lock, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService, uploadService, BASE_URL } from '../../services/api';

const Profile = () => {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [activeTab, setActiveTab] = useState('profile');
    const [uploading, setUploading] = useState(false);

    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        about: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                about: user.about || ''
            });
        }
    }, [user]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await authService.updateProfile(profileData);
            if (response.data) {
                setUser({ ...user, ...response.data });
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await authService.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to change password' });
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            const response = await uploadService.uploadImage(formData);

            if (response.imageUrl) {
                await authService.updateProfile({ avatar: response.imageUrl });
                setUser({ ...user, avatar: response.imageUrl });
                setMessage({ type: 'success', text: 'Profile picture updated!' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to upload image' });
        } finally {
            setUploading(false);
        }
    };

    const handleImageError = (e) => {
        e.target.onerror = null;
        e.target.src = `https://ui-avatars.com/api/?name=${user?.name || 'Provider'}&background=10b981&color=fff&size=200`;
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-gray-600">Manage your account settings</p>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Cover */}
                <div className="h-32 bg-gradient-to-r from-emerald-500 to-teal-600"></div>

                {/* Avatar */}
                <div className="px-6 pb-6">
                    <div className="relative -mt-16 mb-4">
                        <div className="relative inline-block">
                            <img
                                src={user?.avatar
                                    ? (user.avatar.startsWith('http')
                                        ? user.avatar
                                        : `${BASE_URL}${user.avatar}`)
                                    : `https://ui-avatars.com/api/?name=${user?.name || 'Provider'}&background=10b981&color=fff&size=200`
                                }
                                alt={user?.name}
                                className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-lg"
                                onError={handleImageError}
                            />
                            <label className="absolute bottom-0 right-0 p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl cursor-pointer shadow-lg transition-colors">
                                {uploading ? (
                                    <Loader className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Camera className="w-5 h-5" />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    disabled={uploading}
                                />
                            </label>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                    <p className="text-emerald-600">Service Provider</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1 flex">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'profile'
                        ? 'bg-emerald-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <User className="w-4 h-4 inline mr-2" />
                    Profile
                </button>
                <button
                    onClick={() => setActiveTab('password')}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'password'
                        ? 'bg-emerald-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <Lock className="w-4 h-4 inline mr-2" />
                    Password
                </button>
            </div>

            {/* Message */}
            {message.text && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                    {message.type === 'success' ? (
                        <CheckCircle className="w-5 h-5" />
                    ) : (
                        <AlertCircle className="w-5 h-5" />
                    )}
                    {message.text}
                </div>
            )}

            {/* Profile Form */}
            {activeTab === 'profile' && (
                <form onSubmit={handleProfileUpdate} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={profileData.name}
                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 font-medium"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                value={profileData.email}
                                disabled
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="tel"
                                value={profileData.phone}
                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 font-medium"
                                placeholder="+91 98765 43210"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">About</label>
                        <textarea
                            value={profileData.about}
                            onChange={(e) => setProfileData({ ...profileData, about: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 font-medium"
                            placeholder="Tell customers about yourself and your services..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading && <Loader className="w-5 h-5 animate-spin" />}
                        Save Changes
                    </button>
                </form>
            )}

            {/* Password Form */}
            {activeTab === 'password' && (
                <form onSubmit={handlePasswordChange} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 font-medium"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 font-medium"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 font-medium"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading && <Loader className="w-5 h-5 animate-spin" />}
                        Change Password
                    </button>
                </form>
            )}
        </div>
    );
};

export default Profile;
