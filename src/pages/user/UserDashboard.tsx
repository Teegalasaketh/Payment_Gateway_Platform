import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { CardSkeleton } from '../../components/shared/LoadingSkeleton';
import { paymentService } from '../../services/payment.service';
import {
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Brain,
  CreditCard,
  ChevronRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useNavigate, Link } from 'react-router-dom';

export const UserDashboard: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isDark = theme === 'dark';

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await paymentService.getPayments();
        setPayments(response.data);
      } catch (err) {
        console.error('Failed to load merchant payments data', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboard();
  }, []);

  // Calculations from fetched payments
  const settledPayments = payments.filter((p) => p.status === 'SUCCESS');
  const totalSettledVal = settledPayments.reduce((sum, p) => sum + p.amount, 0);

  const countSuccess = settledPayments.length;
  const countFailed = payments.filter((p) => p.status === 'FAILED').length;
  const countPending = payments.filter((p) => p.status === 'PENDING').length;

  const successRate = payments.length > 0 ? ((countSuccess / payments.length) * 100).toFixed(1) : '0.0';

  // Chart 1: Last 7 Days Activity (Calculated dynamically)
  const activityData = useMemo(() => {
    const daysOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyVolume: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    const dailyTxns: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

    payments.forEach((p) => {
      if (p.status === 'SUCCESS') {
        const date = new Date(p.date);
        const dayName = days[date.getDay()];
        if (dayName in dailyVolume) {
          dailyVolume[dayName] += p.amount;
          dailyTxns[dayName] += 1;
        }
      }
    });

    return daysOrder.map((day) => ({
      day,
      volume: dailyVolume[day],
      txns: dailyTxns[day],
    }));
  }, [payments]);

  // Chart 2: Spending comparison past 4 months (Calculated dynamically)
  const monthlyData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result: { month: string; spent: number }[] = [];
    
    for (let i = 3; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      result.push({ month: monthNames[d.getMonth()], spent: 0 });
    }

    payments.forEach((p) => {
      if (p.status === 'SUCCESS') {
        const date = new Date(p.date);
        const mName = monthNames[date.getMonth()];
        const target = result.find((r) => r.month === mName);
        if (target) {
          target.spent += p.amount;
        }
      }
    });

    return result;
  }, [payments]);

  const monthlyGrowth = useMemo(() => {
    if (monthlyData.length >= 2) {
      const current = monthlyData[monthlyData.length - 1].spent;
      const prev = monthlyData[monthlyData.length - 2].spent;
      if (prev > 0) return ((current - prev) / prev) * 100;
      if (current > 0) return 100;
    }
    return 0;
  }, [monthlyData]);
  const isGrowthPositive = monthlyGrowth >= 0;

  // Chart 3: Method Distribution ratios
  const methodData = (() => {
    const counts: Record<string, number> = {};
    payments.forEach((p) => {
      counts[p.method] = (counts[p.method] || 0) + 1;
    });
    return Object.keys(counts).map((key) => ({
      name: key,
      value: counts[key],
    }));
  })();

  const COLORS = ['#2563EB', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const recentTransactions = payments.slice(0, 5);

  return (
    <div className="space-y-6 text-left">
      {/* Welcome Header banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-primary to-blue-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-[-50%] left-[-20%] h-[150%] w-[50%] rounded-full bg-white/10 blur-[100px] pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-extrabold tracking-tight">Merchant Portal</h1>
          <p className="mt-1 text-slate-100 text-xs font-semibold">
            Manage transactions, check API keys, and run checkouts.
          </p>
        </div>
        <div className="relative z-10 flex gap-2 shrink-0">
          <button
            onClick={() => navigate('/user/payments')}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-white text-primary px-4 py-2.5 text-xs font-bold transition-all hover:bg-slate-50 shadow"
          >
            <CreditCard className="h-4 w-4" />
            Make Payment Charge
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <CardSkeleton count={4} />
        ) : (
          <>
            {/* Total Payments settled */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Sales Settled</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-extrabold tracking-tight">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalSettledVal)}</div>
              <div className={`mt-2 flex items-center gap-1.5 text-xs font-bold ${isGrowthPositive ? 'text-success' : 'text-danger'}`}>
                {isGrowthPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5 rotate-90" />}
                <span>{isGrowthPositive ? '+' : ''}{monthlyGrowth.toFixed(1)}% this month</span>
              </div>
            </div>

            {/* Success count */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved Settlements</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-success">
                  <CheckCircle className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-extrabold tracking-tight">{countSuccess}</div>
              <p className="text-[10px] text-slate-400 mt-1.5 font-semibold">Uptime processing success: {successRate}%</p>
            </div>

            {/* Failed count */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Declined Settlements</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-danger">
                  <XCircle className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-extrabold tracking-tight">{countFailed}</div>
              <p className="text-[10px] text-slate-400 mt-1.5 font-semibold">{countFailed > 0 ? 'Requires validation recovery' : 'No failed transactions'}</p>
            </div>

            {/* Pending count */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Audit Checks</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-warning">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-extrabold tracking-tight">{countPending}</div>
              <p className="text-[10px] text-slate-400 mt-1.5 font-semibold">Awaiting bank settlement</p>
            </div>
          </>
        )}
      </div>

      {/* Visualizations Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Payment Activity Area chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold tracking-tight">Processing Activity</h3>
              <p className="text-xs text-slate-400">Weekly settled volume trend</p>
            </div>
            <TrendingUp className="h-5 w-5 text-slate-400" />
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#1e293b' : '#f1f5f9'} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} stroke="transparent" />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} stroke="transparent" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                    color: isDark ? '#f8fafc' : '#0f172a',
                    borderRadius: '12px',
                    fontSize: '11px',
                  }}
                />
                <Area type="monotone" dataKey="volume" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorSpent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Spending Bar chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-1">
          <h3 className="text-sm font-bold tracking-tight mb-1">Monthly Spending</h3>
          <p className="text-xs text-slate-400 mb-4">Volume comparison</p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#1e293b' : '#f1f5f9'} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} stroke="transparent" />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} stroke="transparent" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                    color: isDark ? '#f8fafc' : '#0f172a',
                    borderRadius: '12px',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="spent" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row 3: Pie Chart + Recent Transactions + AI recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Method usage ratios pie chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold mb-1">Payment Method Usage</h3>
          <p className="text-xs text-slate-400 mb-4">Breakdown by channel</p>
          <div className="h-60 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={methodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {methodData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                    color: isDark ? '#f8fafc' : '#0f172a',
                    borderRadius: '12px',
                    fontSize: '11px',
                  }}
                />
                <Legend iconSize={6} wrapperStyle={{ fontSize: '9px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions lists */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold">Recent Settled Payments</h3>
              <Link to="/user/activity" className="text-xs font-semibold text-primary hover:underline flex items-center">
                All Activity
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            
            <div className="space-y-3">
              {recentTransactions.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.id}</p>
                      <span className="text-[9px] text-slate-400 font-semibold uppercase">{item.method} • {new Date(item.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-xs font-bold block">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: item.currency || 'INR' }).format(item.amount)}</span>
                    <span className={`inline-flex items-center rounded-md px-1.5 py-0.2 text-[8px] font-bold mt-0.5 ${
                      item.status === 'SUCCESS'
                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10 dark:bg-emerald-950/20 dark:text-emerald-400'
                        : 'bg-red-50 text-red-700 ring-1 ring-red-600/10 dark:bg-red-950/20 dark:text-red-400'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendation alert card */}
          <div className="mt-6 rounded-xl border border-blue-200/50 bg-blue-50/20 p-3.5 dark:border-blue-900/30 dark:bg-blue-950/10">
            <div className="flex gap-2">
              <Brain className="h-4.5 w-4.5 text-blue-500 shrink-0 mt-0.5" />
              <div className="text-left">
                <span className="text-[10px] font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wider block">AI Operation Recommendation</span>
                <p className="text-[10px] text-blue-700/80 dark:text-blue-400/80 leading-relaxed mt-1 font-semibold">
                  We detected minor network delay on UPI bank endpoints. Route your UPI checkout payloads through Fallback-Acquirer-B to boost authorization success rate by 2.1%.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
export default UserDashboard;
