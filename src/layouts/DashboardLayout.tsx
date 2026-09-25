import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { toast } from 'sonner';
import { paymentService } from '../services/payment.service';
import {
  ShieldCheck,
  Menu,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  LayoutDashboard,
  CreditCard,
  Settings,
  Users,
  BellRing,
  HelpCircle,
  FileText,
  User as UserIcon,
  X,
  Keyboard,
  ShieldAlert,
  ArrowRightLeft,
  Webhook,
  Activity,
  Key,
  ClipboardList,
  Brain
} from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  time: string;
}

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Layout states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Refs for closing dropdowns on click outside
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const searchModalRef = useRef<HTMLDivElement>(null);

  // Dynamic Notifications Setup
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const fetchLayoutNotifications = async () => {
    try {
      const [payRes, fraudRes] = await Promise.all([
        paymentService.getPayments(),
        paymentService.getFraudCases()
      ]);
      
      const list: NotificationItem[] = [];
      const readIds: string[] = JSON.parse(localStorage.getItem('read_notif_ids') || '[]');
      const clearedIds: string[] = JSON.parse(localStorage.getItem('cleared_notif_ids') || '[]');

      // 1. Map payments
      payRes.data.forEach((p: any, idx: number) => {
        const successId = `notif-success-${p.id}`;
        const failedId = `notif-failed-${p.id}`;

        if (p.status === 'Success') {
          if (!clearedIds.includes(successId)) {
            list.push({
              id: successId,
              title: 'Payment Settle Success',
              message: `Transaction ID ${p.id} settled ${p.currency === 'USD' ? '$' : '€'}${p.amount.toFixed(2)} successfully from ${p.customerName}.`,
              type: 'success',
              read: readIds.includes(successId) || idx > 1,
              time: 'Just now'
            });
          }
        } else if (p.status === 'Failed') {
          if (!clearedIds.includes(failedId)) {
            list.push({
              id: failedId,
              title: 'Gateway Settle Decline',
              message: `Payment attempt ${p.id} declined by issuing bank.`,
              type: 'error',
              read: readIds.includes(failedId) || true,
              time: 'Just now'
            });
          }
        }
      });

      // 2. Map fraud alerts
      fraudRes.data.forEach((f: any) => {
        const fraudId = `notif-fraud-${f.id}`;
        if (!clearedIds.includes(fraudId)) {
          list.push({
            id: fraudId,
            title: 'High-Risk Transaction Flagged',
            message: `Aegis Shield blocked credit card testing attempt from IP ${f.ipAddress}.`,
            type: 'warning',
            read: readIds.includes(fraudId) || f.status !== 'Flagged',
            time: 'Recently'
          });
        }
      });

      // 3. Add system patch
      const patchId = 'notif-system-patch';
      if (!clearedIds.includes(patchId)) {
        list.push({
          id: patchId,
          title: 'System Patch v2.4 Released',
          message: 'Dynamic webhook retry backoffs and idempotency cache limits key checks are active.',
          type: 'info',
          read: readIds.includes(patchId) || true,
          time: '2d ago'
        });
      }

      setNotifications(list);
    } catch (err) {
      console.error('Failed to load layout notifications', err);
    }
  };

  useEffect(() => {
    fetchLayoutNotifications();
    const interval = setInterval(fetchLayoutNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully.');
    navigate('/login');
  };

  const markAllNotificationsAsRead = () => {
    const readIds: string[] = JSON.parse(localStorage.getItem('read_notif_ids') || '[]');
    const currentIds = notifications.map((n) => n.id);
    const updatedReadIds = Array.from(new Set([...readIds, ...currentIds]));
    localStorage.setItem('read_notif_ids', JSON.stringify(updatedReadIds));

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read.');
  };

  const clearNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const clearedIds: string[] = JSON.parse(localStorage.getItem('cleared_notif_ids') || '[]');
    if (!clearedIds.includes(id)) {
      clearedIds.push(id);
      localStorage.setItem('cleared_notif_ids', JSON.stringify(clearedIds));
    }

    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Sidebar navigation definitions based on role
  const adminLinks = [
    { name: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Payments', path: '/admin/payments', icon: CreditCard },
    { name: 'Transactions', path: '/admin/transactions', icon: ArrowRightLeft },
    { name: 'Fraud Center', path: '/admin/fraud', icon: ShieldAlert },
    { name: 'Webhook Monitor', path: '/admin/webhooks', icon: Webhook },
    { name: 'Kafka Stream', path: '/admin/kafka', icon: Activity },
    { name: 'Idempotency Keys', path: '/admin/idempotency', icon: Key },
    { name: 'Audit Trail', path: '/admin/audit-logs', icon: ClipboardList },
    { name: 'AI Insights', path: '/admin/ai-insights', icon: Brain },
    { name: 'System Settings', path: '/admin/settings', icon: Settings },
  ];

  const userLinks = [
    { name: 'Dashboard', path: '/user/dashboard', icon: LayoutDashboard },
    { name: 'Send Payments', path: '/user/payments', icon: CreditCard },
    { name: 'Activity Log', path: '/user/activity', icon: FileText },
    { name: 'AI Assistant', path: '/user/ai', icon: Brain },
    { name: 'Alerts Log', path: '/user/notifications', icon: BellRing },
    { name: 'My Profile', path: '/user/profile', icon: UserIcon },
    { name: 'Help Support', path: '/user/support', icon: HelpCircle },
  ];

  const currentLinks = user?.role === 'Admin' ? adminLinks : userLinks;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200 relative">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/3 h-96 w-96 rounded-full bg-primary/5 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-blue-500/5 blur-[100px] pointer-events-none"></div>
      
      {/* ================================================================== */}
      {/* SIDEBAR - DESKTOP */}
      {/* ================================================================== */}
      <aside
        className={`hidden md:flex flex-col shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 transition-all duration-300 ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Header Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-md shadow-primary/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            {!isSidebarCollapsed && (
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                AegisPay
              </span>
            )}
          </div>
          {!isSidebarCollapsed && (
            <button
              onClick={() => setIsSidebarCollapsed(true)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 space-y-1.5 p-4">
          {currentLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/10'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? '' : 'text-slate-400 group-hover:text-slate-500'}`} />
                {!isSidebarCollapsed && <span className="truncate">{link.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Switchers / Collapse */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          {isSidebarCollapsed ? (
            <button
              onClick={() => setIsSidebarCollapsed(false)}
              className="flex h-10 w-full items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2 dark:bg-slate-800/50">
              <span className="text-xs font-semibold text-slate-400">Theme</span>
              <button
                onClick={toggleTheme}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow dark:bg-slate-800"
              >
                {theme === 'light' ? (
                  <Moon className="h-4 w-4 text-slate-600" />
                ) : (
                  <Sun className="h-4 w-4 text-amber-400" />
                )}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ================================================================== */}
      {/* MOBILE SIDEBAR DRAWERS */}
      {/* ================================================================== */}
      {isMobileSidebarOpen && (
        <div className="relative z-50 md:hidden">
          {/* Overlay */}
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          ></div>
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 animate-slide-in">
            <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                  AegisPay
                </span>
              </div>
              <button onClick={() => setIsMobileSidebarOpen(false)} className="p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <nav className="flex-1 space-y-1.5 p-4">
              {currentLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-primary text-white shadow'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Theme Toggle</span>
              <button onClick={toggleTheme} className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                {theme === 'light' ? <Moon className="h-4 w-4 text-slate-600" /> : <Sun className="h-4 w-4 text-amber-400" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* MAIN CONTAINER */}
      {/* ================================================================== */}
      <div className="flex flex-col flex-1 min-w-0">
        
        {/* ================================================================== */}
        {/* NAVBAR */}
        {/* ================================================================== */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900">
          
          {/* Left: Collapsible trigger + Breadcrumbs */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:block">
              <Breadcrumbs />
            </div>
          </div>

          {/* Right: Search, Notifications, Profile */}
          <div className="flex items-center gap-3">
            
            {/* Visual Search Box */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 w-60 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-left text-xs font-medium text-slate-400 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:bg-slate-950 transition-colors"
            >
              <Search className="h-4 w-4 text-slate-400" />
              <span>Search platform...</span>
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 font-mono text-[9px] font-bold text-slate-400 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                Ctrl K
              </kbd>
            </button>

            {/* Search Icon button (for small displays) */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors border border-transparent dark:border-transparent"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Notification Dropdown Container */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`relative p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors border ${
                  isNotificationsOpen
                    ? 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800'
                    : 'border-transparent'
                }`}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-danger ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 z-50 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900 animate-fade-in">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-sm font-bold">Alert Desk</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-xs font-semibold text-primary hover:underline hover:text-primary-hover"
                      >
                        Read All
                      </button>
                    )}
                  </div>
                  
                  {/* Notifications list */}
                  <div className="max-h-80 overflow-y-auto py-1">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                        <BellRing className="h-8 w-8 text-slate-300 dark:text-slate-700" />
                        <p className="mt-2 text-xs text-slate-400 font-medium">All cleared! No alerts in desk.</p>
                      </div>
                    ) : (
                      notifications.map((item) => {
                        const iconColors = {
                          info: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30',
                          success: 'text-success bg-emerald-50 dark:bg-emerald-950/30',
                          warning: 'text-warning bg-amber-50 dark:bg-amber-950/30',
                          error: 'text-danger bg-red-50 dark:bg-red-950/30',
                        };
                        return (
                          <div
                            key={item.id}
                            className={`flex gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors relative ${
                              !item.read ? 'bg-blue-50/20 dark:bg-blue-950/5' : ''
                            }`}
                          >
                            <div className={`h-8 w-8 rounded-lg shrink-0 flex items-center justify-center ${iconColors[item.type]}`}>
                              <ShieldAlert className="h-4.5 w-4.5" />
                            </div>
                            <div className="flex-1 min-w-0 pr-4">
                              <div className="flex items-baseline justify-between gap-1">
                                <span className={`text-xs font-bold truncate ${!item.read ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                                  {item.title}
                                </span>
                                <span className="text-[9px] text-slate-400 whitespace-nowrap">{item.time}</span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                                {item.message}
                              </p>
                            </div>
                            
                            <button
                              onClick={(e) => clearNotification(item.id, e)}
                              className="absolute right-2 top-3 p-1 rounded-lg text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown Container */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <img
                  src={user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={user?.name || 'User Profile'}
                  className="h-8 w-8 rounded-lg object-cover ring-2 ring-primary/10"
                />
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{user?.name}</div>
                  <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">{user?.role}</div>
                </div>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 z-50 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900 animate-fade-in">
                  <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-400">Signed in as</p>
                    <p className="text-xs font-bold truncate text-slate-700 dark:text-slate-200 mt-0.5">{user?.email}</p>
                  </div>
                  
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate(user?.role === 'Admin' ? '/admin/settings' : '/user/profile');
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
                    >
                      <UserIcon className="h-4 w-4" />
                      Account Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-danger hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* ================================================================== */}
        {/* DYNAMIC SCROLLABLE WRAPPER */}
        {/* ================================================================== */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {/* ================================================================== */}
      {/* CMD+K GLOBAL SEARCH MODAL */}
      {/* ================================================================== */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-900/40 backdrop-blur-sm pt-[10vh]">
          {/* Overlay click closer */}
          <div onClick={() => setIsSearchOpen(false)} className="absolute inset-0"></div>
          
          <div
            ref={searchModalRef}
            className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-scale-up"
          >
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Type to search transactions, cards, settings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm focus:outline-none dark:text-white"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Results mock list */}
            <div className="mt-4 max-h-60 overflow-y-auto space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">Quick Links</div>
              
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  navigate(user?.role === 'Admin' ? '/admin/dashboard' : '/user/dashboard');
                }}
                className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 text-left transition-colors"
              >
                <LayoutDashboard className="h-4 w-4 text-slate-400" />
                Go to Dashboard Console
              </button>

              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  toast.info('Search query processed.');
                }}
                className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 text-left transition-colors"
              >
                <Keyboard className="h-4 w-4 text-slate-400" />
                Keyboard Shortcuts Guide
              </button>
            </div>
            
            <div className="mt-4 border-t border-slate-100 pt-3 text-[10px] text-slate-400 flex items-center gap-2 dark:border-slate-800 font-semibold">
              <span>Press <span className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">esc</span> to close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
