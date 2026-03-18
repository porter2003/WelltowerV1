'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';

export default function ConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'error'>('verifying');

  useEffect(() => {
    const supabase = createClient();

    async function verify() {
      // 1. PKCE flow — Supabase sends ?code=
      const code = searchParams.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) { router.replace('/auth/set-password'); return; }
      }

      // 2. OTP / token hash flow — Supabase sends ?token_hash=&type=
      const token_hash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as 'invite' });
        if (!error) { router.replace('/auth/set-password'); return; }
      }

      // 3. Implicit flow — tokens arrive as URL hash fragments (#access_token=...)
      //    The browser client picks these up automatically on init; just check session.
      const { data: { session } } = await supabase.auth.getSession();
      if (session) { router.replace('/auth/set-password'); return; }

      setStatus('error');
      router.replace('/login?error=invalid-link');
    }

    verify();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#e8f0f8' }}>
      <p className="text-sm text-brand">
        {status === 'verifying' ? 'Verifying your invite…' : 'Invalid or expired link.'}
      </p>
    </div>
  );
}
