'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Calendar, Users, ArrowRight, Bell, User, Shield } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { announcementsApi, eventsApi, researchApi } from '@/lib/api';
import { Announcement, Event, Research } from '@/types';
import { formatDate, getStatusColor, getRoleBadgeColor, cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user, isAuthenticated, hasRole } = useAuthStore();
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/dashboard');
      return;
    }
    const load = async () => {
      try {
        const [annRes, evRes] = await Promise.all([
          announcementsApi.getAll({ limit: 5, status: 'published' }),
          eventsApi.getAll({ upcoming: 'true', limit: 4 }),
        ]);
        setAnnouncements(annRes.data.data.announcements);
        setEvents(evRes.data.data.events);
      } catch {}
      setLoading(false);
    };
    load();
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) return null;

  const roleLabel = user.role.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="pt-16">
      <section className="section-sm">
        <div className="container-page">
          {/* Welcome */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div>
              <p className="text-text-tertiary text-sm mb-1">Welcome back</p>
              <h1 className="heading-lg">
                {user.firstName} {user.lastName}
              </h1>
              <span className={cn('badge mt-2', getRoleBadgeColor(user.role))}>
                {roleLabel}
              </span>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/profile" className="btn-secondary">
                <User className="w-4 h-4" /> Edit Profile
              </Link>
              {hasRole(['admin', 'super_admin']) && (
                <Link href="/admin" className="btn-primary">
                  <Shield className="w-4 h-4" /> Admin Panel
                </Link>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              { icon: BookOpen, label: 'Research', sublabel: 'Browse publications', href: '/research', color: 'text-primary-light' },
              { icon: Calendar, label: 'Events', sublabel: 'Upcoming workshops', href: '/events', color: 'text-accent' },
              { icon: Users, label: 'Team', sublabel: 'Meet our members', href: '/team', color: 'text-purple-400' },
              { icon: Bell, label: 'Announcements', sublabel: 'Latest updates', href: '#announcements', color: 'text-warning' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.label} href={item.href} className="card-hover flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-bg-elevated flex items-center justify-center flex-shrink-0">
                    <Icon className={cn('w-5 h-5', item.color)} />
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary text-sm">{item.label}</p>
                    <p className="text-xs text-text-tertiary">{item.sublabel}</p>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upcoming Events */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="heading-sm">Upcoming Events</h2>
                <Link href="/events" className="text-xs text-primary-light hover:text-primary flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-3">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="card animate-pulse h-20" />
                  ))
                ) : events.length === 0 ? (
                  <div className="card text-center py-8 text-text-tertiary text-sm">No upcoming events</div>
                ) : events.map((event) => (
                  <Link key={event._id} href={`/events/${event.slug}`} className="card-hover flex items-start gap-4">
                    <div className="text-center min-w-[42px]">
                      <p className="text-xs text-text-muted">{formatDate(event.startDate, 'MMM')}</p>
                      <p className="text-xl font-bold text-text-primary leading-tight">{formatDate(event.startDate, 'd')}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary text-sm line-clamp-1">{event.title}</p>
                      <p className="text-xs text-text-tertiary mt-0.5 capitalize">{event.format} · {event.type}</p>
                    </div>
                    <span className={cn('badge text-xs flex-shrink-0', getStatusColor(event.status))}>
                      {event.status}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Announcements */}
            <div id="announcements">
              <div className="flex items-center justify-between mb-4">
                <h2 className="heading-sm">Announcements</h2>
                <Link href="/announcements" className="text-xs text-primary-light hover:text-primary flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-3">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="card animate-pulse h-20" />
                  ))
                ) : announcements.length === 0 ? (
                  <div className="card text-center py-8 text-text-tertiary text-sm">No announcements</div>
                ) : announcements.map((ann) => (
                  <div key={ann._id} className="card-hover">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="badge bg-bg-elevated text-text-tertiary border-border text-xs capitalize">{ann.category}</span>
                      {ann.pinned && <span className="text-xs text-warning">Pinned</span>}
                    </div>
                    <p className="font-medium text-text-primary text-sm line-clamp-1 mb-1">{ann.title}</p>
                    <p className="text-xs text-text-muted">{ann.publishedAt ? formatDate(ann.publishedAt) : ''}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Profile completeness */}
          {(!user.bio || !user.school || !user.country) && (
            <div className="mt-8 card bg-gradient-to-r from-primary/10 to-transparent border-primary/20">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-text-primary mb-1">Complete your profile</p>
                  <p className="text-sm text-text-secondary">Add your bio, school, and country so other members can find you.</p>
                </div>
                <Link href="/dashboard/profile" className="btn-primary text-sm flex-shrink-0">
                  Update <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
