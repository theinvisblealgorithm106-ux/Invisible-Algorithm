'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Shield, Users, BookOpen, Calendar, FileText, Bell, MessageSquare, BarChart3, Home } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const adminNav = [
  { href: '/admin', icon: BarChart3, label: 'Overview', exact: true },
  { href: '/admin/applications', icon: FileText, label: 'Applications' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/research', icon: BookOpen, label: 'Research' },
  { href: '/admin/events', icon: Calendar, label: 'Events' },
  { href: '/admin/announcements', icon: Bell, label: 'Announcements' },
  { href: '/admin/messages', icon: MessageSquare, label: 'Messages' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hasRole } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/admin');
      return;
    }
    if (!hasRole(['admin', 'super_admin'])) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, hasRole, router]);

  if (!isAuthenticated || !hasRole(['admin', 'super_admin'])) return null;

  return (
    <div className="pt-16 min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 border-r border-border bg-bg-subtle fixed top-16 bottom-0 left-0 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-6 px-2 py-2">
            <Shield className="w-4 h-4 text-primary-light" />
            <span className="text-sm font-semibold text-text-primary">Admin Panel</span>
          </div>
          <nav className="space-y-1">
            {adminNav.map(({ href, icon: Icon, label, exact }) => {
              const isActive = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary-light'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto pt-4 border-t border-border mt-8">
            <Link href="/dashboard" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-text-tertiary hover:text-text-secondary hover:bg-bg-elevated transition-colors">
              <Home className="w-4 h-4" /> Back to Dashboard
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-56">
        {children}
      </div>
    </div>
  );
}
