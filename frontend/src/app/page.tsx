import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Brain, BookOpen, Users, Globe, Zap, TrendingUp, Award, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'The Invisible Algorithm — Where Students Shape the Future of Technology',
};

const stats = [
  { value: '10+', label: 'Schools', color: 'bg-primary/10 text-primary border-primary/20' },
  { value: '30+', label: 'Members', color: 'bg-accent-green/10 text-accent-green border-accent-green/20' },
];

const pillars = [
  {
    icon: Brain,
    title: 'Artificial Intelligence & ML',
    description: 'Explore the frontiers of AI through research projects, workshops, and hands-on collaboration with peers worldwide.',
    gradient: 'from-primary/15 to-accent-cyan/10',
    border: 'border-primary/20',
    iconBg: 'bg-primary text-white',
    tag: 'bg-primary/10 text-primary border-primary/20',
  },
  {
    icon: TrendingUp,
    title: 'Financial Literacy',
    description: 'Understand the intersection of technology and finance — from algorithmic trading to fintech innovation.',
    gradient: 'from-accent-yellow/20 to-accent/10',
    border: 'border-accent-yellow/30',
    iconBg: 'bg-accent-yellow text-white',
    tag: 'bg-accent-yellow/10 text-accent-yellow border-accent-yellow/30',
  },
  {
    icon: BookOpen,
    title: 'Research & Publications',
    description: 'Conduct original research, publish findings, and contribute to the global body of student scholarship.',
    gradient: 'from-accent/15 to-accent-yellow/10',
    border: 'border-accent/20',
    iconBg: 'bg-accent text-white',
    tag: 'bg-accent/10 text-accent border-accent/20',
  },
  {
    icon: Globe,
    title: 'Global Collaboration',
    description: 'Connect with students and educators across 10+ partner schools through our international network.',
    gradient: 'from-accent-green/15 to-accent-cyan/10',
    border: 'border-accent-green/20',
    iconBg: 'bg-accent-green text-white',
    tag: 'bg-accent-green/10 text-accent-green border-accent-green/20',
  },
];

const features = [
  { icon: Users, text: 'Student-led research teams' },
  { icon: Award, text: 'Published academic work' },
  { icon: Zap, text: 'Live workshops & seminars' },
  { icon: Globe, text: 'Interschool partnerships' },
];

