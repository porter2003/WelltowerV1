'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase-browser';

export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace('/login');
      } else {
        setSessionChecked(true);
      }
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push('/');
    router.refresh();
  }

  if (!sessionChecked) return null;

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#e8f0f8' }}>
      <div className="w-full max-w-md px-4">
        <div className="flex items-center justify-center gap-5 mb-8">
          <Image src="/brighton-logo.png" alt="Brighton" height={36} width={180} className="object-contain" priority />
          <span className="w-px h-8 bg-gray-300" />
          <Image src="/welltower-logo.png" alt="Welltower" height={36} width={120} className="object-contain" priority />
        </div>

        <div className="bg-white rounded-xl border border-border shadow-sm p-8">
          <h1 className="text-[22px] font-extrabold text-brand mb-1">Set Your Password</h1>
          <p className="text-text-muted text-sm mb-6">Choose a password to complete your account setup.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-brand mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full px-3 py-2.5 rounded-lg border border-border text-brand text-base focus:outline-none focus:border-brand"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-brand mb-1.5">Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full px-3 py-2.5 rounded-lg border border-border text-brand text-base focus:outline-none focus:border-brand"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-[13px] text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-white text-base font-semibold disabled:opacity-60 transition-opacity hover:opacity-90"
              style={{ background: '#003D79' }}
            >
              {loading ? 'Setting password…' : 'Set Password & Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
