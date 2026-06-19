'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, Pin } from 'lucide-react';
import { announcementsApi } from '@/lib/api';
import { Announcement } from '@/types';
import { formatDate, getStatusColor, cn } from '@/lib/utils';

const categoryColors: Record<string, string> = {
  general: 'bg-bg-elevated text-text-tertiary border-border',
  event: 'bg-primary/10 text-primary-light border-primary/20',
  research: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  partnership: 'bg-accent/10 text-accent border-accent/20',
  opportunity: 'bg-success/10 text-success border-success/20',
  update: 'bg-warning/10 text-warning border-warning/20',
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 10, status: 'published' };
      if (category) params.category = category;
      const res = await announcementsApi.getAll(params);
      setAnnouncements(res.data.data.announcements);
      setTotalPages(res.data.data.pagination.pages);
    } catch {}
    setLoading(false);
  }, [page, category]);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  return (
    <div className="pt-16">
      <section className="section-sm relative">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="container-page relative">
          <p className="label mb-3">Announcements</p>
          <h1 className="heading-xl mb-3">Latest from The Invisible Algorithm</h1>
          <p className="text-text-secondary max-w-xl mb-8">Updates, opportunities, and news from our international community.</p>

          <div className="flex flex-wrap gap-2">
            {['', 'general', 'event', 'research', 'partnership', 'opportunity', 'update'].map(c => (
              <button
                key={c}
                onClick={() => { setCategory(c); setPage(1); }}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                  category === c ? 'bg-primary/10 text-primary-light border-primary/30' : 'bg-bg-elevated text-text-secondary border-border hover:border-border-hover'
                )}
              >
                {c === '' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="container-page max-w-3xl">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => <div key={i} className="card h-24 animate-pulse" />)}
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-20">
              <Bell className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-tertiary">No announcements found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((ann) => (
                <div key={ann._id} className={cn('card-hover', ann.pinned && 'border-l-2 border-l-warning')}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      {ann.pinned && <Pin className="w-3.5 h-3.5 text-warning flex-shrink-0" />}
                      <span className={cn('badge text-xs', categoryColors[ann.category] || categoryColors.general)}>
                        {ann.category}
                      </span>
                      {ann.featured && <span className="badge text-xs bg-accent/10 text-accent border-accent/20">Featured</span>}
                    </div>
                    <span className="text-xs text-text-muted flex-shrink-0">
                      {ann.publishedAt ? formatDate(ann.publishedAt) : ''}
                    </span>
                  </div>
                  <h2 className="font-semibold text-text-primary mb-2">{ann.title}</h2>
                  <p className="text-sm text-text-secondary line-clamp-2">{ann.content}</p>
                </div>
              ))}

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-4">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">Previous</button>
                  <span className="text-text-tertiary text-sm px-4 py-2">Page {page} of {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">Next</button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
