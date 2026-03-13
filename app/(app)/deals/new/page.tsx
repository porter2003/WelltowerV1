import Link from 'next/link';
import { createDeal } from '../actions';
import type { DealStage } from '@/lib/types';

const STAGES: DealStage[] = ['Due Diligence', 'Entitlements', 'Construction', 'Closeout'];

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
];

const inputClass =
  'w-full border-b border-dashed border-gray-300 focus:border-brand focus:border-solid px-0 py-2 text-base text-brand bg-transparent outline-none placeholder:text-text-muted transition-colors';

const labelClass = 'block text-base font-semibold text-brand mb-1.5';

export default function NewDealPage() {
  return (
    <div className="max-w-2xl">
      <div className="text-base text-text-muted mb-6">
        <Link href="/" className="hover:text-brand transition-colors">Dashboard</Link>
        <span className="mx-2 text-gray-300">/</span>
        <span className="text-brand">New Deal</span>
      </div>

      <h1 className="text-3xl font-extrabold text-brand mb-8">Add New Deal</h1>

      <form action={createDeal} className="bg-surface border border-border rounded-xl p-8 shadow-sm space-y-6">

        <div>
          <label className={labelClass}>Deal Name</label>
          <input name="name" required className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>City</label>
            <input name="city" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>State</label>
            <select name="state" required className={inputClass}>
              <option value="">— Select —</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>County <span className="font-normal text-text-muted">(optional)</span></label>
            <input name="county" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Unit Count</label>
            <input name="unit_count" type="number" min="1" required className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Stage</label>
          <select name="stage" className={inputClass}>
            {STAGES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Start Date</label>
            <input name="start_date" type="date" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Target Completion</label>
            <input name="target_completion_date" type="date" required className={inputClass} />
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2 border-t border-border">
          <button type="submit" className="text-base font-semibold px-5 py-2.5 rounded-lg text-white transition-opacity hover:opacity-90" style={{ background: '#003D79' }}>
            Save Deal
          </button>
          <Link href="/" className="text-base text-text-muted hover:text-brand transition-colors">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
