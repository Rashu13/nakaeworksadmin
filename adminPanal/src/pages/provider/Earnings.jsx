import React, { useState, useEffect } from 'react';
import {
    IndianRupee, TrendingUp, Calendar, Download, Loader,
    ArrowUpRight, ArrowDownRight, Wallet, CreditCard
} from 'lucide-react';
import { providerService } from '../../services/api';

const periodOptions = [
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'year', label: 'This Year' }
];

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const Earnings = () => {
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('month');
    const [earnings, setEarnings] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [transactionsLoading, setTransactionsLoading] = useState(false);

    useEffect(() => {
        fetchEarnings();
    }, [period]);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchEarnings = async () => {
        setLoading(true);
        try {
            const response = await providerService.getEarnings(period);
            if (response.data.success) {
                setEarnings(response.data.data);
            }
        } catch (error) {
            console.error('Fetch earnings error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactions = async () => {
        setTransactionsLoading(true);
        try {
            const response = await providerService.getTransactions();
            if (response.data.success) {
                setTransactions(response.data.data.transactions);
            }
        } catch (error) {
            console.error('Fetch transactions error:', error);
        } finally {
            setTransactionsLoading(false);
        }
    };

    const getMonthlyChartData = () => {
        if (!earnings?.monthlyBreakdown) return [];

        const data = new Array(12).fill(0);
        earnings.monthlyBreakdown.forEach(item => {
            data[item.month - 1] = parseFloat(item.amount);
        });

        const maxValue = Math.max(...data, 1);
        return data.map((value, index) => ({
            month: months[index],
            value,
            height: (value / maxValue) * 100
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    const chartData = getMonthlyChartData();

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
                    <p className="text-gray-600">Track your income and transactions</p>
                </div>
                <div className="flex gap-2">
                    {periodOptions.map((option) => (
                        <button
                            key={option.key}
                            onClick={() => setPeriod(option.key)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${period === option.key
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-emerald-100">Total Earnings</span>
                        <Wallet className="w-6 h-6 opacity-80" />
                    </div>
                    <p className="text-3xl font-bold">₹{(earnings?.totalEarnings || 0).toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-2 text-emerald-100">
                        <ArrowUpRight size={16} />
                        <span className="text-sm">All time earnings</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500">{periodOptions.find(p => p.key === period)?.label} Earnings</span>
                        <div className="p-2 bg-blue-100 rounded-xl">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">₹{(earnings?.periodEarnings || 0).toLocaleString()}</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500">Pending Earnings</span>
                        <div className="p-2 bg-yellow-100 rounded-xl">
                            <CreditCard className="w-5 h-5 text-yellow-600" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">₹{(earnings?.pendingEarnings || 0).toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-1">Awaiting payment</p>
                </div>
            </div>

            {/* Monthly Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Earnings</h3>
                <div className="flex items-end justify-between gap-2 h-64">
                    {chartData.map((item, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '200px' }}>
                                <div
                                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-lg transition-all duration-500"
                                    style={{ height: `${item.height}%` }}
                                />
                            </div>
                            <span className="text-xs text-gray-500">{item.month}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Transactions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
                </div>

                {transactionsLoading ? (
                    <div className="flex items-center justify-center h-32">
                        <Loader className="w-6 h-6 animate-spin text-emerald-600" />
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="p-12 text-center">
                        <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No transactions yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {transactions.map((transaction) => (
                            <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-xl ${transaction.paymentStatus === 'paid'
                                                ? 'bg-green-100'
                                                : 'bg-yellow-100'
                                            }`}>
                                            <IndianRupee className={`w-5 h-5 ${transaction.paymentStatus === 'paid'
                                                    ? 'text-green-600'
                                                    : 'text-yellow-600'
                                                }`} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{transaction.Service?.name}</p>
                                            <p className="text-sm text-gray-500">
                                                {transaction.consumer?.name} • #{transaction.bookingNumber}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900">₹{parseFloat(transaction.totalAmount).toLocaleString()}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(transaction.createdAt).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Earnings;
