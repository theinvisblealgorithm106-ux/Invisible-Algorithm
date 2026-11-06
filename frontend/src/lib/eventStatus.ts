// Event status is DERIVED from dates, not stored.
//
// The Event schema still has a `status` field, but it went stale the moment an
// event's start date passed: it defaulted to 'upcoming' and nothing ever
// recomputed it, so finished events advertised themselves as upcoming forever.
// Treating the dates as the source of truth removes the whole class of bug —
// there is nothing to keep in sync.
//
// 'cancelled' is the one real exception. It's an administrative decision that
// dates cannot express, so it stays stored and always wins.
//
// Used by both API routes and client components, so this file must stay free of
// Next.js- and browser-only APIs.

export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

interface DatedEvent {
  startDate: string | Date;
  endDate?: string | Date;
  status?: string;
}

export function deriveEventStatus(event: DatedEvent, now: Date = new Date()): EventStatus {
  if (event.status === 'cancelled') return 'cancelled';

  const start = new Date(event.startDate);
  // Treat a missing or malformed end date as a zero-length event.
  const parsedEnd = event.endDate ? new Date(event.endDate) : start;
  const end = Number.isNaN(parsedEnd.getTime()) ? start : parsedEnd;

  if (Number.isNaN(start.getTime())) return 'upcoming';
  if (now < start) return 'upcoming';
  if (now <= end) return 'ongoing';
  return 'completed';
}

// Mongo query fragment matching a derived status, so filtering and counting
// agree with what the pages display. Without this, `?status=upcoming` would
// filter on the stale stored field.
export function eventStatusQuery(status: string, now: Date = new Date()): Record<string, unknown> {
  switch (status) {
    case 'cancelled':
      return { status: 'cancelled' };
    case 'upcoming':
      return { status: { $ne: 'cancelled' }, startDate: { $gt: now } };
    case 'ongoing':
      return { status: { $ne: 'cancelled' }, startDate: { $lte: now }, endDate: { $gte: now } };
    case 'completed':
      return { status: { $ne: 'cancelled' }, endDate: { $lt: now } };
    default:
      return {};
  }
}

// Replaces the stored status with the derived one on a document being returned
// to a client. Accepts a Mongoose doc or a plain object.
export function withDerivedStatus<T extends DatedEvent>(event: T, now: Date = new Date()) {
  const plain = typeof (event as { toObject?: () => T }).toObject === 'function'
    ? (event as unknown as { toObject: () => T }).toObject()
    : event;
  return { ...plain, status: deriveEventStatus(plain, now) };
}

// True when registration should still be open.
export function isEventOpen(event: DatedEvent, now: Date = new Date()): boolean {
  const status = deriveEventStatus(event, now);
  return status === 'upcoming' || status === 'ongoing';
}
