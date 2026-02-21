import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(email, password);

            // Redirect based on user role
            if (result.user.role === 'admin') {
                navigate('/admin');
            } else if (result.user.role === 'provider') {
                navigate('/provider');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white dark:bg-slate-950 transition-colors duration-300">
            {/* Left Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 mb-8">
                        <img src="/logo.png" alt="NakaeWorks" className="h-12 w-auto object-contain" />

                    </Link>

                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back!</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">Enter your credentials to access your account</p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-transparent outline-none transition-all bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-3 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-transparent outline-none transition-all bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember & Forgot */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded" />
                                <span className="text-sm text-gray-600">Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="text-sm text-indigo-600 hover:underline">
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-8 flex items-center gap-4">
                        <div className="flex-1 h-px bg-gray-200 dark:bg-slate-800"></div>
                        <span className="text-sm text-gray-400 dark:text-gray-600 leading-none">or continue with</span>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-slate-800"></div>
                    </div>

                    {/* Social Login */}
                    <div className="flex gap-4">
                        <button className="flex-1 py-3 border border-gray-200 dark:border-slate-800 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors bg-white dark:bg-slate-950">
                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Google</span>
                        </button>
                        <button className="flex-1 py-3 border border-gray-200 dark:border-slate-800 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors bg-white dark:bg-slate-950">
                            <img src="https://www.facebook.com/favicon.ico" alt="Facebook" className="w-5 h-5" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Facebook</span>
                        </button>
                    </div>

                    {/* Quick Login Buttons */}
                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800 px-2 pb-2 rounded-2xl bg-gray-50/50 dark:bg-slate-900/20">
                        <p className="text-center text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-4">Quick Test Login</p>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={() => { setEmail('admin@test.com'); setPassword('admin123'); }}
                                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition-all group"
                            >
                                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <Lock size={18} />
                                </div>
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Admin</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => { setEmail('provider@test.com'); setPassword('provider123'); }}
                                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-purple-100 dark:border-purple-900/50 bg-white dark:bg-slate-900 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-md transition-all group"
                            >
                                <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                    <Mail size={18} />
                                </div>
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Provider</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => { setEmail('user@test.com'); setPassword('user123'); }}
                                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-green-100 dark:border-green-900/50 bg-white dark:bg-slate-900 hover:border-green-400 dark:hover:border-green-600 hover:shadow-md transition-all group"
                            >
                                <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 group-hover:bg-green-600 group-hover:text-white transition-colors">
                                    <ArrowRight size={18} />
                                </div>
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">User</span>
                            </button>
                        </div>
                    </div>

                    {/* Sign Up Link */}
                    <p className="mt-8 text-center text-gray-600 dark:text-gray-400">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right Side - Image */}
            <div className="hidden lg:block lg:w-1/2 relative bg-indigo-600 dark:bg-indigo-950 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 dark:from-indigo-900 dark:to-slate-950 opacity-100">
                    <img
                        src="https://images.unsplash.com/photo-1581578731117-104f8a746950?auto=format&fit=crop&w=1000"
                        alt="Home Services"
                        className="w-full h-full object-cover opacity-20 dark:opacity-10"
                    />
                </div>
                <div className="absolute inset-0 flex items-center justify-center p-12">
                    <div className="text-white text-center">
                        <h2 className="text-4xl font-bold mb-6">Your Home, Our Priority</h2>
                        <p className="text-xl text-white/80 dark:text-white/60 max-w-md mx-auto">
                            Book trusted professionals for all your home service needs in just a few taps.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
