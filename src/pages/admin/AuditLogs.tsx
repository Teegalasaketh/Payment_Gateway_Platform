import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table';
import { mockAuditLogs, type AuditLog } from '../../mock/adminData';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  AlertCircle
} from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');

  // Search & Filter
  const filteredData = useMemo(() => {
    return mockAuditLogs.filter((a) => {
      if (moduleFilter !== 'All' && a.module !== moduleFilter) return false;
      
      if (globalFilter) {
        const text = globalFilter.toLowerCase();
        return (
          a.user.toLowerCase().includes(text) ||
          a.action.toLowerCase().includes(text) ||
          a.ipAddress.includes(text)
        );
      }
      return true;
    });
  }, [moduleFilter, globalFilter]);

  // TanStack Columns
  const columnHelper = createColumnHelper<AuditLog>();
  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'Audit ID',
        cell: (info) => <span className="font-mono text-xs font-bold text-slate-400">{info.getValue()}</span>,
      }),
      columnHelper.accessor('user', {
        header: 'Administrator',
        cell: (info) => <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{info.getValue()}</span>,
      }),
      columnHelper.accessor('action', {
        header: 'Security Action Performed',
        cell: (info) => <span className="text-xs font-medium text-slate-600 dark:text-slate-300 block text-left">{info.getValue()}</span>,
      }),
      columnHelper.accessor('module', {
        header: 'Module System',
        cell: (info) => {
          const val = info.getValue();
          return (
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              {val}
            </span>
          );
        },
      }),
      columnHelper.accessor('ipAddress', {
        header: 'Access IP Address',
        cell: (info) => <span className="font-mono text-xs text-slate-400">{info.getValue()}</span>,
      }),
      columnHelper.accessor('timestamp', {
        header: 'Dispatched Timestamp',
        cell: (info) => <span className="text-xs text-slate-400">{new Date(info.getValue()).toLocaleString()}</span>,
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
          <h1 className="text-2xl font-bold tracking-tight">Security Audit Logs</h1>
          <p className="mt-1 text-xs text-slate-500">
            Immutable system trace logs documenting gateway modifications, overrides, and administrative actions.
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search action details, admins, IPs..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg text-xs"
            >
              <option value="All">All Modules</option>
              <option value="User Management">User Management</option>
              <option value="Payment Management">Payment Management</option>
              <option value="Fraud Center">Fraud Center</option>
              <option value="Webhook Monitor">Webhook Monitor</option>
              <option value="Idempotency Desk">Idempotency Desk</option>
              <option value="AI Insights">AI Insights</option>
              <option value="System Settings">System Settings</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      {filteredData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-center">
          <AlertCircle className="h-10 w-10 text-slate-300 dark:text-slate-700" />
          <h3 className="mt-4 text-sm font-bold text-slate-700 dark:text-slate-300">No audit logs matched query</h3>
          <p className="mt-1 text-xs text-slate-400">Refine search criteria.</p>
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
    </div>
  );
};
