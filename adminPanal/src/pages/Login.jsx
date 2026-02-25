import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Phone, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

const Login = () => {
    const [authMode, setAuthMode] = useState('otp'); // 'email' or 'otp'

    // Email login state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // OTP login state
    const [phone, setPhone] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [countdown, setCountdown] = useState(0);
    const [isExistingUser, setIsExistingUser] = useState(true);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const otpRefs = useRef([]);

    const { login, loginWithOtp } = useAuth();
    const navigate = useNavigate();

    // Countdown timer for resend
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
            const result = await authService.sendOtp(cleanPhone);
            setOtpSent(true);
            setIsExistingUser(result.isExistingUser);
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

        // Auto-focus next input
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all digits entered
        if (value && index === 5 && newOtp.every(d => d)) {
            handleVerifyOtp(newOtp.join(''));
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pastedData.length === 6) {
            const newOtp = pastedData.split('');
            setOtp(newOtp);
            otpRefs.current[5]?.focus();
            handleVerifyOtp(pastedData);
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
        <div className="min-h-screen flex bg-white dark:bg-slate-950 transition-colors duration-300">
            {/* Left Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 mb-8">
                        <img src="/logo.png" alt="NakaeWorks" className="h-12 w-auto object-contain" />
                    </Link>

                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back!</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Sign in to your account</p>

                    {/* Auth Mode Toggle */}
                    <div className="flex bg-gray-100 dark:bg-slate-900 rounded-xl p-1 mb-8">
                        <button
                            onClick={() => { setAuthMode('otp'); setError(''); }}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${authMode === 'otp'
                                    ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400'
                                }`}
                        >
                            <Smartphone size={16} />
                            Phone OTP
                        </button>
                        <button
                            onClick={() => { setAuthMode('email'); setError(''); }}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${authMode === 'email'
                                    ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400'
                                }`}
                        >
                            <Mail size={16} />
                            Email
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    {/* OTP Login */}
                    {authMode === 'otp' && (
                        <>
                            {!otpSent ? (
                                <form onSubmit={handleSendOtp} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Phone Number
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 flex items-center gap-1 pointer-events-none">
                                                <span className="text-sm font-medium">+91</span>
                                            </div>
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                placeholder="98765 43210"
                                                className="w-full pl-16 pr-4 py-3.5 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent outline-none transition-all bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 text-lg tracking-wider"
                                                required
                                                maxLength={10}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || phone.replace(/\D/g, '').length !== 10}
                                        className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                Send OTP
                                                <ArrowRight size={18} />
                                            </>
                                        )}
                                    </button>
                                </form>
                            ) : (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Smartphone className="text-primary-600 dark:text-primary-400" size={28} />
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                                            We've sent a 6-digit OTP to
                                        </p>
                                        <p className="text-gray-900 dark:text-white font-bold text-lg mt-1">
                                            +91 {phone}
                                        </p>
                                    </div>

                                    {/* OTP Input Boxes */}
                                    <div className="flex gap-3 justify-center" onPaste={handleOtpPaste}>
                                        {otp.map((digit, index) => (
                                            <input
                                                key={index}
                                                ref={(el) => (otpRefs.current[index] = el)}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:border-primary-500 dark:focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 outline-none transition-all bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                                            />
                                        ))}
                                    </div>

                                    {/* Verify Button */}
                                    <button
                                        onClick={() => handleVerifyOtp(otp.join(''))}
                                        disabled={loading || otp.some(d => !d)}
                                        className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                Verify & Sign In
                                                <ArrowRight size={18} />
                                            </>
                                        )}
                                    </button>

                                    {/* Resend / Change Number */}
                                    <div className="flex items-center justify-between text-sm">
                                        <button
                                            onClick={() => { setOtpSent(false); setError(''); }}
                                            className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                        >
                                            Change number
                                        </button>
                                        {countdown > 0 ? (
                                            <span className="text-gray-400 dark:text-gray-600">
                                                Resend in {countdown}s
                                            </span>
                                        ) : (
                                            <button
                                                onClick={handleSendOtp}
                                                className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
                                            >
                                                Resend OTP
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Email Login */}
                    {authMode === 'email' && (
                        <form onSubmit={handleEmailSubmit} className="space-y-5">
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
                                        className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent outline-none transition-all bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                                        required
                                    />
                                </div>
                            </div>

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
                                        className="w-full pl-12 pr-12 py-3 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent outline-none transition-all bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
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

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 text-primary-600 rounded" />
                                    <span className="text-sm text-gray-600">Remember me</span>
                                </label>
                                <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">
                                    Forgot password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
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
                    )}

                    {/* Sign Up Link */}
                    <p className="mt-8 text-center text-gray-600 dark:text-gray-400">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right Side - Image */}
            <div className="hidden lg:block lg:w-1/2 relative bg-primary-600 dark:bg-primary-950 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-purple-700 dark:from-primary-900 dark:to-slate-950 opacity-100">
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
