'use client';

import { useState, useTransition } from 'react';
import { createTemplate, updateTemplate, deleteTemplate } from '@/app/(app)/admin/default-tasks/actions';
import type { TaskTemplate, DealStage, TaskPriority } from '@/lib/types';

const STAGES: DealStage[] = ['Due Diligence', 'Entitlements', 'Construction', 'Closeout'];

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  high:   'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low:    'bg-gray-100 text-gray-600',
};

function formatDuration(days: number): string {
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  const weeks = Math.floor(days / 7);
  const remainder = days % 7;
  if (remainder === 0) return weeks === 1 ? '1 week' : `${weeks} weeks`;
  return `${weeks}w ${remainder}d`;
}

type EditState = {
  id: string;
  title: string;
  description: string;
  deal_stage: DealStage;
  priority: TaskPriority;
  sort_order: number;
  default_start_offset_days: number;
  default_duration_days: number;
};

type AddState = {
  stage: DealStage;
  title: string;
  description: string;
  priority: TaskPriority;
  sort_order: string;
  default_start_offset_days: string;
  default_duration_days: string;
};

export function DefaultTasksClient({ templates }: { templates: TaskTemplate[] }) {
  const [isPending, startTransition] = useTransition();
  const [editState, setEditState] = useState<EditState | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [addState, setAddState] = useState<AddState | null>(null);

  function startEdit(t: TaskTemplate) {
    setEditState({
      id: t.id,
      title: t.title,
      description: t.description ?? '',
      deal_stage: t.deal_stage,
      priority: t.priority,
      sort_order: t.sort_order,
      default_start_offset_days: t.default_start_offset_days,
      default_duration_days: t.default_duration_days,
    });
  }

  function handleSaveEdit() {
    if (!editState) return;
    startTransition(async () => {
      await updateTemplate(editState.id, {
        title: editState.title,
        description: editState.description || undefined,
        deal_stage: editState.deal_stage,
        priority: editState.priority,
        sort_order: editState.sort_order,
        default_start_offset_days: editState.default_start_offset_days,
        default_duration_days: editState.default_duration_days,
      });
      setEditState(null);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteTemplate(id);
      setConfirmDeleteId(null);
    });
  }

  function handleAddSubmit() {
    if (!addState) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set('title', addState.title);
      fd.set('description', addState.description);
      fd.set('deal_stage', addState.stage);
      fd.set('priority', addState.priority);
      fd.set('sort_order', addState.sort_order || '0');
      fd.set('default_start_offset_days', addState.default_start_offset_days || '0');
      fd.set('default_duration_days', addState.default_duration_days || '1');
      await createTemplate(fd);
      setAddState(null);
    });
  }

  const numInput = 'border border-border rounded-lg px-2 py-1.5 text-sm w-20 text-brand focus:outline-none focus:ring-2 focus:ring-brand/30';

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#003D79' }}>Default Tasks</h1>
        <p className="text-sm text-text-muted mt-1">
          These tasks are automatically created for every new deal. Start offset and duration determine the auto-calculated dates. Changes here do not affect existing deals.
        </p>
      </div>

      <div className="space-y-10">
        {STAGES.map((stage) => {
          const stageTasks = templates.filter((t) => t.deal_stage === stage);

          return (
            <div key={stage}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-bold text-text-muted uppercase tracking-widest">{stage}</h2>
                  <span className="text-xs text-text-muted">{stageTasks.length} tasks</span>
                </div>
                <button
                  onClick={() => setAddState({ stage, title: '', description: '', priority: 'medium', sort_order: String(stageTasks.length + 1), default_start_offset_days: '0', default_duration_days: '1' })}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white rounded-lg hover:opacity-90 transition-opacity"
                  style={{ background: '#003D79' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                    <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
                  </svg>
                  Add Task
                </button>
              </div>

              {/* Add form */}
              {addState?.stage === stage && (
                <div className="mb-3 bg-white border border-brand rounded-xl p-4 shadow-sm space-y-3">
                  <input
                    autoFocus
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                    placeholder="Task title"
                    value={addState.title}
                    onChange={(e) => setAddState({ ...addState, title: e.target.value })}
                  />
                  <textarea
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm resize-none"
                    placeholder="Description (optional)"
                    rows={2}
                    value={addState.description}
                    onChange={(e) => setAddState({ ...addState, description: e.target.value })}
                  />
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-text-muted">Priority</label>
                      <select className="border border-border rounded-lg px-2 py-1.5 text-sm" value={addState.priority} onChange={(e) => setAddState({ ...addState, priority: e.target.value as TaskPriority })}>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-text-muted whitespace-nowrap">Start offset (days)</label>
                      <input type="number" min="0" className={numInput} value={addState.default_start_offset_days} onChange={(e) => setAddState({ ...addState, default_start_offset_days: e.target.value })} />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-text-muted whitespace-nowrap">Duration (days)</label>
                      <input type="number" min="1" className={numInput} value={addState.default_duration_days} onChange={(e) => setAddState({ ...addState, default_duration_days: e.target.value })} />
                    </div>
                    <div className="flex gap-2 ml-auto">
                      <button onClick={() => setAddState(null)} className="px-3 py-1.5 text-sm text-text-muted rounded-lg border border-border">Cancel</button>
                      <button
                        disabled={!addState.title.trim() || isPending}
                        onClick={handleAddSubmit}
                        className="px-3 py-1.5 text-sm font-semibold text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
                        style={{ background: '#003D79' }}
                      >
                        {isPending ? 'Saving…' : 'Add Task'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Task list */}
              <div className="bg-white border border-border rounded-xl overflow-hidden divide-y divide-border">
                {stageTasks.length === 0 && (
                  <p className="px-4 py-4 text-sm text-text-muted italic">No default tasks for this stage.</p>
                )}
                {stageTasks.map((t) => (
                  <div key={t.id} className="group px-4 py-3">
                    {editState?.id === t.id ? (
                      <div className="space-y-2">
                        <input
                          autoFocus
                          className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                          value={editState.title}
                          onChange={(e) => setEditState({ ...editState, title: e.target.value })}
                        />
                        <textarea
                          className="w-full border border-border rounded-lg px-3 py-2 text-sm resize-none"
                          placeholder="Description (optional)"
                          rows={3}
                          value={editState.description}
                          onChange={(e) => setEditState({ ...editState, description: e.target.value })}
                        />
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-2">
                            <label className="text-xs font-medium text-text-muted">Stage</label>
                            <select className="border border-border rounded-lg px-2 py-1.5 text-sm" value={editState.deal_stage} onChange={(e) => setEditState({ ...editState, deal_stage: e.target.value as DealStage })}>
                              {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-xs font-medium text-text-muted">Priority</label>
                            <select className="border border-border rounded-lg px-2 py-1.5 text-sm" value={editState.priority} onChange={(e) => setEditState({ ...editState, priority: e.target.value as TaskPriority })}>
                              <option value="high">High</option>
                              <option value="medium">Medium</option>
                              <option value="low">Low</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-xs font-medium text-text-muted whitespace-nowrap">Start offset (days)</label>
                            <input type="number" min="0" className={numInput} value={editState.default_start_offset_days} onChange={(e) => setEditState({ ...editState, default_start_offset_days: parseInt(e.target.value, 10) || 0 })} />
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-xs font-medium text-text-muted whitespace-nowrap">Duration (days)</label>
                            <input type="number" min="1" className={numInput} value={editState.default_duration_days} onChange={(e) => setEditState({ ...editState, default_duration_days: parseInt(e.target.value, 10) || 1 })} />
                          </div>
                          <div className="flex gap-2 ml-auto">
                            <button onClick={() => setEditState(null)} className="px-3 py-1.5 text-sm text-text-muted rounded-lg border border-border">Cancel</button>
                            <button
                              disabled={!editState.title.trim() || isPending}
                              onClick={handleSaveEdit}
                              className="px-3 py-1.5 text-sm font-semibold text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
                              style={{ background: '#003D79' }}
                            >
                              {isPending ? 'Saving…' : 'Save'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : confirmDeleteId === t.id ? (
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-red-700 font-medium">Remove "{t.title}" from default tasks?</p>
                        <div className="flex gap-2">
                          <button onClick={() => setConfirmDeleteId(null)} className="px-3 py-1.5 text-sm text-text-muted rounded-lg border border-border">Cancel</button>
                          <button disabled={isPending} onClick={() => handleDelete(t.id)} className="px-3 py-1.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 transition-colors">
                            {isPending ? 'Removing…' : 'Remove'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-brand">{t.title}</span>
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${PRIORITY_COLORS[t.priority]}`}>
                              {t.priority}
                            </span>
                            <span className="text-[11px] text-text-muted">
                              Starts day {t.default_start_offset_days} · {formatDuration(t.default_duration_days)}
                            </span>
                          </div>
                          {t.description && (
                            <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{t.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button onClick={() => startEdit(t)} className="p-2 rounded-lg text-text-muted hover:text-brand hover:bg-brand-pale transition-colors" title="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                              <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.262a1.75 1.75 0 0 0 0-2.474ZM4.75 3.5A2.25 2.25 0 0 0 2.5 5.75v5.5A2.25 2.25 0 0 0 4.75 13.5h5.5A2.25 2.25 0 0 0 12.5 11.25V9.5a.75.75 0 0 0-1.5 0v1.75a.75.75 0 0 1-.75.75h-5.5a.75.75 0 0 1-.75-.75v-5.5a.75.75 0 0 1 .75-.75H6.5a.75.75 0 0 0 0-1.5H4.75Z" />
                            </svg>
                          </button>
                          <button onClick={() => setConfirmDeleteId(t.id)} className="p-2 rounded-lg text-text-muted hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                              <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
