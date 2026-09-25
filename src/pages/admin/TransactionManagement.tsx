import React, { useState, useMemo, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table';
import { type Transaction } from '../../mock/adminData';
import { paymentService } from '../../services/payment.service';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  AlertCircle,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  X
} from 'lucide-react';
import { toast } from 'sonner';

export const TransactionManagement: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [_isLoading, _setIsLoading] = useState(true);
  
  // Selected transaction for details modal
  const [viewingTxn, setViewingTxn] = useState<Transaction | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await paymentService.getTransactions();
        setTransactions(response.data);
      } catch (err) {
        toast.error('Failed to load transaction data.');
      } finally {
        _setIsLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  // Search & Filter
  const filteredData = useMemo(() => {
    return transactions.filter((t) => {
      if (statusFilter !== 'All' && t.status !== statusFilter) return false;
      if (typeFilter !== 'All' && t.type !== typeFilter) return false;
      
      if (globalFilter) {
        const text = globalFilter.toLowerCase();
        return (
          t.id.toLowerCase().includes(text) ||
          t.customerEmail.toLowerCase().includes(text) ||
          t.reference.toLowerCase().includes(text)
        );
      }
      return true;
    });
  }, [transactions, statusFilter, typeFilter, globalFilter]);

  const exportData = (format: 'CSV' | 'PDF') => {
    toast.info(`Generating ${format} export sheet...`);
    setTimeout(() => {
      toast.success(`Export downloaded: ${filteredData.length} logs structured successfully.`);
    }, 900);
  };

  const getResponseCodeMeaning = (code: string) => {
    const codes: Record<string, string> = {
      '00': 'Approved / Completed successfully',
      '05': 'Do not honor (General decline)',
      '12': 'Invalid transaction type',
      '51': 'Insufficient funds on credit account',
      '91': 'System timeout at card network authorization',
    };
    return codes[code] || 'Declined by financial organization';
  };

  // TanStack Columns
  const columnHelper = createColumnHelper<Transaction>();
  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'Transaction ID',
        cell: (info) => <span className="font-mono text-xs font-bold">{info.getValue()}</span>,
      }),
      columnHelper.accessor('customerEmail', {
        header: 'Customer Email',
        cell: (info) => <span className="text-xs text-slate-500 dark:text-slate-400">{info.getValue()}</span>,
      }),
      columnHelper.accessor('type', {
        header: 'Type',
        cell: (info) => (
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
            {info.getValue()}
          </span>
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
      columnHelper.accessor('reference', {
        header: 'Trace Ref',
        cell: (info) => <span className="font-mono text-xs text-slate-400">{info.getValue()}</span>,
      }),
      columnHelper.accessor('date', {
        header: 'Timestamp',
        cell: (info) => <span className="text-xs text-slate-400">{new Date(info.getValue()).toLocaleString()}</span>,
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Audit details',
        cell: (info) => (
          <button
            onClick={() => setViewingTxn(info.row.original)}
            className="flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] font-bold px-2 py-1 transition-colors text-slate-700 dark:text-slate-300"
          >
            <Eye className="h-3.5 w-3.5" />
            Inspect
          </button>
        ),
      }),
    ],
    []
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
          <h1 className="text-2xl font-bold tracking-tight">System Transaction Audit</h1>
          <p className="mt-1 text-xs text-slate-500">
            Inspect lower-level trace events, bank response payloads, and processing step records.
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
            onClick={() => exportData('PDF')}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm"
          >
            <Download className="h-4 w-4" />
            PDF Log
          </button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search Txn ID, customer email, references..."
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
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg text-xs"
          >
            <option value="All">All Types</option>
            <option value="Capture">Capture</option>
            <option value="Authorize">Authorize</option>
            <option value="Refund">Refund</option>
            <option value="Payout">Payout</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      {filteredData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-center">
          <AlertCircle className="h-10 w-10 text-slate-300 dark:text-slate-700" />
          <h3 className="mt-4 text-sm font-bold text-slate-700 dark:text-slate-300">No matching transactions found</h3>
          <p className="mt-1 text-xs text-slate-400">Refine search filter.</p>
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
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} ({filteredData.length} total logs)
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

      {/* ================================================================== */}
      {/* TRANSACTION INSPECTOR DETAILS MODAL (WITH STEPPER TIMELINE) */}
      {/* ================================================================== */}
      {viewingTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold">Trace Inspector</h3>
                <p className="text-[10px] text-slate-400 font-semibold">Txn Hash ID: {viewingTxn.id}</p>
              </div>
              <button onClick={() => setViewingTxn(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            
            <div className="mt-4 space-y-5 text-sm">
              
              {/* Stepper Status Timeline */}
              <div className="bg-slate-50 p-4 rounded-xl dark:bg-slate-950/40">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-4">Pipeline Execution Trace</h4>
                
                <div className="flex items-center justify-between relative">
                  {/* Progress Line */}
                  <div className="absolute left-[15%] right-[15%] top-3.5 h-0.5 bg-slate-200 dark:bg-slate-800 z-0">
                    <div
                      className={`h-full bg-emerald-500 transition-all ${
                        viewingTxn.status === 'Success'
                          ? 'w-full'
                          : viewingTxn.status === 'Failed'
                          ? 'w-[50%] bg-red-500'
                          : 'w-[50%]'
                      }`}
                    ></div>
                  </div>

                  {/* Step 1: Created */}
                  <div className="flex flex-col items-center z-10 relative">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow shadow-emerald-500/20">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 mt-1">Created</span>
                  </div>

                  {/* Step 2: Processing */}
                  <div className="flex flex-col items-center z-10 relative">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow shadow-emerald-500/20">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 mt-1">Processing</span>
                  </div>

                  {/* Step 3: Finished */}
                  <div className="flex flex-col items-center z-10 relative">
                    {viewingTxn.status === 'Success' ? (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow shadow-emerald-500/20">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                    ) : viewingTxn.status === 'Failed' ? (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow shadow-red-500/20">
                        <XCircle className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-white shadow shadow-amber-500/20">
                        <Clock className="h-4 w-4" />
                      </div>
                    )}
                    <span className="text-[10px] font-bold text-slate-500 mt-1">
                      {viewingTxn.status === 'Success' ? 'Completed' : viewingTxn.status === 'Failed' ? 'Declined' : 'Processing'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transaction Metadata Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block">Associated Payment</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200 mt-0.5 block">{viewingTxn.paymentId}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Settlement Value</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200 mt-0.5 block">
                    {viewingTxn.currency} {viewingTxn.amount.toFixed(2)} ({viewingTxn.method})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Audit Risk Assessment</span>
                  <span className={`font-bold mt-0.5 block ${viewingTxn.riskScore > 65 ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}`}>
                    {viewingTxn.riskScore} / 100
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Trace Reference</span>
                  <span className="font-mono font-semibold text-slate-600 dark:text-slate-400 mt-0.5 block">{viewingTxn.reference}</span>
                </div>
              </div>

              {/* Bank response payload */}
              <div className="border-t border-slate-100 pt-3 dark:border-slate-800 text-xs">
                <span className="text-slate-400 font-semibold block mb-1">Acquirer Network Response Code</span>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950/40">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded text-[10px]">
                      {viewingTxn.responseCode}
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {getResponseCodeMeaning(viewingTxn.responseCode)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setViewingTxn(null)}
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover shadow-sm"
                >
                  Close Inspector
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
