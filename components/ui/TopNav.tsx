'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { avatarColor } from '@/lib/avatar';
import type { User } from '@/lib/types';

const navLinks = [
  { href: '/', label: 'Dashboard' },
  { href: '/deals/new', label: 'New Deal' },
  { href: '/admin/users', label: 'Team' },
  { href: '/admin/default-tasks', label: 'Default Tasks' },
];

type Props = { currentUser: User | null };

export function TopNav({ currentUser }: Props) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-border shadow-sm">
      <div className="max-w-[1400px] mx-auto px-6 h-24 flex items-center justify-between">

        {/* Logo lockup */}
        <Link href="/" className="flex items-center gap-5 shrink-0">
          <Image
            src="/brighton-logo.png"
            alt="Brighton"
            height={40}
            width={200}
            className="object-contain"
            priority
          />
          <span className="w-px h-8 bg-gray-200" />
          <Image
            src="/welltower-logo.png"
            alt="Welltower"
            height={40}
            width={130}
            className="object-contain"
            priority
          />
        </Link>

        <div className="flex items-center gap-2">
          {/* Nav links */}
          <nav className="flex items-center gap-1">
            {navLinks.map(({ href, label }) => {
              const isActive =
                href === '/' ? pathname === '/' : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-5 py-2.5 rounded-lg text-base font-semibold tracking-wide transition-colors ${
                    isActive
                      ? 'bg-brand-pale text-brand'
                      : 'text-text-muted hover:text-brand hover:bg-brand-pale'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Profile avatar + dropdown */}
          {currentUser && (
            <div className="relative ml-3" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold transition-opacity hover:opacity-85"
                style={{ background: avatarColor(currentUser.id) }}
                title={`${currentUser.first_name} ${currentUser.last_name}`}
              >
                {currentUser.first_name[0]}{currentUser.last_name[0]}
              </button>

              {menuOpen && (
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="absolute right-0 top-12 z-50 w-56 bg-white border border-border rounded-xl shadow-lg px-4 py-3 hover:bg-brand-pale transition-colors"
                >
                  <p className="text-sm font-semibold text-brand">
                    {currentUser.first_name} {currentUser.last_name}
                  </p>
                  <p className="text-xs text-text-muted truncate">{currentUser.email}</p>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
