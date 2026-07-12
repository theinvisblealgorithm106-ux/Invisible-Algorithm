'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, MessageSquare, Globe, Linkedin, Instagram, Check } from 'lucide-react';
import { contactApi } from '@/lib/api';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(1, 'Name required'),
  email: z.string().email('Valid email required'),
  subject: z.string().min(1, 'Subject required'),
  category: z.enum(['general', 'partnership', 'research', 'media', 'technical', 'other']),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
});

type FormData = z.infer<typeof schema>;

const contactInfo = [
  { icon: Mail, label: 'Email', value: 'theinvisiblealgorithm106@gmail.com', href: 'mailto:theinvisiblealgorithm106@gmail.com' },
  { icon: Globe, label: 'Website', value: 'theinvisiblealgorithm.org', href: '#' },
  { icon: Linkedin, label: 'LinkedIn', value: 'The Invisible Algorithm', href: '#' },
  { icon: Instagram, label: 'Instagram', value: '@theinvisiblealgorithm', href: 'https://www.instagram.com/theinvisiblealgorithm/' },
];

const categories = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'partnership', label: 'School Partnership' },
  { value: 'research', label: 'Research Collaboration' },
  { value: 'media', label: 'Media & Press' },
  { value: 'technical', label: 'Technical Support' },
  { value: 'other', label: 'Other' },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'general' },
  });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      await contactApi.submit(data);
      setSubmitted(true);
      reset();
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-16">
      <section className="section">
        <div className="container-page">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left */}
            <div>
              <p className="label mb-3">Contact</p>
              <h1 className="heading-xl mb-5">Get in touch</h1>
              <p className="text-text-secondary leading-relaxed mb-10">
                Whether you're interested in partnering with us, collaborating on research, speaking at one of our events, or simply want to learn more — we'd love to hear from you.
              </p>

              <div className="space-y-4 mb-10">
                {contactInfo.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target={item.href.startsWith('mailto') ? undefined : '_blank'}
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-bg-elevated border border-border flex items-center justify-center flex-shrink-0 group-hover:border-primary/50 group-hover:bg-primary/5 transition-all">
                        <Icon className="w-4 h-4 text-text-tertiary group-hover:text-primary-light transition-colors" />
                      </div>
                      <div>
                        <p className="text-xs text-text-muted">{item.label}</p>
                        <p className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">{item.value}</p>
                      </div>
                    </a>
                  );
                })}
              </div>

              <div className="card bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                <h3 className="font-semibold text-text-primary mb-2">Interested in partnering?</h3>
                <p className="text-sm text-text-secondary">
                  We work with schools, universities, companies, and organizations worldwide. Select "School Partnership" in the form to tell us about your organization.
                </p>
              </div>
            </div>

            {/* Form */}
            <div>
              {submitted ? (
                <div className="card text-center py-12 animate-in">
                  <div className="w-14 h-14 rounded-full bg-success/10 border border-success/30 flex items-center justify-center mx-auto mb-5">
                    <Check className="w-7 h-7 text-success" />
                  </div>
                  <h2 className="heading-md mb-3">Message Sent!</h2>
                  <p className="text-text-secondary mb-6">Thank you for reaching out.</p>
                  <button onClick={() => setSubmitted(false)} className="btn-secondary">Send Another</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
                  <h2 className="heading-sm">Send us a message</h2>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">Name *</label>
                      <input {...register('name')} className="input-base" placeholder="Your name" />
                      {errors.name && <p className="text-xs text-error mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">Email *</label>
                      <input {...register('email')} type="email" className="input-base" placeholder="you@example.com" />
                      {errors.email && <p className="text-xs text-error mt-1">{errors.email.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Category *</label>
                    <select {...register('category')} className="input-base">
                      {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Subject *</label>
                    <input {...register('subject')} className="input-base" placeholder="What's this about?" />
                    {errors.subject && <p className="text-xs text-error mt-1">{errors.subject.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Message *</label>
                    <textarea
                      {...register('message')}
                      rows={6}
                      className="input-base resize-none"
                      placeholder="Your message..."
                    />
                    {errors.message && <p className="text-xs text-error mt-1">{errors.message.message}</p>}
                  </div>

                  <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
                    <MessageSquare className="w-4 h-4" />
                    {submitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
