import { createClient } from '@/lib/supabase-server';
import { DefaultTasksClient } from '@/components/admin/DefaultTasksClient';
import type { TaskTemplate } from '@/lib/types';

export default async function DefaultTasksPage() {
  const supabase = await createClient();

  const { data: templates } = await supabase
    .from('task_templates')
    .select('*')
    .order('deal_stage')
    .order('sort_order');

  return <DefaultTasksClient templates={(templates ?? []) as unknown as TaskTemplate[]} />;
}
