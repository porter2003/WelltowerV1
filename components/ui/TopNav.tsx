'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { avatarColor } from '@/lib/avatar';
import type { User } from '@/lib/types';

const navLinks = [
  { href: '/', label: 'Deals' },
  { href: '/deals/new', label: 'New Deal' },
  { href: '/resources', label: 'Resources' },
  { href: '/admin/users', label: 'Team' },
  { href: '/admin/default-tasks', label: 'Default Tasks' },
];

type Props = { currentUser: User | null };

export function TopNav({ currentUser }: Props) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      const inHamburger = mobileNavRef.current?.contains(e.target as Node);
      const inDropdown = mobileDropdownRef.current?.contains(e.target as Node);
      if (!inHamburger && !inDropdown) {
        setMobileNavOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-border shadow-sm">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-24 flex items-center justify-between">

        {/* Logo lockup */}
        <Link href="/" className="flex items-center gap-2 sm:gap-5 shrink-0 min-w-0">
          <Image
            src="/brighton-logo.png"
            alt="Brighton"
            height={40}
            width={200}
            className="object-contain w-[100px] sm:w-[200px]"
            priority
          />
          <span className="w-px h-6 sm:h-8 bg-gray-200" />
          <Image
            src="/welltower-logo.png"
            alt="Welltower"
            height={40}
            width={130}
            className="object-contain w-[80px] sm:w-[130px]"
            priority
          />
        </Link>

        <div className="flex items-center gap-2">
          {/* Nav links — hidden on mobile, visible sm+ */}
          <nav className="hidden sm:flex items-center gap-1">
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

          {/* Mobile hamburger button — visible below sm */}
          <div className="sm:hidden" ref={mobileNavRef}>
            <button
              onClick={() => setMobileNavOpen((o) => !o)}
              className="p-2 rounded-lg text-text-muted hover:text-brand hover:bg-brand-pale transition-colors"
              aria-label="Open navigation menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Profile avatar + dropdown */}
          {currentUser && (
            <div className="relative ml-1 sm:ml-3" ref={menuRef}>
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

      {/* Mobile nav dropdown */}
      {mobileNavOpen && (
        <div ref={mobileDropdownRef} className="sm:hidden border-t border-border bg-white px-4 py-3 space-y-1">
          {navLinks.map(({ href, label }) => {
            const isActive =
              href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileNavOpen(false)}
                className={`block px-4 py-3 rounded-lg text-base font-semibold tracking-wide transition-colors ${
                  isActive
                    ? 'bg-brand-pale text-brand'
                    : 'text-text-muted hover:text-brand hover:bg-brand-pale'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
