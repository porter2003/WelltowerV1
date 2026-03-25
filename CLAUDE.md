# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Brighton — Welltower Partnership Management Tool

## Project Overview

Internal web app for Brighton Corporation to manage its Welltower build-to-rent (BTR) partnerships. Brighton targets ~3 Welltower projects per year (150–250 single-family units each). The app centralizes deal tracking, task management, and team coordination across all active projects.

Internal use only. 5–10 Brighton staff users. No external access at launch.

---

## Current Phase: Phase 2 (Auth + Database Active)

Supabase auth and database are fully integrated. The app uses real data, cookie-based sessions, and server actions for all mutations.

- Mock data in `lib/mock-data.ts` is retained but not used in production routes
- All pages are protected by `middleware.ts` — unauthenticated users are redirected to `/login`
- File attachments via Supabase Storage are fully implemented (bucket: `task-files`)
- Remaining Phase 3 work: comments on tasks, notifications, partner access

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, server components, server actions)
- **Language:** TypeScript 5 — strict mode, no `any` types
- **Styling:** Tailwind CSS v4 (`@theme` custom properties in `globals.css`) — no custom CSS files
- **Database/Auth:** Supabase (Postgres + Auth + `@supabase/ssr` for cookie sessions)
- **Drag & Drop:** `@dnd-kit` (core, sortable, utilities)
- **Hosting (Phase 3):** Vercel
- **Version Control:** GitHub

---

## Dev Commands

```bash
npm run dev       # Start local dev server (localhost:3000)
npm run build     # Production build
npm run lint      # ESLint check
npm run typecheck # TypeScript type check (tsc --noEmit)
```

---

## Application Structure

### Routes

| Route | Description |
|---|---|
| `/` | Dashboard — all active deals with status, unit count, key dates, task progress |
| `/deals/[id]` | Deal detail — tasks organized by stage with drag-drop, assignments, file attachments |
| `/deals/new` | Create a new deal (auto-creates tasks from templates) |
| `/admin/users` | Team management — invite users, approve access requests, manage roles |
| `/admin/default-tasks` | Manage task templates applied to new deals |
| `/profile` | Edit current user's profile |
| `/login` | Login / request access |
| `/auth/confirm` | Invite link verification (handles code, token hash, and hash-fragment flows) |
| `/auth/set-password` | Password setup after invite |
| `/auth/callback` | Supabase OAuth callback |

### Route Group: `(app)`

Protected routes live under `app/(app)/`. The layout at `app/(app)/layout.tsx` fetches the current user/profile from Supabase and renders `<TopNav />`. The middleware enforces auth before any of these routes are reached.

### Deal Stages (task organization within each deal)
`Due Diligence` → `Entitlements` → `Construction` → `Closeout`

---

## Environment Variables

Required in `.env.local` (no `.env.example` exists):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # server-only, used by supabase-admin.ts
NEXT_PUBLIC_APP_URL=            # defaults to https://welltower-v1.vercel.app (used in invite redirect URLs)
```

---

## Data Model

Defined in `lib/types.ts`. The TypeScript `Database` type (for typed Supabase queries) is in `lib/supabase.ts`.

> **Note:** `supabase/schema.sql` is stale — it's missing tables (`task_files`, `task_templates`, `access_requests`) and has outdated column names. Treat the Supabase dashboard as the source of truth for the live schema.

```ts
type UserRole = 'admin' | 'member' | 'partner';

type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
};

type DealStage = 'Due Diligence' | 'Entitlements' | 'Construction' | 'Closeout';

type Deal = {
  id: string;
  name: string;
  partner: string;
  city: string;
  state: string;
  county?: string;
  unit_count: number;
  stage: DealStage;
  start_date: string;       // ISO date
  target_completion_date: string; // ISO date
};

type TaskPriority = 'low' | 'medium' | 'high';

type Task = {
  id: string;
  deal_id: string;
  title: string;
  description?: string;
  deal_stage: DealStage;
  priority: TaskPriority;
  sort_order?: number;
  start_date?: string;
  due_date?: string;
  doc_link?: string;
  is_complete: boolean;
  completed_at?: string;
  created_at: string;
};

type TaskFile = {
  id: string;
  task_id: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  uploaded_by?: string;
  uploaded_at: string;
};

type TaskAssignment = { task_id: string; user_id: string; };

type ActivityLog = {
  id: string;
  task_id: string;
  user_id: string;
  action: 'completed' | 'reassigned' | 'created' | 'updated';
  timestamp: string;
};

