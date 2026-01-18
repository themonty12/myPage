# Vercel + Supabase setup

## 1) Supabase project
- Create a new project in Supabase.
- Create a table for archives:

```sql
create table if not exists public.archives (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
```

## 2) Environment variables
Local dev: create `.env.local` with:

```
ARCHIVE_STORAGE=supabase
SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Vercel: set the same env vars in Project Settings -> Environment Variables.

## 3) Deploy to Vercel
- Import the Git repository.
- Framework: Next.js (auto-detected).
- Build command: `next build`
- Output: default (Next.js)

## Notes
- `SUPABASE_SERVICE_ROLE_KEY` must be server-side only. Do not expose it to the client.
- The app uses `/api/archive` to read/write the data.
