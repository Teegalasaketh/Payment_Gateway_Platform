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
import { paymentService } from '../../services/payment.service';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TransactionHistory: React.FC = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');
  const [_isLoading, _setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await paymentService.getPayments();
        setPayments(response.data);
      } catch (err) {
        console.error('Failed to load transactions', err);
      } finally {
        _setIsLoading(false);
      }
    };
    fetchPayments();
  }, []);

  // Filtering Logic
  const filteredData = useMemo(() => {
    return payments.filter((p) => {
      if (statusFilter !== 'All' && p.status !== statusFilter) return false;
      if (methodFilter !== 'All' && p.method !== methodFilter) return false;
      
      if (globalFilter) {
        return p.id.toLowerCase().includes(globalFilter.toLowerCase());
      }
      return true;
    });
  }, [payments, statusFilter, methodFilter, globalFilter]);

  // TanStack Columns
  const columnHelper = createColumnHelper<Payment>();
  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'Transaction ID',
        cell: (info) => <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">{info.getValue()}</span>,
      }),
      columnHelper.accessor('amount', {
        header: 'Charged Value',
        cell: (info) => {
          const row = info.row.original;
          return (
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {row.currency === 'USD' ? '$' : '€'}{info.getValue().toFixed(2)}
            </span>
          );
        },
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const status = info.getValue();
          return (
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${
                status === 'Success'
                  ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/10 dark:bg-emerald-950/20 dark:text-emerald-400'
                  : status === 'Failed'
                  ? 'bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-950/20 dark:text-red-400'
                  : 'bg-amber-50 text-amber-700 ring-amber-600/10 dark:bg-amber-950/20 dark:text-amber-400'
              }`}
            >
              {status === 'Success' ? (
                <CheckCircle className="h-3 w-3" />
              ) : status === 'Failed' ? (
                <XCircle className="h-3 w-3" />
              ) : (
                <Clock className="h-3 w-3" />
              )}
              {status}
            </span>
          );
        },
      }),
      columnHelper.accessor('method', {
        header: 'Payment Method',
        cell: (info) => <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">{info.getValue()}</span>,
      }),
      columnHelper.accessor('date', {
        header: 'Settlement Date',
        cell: (info) => <span className="text-xs text-slate-400">{new Date(info.getValue()).toLocaleString()}</span>,
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions Desk',
        cell: (info) => {
          const row = info.row.original;
          return (
            <button
              onClick={() => navigate(`/user/payments/${row.id}`)}
              className="flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2.5 py-1 text-[10px] font-bold text-slate-700 dark:text-slate-300 transition-colors"
            >
              <Eye className="h-3.5 w-3.5" />
              View Details
            </button>
          );
        },
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transaction Ledger</h1>
        <p className="mt-1 text-xs text-slate-500">
          Search logs history, inspect transaction outcomes, and download billing invoices.
        </p>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by payment ID..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl focus:outline-none"
          />
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg"
            >
              <option value="All">All statuses</option>
              <option value="Success">Success</option>
              <option value="Failed">Failed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg"
          >
            <option value="All">All methods</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
            <option value="UPI">UPI</option>
            <option value="Wallet">Wallet</option>
            <option value="Crypto">Crypto</option>
            <option value="Net Banking">Net Banking</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      {filteredData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-center">
          <AlertCircle className="h-10 w-10 text-slate-300 dark:text-slate-700" />
          <h3 className="mt-4 text-sm font-bold text-slate-700 dark:text-slate-300">No transaction logs match search</h3>
          <p className="mt-1 text-xs text-slate-400">Refine selection filters.</p>
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
    </div>
  );
};
export default TransactionHistory;
