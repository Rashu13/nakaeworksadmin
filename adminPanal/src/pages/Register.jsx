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
        <div className="min-h-screen flex">
            {/* Left Side - Image */}
            <div className="hidden lg:block lg:w-1/2 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-primary-700">
                    <img
                        src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1000"
                        alt="Home Services"
                        className="w-full h-full object-cover opacity-30"
                    />
                </div>
                <div className="absolute inset-0 flex items-center justify-center p-12">
                    <div className="text-white text-center">
                        <h2 className="text-4xl font-bold mb-6">Join Our Community</h2>
                        <p className="text-xl text-white/80 max-w-md">
                            Create an account and start booking professional home services today.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto bg-white dark:bg-slate-950">
                <div className="w-full max-w-md">
                    <Link to="/" className="flex items-center gap-2 mb-8">
                        <img src="/logo.png" alt="NakaeWorks" className="h-12 w-auto object-contain" />
                    </Link>

                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Account</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Get started in seconds</p>

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

                    {/* OTP Registration */}
                    {authMode === 'otp' && (
                        <>
                            {!otpSent ? (
                                <form onSubmit={handleSendOtp} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                            <input
                                                type="text"
                                                value={otpName}
                                                onChange={(e) => setOtpName(e.target.value)}
                                                placeholder="Your full name"
                                                className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 flex items-center gap-1 pointer-events-none">
                                                <span className="text-sm font-medium">+91</span>
                                            </div>
                                            <input
                                                type="tel"
                                                value={otpPhone}
                                                onChange={(e) => setOtpPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                placeholder="98765 43210"
                                                className="w-full pl-16 pr-4 py-3 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-lg tracking-wider"
                                                required
                                                maxLength={10}
                                            />
                                        </div>
                                    </div>

                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4 mt-1 text-primary-600 rounded" required />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            I agree to the{' '}
                                            <Link to="/terms" className="text-primary-600 dark:text-primary-400 hover:underline">Terms of Service</Link>
                                            {' '}and{' '}
                                            <Link to="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</Link>
                                        </span>
                                    </label>

                                    <button
                                        type="submit"
                                        disabled={loading || otpPhone.replace(/\D/g, '').length !== 10 || !otpName.trim()}
                                        className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                Send OTP & Register
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
                                            +91 {otpPhone}
                                        </p>
                                    </div>

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
                                                className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 outline-none transition-all bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                                            />
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => handleVerifyOtp(otp.join(''))}
                                        disabled={loading || otp.some(d => !d)}
                                        className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                Verify & Create Account
                                                <ArrowRight size={18} />
                                            </>
                                        )}
                                    </button>

                                    <div className="flex items-center justify-between text-sm">
                                        <button
                                            onClick={() => { setOtpSent(false); setError(''); }}
                                            className="text-gray-500 dark:text-gray-400 hover:text-primary-600 transition-colors"
                                        >
                                            Change number
                                        </button>
                                        {countdown > 0 ? (
                                            <span className="text-gray-400 dark:text-gray-600">Resend in {countdown}s</span>
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

                    {/* Email Registration */}
                    {authMode === 'email' && (
                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                            <div className="flex gap-4 mb-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'consumer' })}
                                    className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${formData.role === 'consumer'
                                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                        : 'border-gray-200 dark:border-slate-800 text-gray-600 dark:text-gray-400'
                                        }`}
                                >
                                    I need services
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'provider' })}
                                    className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all ${formData.role === 'provider'
                                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                        : 'border-gray-200 dark:border-slate-800 text-gray-600 dark:text-gray-400'
                                        }`}
                                >
                                    I'm a provider
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe"
                                        className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-white" required />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com"
                                        className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-white" required />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210"
                                        className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-white" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••"
                                        className="w-full pl-12 pr-12 py-3 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-white" required />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••"
                                        className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-white" required />
                                </div>
                            </div>

                            <label className="flex items-start gap-3 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 mt-1 text-primary-600 rounded" required />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    I agree to the{' '}
                                    <Link to="/terms" className="text-primary-600 dark:text-primary-400 hover:underline">Terms of Service</Link>
                                    {' '}and{' '}
                                    <Link to="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</Link>
                                </span>
                            </label>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Create Account
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    <p className="mt-8 text-center text-gray-600 dark:text-gray-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
