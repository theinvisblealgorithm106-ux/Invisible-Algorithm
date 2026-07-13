'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Users, Globe, Monitor, Video, ExternalLink, User } from 'lucide-react';
import { eventsApi } from '@/lib/api';
import { formatDatetime, formatDate, getStatusColor, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Speaker {
  name: string;
  affiliation?: string;
  bio?: string;
}

interface Event {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  startDate: string;
  type: string;
  format: string;
  location?: string;
  featured: boolean;
  status: string;
  requiresRegistration: boolean;
  registeredCount: number;
  capacity?: number | null;
  timezone?: string;
  virtualLink?: string | null;
  speakers: Speaker[];
  tags: string[];
}

export default function EventDetailPage() {
  const { slug } = useParams() as { slug: string };
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [regData, setRegData] = useState({ name: '', email: '' });

  useEffect(() => {
    fetch(`/api/events/${slug}`)
      .then((r) => r.json())
      .then((json) => { if (json.success) setEvent(json.data.event); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    setRegistering(true);
    try {
      await eventsApi.register(event._id, regData);
      toast.success('Successfully registered!');
      setShowForm(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-16 section">
        <div className="container-page max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-bg-elevated rounded w-1/4" />
            <div className="h-8 bg-bg-elevated rounded w-3/4" />
            <div className="h-40 bg-bg-elevated rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="pt-16 section text-center">
        <h1 className="heading-lg mb-4">Event not found</h1>
        <Link href="/events" className="btn-primary">Back to Events</Link>
      </div>
    );
  }

  const isFull = event.capacity ? event.registeredCount >= event.capacity : false;
  const isClosed = event.status === 'completed' || event.status === 'cancelled';
  const FormatIcon = { virtual: Video, 'in-person': MapPin, hybrid: Globe }[event.format] || Monitor;

  return (
    <div className="pt-16">
      <section className="section">
        <div className="container-page max-w-4xl">
          <Link href="/events" className="inline-flex items-center gap-2 text-text-tertiary hover:text-text-secondary text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main */}
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2 mb-5">
                <span className={cn('badge', getStatusColor(event.status))}>
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </span>
                <span className="badge bg-bg-elevated text-text-tertiary border-border capitalize">{event.type}</span>
                <span className="badge bg-bg-elevated text-text-tertiary border-border capitalize">{event.format}</span>
              </div>

              <h1 className="heading-xl mb-6">{event.title}</h1>
              <p className="text-text-secondary leading-relaxed mb-8">{event.description}</p>

              {/* Speakers */}
              {event.speakers?.length > 0 && (
                <div className="mb-8">
                  <h2 className="heading-sm mb-4">Speakers</h2>
                  <div className="space-y-3">
                    {event.speakers.map((speaker, i) => (
                      <div key={i} className="card-glass flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-primary-light" />
                        </div>
                        <div>
                          <p className="font-medium text-text-primary text-sm">{speaker.name}</p>
                          {speaker.affiliation && <p className="text-xs text-text-tertiary">{speaker.affiliation}</p>}
                          {speaker.bio && <p className="text-xs text-text-secondary mt-1">{speaker.bio}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {event.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-bg-elevated text-text-tertiary px-3 py-1 rounded-full border border-border">{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="card sticky top-20">
                <h2 className="font-semibold text-text-primary mb-4">Event Details</h2>

                <div className="space-y-3 text-sm mb-6">
                  <div className="flex gap-3 text-text-secondary">
                    <Calendar className="w-4 h-4 text-text-muted flex-shrink-0 mt-0.5" />
                    <div>
                      <p>{formatDate(event.startDate)}</p>
                      <p className="text-text-tertiary text-xs mt-0.5">{formatDatetime(event.startDate)}</p>
                    </div>
                  </div>

                  {event.location && (
                    <div className="flex gap-3 text-text-secondary min-w-0">
                      {event.format === 'virtual' ? (
                        <Video className="w-4 h-4 text-text-muted flex-shrink-0 mt-0.5" />
                      ) : (
                        <MapPin className="w-4 h-4 text-text-muted flex-shrink-0 mt-0.5" />
                      )}
                      {/^https?:\/\//i.test(event.location) ? (
                        <a
                          href={event.location}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-light hover:underline break-words min-w-0"
                        >
                          {event.location}
                        </a>
                      ) : (
                        <span className="break-words min-w-0">{event.location}</span>
                      )}
                    </div>
                  )}

                  {event.format !== 'in-person' && !event.location && (
                    <div className="flex gap-3 text-text-secondary">
                      <Video className="w-4 h-4 text-text-muted flex-shrink-0 mt-0.5" />
                      <span>Virtual event — link to be shared</span>
                    </div>
                  )}

                  {event.requiresRegistration && (
                    <div className="flex gap-3 text-text-secondary">
                      <Users className="w-4 h-4 text-text-muted flex-shrink-0 mt-0.5" />
                      <span>
                        {event.registeredCount} registered
                        {event.capacity && ` / ${event.capacity} capacity`}
                      </span>
                    </div>
                  )}

                  {event.timezone && (
                    <div className="flex gap-3 text-text-secondary">
                      <Globe className="w-4 h-4 text-text-muted flex-shrink-0 mt-0.5" />
                      <span>{event.timezone}</span>
                    </div>
                  )}
                </div>

                {event.requiresRegistration && !isClosed && (
                  <>
                    {!showForm ? (
                      <button
                        onClick={() => setShowForm(true)}
                        disabled={isFull}
                        className="btn-primary w-full justify-center"
                      >
                        {isFull ? 'Event Full' : 'Register Now'}
                      </button>
                    ) : (
                      <form onSubmit={handleRegister} className="space-y-3">
                        <input
                          type="text"
                          placeholder="Your name"
                          value={regData.name}
                          onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                          className="input-base"
                          required
                        />
                        <input
                          type="email"
                          placeholder="Your email"
                          value={regData.email}
                          onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                          className="input-base"
                          required
                        />
                        <div className="flex gap-2">
                          <button type="submit" disabled={registering} className="btn-primary flex-1 justify-center text-sm">
                            {registering ? 'Registering...' : 'Confirm'}
                          </button>
                          <button type="button" onClick={() => setShowForm(false)} className="btn-secondary px-3 text-sm">Cancel</button>
                        </div>
                      </form>
                    )}
                  </>
                )}

                {isClosed && (
                  <div className="text-center py-3 text-text-tertiary text-sm bg-bg-elevated rounded-lg">
                    {event.status === 'completed' ? 'This event has ended' : 'This event was cancelled'}
                  </div>
                )}

                {(event.virtualLink || event.location) && event.format !== 'in-person' && event.status === 'ongoing' && (
                  <a href={event.virtualLink || event.location!} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full justify-center mt-3 text-sm">
                    <ExternalLink className="w-4 h-4" /> Join Now
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
