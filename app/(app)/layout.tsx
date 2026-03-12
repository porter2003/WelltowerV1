import { TopNav } from '@/components/ui/TopNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopNav />
      <main className="max-w-[1400px] mx-auto px-6 py-8">{children}</main>
    </>
  );
}
