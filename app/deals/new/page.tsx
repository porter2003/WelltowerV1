'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { DealStage } from '@/lib/types';

const STAGES: DealStage[] = ['Due Diligence', 'Entitlements', 'Construction', 'Closeout'];

export default function NewDealPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    location: '',
    unit_count: '',
    stage: 'Due Diligence' as DealStage,
    start_date: '',
    target_completion_date: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Phase 2: POST to Supabase
    alert('Deal saved! (mock — no data persisted yet)');
    router.push('/');
  }

  return (
    <div className="max-w-2xl">
      {/* Breadcrumb */}
      <div className="text-sm text-text-muted mb-6">
        <Link href="/" className="hover:text-brand transition-colors">Dashboard</Link>
        <span className="mx-2 text-gray-300">/</span>
        <span className="text-brand">New Deal</span>
      </div>

      <h1 className="text-[22px] font-extrabold text-brand mb-8">Add New Deal</h1>

      <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-[13px] font-semibold text-brand mb-1.5">
              Deal Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="e.g. Meridian Ridge"
              className="w-full border-b border-dashed border-gray-300 focus:border-brand focus:border-solid px-0 py-2 text-sm text-brand bg-transparent outline-none placeholder:text-text-muted transition-colors"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-brand mb-1.5">
              Location
            </label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              placeholder="e.g. Meridian, ID"
              className="w-full border-b border-dashed border-gray-300 focus:border-brand focus:border-solid px-0 py-2 text-sm text-brand bg-transparent outline-none placeholder:text-text-muted transition-colors"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-brand mb-1.5">
              Unit Count
            </label>
            <input
              name="unit_count"
              type="number"
              min="1"
              value={form.unit_count}
              onChange={handleChange}
              required
              placeholder="e.g. 200"
              className="w-full border-b border-dashed border-gray-300 focus:border-brand focus:border-solid px-0 py-2 text-sm text-brand bg-transparent outline-none placeholder:text-text-muted transition-colors"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-brand mb-1.5">
              Stage
            </label>
            <select
              name="stage"
              value={form.stage}
              onChange={handleChange}
              className="w-full border-b border-dashed border-gray-300 focus:border-brand focus:border-solid px-0 py-2 text-sm text-brand bg-transparent outline-none transition-colors"
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-brand mb-1.5">
              Start Date
            </label>
            <input
              name="start_date"
              type="date"
              value={form.start_date}
              onChange={handleChange}
              required
              className="w-full border-b border-dashed border-gray-300 focus:border-brand focus:border-solid px-0 py-2 text-sm text-brand bg-transparent outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-brand mb-1.5">
              Target Completion
            </label>
            <input
              name="target_completion_date"
              type="date"
              value={form.target_completion_date}
              onChange={handleChange}
              required
              className="w-full border-b border-dashed border-gray-300 focus:border-brand focus:border-solid px-0 py-2 text-sm text-brand bg-transparent outline-none transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2 border-t border-border">
          <button
            type="submit"
            className="text-sm font-semibold px-5 py-2 rounded-lg text-white transition-opacity hover:opacity-90"
            style={{ background: '#003D79' }}
          >
            Save Deal
          </button>
          <Link
            href="/"
            className="text-sm text-text-muted hover:text-brand transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
