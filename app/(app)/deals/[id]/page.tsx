import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { DealHeader } from '@/components/deals/DealHeader';
import { TaskStageSection } from '@/components/tasks/TaskStageSection';
import type { Deal, DealStage, Task } from '@/lib/types';

export const revalidate = 0;

const STAGE_ORDER: DealStage[] = ['Due Diligence', 'Entitlements', 'Construction', 'Closeout'];

type Props = { params: Promise<{ id: string }> };

export default async function DealDetailPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();

  const [{ data: dealData }, { data: tasksData }, { data: { user: authUser } }] = await Promise.all([
    supabase.from('deals').select('*').eq('id', id).single(),
    supabase
      .from('tasks')
      .select('*')
      .eq('deal_id', id)
      .order('is_complete', { ascending: false })
      .order('created_at'),
    supabase.auth.getUser(),
  ]);

  if (!dealData) notFound();

  const deal = dealData as Deal;
  const taskList: Task[] = (tasksData ?? []) as Task[];

  // Fetch current user's role to determine admin access
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authUser?.id ?? '')
    .single();
  const isAdmin = profile?.role === 'admin';

  const tasksByStage = STAGE_ORDER.reduce<Record<DealStage, Task[]>>(
    (acc, stage) => {
      acc[stage] = taskList.filter((t) => t.deal_stage === stage);
      return acc;
    },
    { 'Due Diligence': [], Entitlements: [], Construction: [], Closeout: [] }
  );

  const totalTasks = taskList.length;
  const completedTasks = taskList.filter((t) => t.is_complete).length;
  const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div>
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white rounded-lg transition-opacity hover:opacity-90"
          style={{ background: '#003D79' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
          </svg>
          Dashboard
        </Link>
      </div>

      <DealHeader deal={deal} pct={pct} isAdmin={isAdmin} />

      {/* Tasks by stage — always show all four stages */}
      <div className="space-y-6">
        {STAGE_ORDER.map((stage) => (
          <TaskStageSection
            key={stage}
            stage={stage}
            tasks={tasksByStage[stage]}
            dealId={id}
          />
        ))}
      </div>
    </div>
  );
}
