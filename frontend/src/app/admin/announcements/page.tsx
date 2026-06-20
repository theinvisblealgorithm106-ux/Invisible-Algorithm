'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit, Eye, X } from 'lucide-react';
import { announcementsApi } from '@/lib/api';
import { Announcement } from '@/types';
import { formatDate, getStatusColor, cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

interface AnnouncementForm extends Record<string, unknown> {
  title: string;
  content: string;
  category: string;
  priority: string;
  status: string;
  featured: boolean;
  pinned: boolean;
}

const defaultForm: AnnouncementForm = {
  title: '',
  content: '',
  category: 'general',
  priority: 'medium',
  status: 'draft',
  featured: false,
  pinned: false,
};

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<AnnouncementForm>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await announcementsApi.getAll({ page, limit: 20 });
      setAnnouncements(res.data.data.announcements);
      setTotalPages(res.data.data.pagination.pages);
    } catch {}
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  const openEdit = (ann: Announcement) => {
    setEditing(ann._id);
    setForm({
      title: ann.title,
      content: ann.content,
      category: ann.category,
      priority: ann.priority,
      status: ann.status,
      featured: ann.featured,
      pinned: ann.pinned,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.content) {
      toast.error('Title and content are required');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await announcementsApi.update(editing, form);
        toast.success('Announcement updated');
      } else {
        await announcementsApi.create(form);
        toast.success('Announcement created');
      }
      setShowForm(false);
      setEditing(null);
      setForm(defaultForm);
      fetchAnnouncements();
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await announcementsApi.delete(id);
      toast.success('Deleted');
      fetchAnnouncements();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="heading-lg mb-1">Announcements</h1>
          <p className="text-text-tertiary text-sm">Manage platform announcements</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(defaultForm); }} className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> New Announcement
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg-subtle">
              <th className="text-left px-4 py-3 text-xs font-medium text-text-muted">Title</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-text-muted hidden sm:table-cell">Category</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-text-muted">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-text-muted hidden md:table-cell">Priority</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-text-muted hidden lg:table-cell">Date</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-text-muted">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>{[...Array(6)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-bg-elevated rounded animate-pulse" /></td>)}</tr>
              ))
            ) : announcements.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-text-tertiary">No announcements yet</td></tr>
            ) : announcements.map((ann) => (
              <tr key={ann._id} className="hover:bg-bg-elevated transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {ann.pinned && <span className="text-xs text-warning">📌</span>}
                    <p className="font-medium text-text-primary line-clamp-1">{ann.title}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-text-secondary capitalize hidden sm:table-cell">{ann.category}</td>
                <td className="px-4 py-3">
                  <span className={cn('badge text-xs', getStatusColor(ann.status))}>{ann.status}</span>
                </td>
                <td className="px-4 py-3 text-text-secondary capitalize hidden md:table-cell">{ann.priority}</td>
                <td className="px-4 py-3 text-text-tertiary hidden lg:table-cell">{formatDate(ann.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(ann)} className="btn-ghost px-2 py-1.5">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(ann._id)} className="btn-ghost px-2 py-1.5 text-error hover:bg-error/10">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">Prev</button>
          <span className="text-text-tertiary text-sm px-3 py-1.5">Page {page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">Next</button>
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4">
          <div className="bg-bg-surface border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-bg-surface border-b border-border p-5 flex items-center justify-between">
              <h2 className="font-semibold text-text-primary">{editing ? 'Edit Announcement' : 'New Announcement'}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-text-muted" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Title *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-base" placeholder="Announcement title" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Content *</label>
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={6} className="input-base resize-none" placeholder="Announcement content..." />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-base">
                    {['general', 'event', 'research', 'partnership', 'opportunity', 'update'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="input-base">
                    {['low', 'medium', 'high', 'urgent'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-base">
                    {['draft', 'published', 'archived'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 accent-primary" />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                  <input type="checkbox" checked={form.pinned} onChange={(e) => setForm({ ...form, pinned: e.target.checked })} className="w-4 h-4 accent-primary" />
                  Pinned
                </label>
              </div>
              <div className="flex gap-3 pt-2 border-t border-border">
                <button onClick={handleSave} disabled={saving} className="btn-primary">
                  {saving ? 'Saving...' : editing ? 'Update' : 'Create'} Announcement
                </button>
                <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
