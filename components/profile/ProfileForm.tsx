'use client';

import { useState, useTransition } from 'react';
import { updateProfile, signOut } from '@/app/(app)/profile/actions';
import type { User } from '@/lib/types';

export function ProfileForm({ user }: { user: User }) {
  const [isPending, startTransition] = useTransition();
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  function handleSubmit(formData: FormData) {
    startTransition(() => updateProfile(formData));
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6 shadow-sm space-y-4">
      <form action={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-brand mb-1.5">First Name</label>
            <input
              name="first_name"
              defaultValue={user.first_name}
              required
              className="w-full border border-border rounded-lg px-3 py-2 text-sm text-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-brand mb-1.5">Last Name</label>
            <input
              name="last_name"
              defaultValue={user.last_name}
              required
              className="w-full border border-border rounded-lg px-3 py-2 text-sm text-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-brand mb-1.5">Email</label>
          <input
            value={user.email}
            disabled
            className="w-full border border-border rounded-lg px-3 py-2 text-sm text-text-muted bg-gray-50 cursor-not-allowed"
          />
          <p className="text-xs text-text-muted mt-1">Email cannot be changed here.</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-brand mb-1.5">Role</label>
          <input
            value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            disabled
            className="w-full border border-border rounded-lg px-3 py-2 text-sm text-text-muted bg-gray-50 cursor-not-allowed"
          />
        </div>
        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
            style={{ background: '#003D79' }}
          >
            {isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>

      <div className="pt-2 border-t border-border">
        {confirmSignOut ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-muted">Are you sure?</span>
            <form action={signOut}>
              <button
                type="submit"
                className="px-3 py-1.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </form>
            <button
              onClick={() => setConfirmSignOut(false)}
              className="px-3 py-1.5 text-sm border border-border rounded-lg text-text-muted hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmSignOut(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M2 4.75A2.75 2.75 0 0 1 4.75 2h3a2.75 2.75 0 0 1 2.75 2.75v.25a.75.75 0 0 1-1.5 0v-.25c0-.69-.56-1.25-1.25-1.25h-3c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h3c.69 0 1.25-.56 1.25-1.25v-.25a.75.75 0 0 1 1.5 0v.25A2.75 2.75 0 0 1 7.75 14h-3A2.75 2.75 0 0 1 2 11.25v-6.5Zm9.47.47a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 1 1-1.06-1.06l.97-.97H6.75a.75.75 0 0 1 0-1.5h5.69l-.97-.97a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
            Sign Out
          </button>
        )}
      </div>
    </div>
  );
}