export default function HomePage() {
  return (
    <div className="pt-16 overflow-x-hidden">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-bg min-h-[92vh] flex items-center">

        {/* Floating blobs */}
        <div
          className="blob absolute -top-20 -right-20 w-72 h-72 bg-primary/25 animate-float pointer-events-none"
          style={{ filter: 'blur(1px)' }}
        />
        <div
          className="blob-alt absolute top-1/3 -right-10 w-40 h-40 bg-accent-cyan/30 animate-float-alt pointer-events-none"
          style={{ filter: 'blur(1px)' }}
        />
        <div
          className="blob absolute bottom-10 -left-16 w-80 h-80 bg-accent/20 animate-float-slow pointer-events-none"
          style={{ filter: 'blur(2px)' }}
        />
        <div
          className="blob-alt absolute top-1/4 left-1/3 w-28 h-28 bg-accent-yellow/30 animate-float pointer-events-none"
          style={{ animationDelay: '1.5s', filter: 'blur(1px)' }}
        />
        <div
          className="blob absolute top-16 left-10 w-20 h-20 bg-accent-green/30 animate-float-alt pointer-events-none"
          style={{ animationDelay: '3s', filter: 'blur(1px)' }}
        />

        <div className="container-page relative py-24 md:py-36 text-center w-full">
          <div className="inline-flex items-center gap-2 bg-white border border-primary/30 rounded-full px-5 py-2.5 mb-8 text-xs font-semibold text-primary shadow-sm shadow-primary/10 animate-bounce-in">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-slow" />
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
            <Link href="/join" className="btn-primary text-base px-8 py-3.5">
              Apply for Membership <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/research" className="btn-secondary text-base px-8 py-3.5">
              Explore Research
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className={`card-glass border text-center py-5 ${stat.color}`}>
                <div className="text-3xl font-extrabold mb-1">{stat.value}</div>
                <div className="text-xs font-semibold uppercase tracking-wider opacity-70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Wave at bottom of hero */}
        <div className="wave-down">
          <svg viewBox="0 0 1440 90" preserveAspectRatio="none" className="w-full h-[60px] sm:h-[90px]" xmlns="http://www.w3.org/2000/svg">
            <path fill="#FFFFFF" d="M0,45 C180,90 360,0 540,45 C720,90 900,0 1080,45 C1260,90 1350,20 1440,45 L1440,90 L0,90 Z" />
          </svg>
        </div>
      </section>

      {/* ── Pillars ── */}
      <section className="section bg-white relative">
        <div className="container-page">
          <div className="text-center mb-14">
            <span className="inline-block bg-accent-yellow/15 text-accent-yellow border border-accent-yellow/30 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest mb-4">
              What We Do
            </span>
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
                  className={`card-hover bg-gradient-to-br ${pillar.gradient} ${pillar.border}`}
                >
                  <div className={`w-12 h-12 rounded-2xl ${pillar.iconBg} flex items-center justify-center mb-5 shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="heading-sm mb-3">{pillar.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{pillar.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wave bottom */}
        <div className="wave-down">
          <svg viewBox="0 0 1440 70" preserveAspectRatio="none" className="w-full h-[50px] sm:h-[70px]" xmlns="http://www.w3.org/2000/svg">
            <path fill="#FAF5EB" d="M0,35 C360,70 720,0 1080,35 C1260,52 1380,15 1440,35 L1440,70 L0,70 Z" />
          </svg>
        </div>
      </section>

      {/* ── Features strip ── */}
      <section className="py-10 bg-bg relative">
        <div className="container-page">
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {features.map((f, i) => {
              const Icon = f.icon;
              const colors = ['text-primary', 'text-accent-green', 'text-accent', 'text-accent-yellow'];
              return (
                <div key={f.text} className="flex items-center gap-2.5 text-text-secondary text-sm font-medium">
                  <div className={`w-8 h-8 rounded-lg bg-white shadow-sm border border-border flex items-center justify-center ${colors[i]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {f.text}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="section bg-bg relative overflow-hidden">
        {/* Background blob */}
        <div
          className="blob-alt absolute -right-32 top-1/2 -translate-y-1/2 w-96 h-96 bg-accent-green/10 pointer-events-none"
          style={{ filter: 'blur(3px)' }}
        />

        <div className="container-page relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block bg-accent-green/15 text-accent-green border border-accent-green/30 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest mb-5">
                Our Mission
              </span>
              <h2 className="heading-xl mb-6">
                Building a borderless community of student innovators
              </h2>
              <p className="text-text-secondary leading-relaxed mb-5">
                The Invisible Algorithm was founded on a simple belief: students everywhere — regardless of their school or country — deserve access to world-class education, research opportunities, and a network of peers who share their curiosity.
              </p>
              <p className="text-text-secondary leading-relaxed mb-8">
                We organize workshops, research collaborations, publications, and educational programs that connect high school and university students across more than 40 countries.
              </p>
              <div className="flex gap-4 flex-wrap">
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
                { title: 'Student Research Program', desc: 'Conduct and publish original research with mentorship from experienced researchers.', color: 'border-l-4 border-primary', tag: 'Research', tagColor: 'bg-primary/10 text-primary border-primary/20', href: '/research' },
                { title: 'Global Workshop Series', desc: 'Monthly live workshops covering AI, ML, finance, and CS fundamentals.', color: 'border-l-4 border-accent-green', tag: 'Events', tagColor: 'bg-accent-green/10 text-accent-green border-accent-green/20', href: '/events' },
                { title: 'School Partnerships', desc: 'Partner your school or university with our international network.', color: 'border-l-4 border-accent-yellow', tag: 'Partnerships', tagColor: 'bg-accent-yellow/10 text-accent-yellow border-accent-yellow/30', href: null },
              ].map((item) => {
                const content = (
                  <>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`badge ${item.tagColor}`}>{item.tag}</span>
                      </div>
                      <h3 className="font-semibold text-text-primary mb-1.5">{item.title}</h3>
                      <p className="text-sm text-text-secondary">{item.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-text-tertiary flex-shrink-0 mt-1" />
                  </>
                );
                return item.href ? (
                  <Link key={item.title} href={item.href} className={`card-hover flex gap-4 ${item.color}`}>
                    {content}
                  </Link>
                ) : (
                  <div key={item.title} className={`card-hover flex gap-4 ${item.color}`}>
                    {content}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section relative overflow-hidden">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-accent-cyan to-accent-green p-0.5 shadow-2xl shadow-primary/20">
            <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-primary/90 to-accent-green/90 p-10 md:p-16 text-center">
              {/* Blobs inside CTA */}
              <div className="blob absolute -top-10 -left-10 w-48 h-48 bg-white/10 pointer-events-none" />
              <div className="blob-alt absolute -bottom-10 -right-10 w-56 h-56 bg-white/10 pointer-events-none" />
              <div className="blob absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent-yellow/10 pointer-events-none" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 mb-6 text-xs font-bold text-white uppercase tracking-widest">
                  Join The Community
                </div>
                <h2 className="heading-xl text-white max-w-2xl mx-auto mb-4">
                  Ready to shape the future of technology?
                </h2>
                <p className="text-white/80 max-w-lg mx-auto mb-8">
                  Applications are open to high school and university students worldwide. Join hundreds of curious, ambitious peers building something meaningful.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link href="/join" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold bg-white text-primary hover:bg-bg active:scale-95 transition-all duration-200 shadow-lg hover:-translate-y-0.5">
                    Apply for Membership <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold border-2 border-white/50 text-white hover:bg-white/10 active:scale-95 transition-all duration-200 hover:-translate-y-0.5">
                    Get in Touch
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
