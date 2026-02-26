import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white dark:bg-white/5 rounded-[2rem] p-8 shadow-xl border border-gray-100 dark:border-white/10 hover:border-primary-500/30 transition-all group relative overflow-hidden"
    >
        <div className={`absolute top-0 right-0 w-32 h-32 ${color}/5 blur-[40px] pointer-events-none group-hover:opacity-100 transition-opacity`} />
        <div className="flex items-start justify-between relative z-10">
            <div>
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[3px] mb-4">{title}</p>
                <h3 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">{value}</h3>
                {trend && (
                    <div className={`flex items-center gap-2 mt-4 inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {trend === 'up' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                        <span>{trendValue}% Growth</span>
                    </div>
                )}
            </div>
            <div className={`w-14 h-14 rounded-2xl ${color}/10 border border-${color.split('-')[1]}-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                <Icon size={26} className={color.replace('bg-', 'text-')} />
            </div>
        </div>
    </motion.div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProviders: 0,
        totalServices: 0,
        totalBookings: 0,
        monthlyBookings: 0,
        pendingBookings: 0,
        totalRevenue: 0,
        recentBookings: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await adminService.getDashboardStats();
            const statsData = response.statistics || response.stats || {};
            const revenueData = response.revenue || {};
            const monthlyTrend = response.monthlyTrend || [];
            const recentBookings = response.recentBookings || [];

            const currentMonth = new Date().getMonth() + 1;
            const currentYear = new Date().getFullYear();
            const currentMonthStats = monthlyTrend.find(t => t.month === currentMonth && t.year === currentYear);

            setStats({
                totalUsers: statsData.totalUsers ?? 0,
                totalProviders: statsData.totalProviders ?? 0,
                totalServices: statsData.totalServices ?? 0,
                totalBookings: statsData.totalBookings ?? 0,
                monthlyBookings: currentMonthStats?.count ?? 0,
                pendingBookings: statsData.pendingBookings ?? 0,
                totalRevenue: revenueData.total ?? 0,
                recentBookings: recentBookings
            });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
                <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[4px] animate-pulse">Syncing Command Systems...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {/* Intel Briefing Header */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col md:flex-row md:items-end justify-between gap-6"
            >
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-12 h-[2px] bg-primary-500 rounded-full"></span>
                        <span className="text-[10px] font-black text-primary-500 uppercase tracking-[4px]">Mission Control Center</span>
                    </div>
                    <h1 className="text-6xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Operations <span className="text-primary-500">Overview</span></h1>
                    <p className="text-gray-500 dark:text-gray-500 font-medium text-xl mt-4 max-w-xl">Unified command interface for managing NakaeWorks professional deployments.</p>
                </div>
                <div className="flex items-center gap-4 bg-white dark:bg-white/5 p-4 rounded-3xl border border-gray-100 dark:border-white/10 shadow-xl">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[2px]">System Time</p>
                        <p className="text-[10px] font-bold text-gray-900 dark:text-white uppercase mt-1">{new Date().toLocaleTimeString()}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <TrendingUp size={20} className="text-emerald-500" />
                    </div>
                </div>
            </motion.div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard
                    title="Unified Userbase"
                    value={stats.totalUsers.toLocaleString()}
                    icon={Users}
                    color="bg-blue-500"
                    trend="up"
                    trendValue="12"
                    delay={0.1}
                />
                <StatCard
                    title="Active Operatives"
                    value={stats.totalProviders}
                    icon={UserCheck}
                    color="bg-emerald-500"
                    trend="up"
                    trendValue="8"
                    delay={0.2}
                />
                <StatCard
                    title="Service Protocols"
                    value={stats.totalServices}
                    icon={Briefcase}
                    color="bg-purple-500"
                    delay={0.3}
                />
                <StatCard
                    title="Total Deployments"
                    value={stats.totalBookings.toLocaleString()}
                    icon={ShoppingBag}
                    color="bg-primary-500"
                    trend="up"
                    trendValue="15"
                    delay={0.4}
                />
            </div>

            {/* Strategic Intelligence Blocks */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Nexus */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2 bg-gradient-to-br from-gray-900 to-black dark:from-[#0f172a] dark:to-black rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl border border-white/5"
                >
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-500/10 blur-[120px] pointer-events-none" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <p className="text-[10px] font-black text-primary-500 uppercase tracking-[4px] mb-2">Revenue Nexus</p>
                                <h3 className="text-4xl font-black tracking-tighter">FINANCIAL SETTLEMENT</h3>
                            </div>
                            <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center">
                                <DollarSign size={32} className="text-primary-500" />
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-end gap-10">
                            <div>
                                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[2px] mb-2">Net Accumulation</p>
                                <div className="flex items-center gap-4">
                                    <span className="text-7xl font-black text-white tracking-tighter">₹{(stats.totalRevenue || 0).toLocaleString()}</span>
                                    <div className="px-3 py-1 bg-emerald-500 rounded-full flex items-center gap-1">
                                        <ArrowUp size={12} className="text-black" />
                                        <span className="text-[10px] font-black text-black">Verified</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 space-y-4 pt-10 md:pt-0">
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary-500 w-[75%] shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
                                </div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Asset Performance Index: 88%</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Efficiency Matrix */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white dark:bg-white/5 rounded-[3rem] p-10 border border-gray-100 dark:border-white/10 shadow-xl"
                >
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[4px] mb-10">Intelligence Matrix</p>
                    <div className="space-y-8">
                        {[
                            { label: 'Current Cycle Bookings', value: stats.monthlyBookings, color: 'text-gray-900 dark:text-white' },
                            { label: 'Pending Authorizations', value: stats.pendingBookings, color: 'text-primary-500' },
                            { label: 'Ticket Optimization', value: `₹${Math.round(stats.totalRevenue / stats.totalBookings || 0)}`, color: 'text-emerald-500' }
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col gap-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[2px]">{item.label}</span>
                                    <span className={`text-3xl font-black tracking-tighter ${item.color}`}>{item.value}</span>
                                </div>
                                <div className="h-[1px] w-full bg-gray-100 dark:bg-white/5" />
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Strategic Logbook */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white dark:bg-white/5 rounded-[3.5rem] p-10 border border-gray-100 dark:border-white/10 shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 blur-[100px] pointer-events-none" />
                <div className="flex items-center justify-between mb-12 relative z-10">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[4px] mb-2">Strategic Logbook</p>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">RECENT DEPLOYMENTS</h3>
                    </div>
                    <button className="px-6 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[3px] text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all">
                        Full Archives
                    </button>
                </div>

                {!stats.recentBookings || stats.recentBookings.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50/50 dark:bg-white/[0.02] rounded-[2.5rem] border border-dashed border-gray-200 dark:border-white/10">
                        <ShoppingBag size={64} className="mx-auto mb-6 opacity-10" />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[3px]">No records found in current frequency</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto relative z-10">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[3px]">
                                    <th className="pb-8 px-4">Protocol ID</th>
                                    <th className="pb-8 px-4">Unit Type</th>
                                    <th className="pb-8 px-4">Subject</th>
                                    <th className="pb-8 px-4">Asset</th>
                                    <th className="pb-8 px-4 text-right">Settlement</th>
                                    <th className="pb-8 px-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {stats.recentBookings.map((booking, i) => (
                                    <tr key={booking.id} className="group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-all duration-300">
                                        <td className="py-6 px-4">
                                            <span className="font-black text-primary-500 tracking-wider font-mono uppercase truncate block max-w-[120px]">{booking.bookingNumber}</span>
                                        </td>
                                        <td className="py-6 px-4">
                                            <span className="font-black text-gray-900 dark:text-white text-xs uppercase tracking-tight">{booking.service?.name}</span>
                                        </td>
                                        <td className="py-6 px-4">
                                            <span className="font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-tight">{booking.consumer?.name}</span>
                                        </td>
                                        <td className="py-6 px-4">
                                            <span className="font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-tight">{booking.provider?.name || 'UNASSIGNED'}</span>
                                        </td>
                                        <td className="py-6 px-4 text-right">
                                            <span className="font-black text-gray-900 dark:text-white text-lg tracking-tighter">₹{booking.totalAmount}</span>
                                        </td>
                                        <td className="py-6 px-4 text-right">
                                            <span className={`inline-flex px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest
                                                ${booking.status?.slug === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                                                    booking.status?.slug === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                                                        booking.status?.slug === 'confirmed' ? 'bg-blue-500/10 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' :
                                                            'bg-orange-500/10 text-orange-500'}`}>
                                                {booking.status?.name}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default AdminDashboard;
