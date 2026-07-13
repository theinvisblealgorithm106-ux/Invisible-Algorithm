'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, Check, Users, BookOpen, Globe, Zap } from 'lucide-react';
import { applicationsApi } from '@/lib/api';
import { INTERESTS, GRADE_LEVELS, REFERRAL_SOURCES, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Valid email required'),
  school: z.string().min(1, 'Required'),
  country: z.string().min(1, 'Required'),
  gradeLevel: z.string().min(1, 'Required'),
  age: z.number({ invalid_type_error: 'Required' }).min(10).max(30),
  interests: z.array(z.string()).min(1, 'Select at least one interest'),
  motivation: z.string().min(100, 'At least 100 characters').max(2000),
  experience: z.string().max(2000),
  contributionPlan: z.string().min(100, 'At least 100 characters').max(2000),
  referralSource: z.string().min(1, 'Required'),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

const benefits = [
  { icon: Users, text: 'Join a community of 30+ students across 10+ schools' },
  { icon: BookOpen, text: 'Access research programs and publish original work' },
  { icon: Globe, text: 'Connect with an international network of peers and mentors' },
  { icon: Zap, text: 'Participate in exclusive workshops, seminars, and competitions' },
];

export default function JoinPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, setValue, getValues, trigger } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { interests: [], age: undefined },
  });

  const interests = watch('interests') || [];

  const toggleInterest = (interest: string) => {
    const current = interests;
    if (current.includes(interest)) {
      setValue('interests', current.filter(i => i !== interest));
    } else {
      setValue('interests', [...current, interest]);
    }
  };

  const nextStep = async () => {
    const fieldsToValidate: (keyof FormData)[][] = [
      ['firstName', 'lastName', 'email', 'school', 'country', 'gradeLevel', 'age'],
      ['interests', 'motivation', 'experience'],
      ['contributionPlan', 'referralSource'],
    ];

    const valid = await trigger(fieldsToValidate[step - 1]);
    if (valid) setStep(s => s + 1);
  };

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      await applicationsApi.submit(data);
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Submission failed. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4 animate-in">
          <div className="w-16 h-16 rounded-full bg-success/10 border border-success/30 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-success" />
          </div>
          <h1 className="heading-lg mb-3">Application Submitted!</h1>
          <p className="text-text-secondary mb-2">
            Thank you for applying to The Invisible Algorithm. We've received your application and will review it ASAP.
          </p>
          <p className="text-text-tertiary text-sm mb-8">A confirmation email has been sent to the address you provided.</p>
          <a href="/" className="btn-primary">Return to Homepage</a>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16">
      <section className="section">
        <div className="container-page">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left */}
            <div className="lg:sticky lg:top-24">
              <p className="label mb-3">Join Us</p>
              <h1 className="heading-xl mb-5">Become a member of The Invisible Algorithm</h1>
              <p className="text-text-secondary leading-relaxed mb-8">
                We welcome curious, driven students from anywhere in the world. Whether you're passionate about AI, finance, computer science, or all three — there's a place for you here.
              </p>

              <div className="space-y-4 mb-8">
                {benefits.map((b) => {
                  const Icon = b.icon;
                  return (
                    <div key={b.text} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-primary-light" />
                      </div>
                      <p className="text-text-secondary text-sm">{b.text}</p>
                    </div>
                  );
                })}
              </div>

              {/* Step indicators */}
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all',
                      step > s ? 'bg-success text-white' : step === s ? 'bg-primary text-white' : 'bg-bg-elevated text-text-tertiary border border-border'
                    )}>
                      {step > s ? <Check className="w-3.5 h-3.5" /> : s}
                    </div>
                    <span className={cn('text-xs', step === s ? 'text-text-primary' : 'text-text-muted')}>
                      {s === 1 ? 'Personal Info' : s === 2 ? 'Background' : 'Goals'}
                    </span>
                    {s < 3 && <div className="w-8 h-px bg-border" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="card">
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Step 1 */}
                {step === 1 && (
                  <div className="space-y-4 animate-in">
                    <h2 className="heading-sm mb-5">Personal Information</h2>
                    <div className="grid grid-cols-2 gap-4">
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
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">Email Address *</label>
                      <input {...register('email')} type="email" className="input-base" placeholder="you@example.com" />
                      {errors.email && <p className="text-xs text-error mt-1">{errors.email.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">School / University *</label>
                      <input {...register('school')} className="input-base" placeholder="Name of your school" />
                      {errors.school && <p className="text-xs text-error mt-1">{errors.school.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1.5">Country *</label>
                        <input {...register('country')} className="input-base" placeholder="Country" />
                        {errors.country && <p className="text-xs text-error mt-1">{errors.country.message}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1.5">Age *</label>
                        <input {...register('age', { valueAsNumber: true })} type="number" min={10} max={30} className="input-base" placeholder="Age" />
                        {errors.age && <p className="text-xs text-error mt-1">{errors.age.message}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">Grade / Year *</label>
                      <select {...register('gradeLevel')} className="input-base">
                        <option value="">Select grade level</option>
                        {GRADE_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                      {errors.gradeLevel && <p className="text-xs text-error mt-1">{errors.gradeLevel.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1.5">LinkedIn (optional)</label>
                        <input {...register('linkedinUrl')} className="input-base" placeholder="https://linkedin.com/in/..." />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1.5">GitHub (optional)</label>
                        <input {...register('githubUrl')} className="input-base" placeholder="https://github.com/..." />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2 */}
                {step === 2 && (
                  <div className="space-y-5 animate-in">
                    <h2 className="heading-sm mb-5">Your Background & Interests</h2>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-2">Areas of Interest * (select all that apply)</label>
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
                      {errors.interests && <p className="text-xs text-error mt-1">{errors.interests.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">
                        Why do you want to join The Invisible Algorithm? * <span className="text-text-muted font-normal">(100-2000 chars)</span>
                      </label>
                      <textarea
                        {...register('motivation')}
                        rows={5}
                        className="input-base resize-none"
                        placeholder="Tell us what draws you to our organization and what you hope to gain..."
                      />
                      <p className="text-xs text-text-muted mt-1">{watch('motivation')?.length || 0} / 2000</p>
                      {errors.motivation && <p className="text-xs text-error mt-1">{errors.motivation.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">
                        Relevant experience <span className="text-text-muted font-normal">(optional, max 2000 chars)</span>
                      </label>
                      <textarea
                        {...register('experience')}
                        rows={4}
                        className="input-base resize-none"
                        placeholder="Describe any relevant projects, courses, competitions, or work..."
                      />
                      {errors.experience && <p className="text-xs text-error mt-1">{errors.experience.message}</p>}
                    </div>
                  </div>
                )}

                {/* Step 3 */}
                {step === 3 && (
                  <div className="space-y-5 animate-in">
                    <h2 className="heading-sm mb-5">Your Goals & Contribution</h2>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">
                        How do you plan to contribute? * <span className="text-text-muted font-normal">(100-2000 chars)</span>
                      </label>
                      <textarea
                        {...register('contributionPlan')}
                        rows={6}
                        className="input-base resize-none"
                        placeholder="Describe what you'd like to work on, research, or build as a member..."
                      />
                      <p className="text-xs text-text-muted mt-1">{watch('contributionPlan')?.length || 0} / 2000</p>
                      {errors.contributionPlan && <p className="text-xs text-error mt-1">{errors.contributionPlan.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">How did you hear about us? *</label>
                      <select {...register('referralSource')} className="input-base">
                        <option value="">Select one</option>
                        {REFERRAL_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {errors.referralSource && <p className="text-xs text-error mt-1">{errors.referralSource.message}</p>}
                    </div>
                    <div className="card bg-bg-subtle border-border text-sm text-text-secondary">
                      <p className="font-medium text-text-primary mb-1">Before you submit</p>
                      <p>By applying, you confirm that all information is accurate and that you agree to The Invisible Algorithm's community standards of respect, integrity, and collaboration.</p>
                    </div>
                  </div>
                )}

                {/* Nav buttons */}
                <div className={cn('flex gap-3 mt-8', step > 1 ? 'justify-between' : 'justify-end')}>
                  {step > 1 && (
                    <button type="button" onClick={() => setStep(s => s - 1)} className="btn-secondary">
                      Back
                    </button>
                  )}
                  {step < 3 ? (
                    <button type="button" onClick={nextStep} className="btn-primary">
                      Continue <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button type="submit" disabled={submitting} className="btn-primary">
                      {submitting ? 'Submitting...' : 'Submit Application'} <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
