import type { DealStage, TaskPriority } from '@/lib/types';

// Blues + grays only — no red/green/amber per Brighton style guide
const STAGE_STYLES: Record<DealStage, string> = {
  'Due Diligence': 'bg-brand-pale text-brand',
  'Entitlements':  'bg-brand-pale text-brand-mid',
  'Construction':  'bg-gray-200 text-gray-800',
  'Closeout':      'bg-brand text-white',
};

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  low:    'bg-gray-100 text-gray-500',
  medium: 'bg-brand-pale text-brand-mid',
  high:   'bg-brand text-white',
};

type StageBadgeProps = { stage: DealStage };
export function StageBadge({ stage }: StageBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STAGE_STYLES[stage]}`}>
      {stage}
    </span>
  );
}

type PriorityBadgeProps = { priority: TaskPriority };
export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${PRIORITY_STYLES[priority]}`}>
      {priority}
    </span>
  );
}
