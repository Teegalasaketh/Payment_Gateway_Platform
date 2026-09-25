import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  CheckCheck,
  Trash2,
  Mail,
  MailOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { paymentService } from '../../services/payment.service';

interface SystemNotification {
  id: string;
  title: string;
  body: string;
  category: 'success' | 'failed' | 'fraud' | 'system';
  timestamp: string;
  read: boolean;
}

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotificationsData = async () => {
      try {
        const [payRes, fraudRes] = await Promise.all([
          paymentService.getPayments(),
          paymentService.getFraudCases()
        ]);
        
        const list: SystemNotification[] = [];

        // Retrieve read/cleared notification IDs from localStorage
        const readIds: string[] = JSON.parse(localStorage.getItem('read_notif_ids') || '[]');
        const clearedIds: string[] = JSON.parse(localStorage.getItem('cleared_notif_ids') || '[]');

        // 1. Map payments to alerts
        payRes.data.forEach((p: any, idx: number) => {
          const successId = `notif-success-${p.id}`;
          const failedId = `notif-failed-${p.id}`;

          if (p.status === 'Success') {
            if (!clearedIds.includes(successId)) {
              list.push({
                id: successId,
                title: 'Payment Settle Success',
                body: `Transaction ID ${p.id} settled ${p.currency === 'USD' ? '$' : '€'}${p.amount.toFixed(2)} successfully from ${p.customerName}.`,
                category: 'success',
                timestamp: p.date,
                read: readIds.includes(successId) || idx > 1
              });
            }
          } else if (p.status === 'Failed') {
            if (!clearedIds.includes(failedId)) {
              list.push({
                id: failedId,
                title: 'Gateway Settle Decline',
                body: `Payment attempt ${p.id} declined by issuing bank (Reason: Code 51 Insufficient Funds).`,
                category: 'failed',
                timestamp: p.date,
                read: readIds.includes(failedId) || true
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
              title: 'High Risk Alert Blocked',
              body: `Aegis Shield auto-blocked credit card testing attempt originating from IP ${f.ipAddress} (Risk Score: ${f.riskScore}%).`,
              category: 'fraud',
              timestamp: f.timestamp || f.date || new Date().toISOString(),
              read: readIds.includes(fraudId) || f.status !== 'Flagged'
            });
          }
        });

        // Add a generic system patch alert
        const patchId = 'notif-system-patch';
        if (!clearedIds.includes(patchId)) {
          list.push({
            id: patchId,
            title: 'System Patch v2.4 Released',
            body: 'Dynamic webhook retry backoffs and idempotency cache limits key checks are active.',
            category: 'system',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
            read: readIds.includes(patchId) || true
          });
        }

        // Sort by timestamp desc
        list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        setNotifications(list);
      } catch (err) {
        console.error('Failed to load notifications', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotificationsData();
  }, []);

  const handleToggleRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n));
      const readIds = updated.filter((n) => n.read).map((n) => n.id);
      localStorage.setItem('read_notif_ids', JSON.stringify(readIds));
      return updated;
    });
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      const readIds = updated.map((n) => n.id);
      localStorage.setItem('read_notif_ids', JSON.stringify(readIds));
      return updated;
    });
    toast.success('Marked all notifications as read.');
  };

  const handleClearAll = () => {
    const clearedIds: string[] = JSON.parse(localStorage.getItem('cleared_notif_ids') || '[]');
    const idsToClear = notifications.map((n) => n.id);
    const updatedClearedIds = Array.from(new Set([...clearedIds, ...idsToClear]));
    localStorage.setItem('cleared_notif_ids', JSON.stringify(updatedClearedIds));

    setNotifications([]);
    toast.info('Cleared system notifications log.');
  };

  const getCategoryIcon = (category: 'success' | 'failed' | 'fraud' | 'system') => {
    switch (category) {
      case 'success':
        return <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />;
      case 'failed':
        return <XCircle className="h-4.5 w-4.5 text-red-500" />;
      case 'fraud':
        return <AlertTriangle className="h-4.5 w-4.5 text-warning" />;
      case 'system':
      default:
        return <Info className="h-4.5 w-4.5 text-blue-500" />;
    }
  };


  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Alerts</h1>
          <p className="mt-1 text-xs text-slate-500">
            Monitor API warning logs, settle completions, and fraud protection indicators.
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </button>
            
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-350 px-3.5 py-2 text-xs font-bold transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Clear alerts
            </button>
          </div>
        )}
      </div>

      {/* Notifications Workspace */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-xs font-semibold text-slate-400">Loading system alerts...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-center">
          <Bell className="h-10 w-10 text-slate-300 dark:text-slate-700" />
          <h3 className="mt-4 text-sm font-bold text-slate-700 dark:text-slate-300">Alerts inbox is clear</h3>
          <p className="mt-1 text-xs text-slate-400">All system exceptions have been reviewed.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start justify-between gap-4 p-4 rounded-2xl border transition-all ${
                n.read
                  ? 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 opacity-70'
                  : 'bg-white border-slate-300 dark:bg-slate-900 dark:border-slate-700 shadow-sm ring-1 ring-primary/10'
              }`}
            >
              <div className="flex gap-3.5 items-start">
                <div className="h-8.5 w-8.5 rounded-xl bg-slate-100 dark:bg-slate-850 flex items-center justify-center shrink-0">
                  {getCategoryIcon(n.category)}
                </div>

                <div className="text-left space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{n.title}</span>
                    {!n.read && (
                      <span className="h-2 w-2 rounded-full bg-primary" title="Unread"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                    {n.body}
                  </p>
                  <span className="text-[10px] text-slate-400 font-semibold block pt-0.5">
                    {new Date(n.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleToggleRead(n.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 dark:hover:text-slate-350 shrink-0 transition-colors"
                title={n.read ? 'Mark as Unread' : 'Mark as Read'}
              >
                {n.read ? <Mail className="h-4.5 w-4.5" /> : <MailOpen className="h-4.5 w-4.5" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default NotificationsPage;
