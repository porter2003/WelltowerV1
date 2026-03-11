import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDealById, getTasksForDeal, getAssigneesForTask } from '@/lib/mock-data';
import { StageBadge, PriorityBadge } from '@/components/ui/Badge';
import type { DealStage, Task } from '@/lib/types';

const STAGE_ORDER: DealStage[] = ['Due Diligence', 'Entitlements', 'Construction', 'Closeout'];

type Props = { params: Promise<{ id: string }> };

export default async function DealDetailPage({ params }: Props) {
  const { id } = await params;
  const deal = getDealById(id);
  if (!deal) notFound();

  const tasks = getTasksForDeal(id);

  const tasksByStage = STAGE_ORDER.reduce<Record<DealStage, Task[]>>(
    (acc, stage) => {
      acc[stage] = tasks.filter((t) => t.deal_stage === stage);
      return acc;
    },
    { 'Due Diligence': [], Entitlements: [], Construction: [], Closeout: [] }
  );

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.is_complete).length;
  const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="text-base text-text-muted mb-6">
        <Link href="/" className="hover:text-brand transition-colors">Dashboard</Link>
        <span className="mx-2 text-gray-300">/</span>
        <span className="text-brand">{deal.name}</span>
      </div>

      {/* Deal header */}
      <div className="bg-surface border border-border rounded-xl p-8 mb-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-brand">{deal.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-base text-text-muted">
              <span>{deal.partner}</span>
              <span>·</span>
              <span>{deal.location}</span>
              <span>·</span>
              <span>{deal.unit_count} Units</span>
            </div>
          </div>
          <StageBadge stage={deal.stage} />
        </div>

        <div className="mt-8 grid grid-cols-3 gap-8 pt-6 border-t border-border">
          <div>
            <div className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.5px] mb-1.5">Start Date</div>
            <div className="text-brand font-semibold text-base">
              {new Date(deal.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.5px] mb-1.5">Target Completion</div>
            <div className="text-brand font-semibold text-base">
              {new Date(deal.target_completion_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.5px] mb-2">Task Progress</div>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full"
                  style={{ width: `${pct}%`, background: '#003D79' }}
                />
              </div>
              <span className="text-brand font-semibold text-sm shrink-0">{pct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks by stage */}
      <div className="space-y-6">
        {STAGE_ORDER.map((stage) => {
          const stageTasks = tasksByStage[stage];
          if (stageTasks.length === 0) return null;
          return (
            <div key={stage} className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="px-8 py-4 border-b border-border bg-brand-pale flex items-center justify-between">
                <h2 className="font-semibold text-brand text-[11px] uppercase tracking-[0.5px]">{stage}</h2>
                <span className="text-[11px] text-text-muted">
                  {stageTasks.filter((t) => t.is_complete).length}/{stageTasks.length} complete
                </span>
              </div>
              <ul className="divide-y divide-border">
                {stageTasks.map((task) => {
                  const assignees = getAssigneesForTask(task.id);
                  return (
                    <li key={task.id} className="px-8 py-5 flex items-center gap-5">
                      <div
                        className={`w-5 h-5 rounded-full border-2 shrink-0 ${
                          task.is_complete ? 'border-brand' : 'border-gray-300'
                        }`}
                        style={task.is_complete ? { background: '#003D79' } : {}}
                      />
                      <div className="flex-1 min-w-0">
                        <div className={`text-base font-semibold ${task.is_complete ? 'line-through text-text-muted' : 'text-brand'}`}>
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-sm text-text-muted mt-0.5">{task.description}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <PriorityBadge priority={task.priority} />
                        {task.due_date && (
                          <span className="text-sm text-text-muted">
                            Due {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                        {assignees.length > 0 && (
                          <div className="flex -space-x-1">
                            {assignees.map((u) => (
                              <div
                                key={u.id}
                                title={u.name}
                                className="w-7 h-7 rounded-full text-white text-xs flex items-center justify-center font-semibold ring-2 ring-white"
                                style={{ background: '#003D79' }}
                              >
                                {u.name.charAt(0)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
