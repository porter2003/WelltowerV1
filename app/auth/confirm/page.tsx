'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';

type LogEntry = { step: string; result: string; ok: boolean };

function ConfirmInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [done, setDone] = useState(false);

  function log(step: string, result: string, ok: boolean) {
    setLogs((prev) => [...prev, { step, result, ok }]);
  }

  useEffect(() => {
    const supabase = createClient();

    async function verify() {
      const code = searchParams.get('code');
      const token_hash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      const hash = typeof window !== 'undefined' ? window.location.hash : '';

      log('URL params', `code=${code ? '✓' : '✗'}  token_hash=${token_hash ? '✓' : '✗'}  type=${type ?? '—'}`, !!(code || token_hash));
      log('URL hash', hash ? hash.slice(0, 60) + '…' : '(none)', !!hash);

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        log('PKCE exchangeCodeForSession', error ? `❌ ${error.message}` : '✓ success', !error);
        if (!error) { router.replace('/auth/set-password'); return; }
      }

      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as 'invite' });
        log('OTP verifyOtp', error ? `❌ ${error.message}` : '✓ success', !error);
        if (!error) { router.replace('/auth/set-password'); return; }
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      log('getSession', session ? `✓ user=${session.user.email}` : `❌ no session${sessionError ? ' — ' + sessionError.message : ''}`, !!session);
      if (session) { router.replace('/auth/set-password'); return; }

      log('Result', '❌ All methods failed — staying on this page', false);
      setDone(true);
    }

    verify();
  }, [router, searchParams]);

  return (
    <div className="w-full max-w-lg bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-3">
      <h1 className="text-lg font-bold text-gray-800">Invite Debug</h1>
      {logs.length === 0 && <p className="text-sm text-gray-500">Checking invite link…</p>}
      {logs.map((entry, i) => (
        <div key={i} className={`rounded-lg px-3 py-2 text-sm ${entry.ok ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <span className="font-semibold">{entry.step}:</span> {entry.result}
        </div>
      ))}
      {done && (
        <p className="text-xs text-gray-500 pt-2">
          Screenshot this page and share it so the issue can be diagnosed.
        </p>
      )}
    </div>
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
