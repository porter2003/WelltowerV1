'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createClient } from '@/lib/supabase-server';
import type { UserRole } from '@/lib/types';

export async function inviteUser(formData: FormData): Promise<{ error: string } | void> {
  const first_name = formData.get('first_name') as string;
  const last_name = formData.get('last_name') as string;
  const email = formData.get('email') as string;
  const role = formData.get('role') as UserRole;

  const { data: authData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: { first_name, last_name, role },
  });

  if (inviteError) return { error: inviteError.message };

  const { error: profileError } = await supabaseAdmin.from('profiles').insert({
    id: authData.user.id,
    first_name,
    last_name,
    email,
    role,
    is_active: true,
  });

  if (profileError) return { error: profileError.message };

  redirect('/admin/users');
}

export async function approveRequest(requestId: string, formData: FormData): Promise<{ error: string } | void> {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return { error: 'Not authenticated' };

  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authUser.id)
    .single();

  if (callerProfile?.role !== 'admin') return { error: 'Unauthorized' };

  const first_name = formData.get('first_name') as string;
  const last_name = formData.get('last_name') as string;
  const email = formData.get('email') as string;
  const role = formData.get('role') as UserRole;

  const { data: authData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: { first_name, last_name, role },
  });

  if (inviteError) return { error: inviteError.message };

  const { error: profileError } = await supabaseAdmin.from('profiles').insert({
    id: authData.user.id,
    first_name,
    last_name,
    email,
    role,
    is_active: true,
  });

  if (profileError) return { error: profileError.message };

  // Remove the request now that it's been approved
  await supabaseAdmin.from('access_requests').delete().eq('id', requestId);

  revalidatePath('/admin/users');
}

export async function dismissRequest(requestId: string) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) throw new Error('Not authenticated');

  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authUser.id)
    .single();

  if (callerProfile?.role !== 'admin') throw new Error('Unauthorized');

  await supabaseAdmin.from('access_requests').delete().eq('id', requestId);

  revalidatePath('/admin/users');
}

export async function deleteUser(targetUserId: string) {
  // Verify the caller is an admin
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) throw new Error('Not authenticated');

  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authUser.id)
    .single();

  if (callerProfile?.role !== 'admin') throw new Error('Unauthorized');

  // Prevent self-deletion
  if (targetUserId === authUser.id) throw new Error('Cannot delete your own account');

  // Deleting from auth.users cascades to profiles via FK
  const { error } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);
  if (error) throw new Error(error.message);

  revalidatePath('/admin/users');
}
