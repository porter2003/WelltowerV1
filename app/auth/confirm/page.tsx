import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';

type Props = { searchParams: Promise<{ code?: string; token_hash?: string; type?: string }> };

export default async function ConfirmPage({ searchParams }: Props) {
  const { code, token_hash, type } = await searchParams;

  const supabase = await createClient();

  if (code) {
    // PKCE flow — Supabase redirects here with ?code=... after processing the invite link
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) redirect('/login?error=invalid-link');
    redirect('/auth/set-password');
  }

  if (token_hash && type) {
    // Token hash flow (fallback for older email templates)
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as 'invite' });
    if (error) redirect('/login?error=invalid-link');
    redirect('/auth/set-password');
  }

  redirect('/login');
}
