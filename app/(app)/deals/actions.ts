'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase-server';
import type { DealStage, TaskPriority, TaskTemplate } from '@/lib/types';

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

  const { data: templatesRaw } = await supabase
    .from('task_templates')
    .select('*')
    .order('deal_stage')
    .order('sort_order');
  const templates = (templatesRaw ?? []) as TaskTemplate[];

  if (templates.length > 0) {
    const now = new Date().toISOString();
    const tasks = templates.map((t) => ({
      deal_id: data.id,
      title: t.title,
      description: t.description ?? null,
      deal_stage: t.deal_stage,
      priority: t.priority,
      is_complete: false,
      created_at: now,
    }));
    const { error: tasksError } = await supabase.from('tasks').insert(tasks);
    if (tasksError) throw new Error(tasksError.message);
  }

  redirect(`/deals/${data.id}`);
}

export async function updateDeal(
  dealId: string,
  updates: {
    name: string;
    city: string;
    state: string;
    county?: string;
    unit_count: number;
    stage: DealStage;
    start_date: string;
    target_completion_date: string;
  }
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('deals')
    .update({
      name: updates.name,
      city: updates.city,
      state: updates.state.toUpperCase(),
      county: updates.county || null,
      unit_count: updates.unit_count,
      stage: updates.stage,
      start_date: updates.start_date,
      target_completion_date: updates.target_completion_date,
    })
    .eq('id', dealId);

  if (error) throw new Error(error.message);

  revalidatePath(`/deals/${dealId}`);
}

export async function deleteDeal(dealId: string) {
  const supabase = await createClient();

  // Verify admin role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') throw new Error('Unauthorized');

  const { error } = await supabase.from('deals').delete().eq('id', dealId);
  if (error) throw new Error(error.message);

  redirect('/');
}

export async function createTask(formData: FormData) {
  const supabase = await createClient();

  const deal_id = formData.get('deal_id') as string;
  const due_date = (formData.get('due_date') as string) || null;

  const { error } = await supabase.from('tasks').insert({
    deal_id,
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
    deal_stage: formData.get('deal_stage') as DealStage,
    priority: (formData.get('priority') as TaskPriority) ?? 'medium',
    due_date: due_date || null,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/deals/${deal_id}`);
}

export async function toggleTask(taskId: string, dealId: string, currentValue: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('tasks')
    .update({
      is_complete: !currentValue,
      completed_at: !currentValue ? new Date().toISOString() : null,
    })
    .eq('id', taskId);

  if (error) throw new Error(error.message);

  revalidatePath(`/deals/${dealId}`);
}

export async function updateTask(
  taskId: string,
  dealId: string,
  updates: { title: string; description?: string; priority: TaskPriority; due_date?: string }
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('tasks')
    .update({
      title: updates.title,
      description: updates.description || null,
      priority: updates.priority,
      due_date: updates.due_date || null,
    })
    .eq('id', taskId);

  if (error) throw new Error(error.message);

  revalidatePath(`/deals/${dealId}`);
}

export async function deleteTask(taskId: string, dealId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from('tasks').delete().eq('id', taskId);

  if (error) throw new Error(error.message);

  revalidatePath(`/deals/${dealId}`);
}

export async function assignUserToTask(taskId: string, userId: string, dealId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('task_assignments')
    .insert({ task_id: taskId, user_id: userId });

  if (error) throw new Error(error.message);

  revalidatePath(`/deals/${dealId}`);
}

export async function unassignUserFromTask(taskId: string, userId: string, dealId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('task_assignments')
    .delete()
    .eq('task_id', taskId)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);

  revalidatePath(`/deals/${dealId}`);
}
