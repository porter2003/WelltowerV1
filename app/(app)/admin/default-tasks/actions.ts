'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase-server';
import type { DealStage, TaskPriority } from '@/lib/types';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error('Unauthorized');
  return supabase;
}

export async function createTemplate(formData: FormData) {
  const supabase = await requireAdmin();

  const { error } = await supabase.from('task_templates').insert({
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
    deal_stage: formData.get('deal_stage') as DealStage,
    priority: formData.get('priority') as TaskPriority,
    sort_order: parseInt(formData.get('sort_order') as string, 10) || 0,
    default_start_offset_days: parseInt(formData.get('default_start_offset_days') as string, 10) || 0,
    default_duration_days: Math.max(1, parseInt(formData.get('default_duration_days') as string, 10) || 1),
  });

  if (error) throw new Error(error.message);
  revalidatePath('/admin/default-tasks');
}

export async function updateTemplate(
  id: string,
  updates: {
    title: string;
    description?: string;
    deal_stage: DealStage;
    priority: TaskPriority;
    sort_order: number;
    default_start_offset_days: number;
    default_duration_days: number;
  }
) {
  const supabase = await requireAdmin();

  const { error } = await supabase
    .from('task_templates')
    .update({
      title: updates.title,
      description: updates.description || null,
      deal_stage: updates.deal_stage,
      priority: updates.priority,
      sort_order: updates.sort_order,
      default_start_offset_days: updates.default_start_offset_days,
      default_duration_days: Math.max(1, updates.default_duration_days),
    })
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/default-tasks');
}

export async function deleteTemplate(id: string) {
  const supabase = await requireAdmin();

  const { error } = await supabase.from('task_templates').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/default-tasks');
}
