import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Brighton — Welltower Deals',
  description: 'Internal partnership management tool for Brighton Corporation',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
