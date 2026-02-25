import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Minus, Plus, ShoppingBag, ChevronLeft, ArrowRight } from 'lucide-react';
import { BASE_URL } from '../services/api';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, totalItems } = useCart();
    const navigate = useNavigate();

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-32 pb-12 flex items-center justify-center px-4 transition-colors duration-300">
                <div className="text-center max-w-md w-full p-8 bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-gray-200 dark:border-white/5 shadow-2xl shadow-black/5">
                    <div className="w-20 h-20 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag size={40} className="text-primary-500" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Your cart is empty</h2>
                    <p className="text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 mb-8 text-sm font-medium">Looks like you haven't added any services yet. Start exploring our premium services.</p>
                    <Link
                        to="/services"
                        className="inline-flex items-center justify-center w-full px-8 py-4 bg-primary-500 hover:bg-primary-400 text-black font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-xl shadow-primary-500/20"
                    >
                        Explore Services
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pt-32 pb-20 px-4 sm:px-6 transition-colors duration-300">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-3 bg-white dark:bg-gray-100 dark:bg-white/5 border border-gray-100 dark:border-gray-200 dark:border-white/10 rounded-2xl text-gray-600 dark:text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-slate-900 dark:text-white transition-all shadow-sm"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-slate-900 dark:text-white uppercase tracking-tight">Shopping Cart</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 font-bold uppercase tracking-wider">{totalItems} {totalItems === 1 ? 'item' : 'items'} selected</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-10">
                    {/* Cart Items */}
                    <div className="lg:col-span-8 space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.id} className="group bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-200 dark:border-white/5 shadow-xl shadow-black/5 flex flex-col sm:flex-row items-center gap-6 transition-all hover:border-primary-500/20">
                                <div className="w-full sm:w-32 h-32 bg-gray-100 dark:bg-gray-100 dark:bg-white/5 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-200 dark:border-white/5">
                                    <img
                                        src={item.thumbnail ? (item.thumbnail.startsWith('http') ? item.thumbnail : `${BASE_URL}${item.thumbnail}`) : `https://ui-avatars.com/api/?name=${item.name}`}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                                <div className="flex-1 text-center sm:text-left">
                                    <h3
                                        onClick={() => navigate(`/service/${item.slug || item.id}`)}
                                        className="text-lg font-black text-gray-900 dark:text-slate-900 dark:text-white mb-1 uppercase tracking-tight hover:text-primary-500 cursor-pointer transition-colors"
                                    >
                                        {item.name}
                                    </h3>
                                    <p className="text-xs text-primary-500 font-black uppercase tracking-widest mb-3">{item.category?.name || 'Service'}</p>
                                    <div className="flex items-center justify-center sm:justify-start gap-4">
                                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-100 dark:bg-white/5 p-1.5 rounded-xl border border-gray-200/50 dark:border-gray-200 dark:border-white/5">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="w-8 h-8 flex items-center justify-center text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-slate-900 dark:text-white transition-colors"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-8 text-center text-sm font-black text-gray-900 dark:text-slate-900 dark:text-white">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-8 h-8 flex items-center justify-center text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-slate-900 dark:text-white transition-colors"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-center sm:items-end justify-between self-stretch py-1">
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="p-2 text-gray-700 dark:text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                    <div className="mt-4 sm:mt-0">
                                        <p className="text-xl font-black text-gray-900 dark:text-slate-900 dark:text-white tracking-tighter">₹{Math.round((item.price - (item.discount || 0)) * item.quantity)}</p>
                                        <p className="text-[10px] text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">₹{Math.round(item.price - (item.discount || 0))} each</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary Card */}
                    <div className="lg:col-span-4">
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-200 dark:border-white/5 shadow-2xl shadow-black/5 sticky top-32 transition-all">
                            <h2 className="text-xl font-black text-gray-900 dark:text-slate-900 dark:text-white mb-8 uppercase tracking-tight">Order Summary</h2>
                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-sm font-bold uppercase tracking-wider">
                                    <span className="text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400">Subtotal</span>
                                    <span className="text-gray-900 dark:text-slate-900 dark:text-white">₹{Math.round(cartTotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold uppercase tracking-wider">
                                    <span className="text-gray-500 dark:text-gray-400 dark:text-gray-600 dark:text-gray-400">Convenience Fee</span>
                                    <span className="text-green-500">FREE</span>
                                </div>
                                <div className="pt-4 border-t border-gray-100 dark:border-gray-200 dark:border-white/5 flex justify-between">
                                    <span className="text-lg font-black text-gray-900 dark:text-slate-900 dark:text-white uppercase tracking-tight">Total</span>
                                    <span className="text-2xl font-black text-gray-900 dark:text-slate-900 dark:text-white tracking-tighter">₹{Math.round(cartTotal)}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/booking/confirm', { state: { cartFlow: true } })}
                                className="group relative w-full px-8 py-5 bg-primary-500 hover:bg-primary-400 text-black font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-xl shadow-primary-500/20 flex items-center justify-center gap-3 overflow-hidden"
                            >
                                <span className="relative z-10">Proceed to Checkout</span>
                                <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            </button>

                            <Link
                                to="/services"
                                className="block text-center mt-6 text-xs font-black text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors uppercase tracking-widest"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
