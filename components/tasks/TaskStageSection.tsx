'use client';

import { useState, useTransition, useRef } from 'react';
import { PriorityBadge } from '@/components/ui/Badge';
import {
  createTask,
  toggleTask,
  updateTask,
  deleteTask,
  assignUserToTask,
  unassignUserFromTask,
} from '@/app/(app)/deals/actions';
import type { Task, DealStage, TaskPriority, User } from '@/lib/types';
import { avatarColor } from '@/lib/avatar';

const PRIORITY_OPTIONS: TaskPriority[] = ['low', 'medium', 'high'];

type EditForm = {
  title: string;
  description: string;
  priority: TaskPriority;
  due_date: string;
};

type Props = {
  stage: DealStage;
  tasks: Task[];
  dealId: string;
  isAdmin: boolean;
  users: User[];
  assignmentsByTaskId: Record<string, User[]>;
};

export function TaskStageSection({ stage, tasks, dealId, isAdmin, users, assignmentsByTaskId }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
  });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [assignDropdownId, setAssignDropdownId] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);
  const [isPending, startTransition] = useTransition();
  const addFormRef = useRef<HTMLFormElement>(null);

  const completedCount = tasks.filter((t) => t.is_complete).length;

  function startEdit(task: Task) {
    setEditingId(task.id);
    setEditForm({
      title: task.title,
      description: task.description ?? '',
      priority: task.priority,
      due_date: task.due_date ?? '',
    });
    setConfirmDeleteId(null);
    setAssignDropdownId(null);
    setIsAdding(false);
  }

  function handleToggle(task: Task) {
    startTransition(() => toggleTask(task.id, dealId, task.is_complete));
  }

  function handleSaveEdit(taskId: string) {
    startTransition(async () => {
      await updateTask(taskId, dealId, {
        title: editForm.title,
        description: editForm.description,
        priority: editForm.priority,
        due_date: editForm.due_date,
      });
      setEditingId(null);
    });
  }

  function handleDelete(taskId: string) {
    startTransition(async () => {
      await deleteTask(taskId, dealId);
      setConfirmDeleteId(null);
    });
  }

  function handleAdd(formData: FormData) {
    startTransition(async () => {
      await createTask(formData);
      setIsAdding(false);
      addFormRef.current?.reset();
    });
  }

  function handleAssign(taskId: string, userId: string) {
    startTransition(async () => {
      await assignUserToTask(taskId, userId, dealId);
      setAssignDropdownId(null);
      setDropdownPos(null);
    });
  }

  function handleUnassign(taskId: string, userId: string) {
    startTransition(() => unassignUserFromTask(taskId, userId, dealId));
  }

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
      {/* Stage header */}
      <div className="px-4 py-3 sm:px-8 sm:py-4 border-b border-border bg-brand-100 flex items-center justify-between">
        <h2 className="font-semibold text-brand text-[11px] uppercase tracking-[0.5px]">{stage}</h2>
        <span className="text-[11px] text-text-muted">
          {completedCount}/{tasks.length} complete
        </span>
      </div>

      {/* Invisible overlay + fixed dropdown — renders outside overflow-hidden card */}
      {assignDropdownId && dropdownPos && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => { setAssignDropdownId(null); setDropdownPos(null); }}
          />
          <div
            className="fixed z-50 bg-white border border-border rounded-lg shadow-lg py-1 min-w-[160px]"
            style={{ top: dropdownPos.top, right: dropdownPos.right }}
          >
            {users.filter((u) => !(assignmentsByTaskId[assignDropdownId] ?? []).some((a) => a.id === u.id)).length === 0 ? (
              <p className="px-3 py-2 text-xs text-text-muted">Everyone assigned</p>
            ) : (
              users
                .filter((u) => !(assignmentsByTaskId[assignDropdownId] ?? []).some((a) => a.id === u.id))
                .map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleAssign(assignDropdownId, user.id)}
                    disabled={isPending}
                    className="w-full text-left px-3 py-2 text-sm text-brand hover:bg-brand-pale transition-colors flex items-center gap-2"
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                      style={{ background: avatarColor(user.id) }}
                    >
                      {user.first_name[0]}{user.last_name[0]}
                    </div>
                    {user.first_name} {user.last_name}
                  </button>
                ))
            )}
          </div>
        </>
      )}

      {/* Task list */}
      {tasks.length > 0 && (
        <ul className="divide-y divide-border">
          {tasks.map((task) => {
            const assignees = assignmentsByTaskId[task.id] ?? [];
            const unassignedUsers = users.filter((u) => !assignees.some((a) => a.id === u.id));

            return (
              <li key={task.id} className="px-4 py-4 sm:px-8 sm:py-5">
                {editingId === task.id ? (
                  /* ── Edit mode ── */
                  <div className="space-y-3">
                    <input
                      value={editForm.title}
                      onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm text-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                      placeholder="Task title"
                    />
                    <input
                      value={editForm.description}
                      onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/30"
                      placeholder="Description (optional)"
                    />
                    <div className="flex items-center gap-3 flex-wrap">
                      <select
                        value={editForm.priority}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, priority: e.target.value as TaskPriority }))
                        }
                        className="border border-border rounded-lg px-3 py-2 text-sm text-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                      >
                        {PRIORITY_OPTIONS.map((p) => (
                          <option key={p} value={p}>
                            {p.charAt(0).toUpperCase() + p.slice(1)} Priority
                          </option>
                        ))}
                      </select>
                      <input
                        type="date"
                        value={editForm.due_date}
                        onChange={(e) => setEditForm((f) => ({ ...f, due_date: e.target.value }))}
                        className="border border-border rounded-lg px-3 py-2 text-sm text-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                      />
                      <div className="flex gap-2 ml-auto">
                        <button
                          onClick={() => handleSaveEdit(task.id)}
                          disabled={isPending || !editForm.title.trim()}
                          className="px-4 py-2 text-sm bg-brand text-white rounded-lg hover:bg-brand/90 disabled:opacity-50 transition-opacity"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-4 py-2 text-sm border border-border rounded-lg text-text-muted hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ── View mode ── */
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5 group">
                    {/* Top row: checkbox + title/description */}
                    <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                      {/* Complete toggle */}
                      <button
                        onClick={() => handleToggle(task)}
                        disabled={isPending}
                        className={`w-5 h-5 mt-0.5 sm:mt-0 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                          task.is_complete
                            ? 'border-brand bg-brand'
                            : 'border-gray-300 hover:border-brand'
                        }`}
                      >
                        {task.is_complete && (
                          <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                            <path
                              d="M2 6l3 3 5-5"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </button>

                      {/* Title + description */}
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-base font-semibold ${
                            task.is_complete ? 'line-through text-text-muted' : 'text-brand'
                          }`}
                        >
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-sm text-text-muted mt-0.5">{task.description}</div>
                        )}
                      </div>
                    </div>

                    {/* Bottom row on mobile / right side on desktop: meta + assignees + actions */}
                    <div className="flex items-center gap-3 sm:gap-4 flex-wrap pl-8 sm:pl-0 shrink-0">
                      <PriorityBadge priority={task.priority} />

                      {task.due_date && (
                        <span className="text-sm text-text-muted">
                          Due{' '}
                          {new Date(task.due_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      )}

                      {/* Assignee chips + assign button */}
                      <div className="flex items-center gap-1">
                        {assignees.map((user) => (
                          <div key={user.id} className="relative group/avatar">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold select-none"
                              style={{ background: avatarColor(user.id) }}
                              title={`${user.first_name} ${user.last_name}`}
                            >
                              {user.first_name[0]}{user.last_name[0]}
                            </div>
                            {isAdmin && (
                              <button
                                onClick={() => handleUnassign(task.id, user.id)}
                                disabled={isPending}
                                title={`Remove ${user.first_name}`}
                                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full hidden group-hover/avatar:flex items-center justify-center text-[10px] leading-none hover:bg-red-600 transition-colors"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}

                        {/* + assign button (admin only) */}
                        {isAdmin && (
                          <button
                            onClick={(e) => {
                              if (assignDropdownId === task.id) {
                                setAssignDropdownId(null);
                                setDropdownPos(null);
                              } else {
                                const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                                setDropdownPos({
                                  top: rect.bottom + 6,
                                  right: window.innerWidth - rect.right,
                                });
                                setAssignDropdownId(task.id);
                              }
                            }}
                            title="Assign user"
                            className="w-7 h-7 rounded-full border-2 border-dashed border-gray-300 hover:border-brand flex items-center justify-center text-gray-400 hover:text-brand transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                              <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Edit / Delete — always visible on mobile, hover-only on desktop */}
                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(task)}
                          className="p-2.5 rounded-md text-text-muted hover:text-brand hover:bg-brand-pale transition-colors"
                          title="Edit task"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-6 h-6">
                            <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.263a1.75 1.75 0 0 0 0-2.474ZM3.75 14A1.75 1.75 0 0 1 2 12.25v-8.5C2 2.784 2.784 2 3.75 2H7a.75.75 0 0 1 0 1.5H3.75a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25V9a.75.75 0 0 1 1.5 0v3.25A1.75 1.75 0 0 1 12.25 14h-8.5Z" />
                          </svg>
                        </button>

                        {confirmDeleteId === task.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(task.id)}
                              disabled={isPending}
                              className="px-2 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 text-xs border border-border rounded-md text-text-muted hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(task.id)}
                            className="p-2.5 rounded-md text-text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete task"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-6 h-6">
                              <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Add task inline form / button */}
      {isAdding ? (
        <form
          ref={addFormRef}
          action={handleAdd}
          className="px-4 py-4 sm:px-8 sm:py-5 border-t border-border bg-gray-50 space-y-3"
        >
          <input type="hidden" name="deal_id" value={dealId} />
          <input type="hidden" name="deal_stage" value={stage} />
          <input
            name="title"
            required
            autoFocus
            placeholder="Task title"
            className="w-full border border-border rounded-lg px-3 py-2 text-sm text-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <input
            name="description"
            placeholder="Description (optional)"
            className="w-full border border-border rounded-lg px-3 py-2 text-sm text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <div className="flex items-center gap-3 flex-wrap">
            <select
              name="priority"
              defaultValue="medium"
              className="border border-border rounded-lg px-3 py-2 text-sm text-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)} Priority
                </option>
              ))}
            </select>
            <input
              type="date"
              name="due_date"
              className="border border-border rounded-lg px-3 py-2 text-sm text-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
            <div className="flex gap-2 ml-auto">
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 text-sm bg-brand text-white rounded-lg hover:bg-brand/90 disabled:opacity-50 transition-opacity"
              >
                Add Task
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-sm border border-border rounded-lg text-text-muted hover:bg-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="px-4 py-3 sm:px-8 sm:py-4 border-t border-border">
          <button
            onClick={() => {
              setIsAdding(true);
              setEditingId(null);
              setConfirmDeleteId(null);
              setAssignDropdownId(null);
            }}
            className="flex items-center gap-2 text-sm text-text-muted hover:text-brand transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
              <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
            </svg>
            Add Task
          </button>
        </div>
      )}
    </div>
  );
}
