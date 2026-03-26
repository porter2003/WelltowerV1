export type UserRole = 'admin' | 'member' | 'partner';

export type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
};

export type DealStage = 'Due Diligence' | 'Entitlements' | 'Construction' | 'Closeout';

export type Deal = {
  id: string;
  name: string;
  partner: string;
  city: string;
  state: string;
  county?: string;
  unit_count: number;
  stage: DealStage;
  start_date: string;
  target_completion_date: string;
  is_archived?: boolean;
};

export type TaskPriority = 'low' | 'medium' | 'high';

export type Task = {
  id: string;
  deal_id: string;
  title: string;
  description?: string;
  deal_stage: DealStage;
  priority: TaskPriority;
  sort_order?: number | null;
  start_date?: string;
  due_date?: string;
  doc_link?: string;
  is_complete: boolean;
  completed_at?: string;
  created_at: string;
};

export type TaskFile = {
  id: string;
  task_id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_by: string | null;
  uploaded_at: string;
};

export type TaskAssignment = {
  task_id: string;
  user_id: string;
};

export type ActivityAction = 'completed' | 'reassigned' | 'created' | 'updated';

export type ActivityLog = {
  id: string;
  task_id: string;
  user_id: string;
  action: ActivityAction;
  timestamp: string;
};

export type TaskTemplate = {
  id: string;
  title: string;
  description?: string;
  deal_stage: DealStage;
  priority: TaskPriority;
  sort_order: number;
  default_start_offset_days: number;
  default_duration_days: number;
  created_at: string;
};

export type ReferenceFile = {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_by: string | null;
  uploaded_at: string;
};

export type AccessRequest = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  message?: string;
  requested_at: string;
};
