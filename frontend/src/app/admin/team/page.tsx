'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit, X, ArrowUp, ArrowDown, EyeOff, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { teamApi } from '@/lib/api';
import { TeamMember } from '@/types';
import { getInitials, cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { canWriteTab } from '@/lib/permissions';
import toast from 'react-hot-toast';

interface TeamForm extends Record<string, unknown> {
  firstName: string;
  lastName: string;
  role: string;
  school: string;
  avatar: string;
  avatarPosition: string;
  bio: string;
  slug: string;
  linkedin: string;
  github: string;
  twitter: string;
  website: string;
  isActive: boolean;
}

const defaultForm: TeamForm = {
  firstName: '',
  lastName: '',
  role: '',
  school: '',
  avatar: '',
  avatarPosition: '',
  bio: '',
  slug: '',
  linkedin: '',
  github: '',
  twitter: '',
  website: '',
  isActive: true,
};

// The form keeps social links flat for simpler inputs; the API expects them nested.
const toPayload = (form: TeamForm) => ({
  firstName: form.firstName.trim(),
  lastName: form.lastName.trim(),
  role: form.role.trim(),
  school: form.school.trim() || undefined,
  avatar: form.avatar.trim() || undefined,
  avatarPosition: form.avatarPosition.trim() || undefined,
  bio: form.bio,
  // Blank means "derive it from the name" on create; on edit the existing
  // slug is pre-filled, so a blank here can only happen if the admin cleared it.
  ...(form.slug.trim() ? { slug: form.slug.trim() } : {}),
  socialLinks: {
    linkedin: form.linkedin.trim(),
    github: form.github.trim(),
    twitter: form.twitter.trim(),
    website: form.website.trim(),
  },
  isActive: form.isActive,
});

export default function AdminTeamPage() {
  const { user } = useAuthStore();
  const canWrite = canWriteTab(user?.role, 'team');
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<TeamForm>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await teamApi.getAll();
      setMembers(res.data.data.members);
    } catch {
      toast.error('Failed to load team');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setShowForm(true);
  };

  const openEdit = (member: TeamMember) => {
    setEditing(member._id);
    setForm({
      firstName: member.firstName,
      lastName: member.lastName || '',
      role: member.role,
      school: member.school || '',
      avatar: member.avatar || '',
      avatarPosition: member.avatarPosition || '',
      bio: member.bio || '',
      slug: member.slug || '',
      linkedin: member.socialLinks?.linkedin || '',
      github: member.socialLinks?.github || '',
      twitter: member.socialLinks?.twitter || '',
      website: member.socialLinks?.website || '',
      isActive: member.isActive,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.firstName.trim() || !form.role.trim()) {
      toast.error('First name and role are required');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await teamApi.update(editing, toPayload(form));
        toast.success('Team member updated');
      } else {
        await teamApi.create(toPayload(form));
        toast.success('Team member added');
      }
      setShowForm(false);
      setEditing(null);
      setForm(defaultForm);
      fetchMembers();
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Failed to save';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (member: TeamMember) => {
    const name = [member.firstName, member.lastName].filter(Boolean).join(' ');
    if (!confirm(`Remove ${name} from the team page? This cannot be undone.`)) return;
    try {
      await teamApi.delete(member._id);
      toast.success('Removed');
      fetchMembers();
    } catch {
      toast.error('Failed to remove');
    }
  };

  const toggleActive = async (member: TeamMember) => {
    try {
      await teamApi.update(member._id, { isActive: !member.isActive });
      toast.success(member.isActive ? 'Hidden from public page' : 'Now visible');
      fetchMembers();
    } catch {
      toast.error('Failed to update');
    }
  };

  // Swaps a member with its neighbour. Orders can arrive duplicated or sparse
  // (hand-edited, seeded), so write positions from the array index rather than
  // trusting the stored values to differ.
  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= members.length || reordering) return;

    const reordered = [...members];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setMembers(reordered);
    setReordering(true);

    try {
      await Promise.all(
        reordered.map((member, i) =>
          member.order === i ? null : teamApi.update(member._id, { order: i })
        )
      );
    } catch {
      toast.error('Failed to reorder');
      fetchMembers();
    } finally {
      setReordering(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="heading-lg mb-1">Team</h1>
          <p className="text-text-tertiary text-sm">
            Manage the executive team shown on the public{' '}
            <Link href="/team" className="text-primary-light hover:underline">team page</Link>
          </p>
        </div>
        {canWrite && (
          <button onClick={openCreate} className="btn-primary text-sm whitespace-nowrap">
            <Plus className="w-4 h-4" /> Add Member
          </button>
        )}
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg-subtle">
              <th className="text-left px-4 py-3 text-xs font-medium text-text-muted">Member</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-text-muted hidden md:table-cell">Role</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-text-muted hidden lg:table-cell">School</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-text-muted">Visible</th>
              {canWrite && <th className="text-right px-4 py-3 text-xs font-medium text-text-muted">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i}>
                  {[...Array(5)].map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-bg-elevated rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-text-tertiary">
                  No team members yet
                </td>
              </tr>
            ) : members.map((member, index) => (
              <tr key={member._id} className={cn('hover:bg-bg-elevated transition-colors', !member.isActive && 'opacity-60')}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {member.avatar ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={member.avatar}
                        alt=""
                        className={cn('w-9 h-9 rounded-full object-cover border border-border shrink-0', member.avatarPosition)}
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-primary/10 border border-border flex items-center justify-center shrink-0">
                        <span className="text-primary-light font-semibold text-xs">
                          {getInitials(member.firstName, member.lastName || member.firstName)}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-text-primary line-clamp-1">
                        {member.firstName}{member.lastName ? ` ${member.lastName}` : ''}
                      </p>
                      <Link
                        href={`/team/${member.slug}`}
                        className="text-xs text-text-muted hover:text-primary-light inline-flex items-center gap-1"
                      >
                        /team/{member.slug} <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-text-secondary hidden md:table-cell">
                  <span className="line-clamp-2">{member.role}</span>
                </td>
                <td className="px-4 py-3 text-text-tertiary hidden lg:table-cell">
                  <span className="line-clamp-1">{member.school || '—'}</span>
                </td>
                <td className="px-4 py-3">
                  {canWrite ? (
                    <button
                      onClick={() => toggleActive(member)}
                      className={cn('badge text-xs', member.isActive
                        ? 'bg-success/10 text-success border-success/20'
                        : 'bg-bg-elevated text-text-muted border-border')}
                      title={member.isActive ? 'Click to hide from the public page' : 'Click to show on the public page'}
                    >
                      {member.isActive ? 'Visible' : <><EyeOff className="w-3 h-3 inline mr-1" />Hidden</>}
                    </button>
                  ) : (
                    <span className={cn('badge text-xs', member.isActive
                      ? 'bg-success/10 text-success border-success/20'
                      : 'bg-bg-elevated text-text-muted border-border')}>
                      {member.isActive ? 'Visible' : 'Hidden'}
                    </span>
                  )}
                </td>
                {canWrite && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => move(index, -1)}
                        disabled={index === 0 || reordering}
                        className="btn-ghost px-2 py-1.5 disabled:opacity-30"
                        title="Move up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => move(index, 1)}
                        disabled={index === members.length - 1 || reordering}
                        className="btn-ghost px-2 py-1.5 disabled:opacity-30"
                        title="Move down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openEdit(member)} className="btn-ghost px-2 py-1.5" title="Edit">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(member)}
                        className="btn-ghost px-2 py-1.5 text-error hover:bg-error/10"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4">
          <div className="bg-bg-surface border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-bg-surface border-b border-border p-5 flex items-center justify-between">
              <h2 className="font-semibold text-text-primary">{editing ? 'Edit Team Member' : 'Add Team Member'}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-text-muted" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">First name *</label>
                  <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="input-base" placeholder="Ishita" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Last name</label>
                  <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="input-base" placeholder="Batra" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Role / title *</label>
                <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input-base" placeholder="Executive Director of ..." />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">School</label>
                <input value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} className="input-base" placeholder="Optional" />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={10}
                  className="input-base resize-y"
                  placeholder="Written in their own words. Blank lines create paragraphs on the public page."
                />
                <p className="text-[11px] text-text-muted mt-1">
                  Line breaks are preserved on the public profile page.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Photo URL or path</label>
                  <input value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} className="input-base" placeholder="/team/name.jpeg" />
                  <p className="text-[11px] text-text-muted mt-1">
                    A file already in <code>public/team/</code>, or any full https URL.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Photo crop</label>
                  <select value={form.avatarPosition} onChange={(e) => setForm({ ...form, avatarPosition: e.target.value })} className="input-base">
                    <option value="">Center (default)</option>
                    <option value="object-top">Top</option>
                    <option value="object-bottom">Bottom</option>
                    <option value="object-left">Left</option>
                    <option value="object-right">Right</option>
                  </select>
                  <p className="text-[11px] text-text-muted mt-1">
                    Use if the face gets cut off.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Page URL slug</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input-base" placeholder="auto-generated from the name" />
                <p className="text-[11px] text-text-muted mt-1">
                  Their profile lives at <code>/team/{form.slug || 'slug'}</code>. Changing it breaks existing links.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">LinkedIn</label>
                  <input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} className="input-base" placeholder="https://linkedin.com/in/..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">GitHub</label>
                  <input value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })} className="input-base" placeholder="https://github.com/..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Twitter / X</label>
                  <input value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} className="input-base" placeholder="https://x.com/..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Website</label>
                  <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="input-base" placeholder="https://..." />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 accent-primary"
                />
                Show on the public team page
              </label>

              <div className="flex gap-3 pt-2 border-t border-border">
                <button onClick={handleSave} disabled={saving} className="btn-primary">
                  {saving ? 'Saving...' : editing ? 'Update Member' : 'Add Member'}
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
