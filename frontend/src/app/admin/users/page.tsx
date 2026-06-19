'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Shield, ShieldOff, UserCheck, UserX } from 'lucide-react';
import { usersApi } from '@/lib/api';
import { User, UserRole } from '@/types';
import { formatDate, getRoleBadgeColor, cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

const roles: UserRole[] = ['student', 'member', 'researcher', 'admin', 'super_admin'];

export default function AdminUsersPage() {
  const { user: currentUser, hasRole } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 25 };
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;
      const res = await usersApi.getAllUsers(params);
      setUsers(res.data.data.users);
      setTotalPages(res.data.data.pagination.pages);
      setTotal(res.data.data.pagination.total);
    } catch {}
    setLoading(false);
  }, [page, roleFilter, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await usersApi.updateUserRole(userId, newRole);
      toast.success('Role updated');
      fetchUsers();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update role';
      toast.error(msg);
    }
  };

  const handleToggleStatus = async (userId: string, isActive: boolean) => {
    try {
      await usersApi.toggleUserStatus(userId);
      toast.success(`User ${isActive ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="heading-lg mb-1">Users</h1>
          <p className="text-text-tertiary text-sm">{total} total users</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email..."
            className="input-base pl-9 py-2"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="input-base py-2 w-auto"
        >
          <option value="">All Roles</option>
          {roles.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
        </select>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-subtle">
                <th className="text-left px-4 py-3 text-xs font-medium text-text-muted">User</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-text-muted hidden sm:table-cell">Role</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-text-muted hidden md:table-cell">School</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-text-muted hidden lg:table-cell">Joined</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-text-muted">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(6)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-bg-elevated rounded animate-pulse" /></td>)}</tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-text-tertiary">No users found</td></tr>
              ) : users.map((u) => (
                <tr key={u.id} className="hover:bg-bg-elevated transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-text-primary">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-text-muted">{u.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {hasRole('super_admin') && u.id !== currentUser?.id ? (
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        className="text-xs bg-transparent border border-border rounded-lg px-2 py-1 text-text-secondary focus:outline-none focus:border-primary"
                      >
                        {roles.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                      </select>
                    ) : (
                      <span className={cn('badge text-xs', getRoleBadgeColor(u.role))}>
                        {u.role.replace('_', ' ')}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-sm hidden md:table-cell">{u.school || '—'}</td>
                  <td className="px-4 py-3 text-text-tertiary text-sm hidden lg:table-cell">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={cn('badge text-xs', u.isActive ? 'bg-success/10 text-success border-success/20' : 'bg-error/10 text-error border-error/20')}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.id !== currentUser?.id && (
                      <button
                        onClick={() => handleToggleStatus(u.id, u.isActive)}
                        className="btn-ghost text-xs px-2 py-1"
                        title={u.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {u.isActive ? <UserX className="w-4 h-4 text-error" /> : <UserCheck className="w-4 h-4 text-success" />}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">Prev</button>
          <span className="text-text-tertiary text-sm px-3 py-1.5">Page {page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}
