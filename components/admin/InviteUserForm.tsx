'use client';

import { inviteUser } from '@/app/(app)/admin/actions';

const inputClass =
  'w-full border-b border-dashed border-gray-300 focus:border-brand focus:border-solid px-0 py-2 text-sm text-brand bg-transparent outline-none placeholder:text-text-muted transition-colors';

const labelClass = 'block text-[12px] font-semibold text-brand mb-1';

export function InviteUserForm({ onCancel }: { onCancel: () => void }) {
  return (
    <form
      action={async (formData) => {
        await inviteUser(formData);
      }}
      className="border-t border-border px-6 py-5 bg-brand-pale/40"
    >
      <p className="text-[12px] font-semibold text-brand uppercase tracking-[0.5px] mb-4">Invite New Team Member</p>
      <div className="grid grid-cols-4 gap-5 items-end">
        <div>
          <label className={labelClass}>First Name</label>
          <input name="first_name" required placeholder="Jane" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Last Name</label>
          <input name="last_name" required placeholder="Smith" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input name="email" type="email" required placeholder="jsmith@brighton.com" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Role</label>
          <select name="role" className={inputClass}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-5">
        <button
          type="submit"
          className="text-sm font-semibold px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-90"
          style={{ background: '#003D79' }}
        >
          Send Invite
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-text-muted hover:text-brand transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
