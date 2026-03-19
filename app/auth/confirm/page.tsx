'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';

function ConfirmInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createClient();

    async function verify() {
      const code = searchParams.get('code');
      const token_hash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      const hash = typeof window !== 'undefined' ? window.location.hash : '';

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) { router.replace('/auth/set-password'); return; }
      }

      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as 'invite' });
        if (!error) { router.replace('/auth/set-password'); return; }
      }

      if (hash.includes('access_token')) {
        const hashParams = new URLSearchParams(hash.slice(1));
        const access_token = hashParams.get('access_token') ?? '';
        const refresh_token = hashParams.get('refresh_token') ?? '';
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });
        if (!error) { router.replace('/auth/set-password'); return; }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) { router.replace('/auth/set-password'); return; }

      router.replace('/login');
    }

    verify();
  }, [router, searchParams]);

  return (
    <p className="text-sm text-brand">Verifying your invite…</p>
  );
}

export default function ConfirmPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8" style={{ background: '#e8f0f8' }}>
      <Suspense fallback={<p className="text-sm text-brand">Loading…</p>}>
        <ConfirmInner />
      </Suspense>
    </div>
  );
}
