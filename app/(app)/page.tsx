import { createClient } from '@/lib/supabase-server';
import { DashboardClient } from '@/components/deals/DashboardClient';
import type { Deal, Task } from '@/lib/types';

export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await createClient();
  const [{ data: deals }, { data: tasks }] = await Promise.all([
    supabase.from('deals').select('*').order('created_at'),
    supabase.from('tasks').select('*'),
  ]);

  const dealList = (deals ?? []) as unknown as Deal[];
  const taskList = (tasks ?? []) as unknown as Task[];

  const tasksByDealId: Record<string, Task[]> = {};
  for (const task of taskList) {
    if (!tasksByDealId[task.deal_id]) tasksByDealId[task.deal_id] = [];
    tasksByDealId[task.deal_id].push(task);
  }

  return <DashboardClient deals={dealList} tasksByDealId={tasksByDealId} />;
}
