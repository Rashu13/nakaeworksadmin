import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

const Register = () => {
    const [authMode, setAuthMode] = useState('otp'); // 'email' or 'otp'

    // Email registration
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'consumer'
    });
    const [showPassword, setShowPassword] = useState(false);

    // OTP registration
    const [otpPhone, setOtpPhone] = useState('');
    const [otpName, setOtpName] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [countdown, setCountdown] = useState(0);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const otpRefs = useRef([]);

    const { register, loginWithOtp } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const result = await register({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                role: formData.role
            });
            if (result.user.role === 'admin') navigate('/admin');
            else if (result.user.role === 'provider') navigate('/provider');
            else navigate('/');
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSendOtp = async (e) => {
        if (e) e.preventDefault();
        setError('');

        const cleanPhone = otpPhone.replace(/\D/g, '');
        if (cleanPhone.length !== 10) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }

        if (!otpName.trim()) {
            setError('Please enter your name');
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

    const handleVerifyOtp = async (otpString) => {
        setError('');
        setLoading(true);
        const cleanPhone = otpPhone.replace(/\D/g, '');

        try {
            const result = await authService.verifyOtp(cleanPhone, otpString, otpName.trim());
            loginWithOtp(result);
            navigate('/');
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
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-4">
                        <img src="/logo.png" alt="NakaeWorks" className="h-10 w-auto" />
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">NakaeWorks</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Join our community of professionals and users</p>
                </div>

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
                        /* Minimal OTP Register */
                        !otpSent ? (
                            <form onSubmit={handleSendOtp} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            value={otpName}
                                            onChange={(e) => setOtpName(e.target.value)}
                                            placeholder="John Doe"
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">+91</div>
                                        <input
                                            type="tel"
                                            value={otpPhone}
                                            onChange={(e) => setOtpPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            placeholder="9876543210"
                                            className="w-full pl-14 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading || otpPhone.length !== 10 || !otpName.trim()}
                                    className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Sending...' : 'Send OTP & Register'}
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <p className="text-sm text-center text-gray-500">OTP sent to +91 {otpPhone}</p>
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
                                    className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Verifying...' : 'Complete Registration'}
                                </button>
                                <div className="text-center">
                                    <button onClick={() => setOtpSent(false)} className="text-sm text-primary-600 hover:underline">Change Details</button>
                                </div>
                            </div>
                        )
                    ) : (
                        /* Minimal Email Register */
                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                            <div className="flex gap-2 p-1 bg-gray-50 dark:bg-slate-800 rounded-xl mb-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'consumer' })}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${formData.role === 'consumer' ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    USER
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'provider' })}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${formData.role === 'provider' ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    PROVIDER
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe"
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white" required />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com"
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white" required />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="9876543210"
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••"
                                            className="w-full pl-11 pr-11 py-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white" required />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••"
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 outline-none dark:text-white" required />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 mt-4"
                            >
                                {loading ? 'Creating...' : 'Create Account'}
                            </button>
                        </form>
                    )}
                </div>

                <p className="text-center mt-8 text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
