import React, { useState, useMemo, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table';
import { type Payment } from '../../mock/adminData';
import { ConfirmationModal } from '../../components/shared/ConfirmationModal';
import { paymentService } from '../../services/payment.service';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  CornerUpLeft,
  Download,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

export const PaymentManagement: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');
  const [_isLoading, _setIsLoading] = useState(true);
  
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const fetchPayments = async () => {
    try {
      const response = await paymentService.getPayments();
      setPayments(response.data);
    } catch (err) {
      toast.error('Failed to load payments.');
    } finally {
      _setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Filter & Search Logic
  const filteredData = useMemo(() => {
    return payments.filter((p) => {
      if (statusFilter !== 'All' && p.status !== statusFilter) return false;
      if (methodFilter !== 'All' && p.method !== methodFilter) return false;
      
      if (globalFilter) {
        const text = globalFilter.toLowerCase();
        return (
          p.customerName.toLowerCase().includes(text) ||
          p.customerEmail.toLowerCase().includes(text) ||
          p.id.toLowerCase().includes(text)
        );
      }
      return true;
    });
  }, [payments, statusFilter, methodFilter, globalFilter]);

  const [confirmRefundData, setConfirmRefundData] = useState<{ id: string; customer: string } | null>(null);

  // Simulated Actions
  const handleRefund = (paymentId: string, customer: string) => {
    setConfirmRefundData({ id: paymentId, customer });
  };

  const confirmRefund = async () => {
    if (!confirmRefundData) return;
    const { id: paymentId } = confirmRefundData;
    try {
      await paymentService.refundPayment(paymentId);
      toast.success(`Refund processed successfully for ${paymentId}.`);
      fetchPayments();
    } catch (err: any) {
      toast.error(err.message || 'Failed to refund payment.');
    }
    setConfirmRefundData(null);
  };

  const handleRetry = async (paymentId: string) => {
    setLoadingStates((prev) => ({ ...prev, [paymentId]: true }));
    toast.info(`Re-dispatching transaction queue for ${paymentId}...`);
    try {
      await paymentService.retryPayment(paymentId);
      toast.success(`Payment ${paymentId} recovered successfully.`);
      fetchPayments();
    } catch (err: any) {
      toast.error(err.message || 'Failed to recover transaction.');
    } finally {
      setLoadingStates((prev) => ({ ...prev, [paymentId]: false }));
    }
  };

  const exportData = (format: 'CSV' | 'JSON') => {
    toast.info(`Preparing ${format} download package containing ${filteredData.length} records...`);
    setTimeout(() => {
      // Simulated export download
      const content = JSON.stringify(filteredData, null, 2);
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `AegisPay_Payments_${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Export downloaded: ${filteredData.length} entries dispatch package completed.`);
    }, 1000);
  };

  // TanStack Column Definitions
  const columnHelper = createColumnHelper<Payment>();
  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'Payment ID',
        cell: (info) => <span className="font-mono text-xs font-bold">{info.getValue()}</span>,
      }),
      columnHelper.accessor('customerName', {
        header: 'Customer',
        cell: (info) => (
          <div className="text-left">
            <div className="text-xs font-bold">{info.getValue()}</div>
            <div className="text-[10px] text-slate-400 font-medium">{info.row.original.customerEmail}</div>
          </div>
        ),
      }),
      columnHelper.accessor('amount', {
        header: 'Amount',
        cell: (info) => (
          <span className="font-bold text-xs">
            {info.row.original.currency === 'USD' ? '$' : '€'}
            {info.getValue().toFixed(2)}
          </span>
        ),
      }),
      columnHelper.accessor('method', {
        header: 'Method',
        cell: (info) => <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{info.getValue()}</span>,
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const status = info.getValue();
          return (
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${
                status === 'Success'
                  ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/10 dark:bg-emerald-950/20 dark:text-emerald-400'
                  : status === 'Failed'
                  ? 'bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-950/20 dark:text-red-400'
                  : status === 'Refunded'
                  ? 'bg-purple-50 text-purple-700 ring-purple-600/10 dark:bg-purple-950/20 dark:text-purple-400'
                  : 'bg-amber-50 text-amber-700 ring-amber-600/10 dark:bg-amber-950/20 dark:text-amber-400'
              }`}
            >
              {status}
            </span>
          );
        },
      }),
      columnHelper.accessor('date', {
        header: 'Settlement Date',
        cell: (info) => <span className="text-xs text-slate-400">{new Date(info.getValue()).toLocaleString()}</span>,
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Orchestration',
        cell: (info) => {
          const p = info.row.original;
          const isRetrying = loadingStates[p.id];

          return (
            <div className="flex items-center gap-2">
              {p.status === 'Success' && (
                <button
                  onClick={() => handleRefund(p.id, p.customerName)}
                  className="flex items-center gap-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-2 py-1 text-[10px] font-bold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <CornerUpLeft className="h-3 w-3" />
                  Refund
                </button>
              )}

              {p.status === 'Failed' && (
                <button
                  onClick={() => handleRetry(p.id)}
                  disabled={isRetrying}
                  className="flex items-center gap-1 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-50 dark:bg-amber-950/20 dark:text-amber-400 px-2 py-1 text-[10px] font-bold transition-all"
                >
                  <RefreshCw className={`h-3 w-3 ${isRetrying ? 'animate-spin' : ''}`} />
                  {isRetrying ? 'Retrying...' : 'Recover'}
                </button>
              )}
              
              {(p.status === 'Refunded' || p.status === 'Pending') && (
                <span className="text-[10px] text-slate-400 italic font-medium px-2">No actions</span>
              )}
            </div>
          );
        },
      }),
    ],
    [loadingStates, payments]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ledger Settlements</h1>
          <p className="mt-1 text-xs text-slate-500">
            Settle charges, execute manual refunds, and verify processing pipelines.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => exportData('CSV')}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm"
          >
            <Download className="h-4 w-4" />
            CSV Data
          </button>
          <button
            onClick={() => exportData('JSON')}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm"
          >
            <Download className="h-4 w-4" />
            JSON Dump
          </button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search Payment ID, name, emails..."
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
              <option value="Success">Success</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg text-xs"
          >
            <option value="All">All Methods</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="PayPal">PayPal</option>
            <option value="Apple Pay">Apple Pay</option>
            <option value="Google Pay">Google Pay</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      {filteredData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-center">
          <AlertCircle className="h-10 w-10 text-slate-300 dark:text-slate-700" />
          <h3 className="mt-4 text-sm font-bold text-slate-700 dark:text-slate-300">No matching payments found</h3>
          <p className="mt-1 text-xs text-slate-400">Refine search text or filter options.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-400 dark:border-slate-800 dark:bg-slate-800/20">
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="p-4">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 dark:border-slate-800/50 dark:hover:bg-slate-800/30 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination controls */}
          <div className="flex items-center justify-between border-t border-slate-100 p-4 dark:border-slate-800 font-semibold text-xs">
            <span className="text-slate-400">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} ({filteredData.length} total payments)
            </span>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      {confirmRefundData && (
        <ConfirmationModal
          isOpen={confirmRefundData !== null}
          title="Confirm Settle Refund?"
          message={`Are you sure you want to void and refund payment ${confirmRefundData.id} for ${confirmRefundData.customer}? This will reverse the transaction and return funds to the customer account.`}
          confirmText="Confirm Refund"
          cancelText="Cancel"
          type="warning"
          onConfirm={confirmRefund}
          onCancel={() => setConfirmRefundData(null)}
        />
      )}
    </div>
  );
};
