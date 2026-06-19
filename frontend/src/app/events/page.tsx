'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Users, Filter, Search, Globe, Monitor, Video } from 'lucide-react';
import { eventsApi } from '@/lib/api';
import { Event } from '@/types';
import { formatDate, formatDatetime, getStatusColor, EVENT_TYPES, cn } from '@/lib/utils';

const formatIcons: Record<string, React.ElementType> = {
  'virtual': Video,
  'in-person': MapPin,
  'hybrid': Globe,
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [format, setFormat] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showUpcoming, setShowUpcoming] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 12 };
      if (type) params.type = type;
      if (format) params.format = format;
      if (showUpcoming) params.upcoming = 'true';

      const res = await eventsApi.getAll(params);
      setEvents(res.data.data.events);
      setTotalPages(res.data.data.pagination.pages);
      setTotal(res.data.data.pagination.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, type, format, showUpcoming]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div className="pt-16">
      {/* Header */}
      <section className="section-sm relative">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="container-page relative">
          <p className="label mb-3">Events</p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="heading-xl mb-3">Workshops & Events</h1>
              <p className="text-text-secondary max-w-xl">
                Live workshops, seminars, webinars, and competitions organized by The Invisible Algorithm for our global community.
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-text-primary">{total}</p>
              <p className="text-text-tertiary text-sm">Total Events</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => { setShowUpcoming(!showUpcoming); setPage(1); }}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium border transition-all',
                showUpcoming
                  ? 'bg-primary/10 text-primary-light border-primary/30'
                  : 'bg-bg-elevated text-text-secondary border-border hover:border-border-hover'
              )}
            >
              Upcoming Only
            </button>

            <select
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(1); }}
              className="input-base py-2 max-w-[160px]"
            >
              <option value="">All Types</option>
              {EVENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>

            <select
              value={format}
              onChange={(e) => { setFormat(e.target.value); setPage(1); }}
              className="input-base py-2 max-w-[160px]"
            >
              <option value="">All Formats</option>
              <option value="virtual">Virtual</option>
              <option value="in-person">In-Person</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="section-sm">
        <div className="container-page">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-4 bg-bg-elevated rounded w-1/4 mb-4" />
                  <div className="h-6 bg-bg-elevated rounded w-full mb-2" />
                  <div className="h-4 bg-bg-elevated rounded w-3/4 mb-4" />
                  <div className="h-20 bg-bg-elevated rounded mb-4" />
                  <div className="h-10 bg-bg-elevated rounded" />
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20">
              <Calendar className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <h3 className="heading-sm mb-2">No events found</h3>
              <p className="text-text-tertiary">Check back soon for upcoming events.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {events.map((event) => {
                  const FormatIcon = formatIcons[event.format] || Monitor;
                  return (
                    <div key={event._id} className="card-hover flex flex-col">
                      <div className="flex items-start justify-between gap-2 mb-4">
                        <div className="flex flex-wrap gap-1.5">
                          <span className={cn('badge', getStatusColor(event.status))}>
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </span>
                          <span className="badge bg-bg-elevated text-text-tertiary border-border capitalize">
                            {event.type}
                          </span>
                        </div>
                        {event.featured && (
                          <span className="badge bg-accent/10 text-accent border-accent/20">Featured</span>
                        )}
                      </div>

                      <h2 className="font-semibold text-text-primary mb-2 line-clamp-2">{event.title}</h2>
                      <p className="text-sm text-text-secondary mb-5 line-clamp-3 flex-1">{event.description}</p>

                      <div className="space-y-2 text-xs text-text-tertiary mb-5">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                          {formatDate(event.startDate, 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center gap-2">
                          <FormatIcon className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="capitalize">{event.format}</span>
                          {event.location && ` · ${event.location}`}
                        </div>
                        {event.requiresRegistration && (
                          <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 flex-shrink-0" />
                            {event.registeredCount} registered
                            {event.capacity && ` / ${event.capacity} spots`}
                          </div>
                        )}
                      </div>

                      <Link
                        href={`/events/${event.slug}`}
                        className="btn-secondary text-sm w-full justify-center"
                      >
                        View Details
                      </Link>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">Previous</button>
                  <span className="text-text-tertiary text-sm px-4">Page {page} of {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
