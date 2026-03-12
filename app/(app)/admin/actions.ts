'use server';

import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { UserRole } from '@/lib/types';

export async function inviteUser(formData: FormData) {
  const first_name = formData.get('first_name') as string;
  const last_name = formData.get('last_name') as string;
  const email = formData.get('email') as string;
  const role = formData.get('role') as UserRole;

  const { data: authData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: { first_name, last_name, role },
  });

  if (inviteError) throw new Error(inviteError.message);

  const { error: profileError } = await supabaseAdmin.from('profiles').insert({
    id: authData.user.id,
    first_name,
    last_name,
    email,
    role,
    is_active: true,
  });

  if (profileError) throw new Error(profileError.message);

  redirect('/admin/users');
}
