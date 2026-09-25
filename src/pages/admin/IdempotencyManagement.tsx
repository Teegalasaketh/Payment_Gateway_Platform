import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table';
import { mockIdempotencyKeys as initialKeys, type IdempotencyKey } from '../../mock/adminData';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle,
  FileKey,
  ShieldCheck,
  ZapOff,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export const IdempotencyManagement: React.FC = () => {
  const [keys, setKeys] = useState<IdempotencyKey[]>(initialKeys);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Simulator State
  const [inputKey, setInputKey] = useState('');
  const [simulationResult, setSimulationResult] = useState<{
    type: 'collision' | 'unique' | null;
    message: string;
    cachedHash?: string;
  }>({ type: null, message: '' });

  // Search & Filter
  const filteredData = useMemo(() => {
    return keys.filter((k) => {
      if (statusFilter !== 'All' && k.status !== statusFilter) return false;
      
      if (globalFilter) {
        const text = globalFilter.toLowerCase();
        return k.key.toLowerCase().includes(text) || k.requestHash.toLowerCase().includes(text);
      }
      return true;
    });
  }, [keys, statusFilter, globalFilter]);

  // Key Collision Checker
  const handleCheckKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) {
      toast.error('Please enter a key string to test.');
      return;
    }

    const trimmed = inputKey.trim();
    const match = keys.find((k) => k.key.toLowerCase() === trimmed.toLowerCase());

    if (match) {
      setSimulationResult({
        type: 'collision',
        message: 'Duplicate request detected! This request was rejected. The gateway returned the cached response payload directly from memory without re-running payments.',
        cachedHash: match.requestHash,
      });
      toast.error('Idempotency collision! Request blocked.');
    } else {
      // Create new key to demonstrate adding it
      const newKey: IdempotencyKey = {
        key: trimmed,
        requestHash: `idem-hash-gen-${Math.floor(10000000 + Math.random() * 90000000)}`,
        status: 'Stored',
        createdAt: new Date().toISOString(),
      };
      
      setKeys((prev) => [newKey, ...prev]);
      setSimulationResult({
        type: 'unique',
        message: 'Key verified as unique! Request was allowed through the transaction pipeline safely and the key has been registered.',
        cachedHash: newKey.requestHash,
      });
      setInputKey('');
      toast.success('Key registered successfully.');
    }
  };

  // TanStack Columns
  const columnHelper = createColumnHelper<IdempotencyKey>();
  const columns = useMemo(
    () => [
      columnHelper.accessor('key', {
        header: 'Idempotency Key String',
        cell: (info) => <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">{info.getValue()}</span>,
      }),
      columnHelper.accessor('requestHash', {
        header: 'Request SHA-256 Checksum',
        cell: (info) => <span className="font-mono text-xs text-slate-400 block truncate max-w-xs">{info.getValue()}</span>,
      }),
      columnHelper.accessor('status', {
        header: 'Store Status',
        cell: (info) => {
          const status = info.getValue();
          return (
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${
                status === 'Stored'
                  ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/10 dark:bg-emerald-950/20 dark:text-emerald-400'
                  : 'bg-blue-50 text-blue-700 ring-blue-600/10 dark:bg-blue-950/20 dark:text-blue-400'
              }`}
            >
              {status === 'Stored' ? <CheckCircle className="h-3 w-3" /> : <RefreshCw className="h-3 w-3 animate-spin" />}
              {status}
            </span>
          );
        },
      }),
      columnHelper.accessor('createdAt', {
        header: 'Registered At',
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
          <h1 className="text-2xl font-bold tracking-tight">Idempotency Core Register</h1>
          <p className="mt-1 text-xs text-slate-500">
            Verify duplicate key locks, manage request payload checksums, and prevent double collections.
          </p>
        </div>
      </div>

      {/* Duplicate Key Collision Checker Simulator UI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Simulator Panel */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <FileKey className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-bold">API Collision Simulator</h3>
          </div>
          
          <p className="text-xs text-slate-400 leading-relaxed">
            Enter a key string to simulate header execution. Try typing an existing key from the table to see duplicate blocking.
          </p>

          <form onSubmit={handleCheckKey} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                Idempotency-Key Header
              </label>
              <input
                type="text"
                placeholder="e.g. idem-key-104928"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-primary hover:bg-primary-hover py-2.5 text-xs font-bold text-white shadow-sm"
            >
              Dispatch API Call
            </button>
          </form>

          {/* Results Display */}
          {simulationResult.type && (
            <div className={`rounded-xl border p-4 text-xs space-y-2 mt-4 leading-relaxed ${
              simulationResult.type === 'collision'
                ? 'border-red-200 bg-red-50/20 text-red-800 dark:border-red-950/30 dark:bg-red-950/10 dark:text-red-400'
                : 'border-emerald-200 bg-emerald-50/20 text-emerald-800 dark:border-emerald-950/30 dark:bg-emerald-950/10 dark:text-emerald-400'
            }`}>
              <div className="flex items-center gap-1.5 font-bold">
                {simulationResult.type === 'collision' ? (
                  <>
                    <ZapOff className="h-4.5 w-4.5 text-red-500 shrink-0" />
                    <span>[409] Collision Detected</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                    <span>[200] Session Released</span>
                  </>
                )}
              </div>
              <p className="text-[10px]">{simulationResult.message}</p>
              {simulationResult.cachedHash && (
                <div className="font-mono text-[9px] mt-1 pt-1.5 border-t border-slate-200/50 dark:border-slate-800/50 truncate">
                  Hash: {simulationResult.cachedHash}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Database Keys Register List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">Idempotent Keys Index</h3>
            <span className="text-[10px] text-slate-400 font-semibold">Active Memory Cluster</span>
          </div>

          {/* Controls Bar inside list */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-xs">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search keys, request hashes..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg focus:outline-none"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2 py-1 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg"
              >
                <option value="All">All statuses</option>
                <option value="Stored">Stored</option>
                <option value="Processing">Processing</option>
              </select>
            </div>
          </div>

          {/* Table display */}
          {filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-center">
              <AlertCircle className="h-10 w-10 text-slate-300 dark:text-slate-700" />
              <h4 className="mt-4 text-xs font-bold text-slate-700 dark:text-slate-300">No cached keys match query</h4>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id} className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 dark:border-slate-800 dark:bg-slate-800/20">
                        {headerGroup.headers.map((header) => (
                          <th key={header.id} className="p-3">
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
                          <td key={cell.id} className="p-3">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination controls */}
              <div className="flex items-center justify-between border-t border-slate-100 p-3 dark:border-slate-800 font-semibold text-[10px]">
                <span className="text-slate-400">
                  Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} ({filteredData.length} total cache keys)
                </span>
                
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
