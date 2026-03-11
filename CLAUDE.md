# Brighton — Welltower Partnership Management Tool

## Project Overview

Internal web app for Brighton Corporation to manage its Welltower build-to-rent (BTR) partnerships. Brighton targets ~3 Welltower projects per year (150–250 single-family units each). The app centralizes deal tracking, task management, and team coordination across all active projects.

Internal use only. 5–10 Brighton staff users. No external access at launch.

---

## Current Phase: Local Development Only

**This phase covers UI scaffolding and layout only. Do not wire up real data, authentication, or external services yet.**

- Use mock/hardcoded data in place of database calls
- Do not integrate Supabase (auth or database) in this phase
- Do not configure Vercel deployment in this phase
- Design components and data flows to be backend-ready — use realistic data shapes that match the planned schema (see Data Model below)
- All pages should be navigable locally via `npm run dev`

Future phases will add: Supabase (auth + DB + realtime), Vercel deployment, and role-based access control.

---

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript — strict mode, no `any` types
- **Styling:** Tailwind CSS utility classes only — no custom CSS files
- **Database (Phase 2):** Supabase (Postgres + Auth + Realtime)
- **Hosting (Phase 2):** Vercel
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

### Core Screens (MVP)

| Route | Description |
|---|---|
| `/` | Dashboard — all active Welltower deals with status, unit count, key dates |
| `/deals/[id]` | Deal detail — tasks organized by stage, assignees, completion status |
| `/deals/new` | Add a new deal |
| `/admin/users` | Admin screen — manage team members and roles |
| `/login` | Login screen (Phase 2 — stub for now) |

### Deal Stages (task organization within each deal)
- Due Diligence
- Entitlements
- Construction
- Closeout

*(Exact stages to be confirmed — use these as defaults for now.)*

---

## Data Model

Use these shapes for mock data. They will map directly to the Supabase schema in Phase 2.

```ts
type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'partner'; // 'partner' reserved for Phase 2
  is_active: boolean;
};

type Deal = {
  id: string;
  name: string;
  partner: string; // e.g. "Welltower" — stored for future multi-partner support
  location: string;
  unit_count: number;
  stage: 'Due Diligence' | 'Entitlements' | 'Construction' | 'Closeout';
  start_date: string; // ISO date
  target_completion_date: string; // ISO date
};

type Task = {
  id: string;
  deal_id: string;
  title: string;
  description?: string;
  deal_stage: Deal['stage'];
  priority: 'low' | 'medium' | 'high';
  due_date?: string; // ISO date
  is_complete: boolean;
  completed_at?: string; // ISO timestamp
  created_at: string;
};

type TaskAssignment = {
  task_id: string;
  user_id: string;
};

type ActivityLog = {
  id: string;
  task_id: string;
  user_id: string;
  action: 'completed' | 'reassigned' | 'created' | 'updated';
  timestamp: string; // ISO timestamp
};
```

---

## Coding Conventions

- Use **named exports** for all components, not default exports
- Use **functional React components** with hooks
- Prefer **server components** unless client interactivity is required — mark client components explicitly with `'use client'`
- Co-locate component files: `/components/deals/DealCard.tsx`, etc.
- No hardcoded user IDs or magic strings — use constants or enums
- Never commit `.env` files — use `.env.local` for any future local secrets

---

## Folder Structure (target)

```
/app                  # Next.js App Router pages and layouts
/components           # Shared UI components (organized by feature)
  /deals
  /tasks
  /users
  /ui                 # Generic reusable primitives (buttons, badges, etc.)
/lib                  # Utilities, mock data, type definitions
  /mock-data.ts       # Hardcoded sample data for local dev
  /types.ts           # Shared TypeScript types
/public               # Static assets
```

---

## Future Phases (keep in mind, do not build yet)

- **Phase 2 — Auth & Database:** Supabase login, protected routes, real data
- **Phase 2 — Realtime:** Task updates visible to all users without page refresh
- **Phase 2 — Partner Access:** Welltower external login with restricted visibility
- **Phase 3 — File Attachments:** Supabase Storage for task file uploads
- **Phase 3 — Comments:** Comment threads on tasks
- **Phase 3 — Notifications:** Alerts when tasks are assigned

The role system (`admin` / `member` / `partner`) and `partner` field on deals are included in the data model now specifically to avoid rework in Phase 2.