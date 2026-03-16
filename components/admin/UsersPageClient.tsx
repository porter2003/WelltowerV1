'use client';

import { useState, useTransition } from 'react';
import { InviteUserForm } from './InviteUserForm';
import { deleteUser, approveRequest, dismissRequest } from '@/app/(app)/admin/actions';
import { avatarColor } from '@/lib/avatar';
import type { User, AccessRequest, UserRole } from '@/lib/types';

const ROLE_STYLES: Record<string, string> = {
  admin:   'bg-brand text-white',
  member:  'bg-brand-pale text-brand',
  partner: 'bg-gray-200 text-gray-700',
};

type Props = {
  users: User[];
  isAdmin: boolean;
  currentUserId: string;
  accessRequests: AccessRequest[];
};

export function UsersPageClient({ users, isAdmin, currentUserId, accessRequests }: Props) {
  const [showInvite, setShowInvite] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [approveRoles, setApproveRoles] = useState<Record<string, UserRole>>({});
  const [approveErrors, setApproveErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function handleDelete(userId: string) {
    startTransition(async () => {
      await deleteUser(userId);
      setConfirmDeleteId(null);
    });
  }

  function handleApprove(req: AccessRequest) {
    const role = approveRoles[req.id] ?? 'member';
    const formData = new FormData();
    formData.set('first_name', req.first_name);
    formData.set('last_name', req.last_name);
    formData.set('email', req.email);
    formData.set('role', role);
    startTransition(async () => {
      const result = await approveRequest(req.id, formData);
      if (result?.error) {
        setApproveErrors((e) => ({ ...e, [req.id]: result.error }));
      } else {
        setApprovingId(null);
      }
    });
  }

  function handleDismiss(requestId: string) {
    startTransition(async () => {
      await dismissRequest(requestId);
    });
  }

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
              {isAdmin && <th className="px-6 py-3" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => {
              const isSelf = user.id === currentUserId;
              return (
                <tr key={user.id} className="hover:bg-brand-pale/40 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full text-white text-sm flex items-center justify-center font-semibold shrink-0"
                        style={{ background: avatarColor(user.id) }}
                      >
                        {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                      </div>
                      <span className="font-semibold text-brand text-sm">
                        {user.first_name} {user.last_name}
                        {isSelf && (
                          <span className="ml-2 text-[11px] font-normal text-text-muted">(you)</span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-text-secondary text-sm">{user.email}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${ROLE_STYLES[user.role]}`}>
                      {user.role}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right w-48">
                      {!isSelf && (
                        confirmDeleteId === user.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs text-text-muted">Remove user?</span>
                            <button
                              onClick={() => handleDelete(user.id)}
                              disabled={isPending}
                              className="px-2.5 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                              Remove
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2.5 py-1 text-xs border border-border rounded-md text-text-muted hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(user.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Remove user"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                              <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>

        {showInvite && <InviteUserForm onCancel={() => setShowInvite(false)} />}
      </div>

      {/* Pending access requests — admin only */}
      {isAdmin && accessRequests.length > 0 && (
        <div className="mt-10">
          <h2 className="text-[15px] font-extrabold text-brand tracking-tight mb-4">
            Pending Access Requests
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
              {accessRequests.length}
            </span>
          </h2>
          <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm divide-y divide-border">
            {accessRequests.map((req) => (
              <div key={req.id} className="px-6 py-4 flex items-start gap-4">
                <div
                  className="w-9 h-9 rounded-full text-white text-sm flex items-center justify-center font-semibold shrink-0 mt-0.5"
                  style={{ background: avatarColor(req.email) }}
                >
                  {req.first_name.charAt(0)}{req.last_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-brand text-sm">{req.first_name} {req.last_name}</p>
                  <p className="text-text-muted text-sm">{req.email}</p>
                  {req.message && (
                    <p className="text-text-muted text-xs mt-1 italic">&ldquo;{req.message}&rdquo;</p>
                  )}
                  <p className="text-[11px] text-text-muted mt-1">
                    {new Date(req.requested_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>

                {approvingId === req.id ? (
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <div className="flex items-center gap-2">
                      <select
                        value={approveRoles[req.id] ?? 'member'}
                        onChange={(e) => setApproveRoles((r) => ({ ...r, [req.id]: e.target.value as UserRole }))}
                        className="border border-border rounded-lg px-2 py-1.5 text-sm text-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        onClick={() => handleApprove(req)}
                        disabled={isPending}
                        className="px-3 py-1.5 text-xs bg-brand text-white rounded-lg hover:bg-brand/90 disabled:opacity-50 transition-opacity"
                      >
                        {isPending ? 'Inviting…' : 'Send Invite'}
                      </button>
                      <button
                        onClick={() => { setApprovingId(null); setApproveErrors((e) => { const n = {...e}; delete n[req.id]; return n; }); }}
                        className="px-3 py-1.5 text-xs border border-border rounded-lg text-text-muted hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                    {approveErrors[req.id] && (
                      <p className="text-xs text-red-600">{approveErrors[req.id]}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setApprovingId(req.id)}
                      className="px-3 py-1.5 text-xs bg-brand text-white rounded-lg hover:bg-brand/90 transition-opacity"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleDismiss(req.id)}
                      disabled={isPending}
                      className="px-3 py-1.5 text-xs border border-border rounded-lg text-text-muted hover:text-red-600 hover:border-red-300 hover:bg-red-50 disabled:opacity-50 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
