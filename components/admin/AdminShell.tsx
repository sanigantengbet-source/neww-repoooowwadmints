'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Wrench,
  FolderTree,
  Settings,
  PlusCircle,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  GitBranch,
} from 'lucide-react';
import type { AdminSession } from '@/types';

interface AdminShellProps {
  children: React.ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  // If we are on /admin/login, don't wrap with admin shell
  const isLoginPage = pathname === '/admin/login';
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(!isLoginPage);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (isLoginPage) {
      return;
    }

    let isMounted = true;
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.authenticated) {
          setSession(data.session || { username: 'admin', role: 'admin', expiresAt: 0 });
        } else {
          router.replace('/admin/login');
        }
      })
      .catch(() => {
        if (!isMounted) return;
        router.replace('/admin/login');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isLoginPage, router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch {
      router.push('/admin/login');
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07080c] flex items-center justify-center text-zinc-400 font-mono text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Verifying admin session...</span>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
    { href: '/admin/tools', label: 'Tools Catalog', icon: Wrench, exact: false },
    { href: '/admin/tools/new', label: 'Add New Tool', icon: PlusCircle, exact: true },
    { href: '/admin/categories', label: 'Categories', icon: FolderTree, exact: false },
    { href: '/admin/settings', label: 'Site Settings', icon: Settings, exact: false },
  ];

  const isNavActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-zinc-200 flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-800 bg-[#0d0f17]">
        <div className="flex items-center gap-2 font-mono font-bold text-sm text-white">
          <span className="text-emerald-400">SANN</span>
          <span className="text-zinc-500">/</span>
          <span>ADMIN</span>
        </div>
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          mobileNavOpen ? 'block' : 'hidden'
        } md:flex flex-col w-full md:w-64 border-r border-zinc-800/80 bg-[#0a0c12] p-4 shrink-0 justify-between z-30`}
      >
        <div className="space-y-6">
          {/* Brand header */}
          <div className="hidden md:flex items-center justify-between px-2 pt-2">
            <Link href="/admin" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 group-hover:border-emerald-500/40 transition">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold font-mono text-sm tracking-wide text-white">
                  SANN ADMIN
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  GitHub JSON Storage
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = isNavActive(item.href, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  id={`admin-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition min-h-[40px] ${
                    active
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-zinc-500'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile and footer */}
        <div className="space-y-3 pt-4 border-t border-zinc-800/80">
          {/* User badge */}
          {session && (
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
              <div className="w-7 h-7 rounded-full bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-zinc-200 truncate">
                  Admin Panel
                </p>
                <span className="text-[10px] text-emerald-400 font-mono">
                  Authorized Admin
                </span>
              </div>
            </div>
          )}

          {/* Quick links */}
          <div className="flex items-center justify-between text-xs px-1">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition"
            >
              <span>View Site</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <button
              id="admin-btn-logout"
              onClick={handleLogout}
              className="flex items-center gap-1 text-zinc-400 hover:text-rose-400 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-4 sm:p-8 max-w-6xl w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
