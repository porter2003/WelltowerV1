import type { Metadata } from 'next';
import './globals.css';
import { TopNav } from '@/components/ui/TopNav';

export const metadata: Metadata = {
  title: 'Brighton — Welltower Deals',
  description: 'Internal partnership management tool for Brighton Corporation',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-muted min-h-screen antialiased">
        <TopNav />
        <main className="max-w-[1400px] mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
