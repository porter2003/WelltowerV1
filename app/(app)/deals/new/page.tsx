import Link from 'next/link';
import { createDeal } from '../actions';
import type { DealStage } from '@/lib/types';

const STAGES: DealStage[] = ['Due Diligence', 'Entitlements', 'Construction', 'Closeout'];

const inputClass =
  'w-full border-b border-dashed border-gray-300 focus:border-brand focus:border-solid px-0 py-2 text-base text-brand bg-transparent outline-none placeholder:text-text-muted transition-colors';

const labelClass = 'block text-[13px] font-semibold text-brand mb-1.5';

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
          <input name="name" required placeholder="e.g. Harvest Ridge" className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>City</label>
            <input name="city" required placeholder="e.g. Meridian" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>State</label>
            <input name="state" required maxLength={2} placeholder="e.g. ID" className={inputClass} style={{ textTransform: 'uppercase' }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>County <span className="font-normal text-text-muted">(optional)</span></label>
            <input name="county" placeholder="e.g. Ada County" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Unit Count</label>
            <input name="unit_count" type="number" min="1" required placeholder="e.g. 200" className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Stage</label>
            <select name="stage" className={inputClass}>
              {STAGES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Partner</label>
            <input value="Welltower" readOnly className={`${inputClass} cursor-default text-text-muted`} />
          </div>
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
