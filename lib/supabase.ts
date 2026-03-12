import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

type DealStage = 'Due Diligence' | 'Entitlements' | 'Construction' | 'Closeout';

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row:    { id: string; first_name: string; last_name: string; email: string; role: 'admin' | 'member' | 'partner'; is_active: boolean; created_at: string };
        Insert: { id: string; first_name: string; last_name: string; email: string; role?: 'admin' | 'member' | 'partner'; is_active?: boolean };
        Update: { first_name?: string; last_name?: string; email?: string; role?: 'admin' | 'member' | 'partner'; is_active?: boolean };
        Relationships: [];
      };
      deals: {
        Row:    { id: string; name: string; partner: string; city: string; state: string; county: string | null; unit_count: number; stage: DealStage; start_date: string; target_completion_date: string; created_at: string };
        Insert: { id?: string; name: string; partner?: string; city: string; state: string; county?: string | null; unit_count: number; stage?: DealStage; start_date: string; target_completion_date: string };
        Update: { name?: string; partner?: string; city?: string; state?: string; county?: string | null; unit_count?: number; stage?: DealStage; start_date?: string; target_completion_date?: string };
        Relationships: [];
      };
      tasks: {
        Row:    { id: string; deal_id: string; title: string; description: string | null; deal_stage: DealStage; priority: 'low' | 'medium' | 'high'; due_date: string | null; is_complete: boolean; completed_at: string | null; created_at: string };
        Insert: { id?: string; deal_id: string; title: string; description?: string | null; deal_stage: DealStage; priority?: 'low' | 'medium' | 'high'; due_date?: string | null; is_complete?: boolean; completed_at?: string | null };
        Update: { title?: string; description?: string | null; deal_stage?: DealStage; priority?: 'low' | 'medium' | 'high'; due_date?: string | null; is_complete?: boolean; completed_at?: string | null };
        Relationships: [];
      };
      task_assignments: {
        Row:    { task_id: string; user_id: string };
        Insert: { task_id: string; user_id: string };
        Update: never;
        Relationships: [];
      };
      activity_logs: {
        Row:    { id: string; task_id: string; user_id: string; action: 'completed' | 'reassigned' | 'created' | 'updated'; timestamp: string };
        Insert: { id?: string; task_id: string; user_id: string; action: 'completed' | 'reassigned' | 'created' | 'updated'; timestamp?: string };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
