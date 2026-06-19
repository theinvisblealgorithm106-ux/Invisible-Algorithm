'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

const schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'At least 8 characters'),
  school: z.string().optional(),
  country: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const res = await authApi.register(data);
      const { user, accessToken, refreshToken } = res.data.data;
      setAuth(user, accessToken, refreshToken);
      toast.success(`Welcome to The Invisible Algorithm, ${user.firstName}!`);
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-16 min-h-screen flex items-center justify-center py-12">
      <div className="w-full max-w-sm px-4">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white text-xs font-bold">IA</span>
            </div>
          </Link>
          <h1 className="heading-lg mb-2">Create an account</h1>
          <p className="text-text-tertiary text-sm">Join The Invisible Algorithm community</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">First Name *</label>
              <input {...register('firstName')} className="input-base" placeholder="John" />
              {errors.firstName && <p className="text-xs text-error mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Last Name *</label>
              <input {...register('lastName')} className="input-base" placeholder="Doe" />
              {errors.lastName && <p className="text-xs text-error mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Email *</label>
            <input {...register('email')} type="email" className="input-base" placeholder="you@example.com" />
            {errors.email && <p className="text-xs text-error mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Password *</label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                className="input-base pr-10"
                placeholder="Min 8 characters"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-error mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">School</label>
            <input {...register('school')} className="input-base" placeholder="Your school or university" />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Country</label>
            <input {...register('country')} className="input-base" placeholder="Country" />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full justify-center mt-2">
            {submitting ? 'Creating account...' : 'Create Account'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-sm text-text-tertiary mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary-light hover:text-primary">Sign in</Link>
        </p>

        <p className="text-center text-xs text-text-muted mt-4 px-4">
          Want full membership? <Link href="/join" className="text-primary-light hover:text-primary">Apply here</Link>
        </p>
      </div>
    </div>
  );
}
