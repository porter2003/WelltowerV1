'use client';

import { useState, useTransition } from 'react';
import { requestAccess } from '@/app/login/actions';

type Props = { onCancel: () => void };

export function RequestAccessForm({ onCancel }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await requestAccess(formData);
        setSubmitted(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      }
    });
  }

  if (submitted) {
    return (
      <div className="mt-6 pt-6 border-t border-border text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-brand-pale flex items-center justify-center mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-brand">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="font-semibold text-brand text-sm">Request submitted</p>
        <p className="text-text-muted text-xs">A Brighton admin will review your request and send you an invite.</p>
        <button onClick={onCancel} className="text-xs text-text-muted hover:text-brand transition-colors">
          Back to sign in
        </button>
      </div>
    );
  }

  const inputClass = 'w-full px-3 py-2.5 rounded-lg border border-border text-brand text-base focus:outline-none focus:border-brand';
  const labelClass = 'block text-[13px] font-semibold text-brand mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="mt-6 pt-6 border-t border-border space-y-4">
      <p className="text-sm font-semibold text-brand">Request Access</p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>First Name</label>
          <input name="first_name" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Last Name</label>
          <input name="last_name" required className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Email</label>
        <input name="email" type="email" required className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Message <span className="font-normal text-text-muted">(optional)</span></label>
        <textarea
          name="message"
          rows={2}
          className="w-full px-3 py-2.5 rounded-lg border border-border text-brand text-base focus:outline-none focus:border-brand resize-none"
        />
      </div>

      {error && (
        <p className="text-[13px] text-text-muted bg-brand-pale px-3 py-2 rounded-lg">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 py-2.5 rounded-lg text-white text-base font-semibold disabled:opacity-60 transition-opacity hover:opacity-90"
          style={{ background: '#003D79' }}
        >
          {isPending ? 'Submitting…' : 'Submit Request'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-lg border border-border text-text-muted text-base hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
