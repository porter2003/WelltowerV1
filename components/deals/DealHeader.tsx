'use client';

import { useState, useTransition } from 'react';
import { StageBadge } from '@/components/ui/Badge';
import { updateDeal, deleteDeal } from '@/app/(app)/deals/actions';
import type { Deal, DealStage } from '@/lib/types';

const STAGES: DealStage[] = ['Due Diligence', 'Entitlements', 'Construction', 'Closeout'];

type Props = {
  deal: Deal;
  pct: number;
  isAdmin: boolean;
};

type EditForm = {
  name: string;
  city: string;
  state: string;
  county: string;
  unit_count: string;
  stage: DealStage;
  start_date: string;
  target_completion_date: string;
};

// 0 = idle, 1 = first warning, 2 = second warning (name confirmation)
type DeleteStep = 0 | 1 | 2;

function toDateInput(iso: string) {
  return iso.slice(0, 10);
}

export function DealHeader({ deal, pct, isAdmin }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [deleteStep, setDeleteStep] = useState<DeleteStep>(0);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [form, setForm] = useState<EditForm>({
    name: deal.name,
    city: deal.city,
    state: deal.state,
    county: deal.county ?? '',
    unit_count: String(deal.unit_count),
    stage: deal.stage,
    start_date: toDateInput(deal.start_date),
    target_completion_date: toDateInput(deal.target_completion_date),
  });
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      await updateDeal(deal.id, {
        name: form.name,
        city: form.city,
        state: form.state,
        county: form.county,
        unit_count: parseInt(form.unit_count, 10),
        stage: form.stage,
        start_date: form.start_date,
        target_completion_date: form.target_completion_date,
      });
      setIsEditing(false);
    });
  }

  function handleCancel() {
    setForm({
      name: deal.name,
      city: deal.city,
      state: deal.state,
      county: deal.county ?? '',
      unit_count: String(deal.unit_count),
      stage: deal.stage,
      start_date: toDateInput(deal.start_date),
      target_completion_date: toDateInput(deal.target_completion_date),
    });
    setIsEditing(false);
  }

  function handleDeleteConfirm() {
    startTransition(() => deleteDeal(deal.id));
  }

  function resetDelete() {
    setDeleteStep(0);
    setDeleteConfirmName('');
  }

  const field = (label: string, children: React.ReactNode) => (
    <div>
      <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-[0.5px] mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );

  const input = (key: keyof EditForm, props?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      value={form[key]}
      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
      className="w-full border border-border rounded-lg px-3 py-2 text-sm text-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
      {...props}
    />
  );

  return (
    <div className="bg-surface border border-border rounded-xl p-4 sm:p-8 mb-8 shadow-sm">
      {isEditing ? (
        /* ── Edit mode ── */
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {field('Project Name', input('name', { placeholder: 'Project name' }))}
            {field(
              'Stage',
              <select
                value={form.stage}
                onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value as DealStage }))}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm text-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {field('City', input('city', { placeholder: 'City' }))}
            {field('State', input('state', { placeholder: 'ID', maxLength: 2 }))}
            {field('County (optional)', input('county', { placeholder: 'e.g. Ada County' }))}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {field('Unit Count', input('unit_count', { type: 'number', min: '1', placeholder: '150' }))}
            {field('Start Date', input('start_date', { type: 'date' }))}
            {field('Target Completion', input('target_completion_date', { type: 'date' }))}
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-border">
            <button
              onClick={handleSave}
              disabled={isPending || !form.name.trim() || !form.city.trim() || !form.state.trim()}
              className="px-5 py-2 text-sm bg-brand text-white rounded-lg hover:bg-brand/90 disabled:opacity-50 transition-opacity"
            >
              {isPending ? 'Saving…' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              className="px-5 py-2 text-sm border border-border rounded-lg text-text-muted hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : deleteStep === 1 ? (
        /* ── Delete warning step 1 ── */
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-red-600 shrink-0 mt-0.5">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-semibold text-red-800 text-sm">Warning: This action is permanent</p>
              <p className="text-red-700 text-sm mt-1">
                You are about to delete <strong>{deal.name}</strong> and all of its tasks.
                This cannot be undone. There is no way to recover this data.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDeleteStep(2)}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              I understand — continue to final confirmation
            </button>
            <button
              onClick={resetDelete}
              className="px-4 py-2 text-sm border border-border rounded-lg text-text-muted hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : deleteStep === 2 ? (
        /* ── Delete warning step 2 — name confirmation ── */
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-red-600 shrink-0 mt-0.5">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="font-semibold text-red-800 text-sm">Final confirmation required</p>
              <p className="text-red-700 text-sm mt-1 mb-3">
                This is your last chance. Type the deal name exactly to permanently delete it.
              </p>
              <p className="text-xs font-mono text-red-600 mb-2">Type: {deal.name}</p>
              <input
                value={deleteConfirmName}
                onChange={(e) => setDeleteConfirmName(e.target.value)}
                placeholder="Type deal name here"
                className="w-full border border-red-300 rounded-lg px-3 py-2 text-sm text-brand focus:outline-none focus:ring-2 focus:ring-red-300 bg-white"
                autoFocus
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDeleteConfirm}
              disabled={isPending || deleteConfirmName !== deal.name}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? 'Deleting…' : 'Permanently Delete Deal'}
            </button>
            <button
              onClick={resetDelete}
              className="px-4 py-2 text-sm border border-border rounded-lg text-text-muted hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* ── View mode ── */
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-brand">{deal.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-base text-text-muted">
                <span>{deal.partner}</span>
                <span>·</span>
                <span>{deal.city + ', ' + deal.state}</span>
                {deal.county && <><span>·</span><span>{deal.county}</span></>}
                <span>·</span>
                <span>{deal.unit_count} Units</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StageBadge stage={deal.stage} />
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border rounded-lg text-text-muted hover:text-brand hover:border-brand hover:bg-brand-pale transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.263a1.75 1.75 0 0 0 0-2.474ZM3.75 14A1.75 1.75 0 0 1 2 12.25v-8.5C2 2.784 2.784 2 3.75 2H7a.75.75 0 0 1 0 1.5H3.75a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25V9a.75.75 0 0 1 1.5 0v3.25A1.75 1.75 0 0 1 12.25 14h-8.5Z" />
                </svg>
                Edit
              </button>
              {isAdmin && (
                <button
                  onClick={() => setDeleteStep(1)}
                  title="Delete deal"
                  className="flex items-center px-3 py-1.5 text-sm border border-border rounded-lg text-text-muted hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                    <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-8 pt-6 border-t border-border">
            <div>
              <div className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.5px] mb-1.5">
                Start Date
              </div>
              <div className="text-brand font-semibold text-base">
                {new Date(deal.start_date).toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
                })}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.5px] mb-1.5">
                Target Completion
              </div>
              <div className="text-brand font-semibold text-base">
                {new Date(deal.target_completion_date).toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
                })}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.5px] mb-2">
                Task Progress
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: '#003D79' }} />
                </div>
                <span className="text-brand font-semibold text-sm shrink-0">{pct}%</span>
              </div>
            </div>
          </div>

        </>
      )}
    </div>
  );
}
