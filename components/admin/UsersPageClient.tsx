'use client';

import { useState } from 'react';
import { InviteUserForm } from './InviteUserForm';
import type { User } from '@/lib/types';

const ROLE_STYLES: Record<string, string> = {
  admin:   'bg-brand text-white',
  member:  'bg-brand-pale text-brand',
  partner: 'bg-gray-200 text-gray-700',
};

export function UsersPageClient({ users, isAdmin }: { users: User[]; isAdmin: boolean }) {
  const [showInvite, setShowInvite] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-extrabold text-brand tracking-tight">Team</h1>
          <p className="text-text-muted text-sm mt-1">Brighton staff with access to this tool</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowInvite((v) => !v)}
            className="text-sm font-semibold px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-90"
            style={{ background: '#003D79' }}
          >
            {showInvite ? 'Cancel' : '+ Invite User'}
          </button>
        )}
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-brand-pale">
              <th className="text-left px-6 py-3 text-[11px] font-semibold text-brand uppercase tracking-[0.5px]">Name</th>
              <th className="text-left px-6 py-3 text-[11px] font-semibold text-brand uppercase tracking-[0.5px]">Email</th>
              <th className="text-right px-6 py-3 text-[11px] font-semibold text-brand uppercase tracking-[0.5px]">Role</th>
              <th className="text-right px-6 py-3 text-[11px] font-semibold text-brand uppercase tracking-[0.5px]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-brand-pale/40 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full text-white text-sm flex items-center justify-center font-semibold shrink-0"
                      style={{ background: '#003D79' }}
                    >
                      {user.first_name.charAt(0)}
                    </div>
                    <span className="font-semibold text-brand text-sm">{user.first_name} {user.last_name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-text-secondary text-sm">{user.email}</td>
                <td className="px-6 py-4 text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${ROLE_STYLES[user.role]}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${user.is_active ? 'text-brand' : 'text-gray-400'}`}>
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: user.is_active ? '#003D79' : '#94a3b8' }}
                    />
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showInvite && <InviteUserForm onCancel={() => setShowInvite(false)} />}
      </div>
    </div>
  );
}
