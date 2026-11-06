'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Trash2, Edit, X, ArrowUp, ArrowDown, EyeOff, Upload, Loader2, Star } from 'lucide-react';
import Link from 'next/link';
import { galleryApi } from '@/lib/api';
import { uploadImage } from '@/lib/compressImage';
import { GalleryItem } from '@/types';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { canWriteTab } from '@/lib/permissions';
import toast from 'react-hot-toast';

interface GalleryForm extends Record<string, unknown> {
  title: string;
  caption: string;
  image: string;
  imageFileId: string;
  album: string;
  people: string;
  takenAt: string;
  isPublic: boolean;
  featured: boolean;
}

const defaultForm: GalleryForm = {
  title: '',
  caption: '',
  image: '',
  imageFileId: '',
  album: '',
  people: '',
  takenAt: '',
  isPublic: true,
  featured: false,
};

// People are entered as a comma-separated list but stored as an array.
const toPayload = (form: GalleryForm) => ({
  title: form.title.trim() || undefined,
  caption: form.caption.trim() || undefined,
  image: form.image.trim(),
  imageFileId: form.imageFileId.trim() || undefined,
  album: form.album.trim() || undefined,
  people: form.people.split(',').map((p) => p.trim()).filter(Boolean),
  takenAt: form.takenAt || undefined,
  isPublic: form.isPublic,
  featured: form.featured,
});

