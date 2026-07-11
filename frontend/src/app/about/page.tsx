import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Target, Eye, Heart, Users, Globe, BookOpen, Lightbulb } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about The Invisible Algorithm — our mission, vision, values, and the story behind our international student community.',
};

const values = [
  {
    icon: Lightbulb,
    title: 'Curiosity',
    description: 'We believe genuine curiosity is the foundation of all great work. We celebrate questions as much as answers.',
  },
  {
    icon: Globe,
    title: 'Inclusivity',
    description: 'Geography, school name, or background should never limit access to opportunity. We build for everyone.',
  },
  {
    icon: BookOpen,
    title: 'Rigor',
    description: 'We hold our work to high standards. Whether research, education, or collaboration — we pursue excellence.',
  },
  {
    icon: Users,
    title: 'Collaboration',
    description: 'The best breakthroughs happen when diverse minds work together. We are stronger as a community.',
  },
  {
    icon: Heart,
    title: 'Integrity',
    description: 'We operate with transparency, honesty, and respect — both within our community and in everything we publish.',
  },
  {
    icon: ArrowRight,
    title: 'Action',
    description: 'We are builders and doers. We move from ideas to execution and create real impact in education and research.',
  },
];

const focus = [
  { area: 'Artificial Intelligence', desc: 'Foundation models, neural architectures, AI safety, and applied AI systems.' },
  { area: 'Machine Learning', desc: 'Supervised and unsupervised learning, reinforcement learning, and ML engineering.' },
  { area: 'Computer Science', desc: 'Algorithms, systems, software engineering, and theoretical foundations.' },
  { area: 'Financial Literacy', desc: 'Markets, fintech, algorithmic trading, and the economics of technology.' },
  { area: 'Data Science', desc: 'Statistical analysis, data visualization, and evidence-based decision making.' },
  { area: 'Business & Innovation', desc: 'Entrepreneurship, product strategy, and building technology companies.' },
];

export default function AboutPage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="section relative">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="container-page relative text-center">
          <p className="label mb-4">About Us</p>
          <h1 className="heading-display max-w-3xl mx-auto text-balance mb-6">
            We believe students can change the world{' '}
            <span className="gradient-text">right now</span>
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
            The Invisible Algorithm is a student-led international non-profit dedicated to making world-class education, research, and collaboration accessible to every curious student on the planet.
          </p>
        </div>
      </section>

      {/* Mission + Vision */}
      <section className="section-sm">
        <div className="container-page">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <Target className="w-5 h-5 text-primary-light" />
              </div>
              <h2 className="heading-md mb-3">Our Mission</h2>
              <p className="text-text-secondary leading-relaxed">
                To build a borderless global community where students learn, collaborate, research, and publish findings on artificial intelligence, technology, and business — creating pathways for the next generation of innovators regardless of where they live.
              </p>
            </div>
            <div className="card bg-gradient-to-br from-accent/10 to-transparent border-accent/20">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-5">
                <Eye className="w-5 h-5 text-accent" />
              </div>
              <h2 className="heading-md mb-3">Our Vision</h2>
              <p className="text-text-secondary leading-relaxed">
                A world where every student, in every country, has access to the knowledge, mentorship, and community needed to become a thoughtful leader in technology and business — and to contribute meaningfully to humanity's most important challenges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="section">
        <div className="container-page">
          <div className="max-w-3xl mx-auto">
            <p className="label mb-4">Our Story</p>
            <h2 className="heading-xl mb-6">How it started</h2>
            <div className="prose-custom space-y-6">
              <p>
                The Invisible Algorithm began as a conversation between students who noticed the same thing: the most transformative educational experiences — research opportunities, cutting-edge workshops, access to expert mentors — were concentrated in a handful of well-resourced schools and countries.
              </p>
              <p>
                We founded this organization on the conviction that geography and institution should never define the ceiling of a student's potential. AI and technology are reshaping every industry, every country, and every aspect of human life. The students who understand these technologies — who can not only use them but contribute to their development — will be the leaders of tomorrow.
              </p>
              <p>
                We exist to make sure those students can come from anywhere.
              </p>
              <p>
                Since our founding, we've grown into a network spanning 10+ schools, with members publishing original research, organizing international workshops, and building real skills in AI, machine learning, data science, and finance.
              </p>
              <p>
                Our work is done entirely by students, for students. Every event, every publication, every partnership is driven by young people who believe in the power of education and collaboration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Focus Areas */}
      <section className="section bg-bg-subtle/50 border-y border-border">
        <div className="container-page">
          <div className="text-center mb-12">
            <p className="label mb-3">Focus Areas</p>
            <h2 className="heading-xl">What we study and research</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {focus.map((item) => (
              <div key={item.area} className="card-hover">
                <h3 className="font-semibold text-text-primary mb-2">{item.area}</h3>
                <p className="text-sm text-text-secondary">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section">
        <div className="container-page">
          <div className="text-center mb-12">
            <p className="label mb-3">Our Values</p>
            <h2 className="heading-xl">What guides us</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="card-hover">
                  <Icon className="w-5 h-5 text-primary-light mb-4" />
                  <h3 className="font-semibold text-text-primary mb-2">{v.title}</h3>
                  <p className="text-sm text-text-secondary">{v.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-sm">
        <div className="container-page text-center">
          <h2 className="heading-lg mb-4">Become part of the story</h2>
          <p className="text-text-secondary mb-8 max-w-md mx-auto">
            Join our international community of students building the future of technology.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/join" className="btn-primary">
              Apply for Membership <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/team" className="btn-secondary">
              Meet the Team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
