'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit, X } from 'lucide-react';
import { eventsApi } from '@/lib/api';
import { Event } from '@/types';
import { formatDate, getStatusColor, EVENT_TYPES, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface EventForm {
  title: string;
  description: string;
  type: string;
  format: string;
  status: string;
  startDate: string;
  endDate: string;
  timezone: string;
  location: string;
  virtualLink: string;
  capacity: string;
  requiresRegistration: boolean;
  isPublic: boolean;
  featured: boolean;
  tags: string;
}

const defaultForm: EventForm = {
  title: '', description: '', type: 'workshop', format: 'virtual', status: 'upcoming',
  startDate: '', endDate: '', timezone: 'UTC', location: '', virtualLink: '',
  capacity: '', requiresRegistration: true, isPublic: true, featured: false, tags: '',
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await eventsApi.getAll({ page, limit: 20 });
      setEvents(res.data.data.events);
      setTotalPages(res.data.data.pagination.pages);
    } catch {}
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const openEdit = (event: Event) => {
    setEditing(event._id);
    setForm({
      title: event.title,
      description: event.description,
      type: event.type,
      format: event.format,
      status: event.status,
      startDate: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
      endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
      timezone: event.timezone,
      location: event.location || '',
      virtualLink: '',
      capacity: event.capacity?.toString() || '',
      requiresRegistration: event.requiresRegistration,
      isPublic: true,
      featured: event.featured,
      tags: event.tags.join(', '),
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.startDate || !form.endDate) {
      toast.error('Title, start date, and end date are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        capacity: form.capacity ? parseInt(form.capacity) : undefined,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      };
      if (editing) {
        await eventsApi.update(editing, payload);
        toast.success('Event updated');
      } else {
        await eventsApi.create(payload);
        toast.success('Event created');
      }
      setShowForm(false);
      setEditing(null);
      setForm(defaultForm);
      fetchEvents();
    } catch {
      toast.error('Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    try {
      await eventsApi.delete(id);
      toast.success('Event deleted');
      fetchEvents();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="heading-lg mb-1">Events</h1>
          <p className="text-text-tertiary text-sm">Manage workshops and events</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(defaultForm); }} className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> New Event
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg-subtle">
              <th className="text-left px-4 py-3 text-xs font-medium text-text-muted">Title</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-text-muted hidden sm:table-cell">Type</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-text-muted">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-text-muted hidden md:table-cell">Date</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-text-muted hidden lg:table-cell">Registered</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-text-muted">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>{[...Array(6)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-bg-elevated rounded animate-pulse" /></td>)}</tr>
              ))
            ) : events.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-text-tertiary">No events yet</td></tr>
            ) : events.map((event) => (
              <tr key={event._id} className="hover:bg-bg-elevated transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-text-primary line-clamp-1">{event.title}</p>
                  <p className="text-xs text-text-muted capitalize">{event.format}</p>
                </td>
                <td className="px-4 py-3 text-text-secondary capitalize hidden sm:table-cell">{event.type}</td>
                <td className="px-4 py-3">
                  <span className={cn('badge text-xs', getStatusColor(event.status))}>{event.status}</span>
                </td>
                <td className="px-4 py-3 text-text-tertiary hidden md:table-cell">{formatDate(event.startDate)}</td>
                <td className="px-4 py-3 text-text-secondary hidden lg:table-cell">
                  {event.registeredCount}{event.capacity ? ` / ${event.capacity}` : ''}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(event)} className="btn-ghost px-2 py-1.5"><Edit className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(event._id)} className="btn-ghost px-2 py-1.5 text-error hover:bg-error/10"><Trash2 className="w-3.5 h-3.5" /></button>
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

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4">
          <div className="bg-bg-surface border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-bg-surface border-b border-border p-5 flex items-center justify-between">
              <h2 className="font-semibold text-text-primary">{editing ? 'Edit Event' : 'New Event'}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-text-muted" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Title *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-base" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Description *</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} className="input-base resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="input-base">
                    {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Format</label>
                  <select value={form.format} onChange={e => setForm({ ...form, format: e.target.value })} className="input-base">
                    {['virtual', 'in-person', 'hybrid'].map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Start Date *</label>
                  <input type="datetime-local" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="input-base" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">End Date *</label>
                  <input type="datetime-local" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="input-base" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="input-base">
                    {['upcoming', 'ongoing', 'completed', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Capacity</label>
                  <input type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} className="input-base" placeholder="Leave empty for unlimited" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Location / Virtual Link</label>
                <input value={form.location || form.virtualLink} onChange={e => setForm({ ...form, location: e.target.value })} className="input-base" placeholder="https://zoom.us/... or venue name" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Tags (comma-separated)</label>
                <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="input-base" placeholder="AI, Machine Learning, Workshop" />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 accent-primary" /> Featured
                </label>
                <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                  <input type="checkbox" checked={form.requiresRegistration} onChange={e => setForm({ ...form, requiresRegistration: e.target.checked })} className="w-4 h-4 accent-primary" /> Requires Registration
                </label>
              </div>
              <div className="flex gap-3 pt-2 border-t border-border">
                <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : editing ? 'Update Event' : 'Create Event'}</button>
                <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
