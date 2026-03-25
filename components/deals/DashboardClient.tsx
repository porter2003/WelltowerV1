'use client';

import { useState } from 'react';
import Link from 'next/link';
import { StageBadge } from '@/components/ui/Badge';
import type { Deal, DealStage, Task } from '@/lib/types';

const STAGES: DealStage[] = ['Due Diligence', 'Entitlements', 'Construction', 'Closeout'];

type Props = {
  deals: Deal[];
  tasksByDealId: Record<string, Task[]>;
};

export function DashboardClient({ deals, tasksByDealId }: Props) {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<DealStage | 'All'>('All');
  const [showArchived, setShowArchived] = useState(false);

  const today = new Date(new Date().toDateString());

  const activeDeals = deals.filter((d) => !d.is_archived);

  const filtered = activeDeals.filter((deal) => {
    const matchesStage = stageFilter === 'All' || deal.stage === stageFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      deal.name.toLowerCase().includes(q) ||
      deal.city.toLowerCase().includes(q) ||
      deal.state.toLowerCase().includes(q);
    return matchesStage && matchesSearch;
  });

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-brand tracking-tight">Active Deals</h1>
        <p className="text-text-muted text-base mt-1">Welltower build-to-rent partnerships</p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        {/* Search */}
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          >
            <path
              fillRule="evenodd"
              d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="text"
            placeholder="Search deals…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-border rounded-lg text-brand placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 bg-surface w-full sm:w-56"
          />
        </div>

        {/* Stage filter tabs */}
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => setStageFilter('All')}
            className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-colors ${
              stageFilter === 'All'
                ? 'bg-brand text-white'
                : 'bg-surface border border-border text-text-muted hover:text-brand hover:border-brand'
            }`}
          >
            All
          </button>
          {STAGES.map((stage) => (
            <button
              key={stage}
              onClick={() => setStageFilter(stage)}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-colors ${
                stageFilter === stage
                  ? 'bg-brand text-white'
                  : 'bg-surface border border-border text-text-muted hover:text-brand hover:border-brand'
              }`}
            >
              {stage}
            </button>
          ))}
        </div>
      </div>

      {/* Deal cards */}
      <div className="grid grid-cols-1 gap-6">
        {filtered.map((deal) => {
          const allTasks = tasksByDealId[deal.id] ?? [];
          const completedTasks = allTasks.filter((t) => t.is_complete).length;
          const openTasks = allTasks.length - completedTasks;
          const pct = allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0;

          const upcomingTasks = allTasks
            .filter((t) => !t.is_complete && t.due_date)
            .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
            .slice(0, 3);

          const overdueCount = allTasks.filter(
            (t) => !t.is_complete && t.due_date && new Date(t.due_date + 'T00:00:00') < today
          ).length;

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
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-2xl font-extrabold text-brand group-hover:text-brand-mid transition-colors">
                        {deal.name}
                      </h2>
                      {overdueCount > 0 && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-200 text-gray-600 uppercase tracking-wide">
                          {overdueCount} overdue
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-base text-text-muted">
                      <span>{deal.city + ', ' + deal.state}</span>
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
                      {new Date(deal.start_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.5px] mb-1">Target Completion</div>
                    <div className="text-brand font-semibold text-base">
                      {new Date(deal.target_completion_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
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
                      {upcomingTasks.map((task) => {
                        const isOverdue = task.due_date && new Date(task.due_date + 'T00:00:00') < today;
                        return (
                          <span
                            key={task.id}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-pale text-brand text-sm font-medium"
                          >
                            <span>{task.title}</span>
                            {task.due_date && (
                              <span className={`text-xs ${isOverdue ? 'text-gray-500 font-semibold' : 'text-text-muted'}`}>
                                {isOverdue ? 'Overdue' : new Date(task.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </span>
                        );
                      })}
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

        {filtered.length === 0 && activeDeals.length > 0 && (
          <div className="bg-surface border border-border rounded-xl p-12 text-center">
            <p className="text-text-muted text-base">No deals match your filters.</p>
            <button
              onClick={() => { setSearch(''); setStageFilter('All'); }}
              className="inline-block mt-3 text-sm font-semibold text-brand hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {activeDeals.length === 0 && (
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

      {/* Archived deals */}
      {deals.some((d) => d.is_archived) && (
        <div className="mt-10">
          <button
            onClick={() => setShowArchived((v) => !v)}
            className="flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-brand transition-colors mb-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className={`w-4 h-4 transition-transform ${showArchived ? 'rotate-90' : ''}`}
            >
              <path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
            Archived Deals ({deals.filter((d) => d.is_archived).length})
          </button>

          {showArchived && (
            <div className="grid grid-cols-1 gap-3">
              {deals.filter((d) => d.is_archived).map((deal) => (
                <Link
                  key={deal.id}
                  href={`/deals/${deal.id}`}
                  className="flex items-center justify-between bg-surface border border-border rounded-xl px-6 py-4 hover:border-brand-pale hover:shadow-sm transition-all group"
                >
                  <div>
                    <span className="font-semibold text-text-muted group-hover:text-brand transition-colors">
                      {deal.name}
                    </span>
                    <span className="ml-3 text-sm text-text-muted">{deal.city}, {deal.state}</span>
                  </div>
                  <span className="text-sm font-semibold text-text-muted group-hover:text-brand transition-colors">
                    Restore →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
