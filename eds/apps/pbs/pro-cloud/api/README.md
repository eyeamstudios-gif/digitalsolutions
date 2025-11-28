# PBS Pro+ Cloud API Setup

This folder contains placeholders for connecting the Pro+ Cloud app to a backend. Choose one provider and configure locally. Do not commit real keys.

Options:
- Supabase (recommended for Postgres + Auth)
- Firebase (Auth + Firestore)

## Quick start

1) Copy `config.example.js` to `config.js` in this folder
2) Set `window.PBS_CLOUD_CONFIG` to your provider and keys
3) Open `pro-cloud/app.html` and verify the status banner

Example config.js for Supabase:

```js
window.PBS_CLOUD_CONFIG = {
  provider: 'supabase',
  url: 'https://YOUR-PROJECT.supabase.co',
  anonKey: 'YOUR-ANON-KEY',
  projectId: 'YOUR-PROJECT-ID'
};
```

## Supabase database and auth

1) In your Supabase project, enable Email/Password auth (Authentication → Providers → Email).
2) Create the table `pbs_budgets` using SQL (SQL Editor):

```sql
create table if not exists public.pbs_budgets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- Row Level Security
alter table public.pbs_budgets enable row level security;

-- Allow users to read/write only their own record
create policy "pbs_budgets_self_select" on public.pbs_budgets
  for select using ( auth.uid() = user_id );
create policy "pbs_budgets_self_upsert" on public.pbs_budgets
  for insert with check ( auth.uid() = user_id );
create policy "pbs_budgets_self_update" on public.pbs_budgets
  for update using ( auth.uid() = user_id ) with check ( auth.uid() = user_id );
```

That’s it. The app will upsert a single JSON blob per user and restore it on demand.

Example config.js for Firebase:

```js
window.PBS_CLOUD_CONFIG = {
  provider: 'firebase',
  apiKey: 'YOUR-API-KEY',
  authDomain: 'your-app.firebaseapp.com',
  projectId: 'your-project-id'
};
```

Security notes:
- Do not commit config.js with real secrets
- For production, load keys from environment at build/deploy time
- Consider using auth flows and RLS rules (Supabase) or Firestore rules (Firebase)