type TaskTemplate = {
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

type AccessRequest = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  message?: string;
  requested_at: string;
};
```

---

## Authentication Flow

1. **Login** → `/login` (email/password or request access)
2. **Invite email** → Supabase sends link; `/auth/confirm` handles code exchange, token hash, or hash-fragment tokens
3. **Set password** → `/auth/set-password`
4. **Middleware** → `middleware.ts` checks session on every request; allows `/auth/*` without auth
5. **Session** → Cookie-based via `@supabase/ssr`; middleware refreshes cookies on every request

**Middleware redirect logic (3-way):**
- No session + not on `/login` or `/auth/*` → redirect to `/login`
- Session exists + `user_metadata.password_set === false` + not on `/auth/*` → force redirect to `/auth/set-password` (traps incomplete invites)
- Session exists + on `/login` → redirect to `/`

The `password_set` flag is written to `user_metadata` by the `inviteUser()` server action and cleared once the user sets a password.

**Supabase clients — when to use each:**
- `lib/supabase-server.ts` — server components and server actions (cookie-aware, use for all standard queries)
- `lib/supabase-admin.ts` — admin-only operations: `inviteUserByEmail`, `deleteUser`, upserts on profiles (uses `SUPABASE_SERVICE_ROLE_KEY`)
- `lib/supabase-browser.ts` — client components only; also used in `TaskFiles` for direct Storage access

---

## Server Actions Pattern

All data mutations use Next.js server actions (`'use server'`). After mutations, call `revalidatePath()` to refresh the cache. Actions are co-located with their routes:

- `app/(app)/deals/actions.ts` — deal CRUD, task CRUD, toggle/reorder tasks, task assignments
- `app/(app)/admin/actions.ts` — user management, invite/approve
- `app/(app)/admin/default-tasks/actions.ts` — template CRUD
- `app/(app)/profile/actions.ts` — profile updates
- `app/login/actions.ts` — login

---

## Coding Conventions

- **Named exports** for all components — no default exports
- **Functional React components** with hooks
- **Server components** preferred — mark client components explicitly with `'use client'`
- **Co-locate** component files: `/components/deals/DealCard.tsx`, etc.
- **No magic strings** — use the defined union types (`DealStage`, `TaskPriority`, `UserRole`)
- **No `any` types** — strict TypeScript throughout
- **`useTransition()`** for loading states in client components that trigger server actions
- **Date parsing:** Always parse ISO date strings as `new Date(isoString + 'T00:00:00')` — appending the time prevents UTC offset from shifting the displayed date by one day

---

## Styling

Tailwind v4 is configured via PostCSS (`postcss.config.mjs`). The `@theme` block in `app/globals.css` defines the full color palette — use these tokens, not raw hex values:

**Brand blues:** `brand` (#003D79), `brand-dark`, `brand-deep`, `brand-mid`, `brand-alt`
**Brand light:** `brand-pale` (#e8f0f8, used for light backgrounds), `brand-100`
**Semantic:** `surface` (white), `border`, `text-muted`
**Gray palette:** `gray-50` through `gray-900`

Per the style guide, use brand blues throughout. Reserve red (`red-600`, `red-700`) only for destructive actions (delete confirmations). Base font size is 14px; max-width container is 1400px.

---

## Folder Structure

```
/app
  /login
  /auth/callback, /auth/confirm, /auth/set-password
  /(app)               # Protected routes — layout fetches user + renders TopNav
    /page.tsx          # Dashboard
    /deals/[id]
    /deals/new
    /admin/users
    /admin/default-tasks
    /profile
/components
  /ui                  # Badge.tsx (StageBadge, PriorityBadge), TopNav.tsx
  /auth                # LoginCard, LoginForm, RequestAccessForm
  /deals               # DealHeader (inline edit + delete with confirmation)
  /tasks               # TaskStageSection (dnd-kit, assignments, inline edit), TaskFiles
  /admin               # UsersPageClient, InviteUserForm, DefaultTasksClient
  /profile             # ProfileForm
/lib
  /types.ts            # All TypeScript types
  /mock-data.ts        # Sample data (retained, not used in active routes)
  /avatar.ts           # Deterministic avatar color from user ID
  /supabase-server.ts
  /supabase-browser.ts
  /supabase-admin.ts
/supabase
  /schema.sql          # Postgres schema
/public                # brighton-logo.png, welltower-logo.png
/docs                  # Brand assets + style guide PDF
```

---

## Future Phases

- **Phase 3 — Comments:** Comment threads on tasks
- **Phase 3 — Notifications:** Alerts when tasks are assigned
- **Phase 3 — Partner Access:** Welltower external login with restricted visibility (`partner` role already in schema)
