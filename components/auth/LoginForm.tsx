'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError('Invalid email or password.');
      setLoading(false);
      return;
    }

    router.push('/');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-[13px] font-semibold text-brand mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="w-full px-3 py-2.5 rounded-lg border border-border text-brand text-base focus:outline-none focus:border-brand"
          placeholder="you@brighton.com"
        />
      </div>

      <div>
        <label className="block text-[13px] font-semibold text-brand mb-1.5">Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full px-3 py-2.5 pr-10 rounded-lg border border-border text-brand text-base focus:outline-none focus:border-brand"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-brand transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                <path d="M3.27 2.21a.75.75 0 0 0-1.04 1.08l9.5 9.5a.75.75 0 1 0 1.08-1.04l-.535-.536a7.365 7.365 0 0 0 1.927-2.292.648.648 0 0 0 0-.567C13.363 6.44 11.164 4 8 4a6.67 6.67 0 0 0-2.583.53L3.27 2.21Z" />
                <path d="M8 5.5c.538 0 1.05.125 1.504.348L4.648 10.7A3.5 3.5 0 0 1 8 5.5ZM4.496 11.652A3.5 3.5 0 0 0 11.35 6.3l1.037 1.036a5.866 5.866 0 0 1-1.19 1.603C10.135 10.012 9.12 10.5 8 10.5c-.904 0-1.74-.286-2.426-.762l-1.078-1.086Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
                <path fillRule="evenodd" d="M1.38 8.28a.87.87 0 0 1 0-.566 7.003 7.003 0 0 1 13.238.006.87.87 0 0 1 0 .566A7.003 7.003 0 0 1 1.379 8.28ZM11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-[13px] text-text-muted bg-brand-pale px-3 py-2 rounded-lg">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-lg text-white text-base font-semibold disabled:opacity-60 transition-opacity hover:opacity-90"
        style={{ background: '#003D79' }}
      >
        {loading ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  );
}
