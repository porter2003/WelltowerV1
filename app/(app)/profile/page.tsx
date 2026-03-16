import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { ProfileForm } from '@/components/profile/ProfileForm';
import type { User } from '@/lib/types';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser?.id ?? '')
    .single();

  if (!data) notFound();

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-brand mb-6">Your Profile</h1>
      <ProfileForm user={data as User} />
    </div>
  );
}
