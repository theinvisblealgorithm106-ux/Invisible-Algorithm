'use client';

import { useState, useEffect } from 'react';
import { Users, BookOpen, Calendar, FileText, MessageSquare, TrendingUp } from 'lucide-react';
import { usersApi, researchApi, eventsApi, applicationsApi, contactApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface StatusCount { _id: string; count: number }
interface Stats {
  users: { total: number; byRole: StatusCount[] };
  research: { byStatus: StatusCount[]; totalViews: number };
  events: { byStatus: StatusCount[] };
  applications: { byStatus: StatusCount[] };
}

const sumCounts = (rows?: StatusCount[]) => rows?.reduce((sum, r) => sum + r.count, 0) ?? 0;

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Partial<Stats>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [uRes, rRes, eRes, aRes] = await Promise.all([
          usersApi.getStats(),
          researchApi.getStats(),
          eventsApi.getStats(),
          applicationsApi.getStats(),
        ]);
        setStats({
          users: uRes.data.data,
          research: rRes.data.data,
          events: eRes.data.data,
          applications: aRes.data.data,
        });
      } catch {
        toast.error('Failed to load stats — try logging out and back in');
      }
      setLoading(false);
    };
    load();
  }, []);

  const summaryCards = [
    {
      icon: Users,
      label: 'Total Users',
      value: stats.users?.total ?? '—',
      color: 'text-primary-light',
      bg: 'bg-primary/10',
    },
    {
      icon: FileText,
      label: 'Applications',
      value: sumCounts(stats.applications?.byStatus),
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
    {
      icon: BookOpen,
      label: 'Research Papers',
      value: sumCounts(stats.research?.byStatus),
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      icon: Calendar,
      label: 'Events',
      value: sumCounts(stats.events?.byStatus),
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="heading-lg mb-1">Admin Overview</h1>
        <p className="text-text-tertiary text-sm">Platform statistics and quick access</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card">
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <p className="text-2xl font-bold text-text-primary mb-0.5">
                {loading ? '—' : card.value}
              </p>
              <p className="text-xs text-text-tertiary">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User roles breakdown */}
        <div className="card">
          <h2 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-text-muted" /> Users by Role
          </h2>
          {loading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => <div key={i} className="h-8 bg-bg-elevated rounded animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {stats.users?.byRole.map((r) => (
                <div key={r._id} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary capitalize">{r._id.replace('_', ' ')}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.min(100, (r.count / (stats.users?.total || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-text-primary w-6 text-right">{r.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Application statuses */}
        <div className="card">
          <h2 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-text-muted" /> Applications by Status
          </h2>
          {loading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => <div key={i} className="h-8 bg-bg-elevated rounded animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {stats.applications?.byStatus.map((s) => (
                <div key={s._id} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary capitalize">{s._id}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                      <div
                        className="h-full bg-warning rounded-full"
                        style={{ width: `${Math.min(100, (s.count / (sumCounts(stats.applications?.byStatus) || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-text-primary w-6 text-right">{s.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
