import { createClient } from '@/lib/supabase-server';
import { TopNav } from '@/components/ui/TopNav';
import type { User } from '@/lib/types';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser?.id ?? '')
    .single();

  return (
    <>
      <TopNav currentUser={data as User | null} />
      <main className="max-w-[1400px] mx-auto px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </>
  );
}
