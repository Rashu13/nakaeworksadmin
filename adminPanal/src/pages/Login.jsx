import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Smartphone, ShieldCheck, Briefcase, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

const Login = () => {
    const [authMode, setAuthMode] = useState('otp'); // 'email' or 'otp'
    const [selectedRole, setSelectedRole] = useState('consumer');
    const [email, setEmail] = useState('user@test.com');
    const [password, setPassword] = useState('Password123@');
    const [showPassword, setShowPassword] = useState(false);

    // OTP login state
    const [phone, setPhone] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [countdown, setCountdown] = useState(0);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const otpRefs = useRef([]);

    const { login, loginWithOtp } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(email, password);
            if (result.user.role === 'admin') navigate('/admin');
            else if (result.user.role === 'provider') navigate('/provider');
            else navigate('/');
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');

        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length !== 10) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }

        setLoading(true);
        try {
            await authService.sendOtp(cleanPhone);
            setOtpSent(true);
            setCountdown(30);
            setOtp(['', '', '', '', '', '']);
            setTimeout(() => otpRefs.current[0]?.focus(), 100);
        } catch (err) {
            setError(err.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) value = value[value.length - 1];
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }

        if (value && index === 5 && newOtp.every(d => d)) {
            handleVerifyOtp(newOtp.join(''));
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        if (role === 'admin') {
            setEmail('admin@test.com');
            setPassword('Password123@');
        } else if (role === 'provider') {
            setEmail('provider@test.com');
            setPassword('Password123@');
        } else {
            setEmail('user@test.com');
            setPassword('Password123@');
        }
    };

    const handleVerifyOtp = async (otpString) => {
        setError('');
        setLoading(true);
        const cleanPhone = phone.replace(/\D/g, '');

        try {
            const result = await authService.verifyOtp(cleanPhone, otpString);
            loginWithOtp(result);
            if (result.user.role === 'admin') navigate('/admin');
            else if (result.user.role === 'provider') navigate('/provider');
            else navigate('/');
        } catch (err) {
            setError(err.message || 'Invalid OTP. Please try again.');
            setOtp(['', '', '', '', '', '']);
            otpRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-6">
            <div className="w-full max-w-md">
                {/* Logo & Header */}
                <div className="text-center mb-10">
                    <Link to="/" className="inline-block mb-6">
                        <img src="/logo.png" alt="NakaeWorks" className="h-14 w-auto mx-auto" />
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Welcome back</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Sign in to manage your account</p>
                </div>

                {/* Login Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-8">

                    {/* Toggle */}
                    <div className="flex p-1 bg-gray-100 dark:bg-slate-800 rounded-xl mb-8">
                        <button
                            onClick={() => { setAuthMode('otp'); setError(''); }}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${authMode === 'otp' ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Phone OTP
                        </button>
                        <button
                            onClick={() => { setAuthMode('email'); setError(''); }}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${authMode === 'email' ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Email
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {authMode === 'otp' ? (
                        /* Minimal OTP Flow */
                        !otpSent ? (
                            <form onSubmit={handleSendOtp} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">+91</div>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            placeholder="9876543210"
                                            className="w-full pl-14 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading || phone.length !== 10}
                                    className="w-full py-3.5 bg-[#0a2357] hover:bg-[#0c2d6e] text-white font-bold rounded-xl transition-all disabled:opacity-50 shadow-md active:scale-[0.98]"
                                >
                                    {loading ? 'Sending...' : 'Send OTP'}
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <p className="text-sm text-center text-gray-500">OTP sent to +91 {phone}</p>
                                <div className="flex gap-2 justify-center">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => (otpRefs.current[index] = el)}
                                            type="text"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            className="w-12 h-14 text-center text-xl font-bold bg-gray-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                                        />
                                    ))}
                                </div>
                                <button
                                    onClick={() => handleVerifyOtp(otp.join(''))}
                                    disabled={loading || otp.some(d => !d)}
                                    className="w-full py-3.5 bg-[#0a2357] hover:bg-[#0c2d6e] text-white font-bold rounded-xl transition-all disabled:opacity-50 shadow-md active:scale-[0.98]"
                                >
                                    {loading ? 'Verifying...' : 'Verify OTP'}
                                </button>
                                <div className="text-center">
                                    <button onClick={() => setOtpSent(false)} className="text-sm text-primary-600 hover:underline">Change Number</button>
                                </div>
                            </div>
                        )
                    ) : (
                        /* Minimal Email Flow */
                        <div className="space-y-6">
                            {/* Role Select - Small Tabs */}
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: 'consumer', label: 'User', icon: User },
                                    { id: 'provider', label: 'Provider', icon: Briefcase },
                                    { id: 'admin', label: 'Admin', icon: ShieldCheck }
                                ].map((role) => (
                                    <button
                                        key={role.id}
                                        onClick={() => handleRoleSelect(role.id)}
                                        className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all ${selectedRole === role.id ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'border-gray-100 dark:border-slate-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                                    >
                                        <role.icon size={18} className="mb-1" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">{role.label}</span>
                                    </button>
                                ))}
                            </div>

                            <form onSubmit={handleEmailSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="name@company.com"
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                                        <Link to="/forgot-password" strokeWidth={3} className="text-xs text-primary-600 hover:underline">Forgot?</Link>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full pl-11 pr-11 py-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 bg-[#0a2357] hover:bg-[#0c2d6e] text-white font-bold rounded-xl transition-all disabled:opacity-50 shadow-md active:scale-[0.98]"
                                >
                                    {loading ? 'Signing in...' : 'Sign In'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                <p className="text-center mt-8 text-sm text-gray-500">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary-600 font-semibold hover:underline">Sign up for free</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
