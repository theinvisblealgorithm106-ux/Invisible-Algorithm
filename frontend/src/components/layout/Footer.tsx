import Link from 'next/link';
import Image from 'next/image';
import { Linkedin, Instagram, Mail, ArrowUpRight } from 'lucide-react';

const footerLinks = {
  Organization: [
    { href: '/about', label: 'About Us' },
    { href: '/team', label: 'Team' },
    { href: '/research', label: 'Research' },
    { href: '/events', label: 'Events' },
  ],
  Community: [
    { href: '/join', label: 'Join Us' },
    { href: '/auth/login', label: 'Member Login' },
    { href: '/contact', label: 'Contact' },
  ],
  Resources: [
    { href: '/research', label: 'Publications' },
    { href: '/events', label: 'Workshops' },
    { href: '/announcements', label: 'Announcements' },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg-subtle mt-auto">
      <div className="container-page py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image src="/logo.png" alt="The Invisible Algorithm" width={56} height={40} className="h-10 w-auto flex-shrink-0" />
              <span className="font-semibold text-sm">
                <span className="text-text-primary">The Invisible</span>
                <span className="text-primary"> Algorithm</span>
              </span>
            </Link>
            <p className="text-text-tertiary text-sm leading-relaxed max-w-sm">
              An international student-led non-profit building the next generation of leaders in AI, technology, and business through education, research, and global collaboration.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-bg-elevated border border-border flex items-center justify-center text-text-tertiary hover:text-text-primary hover:border-border-hover transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/theinvisiblealgorithm/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-bg-elevated border border-border flex items-center justify-center text-text-tertiary hover:text-text-primary hover:border-border-hover transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="mailto:theinvisiblealgorithm106@gmail.com"
                className="w-9 h-9 rounded-lg bg-bg-elevated border border-border flex items-center justify-center text-text-tertiary hover:text-text-primary hover:border-border-hover transition-all"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-4">
                {section}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-tertiary hover:text-text-secondary transition-colors flex items-center gap-1 group"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-xs">
            © {new Date().getFullYear()} The Invisible Algorithm. All rights reserved.
          </p>
          <p className="text-text-muted text-xs">
            Empowering the next generation of global innovators.
          </p>
        </div>
      </div>
    </footer>
  );
}
