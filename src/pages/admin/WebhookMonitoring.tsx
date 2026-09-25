import React, { useState, useMemo, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table';
import { type WebhookLog } from '../../mock/adminData';
import { paymentService } from '../../services/payment.service';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Terminal,
  FileCode,
  ListTodo,
  CheckCircle,
  XCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { toast } from 'sonner';

export const WebhookMonitoring: React.FC = () => {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [viewingPayload, setViewingPayload] = useState<string | null>(null);
  const [viewingHeaders, setViewingHeaders] = useState<WebhookLog | null>(null);
  
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const fetchWebhooks = async () => {
    try {
      const response = await paymentService.getWebhooks();
      setLogs(response.data);
    } catch (err) {
      toast.error('Failed to load webhook logs.');
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = logs.length;
    const success = logs.filter((l) => l.status === 'Success').length;
    const rate = total > 0 ? ((success / total) * 100).toFixed(1) : '100';
    const retries = logs.reduce((sum, l) => sum + l.retries, 0);

    return { total, rate, retries };
  }, [logs]);

  // Filtering
  const filteredData = useMemo(() => {
    return logs.filter((l) => {
      if (statusFilter !== 'All' && l.status !== statusFilter) return false;
      
      if (globalFilter) {
        return l.endpoint.toLowerCase().includes(globalFilter.toLowerCase()) || l.id.toLowerCase().includes(globalFilter.toLowerCase());
      }
      return true;
    });
  }, [logs, statusFilter, globalFilter]);

  // Actions
  const handleRetryWebhook = async (logId: string) => {
    setLoadingStates((prev) => ({ ...prev, [logId]: true }));
    toast.info(`Retrying webhook dispatch for ${logId}...`);
    try {
      await paymentService.retryWebhook(logId);
      toast.success(`Webhook ${logId} delivered successfully on retry.`);
      fetchWebhooks();
    } catch (err: any) {
      toast.error(err.message || 'Failed to dispatch webhook.');
    } finally {
      setLoadingStates((prev) => ({ ...prev, [logId]: false }));
    }
  };

  // TanStack Columns
  const columnHelper = createColumnHelper<WebhookLog>();
  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'Log ID',
        cell: (info) => <span className="font-mono text-xs font-bold">{info.getValue()}</span>,
      }),
      columnHelper.accessor('endpoint', {
        header: 'Callback Endpoint URL',
        cell: (info) => <span className="text-xs truncate max-w-xs font-medium block text-left" title={info.getValue()}>{info.getValue()}</span>,
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
                  : 'bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-950/20 dark:text-red-400'
              }`}
            >
              {status === 'Success' ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              {status}
            </span>
          );
        },
      }),
      columnHelper.accessor('responseCode', {
        header: 'Response',
        cell: (info) => {
          const val = info.getValue();
          const isOk = val === 200 || val === 201;
          return (
            <span className={`font-mono text-xs font-bold ${isOk ? 'text-emerald-500' : 'text-red-500'}`}>
              {val}
            </span>
          );
        },
      }),
      columnHelper.accessor('retries', {
        header: 'Retries',
        cell: (info) => <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{info.getValue()} attempts</span>,
      }),
      columnHelper.accessor('timestamp', {
        header: 'Dispatched At',
        cell: (info) => <span className="text-xs text-slate-400">{new Date(info.getValue()).toLocaleString()}</span>,
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Orchestration Desk',
        cell: (info) => {
          const l = info.row.original;
          const isRetrying = loadingStates[l.id];

          return (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setViewingPayload(l.payload)}
                className="flex items-center gap-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-2 py-1 text-[10px] font-bold text-slate-700 dark:text-slate-300 transition-colors"
                title="View JSON Payload"
              >
                <FileCode className="h-3.5 w-3.5" />
                Payload
              </button>

              <button
                onClick={() => setViewingHeaders(l)}
                className="flex items-center gap-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-2 py-1 text-[10px] font-bold text-slate-700 dark:text-slate-300 transition-colors"
                title="View HTTP Logs"
              >
                <Terminal className="h-3.5 w-3.5" />
                Logs
              </button>

              {l.status === 'Failed' && (
                <button
                  onClick={() => handleRetryWebhook(l.id)}
                  disabled={isRetrying}
                  className="flex items-center gap-1 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-50 dark:bg-amber-950/20 dark:text-amber-400 px-2.5 py-1 text-[10px] font-bold transition-all"
                >
                  <RefreshCw className={`h-3 w-3 ${isRetrying ? 'animate-spin' : ''}`} />
                  Retry
                </button>
              )}
            </div>
          );
        },
      }),
    ],
    [loadingStates]
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
          <h1 className="text-2xl font-bold tracking-tight">Webhook Callbacks Engine</h1>
          <p className="mt-1 text-xs text-slate-500">
            Monitor API callbacks, inspect payloads, and manually execute delivery retries.
          </p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Dispatches</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ListTodo className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold tracking-tight">{metrics.total}</div>
          <p className="text-[10px] text-slate-400 mt-1">Logs stored in operations</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Callback Success Rate</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50/15 text-success">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold tracking-tight">{metrics.rate}%</div>
          <p className="text-[10px] text-slate-400 mt-1">HTTP status 200/201 ratio</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Retries Dispatched</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50/15 text-warning">
              <RefreshCw className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold tracking-tight">{metrics.retries}</div>
          <p className="text-[10px] text-slate-400 mt-1">Simulated retry callbacks</p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search endpoints, log IDs..."
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
              <option value="Success">Success Only</option>
              <option value="Failed">Failed Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Webhook logs table */}
      {filteredData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-center">
          <AlertCircle className="h-10 w-10 text-slate-300 dark:text-slate-700" />
          <h3 className="mt-4 text-sm font-bold text-slate-700 dark:text-slate-300">No webhooks log matches</h3>
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
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} ({filteredData.length} webhook logs)
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
      {/* PAYLOAD MODAL */}
      {/* ================================================================== */}
      {viewingPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold">Webhook JSON Payload</h3>
              <button onClick={() => setViewingPayload(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            
            <div className="mt-4">
              <pre className="block max-h-96 overflow-auto rounded-lg bg-slate-50 p-4 text-xs dark:bg-slate-950 font-mono text-left text-slate-700 dark:text-slate-300">
                {viewingPayload}
              </pre>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewingPayload(null)}
                className="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-hover shadow-sm"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* HEADER LOGS MODAL */}
      {/* ================================================================== */}
      {viewingHeaders && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold">HTTP Raw Execution Logs</h3>
                <p className="text-[10px] text-slate-400 font-semibold">Callback ID: {viewingHeaders.id}</p>
              </div>
              <button onClick={() => setViewingHeaders(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            
            <div className="mt-4 space-y-4 text-xs text-left">
              <div>
                <span className="text-slate-400 font-bold block mb-1">Request Headers Sent</span>
                <pre className="block rounded-lg bg-slate-50 p-3 font-mono text-[10px] dark:bg-slate-950 text-slate-700 dark:text-slate-300">
{`POST ${viewingHeaders.endpoint}
Content-Type: application/json
X-Aegis-Signature: sha256=3ffbd89201a4e58b88d32b535...
User-Agent: AegisPay-Callback-Agent/2.0`}
                </pre>
              </div>

              <div>
                <span className="text-slate-400 font-bold block mb-1">Response Acquirer Response Stream</span>
                <pre className="block rounded-lg bg-slate-50 p-3 font-mono text-[10px] dark:bg-slate-950 text-slate-700 dark:text-slate-300">
{`HTTP/1.1 ${viewingHeaders.responseCode} ${viewingHeaders.status === 'Success' ? 'OK' : 'Internal Error'}
Date: ${new Date(viewingHeaders.timestamp).toUTCString()}
Connection: close

${viewingHeaders.status === 'Success' ? '{"received": true, "code": "success"}' : 'Error: Request timed out after 10000ms.'}`}
                </pre>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewingHeaders(null)}
                className="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-hover shadow-sm"
              >
                Close view
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
