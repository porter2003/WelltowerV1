import { createClient } from '@/lib/supabase-server';
import { UsersPageClient } from '@/components/admin/UsersPageClient';
import type { User } from '@/lib/types';

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const [{ data: { user: authUser } }, { data: profiles }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('profiles').select('*').order('last_name'),
  ]);

  const users = (profiles ?? []) as unknown as User[];
  const currentProfile = users.find((u) => u.id === authUser?.id);
  const isAdmin = currentProfile?.role === 'admin';

  return <UsersPageClient users={users} isAdmin={isAdmin} />;
}
