import { avatarColor } from '@/lib/avatar';

type ActivityEntry = {
  id: string;
  action: 'completed' | 'reassigned' | 'created' | 'updated';
  timestamp: string;
  taskTitle: string;
  userFirstName: string;
  userLastName: string;
  userId: string;
};

type Props = {
  entries: ActivityEntry[];
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function actionLabel(action: ActivityEntry['action']): string {
  switch (action) {
    case 'completed': return 'completed';
    case 'created':   return 'created';
    case 'updated':   return 'updated';
    case 'reassigned': return 'assigned';
  }
}

export function ActivityFeed({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-xl px-6 py-8 text-center text-sm text-text-muted shadow-sm">
        No activity yet — actions like completing or updating tasks will appear here.
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 sm:px-8 sm:py-4 border-b border-border bg-brand-100">
        <h2 className="font-semibold text-brand text-[11px] uppercase tracking-[0.5px]">Activity</h2>
      </div>
      <ul className="divide-y divide-border">
        {entries.map((entry) => (
          <li key={entry.id} className="px-4 py-3 sm:px-8 sm:py-4 flex items-start gap-3">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 mt-0.5"
              style={{ background: avatarColor(entry.userId) }}
            >
              {entry.userFirstName[0]}{entry.userLastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-brand">
                <span className="font-semibold">{entry.userFirstName} {entry.userLastName}</span>
                {' '}{actionLabel(entry.action)}{' '}
                <span className="font-medium">{entry.taskTitle}</span>
              </p>
            </div>
            <span className="text-[11px] text-text-muted shrink-0 mt-0.5">{relativeTime(entry.timestamp)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
