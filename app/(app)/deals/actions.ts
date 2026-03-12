'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import type { DealStage } from '@/lib/types';

export async function createDeal(formData: FormData) {
  const supabase = await createClient();

  const county = formData.get('county') as string | null;

  const { data, error } = await supabase
    .from('deals')
    .insert({
      name: formData.get('name') as string,
      partner: 'Welltower',
      city: formData.get('city') as string,
      state: (formData.get('state') as string).toUpperCase(),
      county: county?.trim() || undefined,
      unit_count: parseInt(formData.get('unit_count') as string, 10),
      stage: formData.get('stage') as DealStage,
      start_date: formData.get('start_date') as string,
      target_completion_date: formData.get('target_completion_date') as string,
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);

  redirect(`/deals/${data.id}`);
}
