'use server';

import { supabase } from '@/lib/supabase';

export async function requestAccess(formData: FormData) {
  const first_name = (formData.get('first_name') as string).trim();
  const last_name = (formData.get('last_name') as string).trim();
  const email = (formData.get('email') as string).trim();
  const message = ((formData.get('message') as string) ?? '').trim() || null;

  const { error } = await supabase.from('access_requests').insert({
    first_name,
    last_name,
    email,
    message,
  });

  if (error) throw new Error(error.message);
}
