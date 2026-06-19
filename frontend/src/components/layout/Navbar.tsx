'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, LogOut, User, LayoutDashboard, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

const navLinks = [
  { href: '/research', label: 'Research' },
  { href: '/events', label: 'Events' },
  { href: '/team', label: 'Team' },
  { href: '/about', label: 'About' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout, hasRole } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore API error
    }
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-bg/95 backdrop-blur-xl border-b border-border shadow-lg shadow-black/20'
          : 'bg-transparent'
      )}
    >
      <div className="container-page">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 group-hover:bg-primary-hover transition-colors">
              <span className="text-white text-xs font-bold">IA</span>
            </div>
            <span className="font-semibold text-sm tracking-tight hidden sm:block">
              <span className="text-text-primary">The Invisible</span>
              <span className="text-primary"> Algorithm</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
                  pathname === link.href || pathname.startsWith(link.href + '/')
                    ? 'text-primary-light bg-primary/10'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-bg-elevated transition-colors text-sm"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                    <span className="text-primary-light text-xs font-semibold">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </span>
                  </div>
                  <span className="text-text-secondary max-w-[100px] truncate">{user.firstName}</span>
                  <ChevronDown className={cn('w-3.5 h-3.5 text-text-tertiary transition-transform', userMenuOpen && 'rotate-180')} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-bg-surface border border-border rounded-xl shadow-xl shadow-black/40 overflow-hidden animate-in">
                    <div className="p-3 border-b border-border">
                      <p className="text-sm font-medium text-text-primary">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-text-tertiary mt-0.5 capitalize">{user.role.replace('_', ' ')}</p>
                    </div>
                    <div className="p-1.5">
                      <Link href="/dashboard" className="flex items-center gap-2.5 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated rounded-lg transition-colors">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                      <Link href="/dashboard/profile" className="flex items-center gap-2.5 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated rounded-lg transition-colors">
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      {hasRole(['admin', 'super_admin']) && (
                        <Link href="/admin" className="flex items-center gap-2.5 px-3 py-2 text-sm text-primary-light hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                          <Shield className="w-4 h-4" /> Admin Panel
                        </Link>
                      )}
                    </div>
                    <div className="p-1.5 border-t border-border">
                      <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-error hover:bg-error/10 rounded-lg transition-colors">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login" className="btn-ghost text-sm">
                  Sign In
                </Link>
                <Link href="/join" className="btn-primary text-sm">
                  Join Us
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-bg-subtle/98 backdrop-blur-xl border-b border-border animate-in">
          <div className="container-page py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'block px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'text-primary-light bg-primary/10'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-border mt-3 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" className="block px-4 py-3 rounded-lg text-sm text-text-secondary hover:bg-bg-elevated">Dashboard</Link>
                  {hasRole(['admin', 'super_admin']) && (
                    <Link href="/admin" className="block px-4 py-3 rounded-lg text-sm text-primary-light hover:bg-primary/10">Admin Panel</Link>
                  )}
                  <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-lg text-sm text-error hover:bg-error/10">Sign Out</button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="block px-4 py-3 rounded-lg text-sm text-text-secondary hover:bg-bg-elevated">Sign In</Link>
                  <Link href="/join" className="btn-primary w-full justify-center">Join Us</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
