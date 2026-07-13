'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Shield, Users, BookOpen, Calendar, FileText, Bell, MessageSquare, BarChart3, Home, LogOut, Eye } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { AdminTab, canAccessAdmin, canViewTab, defaultAdminPath } from '@/lib/permissions';

const adminNav: { href: string; icon: typeof BarChart3; label: string; tab: AdminTab; exact?: boolean }[] = [
  { href: '/admin', icon: BarChart3, label: 'Overview', tab: 'overview', exact: true },
  { href: '/admin/applications', icon: FileText, label: 'Applications', tab: 'applications' },
  { href: '/admin/users', icon: Users, label: 'Users', tab: 'users' },
  { href: '/admin/research', icon: BookOpen, label: 'Research', tab: 'research' },
  { href: '/admin/events', icon: Calendar, label: 'Events', tab: 'events' },
  { href: '/admin/announcements', icon: Bell, label: 'Announcements', tab: 'announcements' },
  { href: '/admin/messages', icon: MessageSquare, label: 'Messages', tab: 'messages' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const role = user?.role;

  const currentTab = adminNav.find(({ href, exact }) =>
    exact ? pathname === href : pathname.startsWith(href)
  )?.tab;

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/admin');
      return;
    }
    if (!canAccessAdmin(role)) {
      router.push('/');
      return;
    }
    if (currentTab && !canViewTab(role, currentTab)) {
      router.push(defaultAdminPath(role));
    }
  }, [isAuthenticated, role, currentTab, router]);

  const allowed = isAuthenticated && canAccessAdmin(role) && (!currentTab || canViewTab(role, currentTab));
  if (!allowed) return null;

  const visibleNav = adminNav.filter((item) => canViewTab(role, item.tab));
  const readOnly = role === 'admin';

  return (
    <div className="pt-16 min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 border-r border-border bg-bg-subtle fixed top-16 bottom-0 left-0 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-6 px-2 py-2">
            <Shield className="w-4 h-4 text-primary-light" />
            <span className="text-sm font-semibold text-text-primary">Admin Panel</span>
            {readOnly && (
              <span className="ml-auto flex items-center gap-1 text-[10px] font-medium text-text-muted bg-bg-elevated border border-border rounded-full px-2 py-0.5" title="Tech Dept: view only">
                <Eye className="w-3 h-3" /> View only
              </span>
            )}
          </div>
          <nav className="space-y-1">
            {visibleNav.map(({ href, icon: Icon, label, exact }) => {
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
          <div className="mt-auto pt-4 border-t border-border mt-8 space-y-1">
            <Link href="/" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-text-tertiary hover:text-text-secondary hover:bg-bg-elevated transition-colors">
              <Home className="w-4 h-4" /> Back to Site
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-text-tertiary hover:text-text-secondary hover:bg-bg-elevated transition-colors">
              <LogOut className="w-4 h-4" /> Log Out
            </button>
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
