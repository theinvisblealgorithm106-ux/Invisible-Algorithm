import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Brain, BookOpen, Users, Globe, Zap, TrendingUp, Award, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'The Invisible Algorithm — Where Students Shape the Future of Technology',
};

const stats = [
  { value: '40+', label: 'Countries Represented' },
  { value: '200+', label: 'Active Members' },
  { value: '50+', label: 'Research Papers' },
  { value: '100+', label: 'Events Hosted' },
];

const pillars = [
  {
    icon: Brain,
    title: 'Artificial Intelligence & ML',
    description: 'Explore the frontiers of AI through research projects, workshops, and hands-on collaboration with peers worldwide.',
    color: 'from-primary/20 to-primary/5',
    border: 'border-primary/20',
    iconBg: 'bg-primary/10 text-primary-light',
  },
  {
    icon: TrendingUp,
    title: 'Financial Literacy',
    description: 'Understand the intersection of technology and finance — from algorithmic trading to fintech innovation.',
    color: 'from-accent/20 to-accent/5',
    border: 'border-accent/20',
    iconBg: 'bg-accent/10 text-accent',
  },
  {
    icon: BookOpen,
    title: 'Research & Publications',
    description: 'Conduct original research, publish findings, and contribute to the global body of student scholarship.',
    color: 'from-purple-500/20 to-purple-500/5',
    border: 'border-purple-500/20',
    iconBg: 'bg-purple-500/10 text-purple-400',
  },
  {
    icon: Globe,
    title: 'Global Collaboration',
    description: 'Connect with students, schools, and educators across 40+ countries through our international network.',
    color: 'from-green-500/20 to-green-500/5',
    border: 'border-green-500/20',
    iconBg: 'bg-green-500/10 text-green-400',
  },
];

const features = [
  { icon: Users, text: 'Student-led research teams' },
  { icon: Award, text: 'Published academic work' },
  { icon: Zap, text: 'Live workshops & seminars' },
  { icon: Globe, text: 'International partnerships' },
];

export default function HomePage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container-page relative py-24 md:py-36 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-8 text-xs font-medium text-primary-light">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            International Student Technology Non-Profit
          </div>

          <h1 className="heading-display max-w-4xl mx-auto text-balance mb-6">
            Where Curious Students{' '}
            <span className="gradient-text">Shape the Future</span>{' '}
            of Technology
          </h1>

          <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            The Invisible Algorithm is a global community of students learning, researching, and collaborating across AI, machine learning, computer science, and financial technology.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/join" className="btn-primary text-base px-8 py-3">
              Apply for Membership <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/research" className="btn-secondary text-base px-8 py-3">
              Explore Research
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="card-glass text-center">
                <div className="text-2xl md:text-3xl font-bold text-text-primary mb-1">{stat.value}</div>
                <div className="text-xs text-text-tertiary">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="section">
        <div className="container-page">
          <div className="text-center mb-14">
            <p className="label mb-3">What We Do</p>
            <h2 className="heading-xl max-w-2xl mx-auto">
              Four pillars of student-driven innovation
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className={`card-hover bg-gradient-to-br ${pillar.color} ${pillar.border}`}
                >
                  <div className={`w-12 h-12 rounded-xl ${pillar.iconBg} flex items-center justify-center mb-5`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="heading-sm mb-3">{pillar.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{pillar.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features strip */}
      <section className="py-10 border-y border-border bg-bg-subtle">
        <div className="container-page">
          <div className="flex flex-wrap justify-center gap-8">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.text} className="flex items-center gap-2.5 text-text-secondary text-sm">
                  <Icon className="w-4 h-4 text-primary-light" />
                  {f.text}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="section">
        <div className="container-page">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="label mb-3">Our Mission</p>
              <h2 className="heading-xl mb-6">
                Building a borderless community of student innovators
              </h2>
              <p className="text-text-secondary leading-relaxed mb-6">
                The Invisible Algorithm was founded on a simple belief: students everywhere — regardless of their school or country — deserve access to world-class education, research opportunities, and a network of peers who share their curiosity.
              </p>
              <p className="text-text-secondary leading-relaxed mb-8">
                We organize workshops, research collaborations, publications, and educational programs that connect high school and university students across more than 40 countries. Our members learn from each other, publish original research, and contribute to real conversations in AI and technology.
              </p>
              <div className="flex gap-4">
                <Link href="/about" className="btn-primary">
                  Learn About Us <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/team" className="btn-secondary">
                  Meet the Team
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { title: 'Student Research Program', desc: 'Conduct and publish original research with mentorship from experienced researchers.', tag: 'Research' },
                { title: 'Global Workshop Series', desc: 'Monthly live workshops covering AI, ML, finance, and CS fundamentals.', tag: 'Events' },
                { title: 'School Partnerships', desc: 'Partner your school or university with our international network.', tag: 'Partnerships' },
              ].map((item) => (
                <div key={item.title} className="card-hover flex gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="badge bg-primary/10 text-primary-light border-primary/20">{item.tag}</span>
                    </div>
                    <h3 className="font-semibold text-text-primary mb-1.5">{item.title}</h3>
                    <p className="text-sm text-text-secondary">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-tertiary flex-shrink-0 mt-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-bg-elevated to-accent/10 border border-primary/20 p-10 md:p-16 text-center glow-primary">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-primary/10 rounded-full blur-3xl" />
            <div className="relative">
              <p className="label mb-4">Join The Community</p>
              <h2 className="heading-xl max-w-2xl mx-auto mb-4">
                Ready to shape the future of technology?
              </h2>
              <p className="text-text-secondary max-w-lg mx-auto mb-8">
                Applications are open to high school and university students worldwide. Join hundreds of curious, ambitious peers building something meaningful.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/join" className="btn-primary text-base px-8 py-3">
                  Apply for Membership <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/contact" className="btn-secondary text-base px-8 py-3">
                  Get in Touch
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
