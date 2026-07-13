'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Eye, Check, X, BookOpen, Plus, Download, FileUp } from 'lucide-react';
import { researchApi } from '@/lib/api';
import { Research } from '@/types';
import { formatDate, getStatusColor, formatCategory, cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { canModerateResearch, canWriteTab } from '@/lib/permissions';
import toast from 'react-hot-toast';

export default function AdminResearchPage() {
  const { user } = useAuthStore();
  const canModerate = canModerateResearch(user?.role);
  const canSubmit = canWriteTab(user?.role, 'research');
  const [research, setResearch] = useState<Research[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('submitted');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<Research | null>(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submitTitle, setSubmitTitle] = useState('');
  const [submitName, setSubmitName] = useState('');
  const [submitFile, setSubmitFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchResearch = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 20 };
      if (status) params.status = status;
      const res = await researchApi.getAll(params);
      setResearch(res.data.data.research);
      setTotalPages(res.data.data.pagination.pages);
      setTotal(res.data.data.pagination.total);
    } catch {}
    setLoading(false);
  }, [page, status]);

  useEffect(() => { fetchResearch(); }, [fetchResearch]);

  const handleStatusUpdate = async (id: string, newStatus: string, featured?: boolean) => {
    try {
      await researchApi.update(id, { status: newStatus, ...(featured !== undefined && { featured }) });
      toast.success(`Paper ${newStatus}`);
      setSelected(null);
      fetchResearch();
    } catch { toast.error('Failed to update'); }
  };

  const handleSubmitPdf = async () => {
    if (!submitTitle.trim() || !submitName.trim() || !submitFile) {
      toast.error('Title, your name, and a PDF file are required');
      return;
    }
    if (submitFile.type !== 'application/pdf') {
      toast.error('File must be a PDF');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', submitTitle.trim());
      formData.append('name', submitName.trim());
      formData.append('file', submitFile);
      await researchApi.uploadPdf(formData);
      toast.success('Paper submitted for review');
      setSubmitTitle('');
      setSubmitName('');
      setSubmitFile(null);
      setShowSubmitForm(false);
      fetchResearch();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Submission failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="heading-lg mb-1">Research Papers</h1>
          <p className="text-text-tertiary text-sm">{total} papers</p>
        </div>
        {canSubmit && (
          <button onClick={() => setShowSubmitForm(true)} className="btn-primary text-sm">
            <Plus className="w-4 h-4" /> Submit Paper
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {['', 'submitted', 'under-review', 'published', 'rejected', 'draft'].map(s => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
              status === s ? 'bg-primary/10 text-primary-light border-primary/30' : 'bg-bg-elevated text-text-secondary border-border hover:border-border-hover'
            )}
          >
            {s === '' ? 'All' : s.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg-subtle">
              <th className="text-left px-4 py-3 text-xs font-medium text-text-muted">Title</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-text-muted hidden sm:table-cell">Category</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-text-muted">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-text-muted hidden lg:table-cell">Submitted</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-text-muted">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>{[...Array(5)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-bg-elevated rounded animate-pulse" /></td>)}</tr>
              ))
            ) : research.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-text-tertiary">No papers found</td></tr>
            ) : research.map((paper) => (
              <tr key={paper._id} className="hover:bg-bg-elevated transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-text-primary line-clamp-1">{paper.title}</p>
                  <p className="text-xs text-text-muted">{paper.authors?.map((a: { name: string }) => a.name).join(', ')}</p>
                </td>
                <td className="px-4 py-3 text-text-secondary hidden sm:table-cell">{formatCategory(paper.category)}</td>
                <td className="px-4 py-3">
                  <span className={cn('badge text-xs', getStatusColor(paper.status))}>{paper.status}</span>
                </td>
                <td className="px-4 py-3 text-text-tertiary hidden lg:table-cell">{formatDate(paper.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setSelected(paper)} className="btn-ghost text-xs px-2 py-1.5">
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
          <div className="bg-bg-surface border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-bg-surface border-b border-border p-5 flex items-start justify-between">
              <div>
                <p className="font-semibold text-text-primary line-clamp-2">{selected.title}</p>
                <p className="text-xs text-text-tertiary mt-0.5">{formatCategory(selected.category)}</p>
              </div>
              <button onClick={() => setSelected(null)}><X className="w-5 h-5 text-text-muted" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs font-medium text-text-muted mb-2">Abstract</p>
                <p className="text-sm text-text-secondary">{selected.abstract}</p>
              </div>
              {selected.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selected.tags.map((tag: string) => <span key={tag} className="text-xs bg-bg-elevated text-text-tertiary px-2 py-0.5 rounded-full border border-border">{tag}</span>)}
                </div>
              )}
              {selected.pdfUrl && (
                <a href={selected.pdfUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm inline-flex">
                  <Download className="w-4 h-4" /> Download PDF
                </a>
              )}
              {canModerate && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                  {selected.status !== 'published' && (
                    <button onClick={() => handleStatusUpdate(selected._id, 'published')} className="btn-primary text-sm bg-success hover:bg-success/80">
                      <Check className="w-4 h-4" /> Publish
                    </button>
                  )}
                  {selected.status === 'submitted' && (
                    <button onClick={() => handleStatusUpdate(selected._id, 'under-review')} className="btn-secondary text-sm">
                      Mark Under Review
                    </button>
                  )}
                  {selected.status !== 'rejected' && (
                    <button onClick={() => handleStatusUpdate(selected._id, 'rejected')} className="btn-secondary text-sm text-error border-error/30 hover:bg-error/10">
                      <X className="w-4 h-4" /> Reject
                    </button>
                  )}
                  <button onClick={() => handleStatusUpdate(selected._id, selected.status, !selected.featured)} className="btn-secondary text-sm">
                    {selected.featured ? 'Unfeature' : 'Feature'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showSubmitForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4">
          <div className="bg-bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl">
            <div className="border-b border-border p-5 flex items-center justify-between">
              <h2 className="font-semibold text-text-primary">Submit Paper</h2>
              <button onClick={() => setShowSubmitForm(false)}><X className="w-5 h-5 text-text-muted" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Title *</label>
                <input value={submitTitle} onChange={(e) => setSubmitTitle(e.target.value)} className="input-base" placeholder="Paper title" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Your Name *</label>
                <input value={submitName} onChange={(e) => setSubmitName(e.target.value)} className="input-base" placeholder="Full name" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">PDF File * <span className="text-text-muted font-normal">(max 8MB)</span></label>
                <label className="flex items-center gap-2 input-base cursor-pointer text-text-secondary">
                  <FileUp className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{submitFile ? submitFile.name : 'Choose a PDF file...'}</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => setSubmitFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
              <div className="flex gap-3 pt-2 border-t border-border">
                <button onClick={handleSubmitPdf} disabled={submitting} className="btn-primary">
                  {submitting ? 'Submitting...' : 'Submit for Review'}
                </button>
                <button onClick={() => setShowSubmitForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
