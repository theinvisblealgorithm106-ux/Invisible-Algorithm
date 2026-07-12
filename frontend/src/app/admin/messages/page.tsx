'use client';

import { useState, useEffect, useCallback } from 'react';
import { Mail, Eye, Archive, Reply, X } from 'lucide-react';
import { contactApi } from '@/lib/api';
import { formatDate, getStatusColor, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Message {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
  status: string;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<Message | null>(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 20 };
      if (status) params.status = status;
      const res = await contactApi.getMessages(params);
      setMessages(res.data.data.messages);
      setTotalPages(res.data.data.pagination.pages);
      setTotal(res.data.data.pagination.total);
    } catch {
      toast.error('Failed to load messages — try logging out and back in');
    }
    setLoading(false);
  }, [page, status]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await contactApi.updateMessageStatus(id, newStatus);
      toast.success(`Marked as ${newStatus}`);
      setSelected(null);
      fetchMessages();
    } catch {
      toast.error('Failed to update');
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="heading-lg mb-1">Contact Messages</h1>
          <p className="text-text-tertiary text-sm">{total} messages</p>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        {['', 'unread', 'read', 'replied', 'archived'].map(s => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
              status === s ? 'bg-primary/10 text-primary-light border-primary/30' : 'bg-bg-elevated text-text-secondary border-border hover:border-border-hover'
            )}
          >
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg-subtle">
              <th className="text-left px-4 py-3 text-xs font-medium text-text-muted">From</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-text-muted">Subject</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-text-muted hidden sm:table-cell">Category</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-text-muted">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-text-muted hidden md:table-cell">Date</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-text-muted">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>{[...Array(6)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-bg-elevated rounded animate-pulse" /></td>)}</tr>
              ))
            ) : messages.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-text-tertiary">No messages found</td></tr>
            ) : messages.map((msg) => (
              <tr key={msg._id} className={cn('hover:bg-bg-elevated transition-colors cursor-pointer', msg.status === 'unread' && 'bg-primary/3')} onClick={() => { setSelected(msg); handleStatusChange(msg._id, 'read'); }}>
                <td className="px-4 py-3">
                  <p className="font-medium text-text-primary text-sm">{msg.name}</p>
                  <p className="text-xs text-text-muted">{msg.email}</p>
                </td>
                <td className="px-4 py-3 text-text-secondary line-clamp-1">{msg.subject}</td>
                <td className="px-4 py-3 text-text-secondary capitalize hidden sm:table-cell">{msg.category}</td>
                <td className="px-4 py-3">
                  <span className={cn('badge text-xs', getStatusColor(msg.status))}>{msg.status}</span>
                </td>
                <td className="px-4 py-3 text-text-tertiary hidden md:table-cell">{formatDate(msg.createdAt)}</td>
                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => setSelected(msg)} className="btn-ghost px-2 py-1.5 text-xs">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
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

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4">
          <div className="bg-bg-surface border border-border rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="border-b border-border p-5 flex items-start justify-between">
              <div>
                <p className="font-semibold text-text-primary">{selected.subject}</p>
                <p className="text-xs text-text-tertiary mt-0.5">{selected.name} &lt;{selected.email}&gt;</p>
              </div>
              <button onClick={() => setSelected(null)}><X className="w-5 h-5 text-text-muted" /></button>
            </div>
            <div className="p-5">
              <div className="flex gap-2 mb-4">
                <span className="badge bg-bg-elevated text-text-tertiary border-border text-xs capitalize">{selected.category}</span>
                <span className="text-xs text-text-muted">{formatDate(selected.createdAt)}</span>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>

              <div className="flex gap-2 mt-5 pt-4 border-t border-border">
                <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`} className="btn-primary text-sm">
                  <Reply className="w-4 h-4" /> Reply via Email
                </a>
                <button onClick={() => handleStatusChange(selected._id, 'replied')} className="btn-secondary text-sm">Mark Replied</button>
                <button onClick={() => handleStatusChange(selected._id, 'archived')} className="btn-secondary text-sm">
                  <Archive className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
