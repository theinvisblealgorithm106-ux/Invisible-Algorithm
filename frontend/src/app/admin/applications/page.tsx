'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Eye, Check, X, Clock, ChevronDown } from 'lucide-react';
import { applicationsApi } from '@/lib/api';
import { Application } from '@/types';
import { formatDate, getStatusColor, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const statuses = ['', 'pending', 'reviewing', 'accepted', 'rejected', 'waitlisted'];

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<Application | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewing, setReviewing] = useState(false);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 20 };
      if (status) params.status = status;
      if (search) params.search = search;
      const res = await applicationsApi.getAll(params);
      setApplications(res.data.data.applications);
      setTotalPages(res.data.data.pagination.pages);
      setTotal(res.data.data.pagination.total);
    } catch {}
    setLoading(false);
  }, [page, status, search]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const handleReview = async (appId: string, newStatus: string) => {
    setReviewing(true);
    try {
      await applicationsApi.review(appId, { status: newStatus, reviewNotes });
      toast.success(`Application ${newStatus}`);
      setSelected(null);
      setReviewNotes('');
      fetchApplications();
    } catch {
      toast.error('Review failed');
    } finally {
      setReviewing(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="heading-lg mb-1">Applications</h1>
          <p className="text-text-tertiary text-sm">{total} total applications</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email, school..."
            className="input-base pl-9 py-2"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="input-base py-2 w-auto"
        >
          <option value="">All Status</option>
          {statuses.slice(1).map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-subtle">
                <th className="text-left px-4 py-3 text-xs font-medium text-text-muted">Applicant</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-text-muted hidden sm:table-cell">School</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-text-muted hidden md:table-cell">Country</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-text-muted">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-text-muted hidden lg:table-cell">Applied</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-bg-elevated rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-text-tertiary">No applications found</td>
                </tr>
              ) : applications.map((app) => (
                <tr key={app._id} className="hover:bg-bg-elevated transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-text-primary">{app.firstName} {app.lastName}</p>
                      <p className="text-xs text-text-muted">{app.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-secondary hidden sm:table-cell">{app.school}</td>
                  <td className="px-4 py-3 text-text-secondary hidden md:table-cell">{app.country}</td>
                  <td className="px-4 py-3">
                    <span className={cn('badge', getStatusColor(app.status))}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-tertiary hidden lg:table-cell">{formatDate(app.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => { setSelected(app); setReviewNotes(app.reviewNotes || ''); }}
                      className="btn-ghost text-xs px-3 py-1.5"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">Prev</button>
          <span className="text-text-tertiary text-sm px-3 py-1.5">Page {page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">Next</button>
        </div>
      )}

      {/* Review modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4">
          <div className="bg-bg-surface border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-bg-surface border-b border-border p-5 flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-text-primary">{selected.firstName} {selected.lastName}</h2>
                <p className="text-sm text-text-tertiary">{selected.email} · {selected.school} · {selected.country}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div><p className="text-text-muted text-xs mb-0.5">Grade</p><p className="text-text-secondary">{selected.gradeLevel}</p></div>
                <div><p className="text-text-muted text-xs mb-0.5">Age</p><p className="text-text-secondary">{selected.age}</p></div>
                <div><p className="text-text-muted text-xs mb-0.5">Status</p><span className={cn('badge', getStatusColor(selected.status))}>{selected.status}</span></div>
              </div>

              <div>
                <p className="text-xs font-medium text-text-muted mb-2">Interests</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.interests.map(i => <span key={i} className="text-xs bg-bg-elevated px-2 py-0.5 rounded-full text-text-secondary border border-border">{i}</span>)}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-text-muted mb-2">Motivation</p>
                <p className="text-sm text-text-secondary bg-bg-subtle p-3 rounded-lg border border-border">{selected.motivation}</p>
              </div>

              {selected.experience && (
                <div>
                  <p className="text-xs font-medium text-text-muted mb-2">Experience</p>
                  <p className="text-sm text-text-secondary bg-bg-subtle p-3 rounded-lg border border-border">{selected.experience}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-medium text-text-muted mb-2">Contribution Plan</p>
                <p className="text-sm text-text-secondary bg-bg-subtle p-3 rounded-lg border border-border">{selected.contributionPlan}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Review Notes (optional)</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                  className="input-base resize-none"
                  placeholder="Internal notes or feedback to send to applicant..."
                />
              </div>

              <div className="flex flex-wrap gap-3 pt-2 border-t border-border">
                <button onClick={() => handleReview(selected._id, 'accepted')} disabled={reviewing} className="btn-primary text-sm bg-success hover:bg-success/80">
                  <Check className="w-4 h-4" /> Accept
                </button>
                <button onClick={() => handleReview(selected._id, 'reviewing')} disabled={reviewing} className="btn-secondary text-sm">
                  <Clock className="w-4 h-4" /> Mark Reviewing
                </button>
                <button onClick={() => handleReview(selected._id, 'waitlisted')} disabled={reviewing} className="btn-secondary text-sm">
                  Waitlist
                </button>
                <button onClick={() => handleReview(selected._id, 'rejected')} disabled={reviewing} className="btn-secondary text-sm text-error border-error/30 hover:bg-error/10">
                  <X className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
