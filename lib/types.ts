export type UserRole = 'admin' | 'member' | 'partner';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
};

export type DealStage = 'Due Diligence' | 'Entitlements' | 'Construction' | 'Closeout';

export type Deal = {
  id: string;
  name: string;
  partner: string;
  location: string;
  unit_count: number;
  stage: DealStage;
  start_date: string;
  target_completion_date: string;
};

export type TaskPriority = 'low' | 'medium' | 'high';

export type Task = {
  id: string;
  deal_id: string;
  title: string;
  description?: string;
  deal_stage: DealStage;
  priority: TaskPriority;
  due_date?: string;
  is_complete: boolean;
  completed_at?: string;
  created_at: string;
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
