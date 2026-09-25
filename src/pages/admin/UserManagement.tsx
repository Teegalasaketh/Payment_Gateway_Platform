import React, { useState, useMemo, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table';
import type { User } from '../../types';
import { TableSkeleton } from '../../components/shared/LoadingSkeleton';
import { ConfirmationModal } from '../../components/shared/ConfirmationModal';
import { userService } from '../../services/user.service';
import { authService } from '../../services/auth.service';
import {
  Search,
  UserPlus,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  Shield,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  X
} from 'lucide-react';
import { toast } from 'sonner';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<'Admin' | 'User'>('User');
  const [editStatus, setEditStatus] = useState<'Active' | 'Suspended' | 'Pending'>('Active');

  // Add Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addRole, setAddRole] = useState<'Admin' | 'User'>('User');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await userService.getUsers();
      const mapped: User[] = response.data.map((u: any) => ({
        id: u.id.toString(),
        name: u.name,
        email: u.email,
        role: (u.role === 'ADMIN' ? 'Admin' : 'User') as any,
        status: (u.active ? 'Active' : 'Suspended') as any,
        createdAt: new Date().toISOString()
      }));
      setUsers(mapped);
    } catch (err) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter & Search Logic
  const filteredData = useMemo(() => {
    return users.filter((u) => {
      // Role filter
      if (roleFilter !== 'All' && u.role !== roleFilter) return false;
      // Status filter
      if (statusFilter !== 'All' && u.status !== statusFilter) return false;
      // Search text
      if (globalFilter) {
        const text = globalFilter.toLowerCase();
        return u.name.toLowerCase().includes(text) || u.email.toLowerCase().includes(text);
      }
      return true;
    });
  }, [users, roleFilter, statusFilter, globalFilter]);

  const [confirmDeleteData, setConfirmDeleteData] = useState<{ id: string; name: string } | null>(null);
  const [confirmSuspendData, setConfirmSuspendData] = useState<{ id: string; name: string; currentStatus: string } | null>(null);

  // Actions
  const toggleSuspend = (userId: string, name: string, currentStatus: string) => {
    setConfirmSuspendData({ id: userId, name, currentStatus });
  };

  const confirmSuspend = async () => {
    if (!confirmSuspendData) return;
    const { id: userId, currentStatus } = confirmSuspendData;
    const newStatus = currentStatus === 'Suspended' ? 'Active' : 'Suspended';
    try {
      await userService.toggleSuspend(userId, newStatus);
      toast.success(`Account status of ${confirmSuspendData.name} updated successfully.`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update account status.');
    }
    setConfirmSuspendData(null);
  };

  const deleteUser = (userId: string, name: string) => {
    setConfirmDeleteData({ id: userId, name });
  };

  const confirmDelete = async () => {
    if (!confirmDeleteData) return;
    const { id: userId, name } = confirmDeleteData;
    try {
      await userService.deleteUser(userId);
      toast.success(`${name} permanently deleted.`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete user.');
    }
    setConfirmDeleteData(null);
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditStatus(user.status);
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName || !editEmail) {
      toast.error('Name and Email are required.');
      return;
    }

    try {
      await userService.updateProfile(editName, editEmail);
      toast.success('User credentials updated successfully.');
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile.');
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName || !addEmail) {
      toast.error('All fields are required.');
      return;
    }

    try {
      await authService.register(addEmail, addName, addRole, 'password123');
      toast.success(`${addName} registered successfully.`);
      setIsAddOpen(false);
      setAddName('');
      setAddEmail('');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to register user.');
    }
  };

  const triggerErrorState = () => {
    setIsError(true);
    toast.error('Simulating platform query timeout error.');
  };

  // TanStack Table Column Definitions
  const columnHelper = createColumnHelper<User>();
  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'User ID',
        cell: (info) => <span className="font-mono text-xs text-slate-400">{info.getValue()}</span>,
      }),
      columnHelper.accessor('name', {
        header: 'Name',
        cell: (info) => (
          <div className="flex items-center gap-3">
            <img
              src={info.row.original.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
              alt={info.getValue()}
              className="h-8 w-8 rounded-lg object-cover ring-2 ring-slate-100 dark:ring-slate-800"
            />
            <span className="font-bold text-xs">{info.getValue()}</span>
          </div>
        ),
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: (info) => <span className="text-xs text-slate-500 dark:text-slate-400">{info.getValue()}</span>,
      }),
      columnHelper.accessor('role', {
        header: 'Security Role',
        cell: (info) => {
          const role = info.getValue();
          return (
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${
                role === 'Admin'
                  ? 'bg-purple-50 text-purple-700 ring-purple-600/10 dark:bg-purple-950/20 dark:text-purple-400'
                  : 'bg-blue-50 text-blue-700 ring-blue-600/10 dark:bg-blue-950/20 dark:text-blue-400'
              }`}
            >
              {role === 'Admin' ? <Shield className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
              {role}
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
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${
                status === 'Active'
                  ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/10 dark:bg-emerald-950/20 dark:text-emerald-400'
                  : status === 'Suspended'
                  ? 'bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-950/20 dark:text-red-400'
                  : 'bg-amber-50 text-amber-700 ring-amber-600/10 dark:bg-amber-950/20 dark:text-amber-400'
              }`}
            >
              {status}
            </span>
          );
        },
      }),
      columnHelper.accessor('createdAt', {
        header: 'Registered',
        cell: (info) => <span className="text-xs text-slate-400">{new Date(info.getValue()).toLocaleDateString()}</span>,
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: (info) => {
          const u = info.row.original;
          return (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEditClick(u)}
                className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                title="Edit Account Details"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
               <button
                onClick={() => toggleSuspend(u.id, u.name, u.status)}
                className={`p-1 rounded transition-colors ${
                  u.status === 'Suspended'
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400'
                    : 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-950/30 dark:text-amber-400'
                }`}
                title={u.status === 'Suspended' ? 'Activate Account' : 'Suspend Account'}
              >
                {u.status === 'Suspended' ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => deleteUser(u.id, u.name)}
                className="p-1 rounded bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50 transition-colors"
                title="Delete Account"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        },
      }),
    ],
    [users]
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
          <h1 className="text-2xl font-bold tracking-tight">Identity Directory</h1>
          <p className="mt-1 text-xs text-slate-500">
            Orchestrate console administrators and client merchant credentials.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={triggerErrorState}
            className="rounded-xl border border-slate-300 dark:border-slate-800 bg-transparent px-3 py-2 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
          >
            Trigger Timeout Error
          </button>
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-white hover:bg-primary-hover shadow-sm"
          >
            <UserPlus className="h-4 w-4" />
            Provision Account
          </button>
        </div>
      </div>

      {isError ? (
        <div className="flex flex-col items-center justify-center py-16 border border-red-200 bg-red-50/20 rounded-2xl p-8 dark:border-red-950/20 dark:bg-red-950/5">
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
            <X className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-800 dark:text-slate-200">Query Exception Encountered</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm text-center">
            Database connection timeout occurred while querying operations cluster sync.
          </p>
          <button
            onClick={() => setIsError(false)}
            className="mt-4 rounded-xl bg-red-600 hover:bg-red-700 px-4 py-2 text-xs font-semibold text-white"
          >
            Reload Workstation
          </button>
        </div>
      ) : (
        <>
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search names, emails..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400 shrink-0" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg text-xs"
                >
                  <option value="All">All Roles</option>
                  <option value="Admin">Admins</option>
                  <option value="User">Users</option>
                </select>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg text-xs"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Table list */}
          {isLoading ? (
            <TableSkeleton rows={8} />
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-center">
              <Search className="h-10 w-10 text-slate-300 dark:text-slate-700" />
              <h3 className="mt-4 text-sm font-bold text-slate-700 dark:text-slate-300">No matching accounts found</h3>
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
                  Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} ({filteredData.length} total entries)
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
        </>
      )}

      {/* ================================================================== */}
      {/* ADD USER MODAL */}
      {/* ================================================================== */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold">Provision Gateway Account</h3>
              <button onClick={() => setIsAddOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marcus Aurelius"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. marcus@rome.gov"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Assigned Role</label>
                <select
                  value={addRole}
                  onChange={(e) => setAddRole(e.target.value as any)}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs focus:outline-none"
                >
                  <option value="User">Merchant User</option>
                  <option value="Admin">Gateway Admin</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover shadow-sm"
                >
                  Confirm Provisioning
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* EDIT USER DETAILS MODAL */}
      {/* ================================================================== */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold">Edit Account Profile</h3>
              <button onClick={() => setEditingUser(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            
            <form onSubmit={saveEdit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Profile Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Primary Email</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Security Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as any)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Credential Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover shadow-sm"
                >
                  Apply Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {confirmDeleteData && (
        <ConfirmationModal
          isOpen={confirmDeleteData !== null}
          title="Delete Account permanently?"
          message={`Are you sure you want to delete administrator ${confirmDeleteData.name}? This will revoke all database credentials and delete logs permanently.`}
          confirmText="Confirm Delete"
          cancelText="Cancel"
          type="danger"
          onConfirm={confirmDelete}
          onCancel={() => setConfirmDeleteData(null)}
        />
      )}

      {confirmSuspendData && (
        <ConfirmationModal
          isOpen={confirmSuspendData !== null}
          title={confirmSuspendData.currentStatus === 'Suspended' ? 'Activate Account?' : 'Suspend Account?'}
          message={`Confirm changing system status for ${confirmSuspendData.name}. Suspended admins are locked out of Aegis dashboard pipelines immediately.`}
          confirmText={confirmSuspendData.currentStatus === 'Suspended' ? 'Activate' : 'Suspend'}
          cancelText="Cancel"
          type="warning"
          onConfirm={confirmSuspend}
          onCancel={() => setConfirmSuspendData(null)}
        />
      )}
    </div>
  );
};
