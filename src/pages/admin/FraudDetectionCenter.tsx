import React, { useState, useMemo } from 'react';
import { mockFraudCases as initialFraudCases, type FraudCase } from '../../mock/adminData';
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Flag,
  AlertTriangle,
  Server,
  Laptop,
  Smartphone,
  Tablet
} from 'lucide-react';
import { toast } from 'sonner';

export const FraudDetectionCenter: React.FC = () => {
  const [fraudCases, setFraudCases] = useState<FraudCase[]>(initialFraudCases);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All'); // 'All', 'High' (>85), 'Medium' (70-85)

  // Risk summary counts
  const summary = useMemo(() => {
    const blocked = fraudCases.filter((f) => f.status === 'Blocked').length;
    const flagged = fraudCases.filter((f) => f.status === 'Flagged').length;
    const highRisk = fraudCases.filter((f) => f.riskScore >= 85).length;
    const medRisk = fraudCases.filter((f) => f.riskScore < 85 && f.riskScore >= 70).length;

    return { blocked, flagged, highRisk, medRisk };
  }, [fraudCases]);

  // Filtering Logic
  const filteredCases = useMemo(() => {
    return fraudCases.filter((f) => {
      // Status
      if (statusFilter !== 'All' && f.status !== statusFilter) return false;
      // Risk Score
      if (riskFilter === 'High' && f.riskScore < 85) return false;
      if (riskFilter === 'Medium' && (f.riskScore >= 85 || f.riskScore < 70)) return false;
      
      if (globalFilter) {
        const text = globalFilter.toLowerCase();
        return (
          f.customerName.toLowerCase().includes(text) ||
          f.customerEmail.toLowerCase().includes(text) ||
          f.transactionId.toLowerCase().includes(text) ||
          f.ipAddress.includes(text)
        );
      }
      return true;
    });
  }, [fraudCases, statusFilter, riskFilter, globalFilter]);

  // Actions
  const handleApprove = (id: string, name: string) => {
    setFraudCases((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: 'Approved' } : f))
    );
    toast.success(`Transaction approved for ${name}. Marked as legitimate.`);
  };

  const handleReject = (id: string, name: string) => {
    setFraudCases((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: 'Rejected' } : f))
    );
    toast.success(`Transaction rejected. Payment will not be processed for ${name}.`);
  };

  const handleBlock = (id: string, ip: string, email: string) => {
    setFraudCases((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: 'Blocked' } : f))
    );
    toast.error(`IP ${ip} and user ${email} have been blocked from processing.`);
  };

  const getDeviceIcon = (device: 'Desktop' | 'Mobile' | 'Tablet') => {
    switch (device) {
      case 'Desktop':
        return <Laptop className="h-4 w-4" />;
      case 'Mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'Tablet':
        return <Tablet className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fraud Analytics Shield</h1>
          <p className="mt-1 text-xs text-slate-500">
            Real-time machine learning risk scores, anomaly checks, and security blocks.
          </p>
        </div>
      </div>

      {/* Summary Risk Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Blocked Vectors</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
              <XCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold tracking-tight">{summary.blocked}</div>
          <p className="text-[10px] text-slate-400 mt-1">IP & Domain blocks in firewall</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Flagged Suspicious</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-warning">
              <Flag className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold tracking-tight">{summary.flagged}</div>
          <p className="text-[10px] text-slate-400 mt-1">Requires manual audit approval</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">High Risk Alerts</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold tracking-tight">{summary.highRisk}</div>
          <p className="text-[10px] text-slate-400 mt-1">Risk Score &gt;= 85 thresholds</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Medium Risk Alerts</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold tracking-tight">{summary.medRisk}</div>
          <p className="text-[10px] text-slate-400 mt-1">Risk Score between 70 and 85</p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search IP, customer, transactions..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg text-xs"
            >
              <option value="All">All Statuses</option>
              <option value="Flagged">Flagged</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg text-xs"
          >
            <option value="All">All Risk Profiles</option>
            <option value="High">High Risk (&gt;= 85)</option>
            <option value="Medium">Medium Risk (70-84)</option>
          </select>
        </div>
      </div>

      {/* Fraud Logs Table */}
      {filteredCases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-center">
          <CheckCircle className="h-10 w-10 text-slate-300 dark:text-slate-700" />
          <h3 className="mt-4 text-sm font-bold text-slate-700 dark:text-slate-300">Fraud alerts log is clear</h3>
          <p className="mt-1 text-xs text-slate-400">All transaction anomalies have been reviewed.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-400 dark:border-slate-800 dark:bg-slate-800/20">
                  <th className="p-4">Customer User</th>
                  <th className="p-4">Transaction</th>
                  <th className="p-4">Network Info</th>
                  <th className="p-4">Risk Metric</th>
                  <th className="p-4">Decision Status</th>
                  <th className="p-4">Actions Desk</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((f) => (
                  <tr key={f.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 dark:border-slate-800/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 text-left">
                      <div className="text-xs font-bold">{f.customerName}</div>
                      <div className="text-[10px] text-slate-400 font-semibold">{f.customerEmail}</div>
                    </td>
                    <td className="p-4 text-xs">
                      <div className="font-mono font-bold text-slate-700 dark:text-slate-300">{f.transactionId}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">${f.amount.toFixed(2)} USD</div>
                    </td>
                    <td className="p-4 text-xs">
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 font-semibold">
                        <Server className="h-3.5 w-3.5 text-slate-400" />
                        <span>IP: {f.ipAddress}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 font-semibold">
                        {getDeviceIcon(f.device)}
                        <span>Device: {f.device}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-extrabold ${f.riskScore >= 85 ? 'text-red-500' : 'text-orange-500'}`}>
                          {f.riskScore}
                        </span>
                        <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800 shrink-0">
                          <div
                            className={`h-full ${f.riskScore >= 85 ? 'bg-red-500' : 'bg-orange-500'}`}
                            style={{ width: `${f.riskScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${
                        f.status === 'Flagged'
                          ? 'bg-amber-50 text-amber-700 ring-amber-600/10 dark:bg-amber-950/20 dark:text-amber-400'
                          : f.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/10 dark:bg-emerald-950/20 dark:text-emerald-400'
                          : f.status === 'Rejected'
                          ? 'bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-950/20 dark:text-red-400'
                          : 'bg-slate-50 text-slate-700 ring-slate-600/10 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {f.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {f.status === 'Flagged' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(f.id, f.customerName)}
                            className="flex items-center gap-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 px-2.5 py-1 text-[10px] font-bold"
                            title="Approve Transaction"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            Release
                          </button>
                          <button
                            onClick={() => handleReject(f.id, f.customerName)}
                            className="flex items-center gap-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 px-2.5 py-1 text-[10px] font-bold"
                            title="Decline Transaction"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Decline
                          </button>
                          <button
                            onClick={() => handleBlock(f.id, f.ipAddress, f.customerEmail)}
                            className="flex items-center gap-1.5 rounded-lg bg-slate-800 text-white hover:bg-black dark:bg-slate-700 px-2.5 py-1 text-[10px] font-bold"
                            title="Block User Domain & IP"
                          >
                            <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
                            Block
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold italic">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
