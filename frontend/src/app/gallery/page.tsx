'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { galleryApi } from '@/lib/api';
import { GalleryItem } from '@/types';
import { formatDate, cn } from '@/lib/utils';

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [albums, setAlbums] = useState<string[]>([]);
  const [album, setAlbum] = useState('');
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await galleryApi.getAll({ limit: 100, ...(album ? { album } : {}) });
        setItems(res.data.data.items);
        // Keep the full album list even while a filter is active.
        if (!album) setAlbums(res.data.data.albums);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [album]);

  const close = useCallback(() => setLightbox(null), []);
  const step = useCallback((delta: number) => {
    setLightbox((current) => {
      if (current === null || items.length === 0) return current;
      // Wrap around at both ends.
      return (current + delta + items.length) % items.length;
    });
  }, [items.length]);

  // Keyboard control for the lightbox, and stop the page scrolling behind it.
  useEffect(() => {
    if (lightbox === null) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [lightbox, close, step]);

  const active = lightbox !== null ? items[lightbox] : null;

  return (
    <div className="pt-16">
      <section className="section-sm relative">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="container-page relative">
          <p className="label mb-3">Gallery</p>
          <h1 className="heading-xl mb-3">Moments From Our Work</h1>
          <p className="text-text-secondary max-w-xl mb-8">
            Workshops, conferences, and the people behind The Invisible Algorithm.
          </p>

          {albums.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {['', ...albums].map((name) => (
                <button
                  key={name || 'all'}
                  onClick={() => setAlbum(name)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium border transition-all',
                    album === name
                      ? 'bg-primary/10 text-primary-light border-primary/30'
                      : 'bg-bg-elevated text-text-secondary border-border hover:border-border-hover'
                  )}
                >
                  {name || 'All'}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section-sm">
        <div className="container-page">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-bg-elevated animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-text-tertiary">No photos yet — check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item, index) => (
                <button
                  key={item._id}
                  onClick={() => setLightbox(index)}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-colors bg-bg-elevated"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title || item.caption || 'Gallery photo'}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {(item.title || item.album) && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-left opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.title && <p className="text-white text-xs font-medium line-clamp-1">{item.title}</p>}
                      {item.album && <p className="text-white/70 text-[11px] line-clamp-1">{item.album}</p>}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {active && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={active.title || 'Gallery photo'}
        >
          <button onClick={close} className="absolute top-4 right-4 text-white/70 hover:text-white p-2" aria-label="Close">
            <X className="w-6 h-6" />
          </button>

          {items.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); step(-1); }}
                className="absolute left-2 sm:left-6 text-white/70 hover:text-white p-2"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); step(1); }}
                className="absolute right-2 sm:right-6 text-white/70 hover:text-white p-2"
                aria-label="Next photo"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          <div className="max-w-5xl w-full max-h-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={active.image}
              alt={active.title || active.caption || 'Gallery photo'}
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg"
            />
            {(active.title || active.caption || active.people?.length > 0 || active.takenAt) && (
              <div className="mt-4 text-center max-w-2xl">
                {active.title && <p className="text-white font-medium">{active.title}</p>}
                {active.caption && <p className="text-white/70 text-sm mt-1">{active.caption}</p>}
                {active.people?.length > 0 && (
                  <p className="text-white/60 text-xs mt-2 inline-flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> {active.people.join(', ')}
                  </p>
                )}
                {active.takenAt && (
                  <p className="text-white/40 text-xs mt-1">{formatDate(active.takenAt)}</p>
                )}
                <p className="text-white/30 text-[11px] mt-3">{lightbox! + 1} / {items.length}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
