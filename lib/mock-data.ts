import type { User, Deal, Task, TaskAssignment, ActivityLog } from './types';

export const USERS: User[] = [
  { id: 'u1', first_name: 'Sarah', last_name: 'Mitchell', email: 'smitchell@brighton.com', role: 'admin', is_active: true },
  { id: 'u2', first_name: 'James', last_name: 'Larsen', email: 'jlarsen@brighton.com', role: 'member', is_active: true },
  { id: 'u3', first_name: 'Priya', last_name: 'Nair', email: 'pnair@brighton.com', role: 'member', is_active: true },
  { id: 'u4', first_name: 'Tom', last_name: 'Whitfield', email: 'twhitfield@brighton.com', role: 'member', is_active: true },
  { id: 'u5', first_name: 'Dana', last_name: 'Reeves', email: 'dreeves@brighton.com', role: 'member', is_active: false },
];

export const DEALS: Deal[] = [
  {
    id: 'd1',
    name: 'Meridian Ridge',
    partner: 'Welltower',
    city: 'Meridian',
    state: 'ID',
    unit_count: 210,
    stage: 'Construction',
    start_date: '2025-03-01',
    target_completion_date: '2026-09-30',
  },
  {
    id: 'd2',
    name: 'Eagle Bluff',
    partner: 'Welltower',
    city: 'Eagle',
    state: 'ID',
    unit_count: 175,
    stage: 'Entitlements',
    start_date: '2025-07-15',
    target_completion_date: '2027-02-28',
  },
  {
    id: 'd3',
    name: 'Nampa Crossroads',
    partner: 'Welltower',
    city: 'Nampa',
    state: 'ID',
    unit_count: 240,
    stage: 'Due Diligence',
    start_date: '2026-01-10',
    target_completion_date: '2027-12-31',
  },
  {
    id: 'd4',
    name: 'Boise Heights',
    partner: 'Welltower',
    city: 'Boise',
    state: 'ID',
    unit_count: 190,
    stage: 'Closeout',
    start_date: '2024-01-15',
    target_completion_date: '2026-04-30',
  },
];

export const TASKS: Task[] = [
  // Meridian Ridge (d1) — Construction
  { id: 't1', deal_id: 'd1', title: 'Finalize GC contract', deal_stage: 'Construction', priority: 'high', due_date: '2026-03-20', is_complete: false, created_at: '2026-01-05T09:00:00Z' },
  { id: 't2', deal_id: 'd1', title: 'Submit building permit application', deal_stage: 'Construction', priority: 'high', due_date: '2026-03-15', is_complete: true, completed_at: '2026-03-10T14:22:00Z', created_at: '2026-01-05T09:00:00Z' },
  { id: 't3', deal_id: 'd1', title: 'Schedule framing inspection', deal_stage: 'Construction', priority: 'medium', due_date: '2026-04-01', is_complete: false, created_at: '2026-01-05T09:00:00Z' },
  { id: 't4', deal_id: 'd1', title: 'Complete Phase 1 environmental review', deal_stage: 'Due Diligence', priority: 'high', due_date: '2025-05-01', is_complete: true, completed_at: '2025-04-28T11:00:00Z', created_at: '2025-03-01T09:00:00Z' },

  // Eagle Bluff (d2) — Entitlements
  { id: 't5', deal_id: 'd2', title: 'Submit rezone application', deal_stage: 'Entitlements', priority: 'high', due_date: '2026-04-10', is_complete: false, created_at: '2025-08-01T09:00:00Z' },
  { id: 't6', deal_id: 'd2', title: 'Attend planning commission hearing', deal_stage: 'Entitlements', priority: 'high', due_date: '2026-05-15', is_complete: false, created_at: '2025-08-01T09:00:00Z' },
  { id: 't7', deal_id: 'd2', title: 'Order title report', deal_stage: 'Due Diligence', priority: 'medium', due_date: '2025-09-01', is_complete: true, completed_at: '2025-08-29T16:00:00Z', created_at: '2025-07-15T09:00:00Z' },

  // Nampa Crossroads (d3) — Due Diligence
  { id: 't8', deal_id: 'd3', title: 'Execute LOI with landowner', deal_stage: 'Due Diligence', priority: 'high', due_date: '2026-03-25', is_complete: false, created_at: '2026-01-10T09:00:00Z' },
  { id: 't9', deal_id: 'd3', title: 'Commission survey', deal_stage: 'Due Diligence', priority: 'medium', due_date: '2026-04-15', is_complete: false, created_at: '2026-01-10T09:00:00Z' },

  // Boise Heights (d4) — Closeout
  { id: 't10', deal_id: 'd4', title: 'Obtain certificate of occupancy', deal_stage: 'Closeout', priority: 'high', due_date: '2026-03-30', is_complete: false, created_at: '2026-02-01T09:00:00Z' },
  { id: 't11', deal_id: 'd4', title: 'Final punch list walk', deal_stage: 'Closeout', priority: 'medium', due_date: '2026-04-10', is_complete: false, created_at: '2026-02-01T09:00:00Z' },
  { id: 't12', deal_id: 'd4', title: 'Close construction loan', deal_stage: 'Closeout', priority: 'high', due_date: '2026-04-25', is_complete: false, created_at: '2026-02-01T09:00:00Z' },
];

export const TASK_ASSIGNMENTS: TaskAssignment[] = [
  { task_id: 't1', user_id: 'u2' },
  { task_id: 't2', user_id: 'u2' },
  { task_id: 't3', user_id: 'u3' },
  { task_id: 't4', user_id: 'u1' },
  { task_id: 't5', user_id: 'u1' },
  { task_id: 't6', user_id: 'u1' },
  { task_id: 't7', user_id: 'u4' },
  { task_id: 't8', user_id: 'u3' },
  { task_id: 't9', user_id: 'u4' },
  { task_id: 't10', user_id: 'u2' },
  { task_id: 't11', user_id: 'u3' },
  { task_id: 't12', user_id: 'u1' },
];

export const ACTIVITY_LOG: ActivityLog[] = [
  { id: 'a1', task_id: 't2', user_id: 'u2', action: 'completed', timestamp: '2026-03-10T14:22:00Z' },
  { id: 'a2', task_id: 't4', user_id: 'u1', action: 'completed', timestamp: '2025-04-28T11:00:00Z' },
  { id: 'a3', task_id: 't7', user_id: 'u4', action: 'completed', timestamp: '2025-08-29T16:00:00Z' },
];

// Helpers
export function getDealById(id: string): Deal | undefined {
  return DEALS.find((d) => d.id === id);
}

export function getTasksForDeal(dealId: string): Task[] {
  return TASKS.filter((t) => t.deal_id === dealId);
}

export function getAssigneesForTask(taskId: string): User[] {
  const userIds = TASK_ASSIGNMENTS.filter((a) => a.task_id === taskId).map((a) => a.user_id);
  return USERS.filter((u) => userIds.includes(u.id));
}

export function getUserById(id: string): User | undefined {
  return USERS.find((u) => u.id === id);
}
