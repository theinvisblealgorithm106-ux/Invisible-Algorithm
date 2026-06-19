'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { ArrowLeft, Save, Key } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { usersApi } from '@/lib/api';
import { INTERESTS, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useState } from 'react';

const profileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  bio: z.string().max(500).optional(),
  school: z.string().max(100).optional(),
  country: z.string().max(60).optional(),
  socialLinks: z.object({
    linkedin: z.string().url().optional().or(z.literal('')),
    github: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    website: z.string().url().optional().or(z.literal('')),
  }).optional(),
  interests: z.array(z.string()).optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'Min 8 characters'),
});

type ProfileData = z.infer<typeof profileSchema>;
type PasswordData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, setUser } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.push('/auth/login');
  }, [isAuthenticated, router]);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      bio: user?.bio || '',
      school: user?.school || '',
      country: user?.country || '',
      socialLinks: user?.socialLinks || {},
      interests: user?.interests || [],
    },
  });

  const interests = watch('interests') || [];

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setValue('interests', interests.filter(i => i !== interest));
    } else {
      setValue('interests', [...interests, interest]);
    }
  };

  const { register: regPw, handleSubmit: handlePw, formState: { errors: pwErrors }, reset: resetPw } = useForm<PasswordData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSaveProfile = async (data: ProfileData) => {
    setSaving(true);
    try {
      const res = await usersApi.updateProfile(data);
      setUser(res.data.data.user);
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async (data: PasswordData) => {
    setChangingPw(true);
    try {
      await usersApi.changePassword(data);
      toast.success('Password changed successfully');
      resetPw();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to change password';
      toast.error(msg);
    } finally {
      setChangingPw(false);
    }
  };

  if (!user) return null;

  return (
    <div className="pt-16">
      <section className="section-sm">
        <div className="container-page max-w-2xl">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-text-tertiary hover:text-text-secondary text-sm mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>

          <h1 className="heading-lg mb-8">Edit Profile</h1>

          {/* Profile form */}
          <form onSubmit={handleSubmit(onSaveProfile)} className="card space-y-5 mb-6">
            <h2 className="heading-sm">Personal Information</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">First Name *</label>
                <input {...register('firstName')} className="input-base" />
                {errors.firstName && <p className="text-xs text-error mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Last Name *</label>
                <input {...register('lastName')} className="input-base" />
                {errors.lastName && <p className="text-xs text-error mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Bio <span className="text-text-muted font-normal">(max 500 chars)</span></label>
              <textarea {...register('bio')} rows={3} className="input-base resize-none" placeholder="Tell us about yourself..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">School / University</label>
                <input {...register('school')} className="input-base" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Country</label>
                <input {...register('country')} className="input-base" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">Interests</label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map(interest => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={cn(
                      'text-xs px-3 py-1.5 rounded-full border transition-all',
                      interests.includes(interest)
                        ? 'bg-primary/20 text-primary-light border-primary/40'
                        : 'bg-bg-elevated text-text-secondary border-border hover:border-border-hover'
                    )}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            <h3 className="font-medium text-text-primary text-sm pt-2">Social Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { field: 'socialLinks.linkedin' as const, placeholder: 'https://linkedin.com/in/...' },
                { field: 'socialLinks.github' as const, placeholder: 'https://github.com/...' },
                { field: 'socialLinks.twitter' as const, placeholder: 'https://twitter.com/...' },
                { field: 'socialLinks.website' as const, placeholder: 'https://yoursite.com' },
              ].map(({ field, placeholder }) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5 capitalize">
                    {field.split('.')[1]}
                  </label>
                  <input {...register(field)} className="input-base" placeholder={placeholder} />
                </div>
              ))}
            </div>

            <button type="submit" disabled={saving} className="btn-primary">
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>

          {/* Password form */}
          <form onSubmit={handlePw(onChangePassword)} className="card space-y-4">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-text-muted" />
              <h2 className="heading-sm">Change Password</h2>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Current Password</label>
              <input {...regPw('currentPassword')} type="password" className="input-base" />
              {pwErrors.currentPassword && <p className="text-xs text-error mt-1">{pwErrors.currentPassword.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">New Password</label>
              <input {...regPw('newPassword')} type="password" className="input-base" placeholder="Min 8 characters" />
              {pwErrors.newPassword && <p className="text-xs text-error mt-1">{pwErrors.newPassword.message}</p>}
            </div>

            <button type="submit" disabled={changingPw} className="btn-secondary">
              {changingPw ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
