import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { CardSkeleton } from '../../components/shared/LoadingSkeleton';
import { paymentService } from '../../services/payment.service';
import { userService } from '../../services/user.service';
import {
  DollarSign,
  Users,
  CreditCard,
  Layers,
  ShieldAlert,
  XCircle,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Brain,
  Zap,
  Monitor
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
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { motion } from 'framer-motion';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [payments, setPayments] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [fraudCases, setFraudCases] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isDark = theme === 'dark';

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [payRes, txnRes, usrRes, fraudRes, whkRes] = await Promise.all([
          paymentService.getPayments(),
          paymentService.getTransactions(),
          userService.getUsers(),
          paymentService.getFraudCases(),
          paymentService.getWebhooks()
        ]);
        setPayments(payRes.data);
        setTransactions(txnRes.data);
        setUsers(usrRes.data);
        setFraudCases(fraudRes.data);
        setWebhooks(whkRes.data);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  // Compute metrics from fetched data
  const totalRevenue = payments
    .filter((p) => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalUsers = users.length;
  const totalPayments = payments.length;
  const totalTransactions = transactions.length;
  const activeFraudCount = fraudCases.filter((f) => f.status === 'Flagged').length;
  const failedPaymentsCount = payments.filter((p) => p.status === 'FAILED').length;
  
  const webhookSuccessRate = (() => {
    const successCount = webhooks.filter((w) => w.status === 'Success').length;
    return webhooks.length > 0 ? ((successCount / webhooks.length) * 100).toFixed(1) : '100';
  })();
  
  const activeSessions = 142; // Simulated count

  // Recharts Data Prep: Past 7 Days Revenue Trend (Calculated dynamically)
  const revenueTrendData = React.useMemo(() => {
    const daysOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyVolume: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    const dailyTxns: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

    payments.forEach((p) => {
      if (p.status === 'SUCCESS') {
        const date = new Date(p.date || p.timestamp);
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

  // Recharts Data Prep: Monthly Transactions grouped by status (Calculated dynamically)
  const monthlyTxnData = React.useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result: { month: string; Success: number; Failed: number; Refunded: number }[] = [];
    
    // Initialize past 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      result.push({ month: monthNames[d.getMonth()], Success: 0, Failed: 0, Refunded: 0 });
    }

    payments.forEach((p) => {
      const date = new Date(p.date || p.timestamp);
      const mName = monthNames[date.getMonth()];
      const target = result.find((r) => r.month === mName);
      if (target) {
        if (p.status === 'SUCCESS') {
          target.Success += 1;
        } else if (p.status === 'FAILED') {
          target.Failed += 1;
        } else if (p.status === 'REFUNDED') {
          target.Refunded += 1;
        }
      }
    });

    return result;
  }, [payments]);

  // Recharts Data Prep: Payment Method Distribution
  const methodDistribution = (() => {
    const counts: Record<string, number> = {};
    payments.forEach((p) => {
      counts[p.method] = (counts[p.method] || 0) + 1;
    });
    return Object.keys(counts).map((key) => ({
      name: key,
      value: counts[key],
    }));
  })();

  const COLORS = ['#2563EB', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  // Recharts Data Prep: Fraud Analysis risk categories mapping (Calculated dynamically)
  const fraudRadarData = React.useMemo(() => {
    const defaultData = [
      { subject: 'IP Velocity', A: 85, B: 110, fullMark: 150 },
      { subject: 'Card Testing', A: 98, B: 130, fullMark: 150 },
      { subject: 'Device Spoof', A: 50, B: 75, fullMark: 150 },
      { subject: 'Geo Mismatch', A: 75, B: 90, fullMark: 150 },
      { subject: 'High Frequency', A: 120, B: 85, fullMark: 150 },
    ];
    if (!fraudCases || fraudCases.length === 0) {
      return defaultData;
    }
    
    let ipVelocityCount = 0;
    let cardTestingCount = 0;
    let deviceSpoofCount = 0;
    let geoMismatchCount = 0;
    let highFrequencyCount = 0;

    fraudCases.forEach((fc) => {
      const score = fc.riskScore || 0;
      if (score > 80) {
        ipVelocityCount += 25;
        cardTestingCount += 20;
      } else if (score > 50) {
        deviceSpoofCount += 15;
        geoMismatchCount += 18;
      } else {
        highFrequencyCount += 10;
      }
    });

    return [
      { subject: 'IP Velocity', A: Math.min(150, ipVelocityCount + 20), B: 110, fullMark: 150 },
      { subject: 'Card Testing', A: Math.min(150, cardTestingCount + 15), B: 130, fullMark: 150 },
      { subject: 'Device Spoof', A: Math.min(150, deviceSpoofCount + 10), B: 75, fullMark: 150 },
      { subject: 'Geo Mismatch', A: Math.min(150, geoMismatchCount + 15), B: 90, fullMark: 150 },
      { subject: 'High Frequency', A: Math.min(150, highFrequencyCount + 30), B: 85, fullMark: 150 },
    ];
  }, [fraudCases]);

  // Recent widgets lists
  const recentPayments = payments.slice(0, 5);
  const recentFraud = fraudCases.slice(0, 4);
  const recentKafka = transactions.slice(0, 4).map((t) => ({
    id: t.id,
    eventName: t.status === 'SUCCESS' ? 'PaymentProcessedEvent' : 'PaymentCreatedEvent',
    topic: t.status === 'SUCCESS' ? 'payment-events-processed' : 'payment-events-created',
    payload: `{"id":"${t.paymentId}","amount":${t.amount},"status":"${t.status}"}`,
    timestamp: t.timestamp
  }));

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 text-left"
    >
      {/* Upper header summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 rounded-3xl p-6 text-white dark:bg-slate-950 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-[-50%] left-[-20%] h-[150%] w-[50%] rounded-full bg-primary/10 blur-[100px] pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight">Orchestration Center</h1>
          <p className="mt-1.5 text-slate-400 text-sm font-medium">
            Active session: <span className="font-semibold text-white">{user?.name}</span> ({user?.role}). System logs sync: Operational.
          </p>
        </div>
        <div className="flex gap-3 shrink-0 relative z-10">
          <div className="flex items-center gap-2 rounded-xl bg-slate-800/80 px-4 py-2 border border-slate-700/50 backdrop-blur-sm text-xs font-semibold text-slate-300">
            <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
            Core Pipeline: Healthy
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <CardSkeleton count={8} />
        ) : (
          <>
            <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Volume (USD)</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-primary">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-extrabold tracking-tight">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalRevenue)}</div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-success font-bold">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>+14.8% vs last week</span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Accounts</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-extrabold tracking-tight">{totalUsers}</div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-success font-bold">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>+4 new registrations</span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Settled Collections</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <CreditCard className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-extrabold tracking-tight">{totalPayments}</div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <span>Success rate: 94.2%</span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Audit Transaction Logs</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                  <Layers className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-extrabold tracking-tight">{totalTransactions}</div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <span>Capture operations</span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Fraud Alerts</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-danger">
                  <ShieldAlert className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-extrabold tracking-tight">{activeFraudCount}</div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-danger font-bold">
                <span>Critical alerts check</span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Failed Settlements</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                  <XCircle className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-extrabold tracking-tight">{failedPaymentsCount}</div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <span>Requires review: {failedPaymentsCount}</span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Webhook Success Rate</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Zap className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-extrabold tracking-tight">{webhookSuccessRate}%</div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-success font-semibold">
                <span>Callbacks delivery</span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Operations Sessions</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                  <Monitor className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-extrabold tracking-tight">{activeSessions}</div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <span>Live dashboard sessions</span>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Visualizations Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Revenue Trend Area Chart */}
        <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">Gross Volume Trend</h3>
              <p className="text-xs text-slate-400">Weekly transaction aggregates</p>
            </div>
            <TrendingUp className="h-5 w-5 text-slate-400" />
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
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
                <Area type="monotone" dataKey="volume" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Monthly Volumes Bar Chart */}
        <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">Monthly Transaction Success</h3>
              <p className="text-xs text-slate-400">Aggregates by status flag</p>
            </div>
            <Layers className="h-5 w-5 text-slate-400" />
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTxnData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Bar dataKey="Success" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Failed" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Visualizations Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Payment Method Distribution Pie Chart */}
        <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-1">
          <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white mb-1">Method Distribution</h3>
          <p className="text-xs text-slate-400 mb-4">Volume ratios</p>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={methodDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {methodDistribution.map((_, index) => (
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
                <Legend iconSize={6} layout="horizontal" wrapperStyle={{ fontSize: '9px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Fraud Radar Chart */}
        <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-1">
          <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white mb-1">Threat Vectors</h3>
          <p className="text-xs text-slate-400 mb-4">Anomalous triggers score</p>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={fraudRadarData}>
                <PolarGrid stroke={isDark ? '#334155' : '#e2e8f0'} />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={{ fontSize: 8 }} />
                <Radar name="Threat Level" dataKey="A" stroke="#EF4444" fill="#EF4444" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* System Health Status Grid */}
        <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-1">
          <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white mb-1">Platform Grid Sync</h3>
          <p className="text-xs text-slate-400 mb-4">Active telemetry</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/40">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Processor</div>
              <div className="mt-1 text-xs font-bold text-emerald-500">Operational</div>
              <div className="text-[9px] text-slate-400 mt-0.5">34ms response</div>
            </div>
            
            <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/40">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Message Bus</div>
              <div className="mt-1 text-xs font-bold text-emerald-500">Operational</div>
              <div className="text-[9px] text-slate-400 mt-0.5">0 logs backpressure</div>
            </div>

            <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/40">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">AI Analytics</div>
              <div className="mt-1 text-xs font-bold text-emerald-500">Operational</div>
              <div className="text-[9px] text-slate-400 mt-0.5">Active monitoring</div>
            </div>

            <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/40">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Endpoints</div>
              <div className="mt-1 text-xs font-bold text-amber-500">Degraded</div>
              <div className="text-[9px] text-slate-400 mt-0.5">1 fallback node</div>
            </div>
          </div>
          
          {/* AI Insights Card Widget */}
          <div className="mt-4 rounded-xl border border-blue-200/50 bg-blue-50/20 p-3 dark:border-blue-900/30 dark:bg-blue-950/10">
            <div className="flex gap-2">
              <Brain className="h-4.5 w-4.5 text-blue-500 shrink-0 mt-0.5" />
              <div className="text-left">
                <span className="text-[10px] font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wider block">AI Intelligence</span>
                <p className="text-[10px] text-blue-700/80 dark:text-blue-400/80 leading-relaxed mt-0.5">
                  Anomalous transaction spike (+4.2%) matching card-testing profiles flagged from 5 proxy IP regions. Audit check highly recommended.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Widgets row 3: Lists subset */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Recent Settlements */}
        <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold">Recent Settlements</h3>
            <span className="text-[10px] text-slate-400 font-semibold">Real-time ledger updates</span>
          </div>

          <div className="space-y-3">
            {recentPayments.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 shrink-0">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.customerName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{item.customerEmail}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: item.currency || 'INR' }).format(item.amount)}</p>
                  <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-bold mt-0.5 ${
                    item.status === 'SUCCESS'
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/10 dark:bg-emerald-950/20 dark:text-emerald-400'
                      : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10 dark:bg-red-950/20 dark:text-red-400'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Fraud alerts subset */}
        <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold">Fraud Alert Desk</h3>
            <span className="text-[10px] text-slate-400 font-semibold">Active Flags</span>
          </div>

          <div className="space-y-3.5">
            {recentFraud.map((item) => (
              <div key={item.id} className="flex gap-3 text-left">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400 shrink-0">
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{item.customerEmail}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Txn: <span className="font-semibold text-slate-600 dark:text-slate-300">{item.transactionId}</span> • Risk: <span className="text-red-500 font-bold">{item.riskScore}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Kafka events feed widget */}
        <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold">Kafka Log Feed</h3>
            <span className="text-[10px] text-slate-400 font-semibold">Events trace</span>
          </div>

          <div className="space-y-3">
            {recentKafka.map((item) => (
              <div key={item.id} className="flex gap-3 text-left border-l-2 border-primary pl-2.5 py-0.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate">{item.eventName}</span>
                    <span className="text-[8px] text-slate-400 shrink-0">topic: {item.topic.split('-').pop()}</span>
                  </div>
                  <code className="block text-[8px] font-mono text-slate-400 mt-0.5 bg-slate-50 dark:bg-slate-800/40 p-1 rounded truncate">
                    {item.payload}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};
