import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { StageBadge } from '@/components/ui/Badge';
import type { Deal, Task } from '@/lib/types';

export const revalidate = 0; // always fetch fresh data

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: deals } = await supabase.from('deals').select('*').order('created_at');
  const { data: tasks } = await supabase.from('tasks').select('*');

  const dealList = (deals ?? []) as unknown as Deal[];
  const taskList = (tasks ?? []) as unknown as Task[];

  return (
    <div>
      {/* Page header */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-brand tracking-tight">Active Deals</h1>
        <p className="text-text-muted text-base mt-1">Welltower build-to-rent partnerships</p>
      </div>

      {/* Deal cards */}
      <div className="grid grid-cols-1 gap-6">
        {dealList.map((deal) => {
          const allTasks = taskList.filter((t) => t.deal_id === deal.id);
          const completedTasks = allTasks.filter((t) => t.is_complete).length;
          const openTasks = allTasks.length - completedTasks;
          const pct = allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0;

          const upcomingTasks = allTasks
            .filter((t) => !t.is_complete && t.due_date)
            .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
            .slice(0, 3);

          return (
            <Link
              key={deal.id}
              href={`/deals/${deal.id}`}
              className="block bg-surface border border-border rounded-xl shadow-sm hover:shadow-md hover:border-brand-pale transition-all group"
            >
              <div className="p-4 sm:p-8">
                {/* Card header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-extrabold text-brand group-hover:text-brand-mid transition-colors">
                      {deal.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-base text-text-muted">
                      <span>{deal.city + ", " + deal.state}</span>
                      <span>·</span>
                      <span>{deal.unit_count} Units</span>
                      <span>·</span>
                      <span>{deal.partner}</span>
                    </div>
                  </div>
                  <StageBadge stage={deal.stage} />
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6 py-6 border-y border-border">
                  <div>
                    <div className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.5px] mb-1">Start Date</div>
                    <div className="text-brand font-semibold text-base">
                      {new Date(deal.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.5px] mb-1">Target Completion</div>
                    <div className="text-brand font-semibold text-base">
                      {new Date(deal.target_completion_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.5px] mb-1">Open Tasks</div>
                    <div className="text-brand font-semibold text-base">{openTasks}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.5px] mb-2">Task Progress</div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{ width: `${pct}%`, background: '#003D79' }}
                        />
                      </div>
                      <span className="text-brand font-semibold text-sm shrink-0">{pct}%</span>
                    </div>
                  </div>
                </div>

                {/* Upcoming tasks */}
                {upcomingTasks.length > 0 && (
                  <div className="mt-5">
                    <div className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.5px] mb-3">Upcoming Tasks</div>
                    <div className="flex flex-wrap gap-2">
                      {upcomingTasks.map((task) => (
                        <span
                          key={task.id}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-pale text-brand text-sm font-medium"
                        >
                          <span>{task.title}</span>
                          {task.due_date && (
                            <span className="text-text-muted text-xs">
                              {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card footer */}
              <div className="px-4 py-3 sm:px-8 sm:py-4 border-t border-border bg-brand-pale/40 rounded-b-xl flex items-center justify-between">
                <span className="text-sm text-text-muted">
                  {completedTasks} of {allTasks.length} tasks complete
                </span>
                <span className="text-sm font-semibold text-brand group-hover:text-brand-mid transition-colors">
                  View Deal →
                </span>
              </div>
            </Link>
          );
        })}

        {dealList.length === 0 && (
          <div className="bg-surface border border-border rounded-xl p-16 text-center">
            <p className="text-text-muted text-base">No active deals. Add one to get started.</p>
            <Link
              href="/deals/new"
              className="inline-block mt-4 px-5 py-2.5 rounded-lg text-white text-base font-semibold"
              style={{ background: '#003D79' }}
            >
              + New Deal
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