export default function AdminGalleryPage() {
  const { user } = useAuthStore();
  const canWrite = canWriteTab(user?.role, 'gallery');
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [albums, setAlbums] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<GalleryForm>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);
  const bulkInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await galleryApi.getAll({ limit: 100 });
      setItems(res.data.data.items);
      setAlbums(res.data.data.albums);
    } catch {
      toast.error('Failed to load gallery');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setShowForm(true);
  };

  const openEdit = (item: GalleryItem) => {
    setEditing(item._id);
    setForm({
      title: item.title || '',
      caption: item.caption || '',
      image: item.image,
      imageFileId: item.imageFileId || '',
      album: item.album || '',
      people: (item.people || []).join(', '),
      // <input type="date"> needs bare YYYY-MM-DD.
      takenAt: item.takenAt ? item.takenAt.slice(0, 10) : '',
      isPublic: item.isPublic,
      featured: item.featured,
    });
    setShowForm(true);
  };

  const handleImageSelect = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      // The Drive id is the last path segment; keeping it lets the API clean
      // up the file if this photo is replaced or deleted.
      setForm((prev) => ({ ...prev, image: url, imageFileId: url.split('/').pop() || '' }));
      toast.success('Photo uploaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Adding photos one at a time is painful for an event with 30 pictures, so
  // a multi-select uploads and creates each item in one go. Captions can be
  // filled in afterwards by editing.
  const handleBulkUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files);
    setBulkProgress({ done: 0, total: list.length });

    let failed = 0;
    for (let i = 0; i < list.length; i++) {
      try {
        const url = await uploadImage(list[i]);
        await galleryApi.create({
          image: url,
          imageFileId: url.split('/').pop(),
          title: list[i].name.replace(/\.[^.]+$/, ''),
          people: [],
          isPublic: true,
        });
      } catch {
        failed++;
      }
      setBulkProgress({ done: i + 1, total: list.length });
    }

    setBulkProgress(null);
    if (failed) toast.error(`${list.length - failed} added, ${failed} failed`);
    else toast.success(`${list.length} photo${list.length > 1 ? 's' : ''} added`);
    fetchItems();
  };

  const handleSave = async () => {
    if (!form.image.trim()) {
      toast.error('Upload a photo or paste an image URL');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await galleryApi.update(editing, toPayload(form));
        toast.success('Photo updated');
      } else {
        await galleryApi.create(toPayload(form));
        toast.success('Photo added');
      }
      setShowForm(false);
      setEditing(null);
      setForm(defaultForm);
      fetchItems();
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: GalleryItem) => {
    if (!confirm('Delete this photo? This also removes the uploaded file and cannot be undone.')) return;
    try {
      await galleryApi.delete(item._id);
      toast.success('Deleted');
      fetchItems();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const toggleFlag = async (item: GalleryItem, field: 'isPublic' | 'featured') => {
    try {
      await galleryApi.update(item._id, { [field]: !item[field] });
      fetchItems();
    } catch {
      toast.error('Failed to update');
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length || reordering) return;

    const reordered = [...items];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setItems(reordered);
    setReordering(true);
    try {
      await Promise.all(reordered.map((item, i) =>
        item.order === i ? null : galleryApi.update(item._id, { order: i })
      ));
    } catch {
      toast.error('Failed to reorder');
      fetchItems();
    } finally {
      setReordering(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="heading-lg mb-1">Photo Gallery</h1>
          <p className="text-text-tertiary text-sm">
            Manage the photos shown on the public{' '}
            <Link href="/gallery" className="text-primary-light hover:underline">gallery page</Link>
          </p>
        </div>
        {canWrite && (
          <div className="flex gap-2">
            <button
              onClick={() => bulkInputRef.current?.click()}
              disabled={!!bulkProgress}
              className="btn-secondary text-sm whitespace-nowrap disabled:opacity-60"
            >
              {bulkProgress
                ? <><Loader2 className="w-4 h-4 animate-spin" /> {bulkProgress.done}/{bulkProgress.total}</>
                : <><Upload className="w-4 h-4" /> Bulk upload</>}
            </button>
            <input
              ref={bulkInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => { handleBulkUpload(e.target.files); e.target.value = ''; }}
            />
            <button onClick={openCreate} className="btn-primary text-sm whitespace-nowrap">
              <Plus className="w-4 h-4" /> Add Photo
            </button>
          </div>
        )}
      </div>

      {albums.length > 0 && (
        <p className="text-xs text-text-muted mb-4">
          Albums: {albums.join(' · ')}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card animate-pulse aspect-square" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-text-tertiary mb-1">No photos yet</p>
          <p className="text-text-muted text-sm">
            Use <strong>Bulk upload</strong> to add several at once.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item, index) => (
            <div key={item._id} className={cn('card p-0 overflow-hidden group', !item.isPublic && 'opacity-60')}>
              <div className="relative aspect-square bg-bg-elevated">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.title || ''} className="w-full h-full object-cover" />
                {!item.isPublic && (
                  <span className="absolute top-2 left-2 badge text-[10px] bg-bg/80 text-text-muted border-border">
                    <EyeOff className="w-3 h-3 inline mr-0.5" /> Hidden
                  </span>
                )}
                {item.featured && (
                  <span className="absolute top-2 right-2 text-warning" title="Featured">
                    <Star className="w-4 h-4 fill-current" />
                  </span>
                )}
              </div>

              <div className="p-3">
                <p className="text-sm font-medium text-text-primary line-clamp-1">
                  {item.title || <span className="text-text-muted">Untitled</span>}
                </p>
                {item.album && <p className="text-[11px] text-text-tertiary line-clamp-1">{item.album}</p>}
                {item.people?.length > 0 && (
                  <p className="text-[11px] text-text-muted line-clamp-1 mt-0.5">{item.people.join(', ')}</p>
                )}

                {canWrite && (
                  <div className="flex items-center gap-0.5 mt-2 flex-wrap">
                    <button onClick={() => move(index, -1)} disabled={index === 0 || reordering} className="btn-ghost px-1.5 py-1 disabled:opacity-30" title="Move earlier">
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => move(index, 1)} disabled={index === items.length - 1 || reordering} className="btn-ghost px-1.5 py-1 disabled:opacity-30" title="Move later">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => toggleFlag(item, 'isPublic')} className="btn-ghost px-1.5 py-1" title={item.isPublic ? 'Hide' : 'Show'}>
                      <EyeOff className={cn('w-3.5 h-3.5', item.isPublic && 'opacity-40')} />
                    </button>
                    <button onClick={() => toggleFlag(item, 'featured')} className="btn-ghost px-1.5 py-1" title="Feature">
                      <Star className={cn('w-3.5 h-3.5', item.featured ? 'fill-current text-warning' : 'opacity-40')} />
                    </button>
                    <button onClick={() => openEdit(item)} className="btn-ghost px-1.5 py-1" title="Edit">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(item)} className="btn-ghost px-1.5 py-1 text-error hover:bg-error/10" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4">
          <div className="bg-bg-surface border border-border rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-bg-surface border-b border-border p-5 flex items-center justify-between">
              <h2 className="font-semibold text-text-primary">{editing ? 'Edit Photo' : 'Add Photo'}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-text-muted" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Photo *</label>
                <div className="flex items-start gap-3">
                  {form.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={form.image} alt="" className="w-24 h-24 rounded-lg object-cover border border-border shrink-0" />
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-bg-elevated border border-border shrink-0" />
                  )}
                  <div className="flex-1 min-w-0 space-y-2">
                    <label className={cn('btn-secondary text-xs cursor-pointer inline-flex', uploading && 'opacity-60 pointer-events-none')}>
                      {uploading
                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...</>
                        : <><Upload className="w-3.5 h-3.5" /> {form.image ? 'Replace' : 'Upload'}</>}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploading}
                        onChange={(e) => { handleImageSelect(e.target.files?.[0]); e.target.value = ''; }}
                      />
                    </label>
                    <input
                      value={form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value, imageFileId: '' })}
                      className="input-base text-xs"
                      placeholder="...or paste an image URL"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-base" placeholder="AI Workshop, Delhi" />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Caption</label>
                <textarea value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} rows={3} className="input-base resize-none" placeholder="What's happening in this photo?" />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">People in this photo</label>
                <input value={form.people} onChange={(e) => setForm({ ...form, people: e.target.value })} className="input-base" placeholder="Ishita Batra, Shriyan, Tanya Mangla" />
                <p className="text-[11px] text-text-muted mt-1">Separate names with commas.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Album</label>
                  <input value={form.album} onChange={(e) => setForm({ ...form, album: e.target.value })} className="input-base" placeholder="Workshops 2026" list="album-suggestions" />
                  <datalist id="album-suggestions">
                    {albums.map((a) => <option key={a} value={a} />)}
                  </datalist>
                  <p className="text-[11px] text-text-muted mt-1">Groups photos on the public page.</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Date taken</label>
                  <input type="date" value={form.takenAt} onChange={(e) => setForm({ ...form, takenAt: e.target.value })} className="input-base" />
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                  <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} className="w-4 h-4 accent-primary" />
                  Show publicly
                </label>
                <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 accent-primary" />
                  Featured
                </label>
              </div>

              <div className="flex gap-3 pt-2 border-t border-border">
                <button onClick={handleSave} disabled={saving || uploading} className="btn-primary">
                  {saving ? 'Saving...' : editing ? 'Update Photo' : 'Add Photo'}
                </button>
                <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
