import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';

type Props = { searchParams: Promise<{ token_hash?: string; type?: string }> };

export default async function ConfirmPage({ searchParams }: Props) {
  const { token_hash, type } = await searchParams;

  if (!token_hash || !type) {
    redirect('/login');
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash,
    type: type as 'invite',
  });

  if (error) {
    redirect('/login?error=invalid-link');
  }

  redirect('/auth/set-password');
}
