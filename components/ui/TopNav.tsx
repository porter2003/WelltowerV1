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
    <header
      style={{ background: 'linear-gradient(135deg, #003D79 0%, #002b57 100%)' }}
      className="text-white shadow-md"
    >
      <div className="max-w-[1400px] mx-auto px-6 h-24 flex items-center justify-between">

        {/* Logo lockup — white pill */}
        <Link href="/" className="flex items-center gap-4 bg-white rounded-xl px-5 py-2.5 shrink-0">
          <Image
            src="/brighton-logo.png"
            alt="Brighton"
            height={36}
            width={180}
            className="object-contain"
            priority
          />
          <span className="w-px h-7 bg-gray-200" />
          <Image
            src="/welltower-logo.jpg"
            alt="Welltower"
            height={36}
            width={120}
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
                    ? 'bg-white/15 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
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
