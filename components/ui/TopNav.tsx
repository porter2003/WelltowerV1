'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Dashboard' },
  { href: '/deals/new', label: 'New Deal' },
  { href: '/admin/users', label: 'Team' },
];

export function TopNav() {
  const pathname = usePathname();

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
      </div>
    </header>
  );
}
