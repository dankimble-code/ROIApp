# OPS_RUNBOOK.md
Owner: Project team (Daniel + Jeremy)  
Scope: Coach Value Insight (Vite + React) app with Supabase backend and Vercel hosting.

This runbook covers **Supabase migrations + verification** for the app. It is designed to be executed by a human or by Codex CLI inside guardrails.

---

## Principles

- **No secrets in git.** Never commit `.env`, `.env.local`, connection strings, or API keys.
- **Use session pooler for DB ops** when direct DB hostnames fail to resolve.
- **Stop on first error** when applying migrations. Diagnose and fix, then resume.
- Prefer **idempotent migrations** (safe to rerun) in environments where partial applies are possible.
- Keep production stable: make changes in a controlled order, verify at each checkpoint.

---

## Environment inventory

### Vercel (Daniel’s team project)
Required env vars (Production and Preview):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY` (anon/public or legacy anon JWT, depending on project)
- `VITE_SUPABASE_PROJECT_ID` (optional if app references it)

Vite build/output:
- Build: `npm run build`
- Output: `dist`

### Supabase (Daniel’s org/project)
- Auth redirect URLs must match the production domain (email confirmation flow).
- DB schema is defined by the repo migrations under `supabase/migrations`.

---

## File layout

- Repo migrations: `supabase/migrations/*.sql`
- Local ops folder (not in git): `~/supabase-migrate/`  
  Contains `.env` with `SOURCE_URI/DEST_URI` and `SOURCE_PGPASSWORD/DEST_PGPASSWORD`.

---

## Pre-flight checks (always do first)

1) Confirm you are operating on the correct repo checkout:
```bash
cd ~/coach-value-insight
git rev-parse --show-toplevel
```

2) Confirm you can reach DEST database (no secrets printed):
```bash
cd ~/supabase-migrate
source .env
PGPASSWORD="$DEST_PGPASSWORD" psql "$DEST_URI" -c "select 1;"
```

3) Confirm core tables exist (counts only):
```sql
select count(*) orgs from public.organizations;
select count(*) programs from public.programs;
select count(*) benefits from public.benefits;
select count(*) scenarios from public.scenarios;
```

---

## Applying migrations to DEST

### Standard apply (clean environment)
Run migrations in timestamp order:

```bash
cd ~/supabase-migrate
source .env
export PGPASSWORD="$DEST_PGPASSWORD"

for f in $(ls -1 ~/coach-value-insight/supabase/migrations/*.sql | sort); do
  echo "Applying $f"
  psql "$DEST_URI" -v ON_ERROR_STOP=1 -f "$f"
done
```

### Resume after partial apply (common)
If a migration partially applied and later migrations now fail with “already exists” errors, do **not** drop tables/data.

Preferred approach:
- Patch the failing migration to be rerunnable:
  - `CREATE TABLE IF NOT EXISTS ...`
  - `DROP TRIGGER IF EXISTS ...` before recreating triggers
  - Guard policies with `pg_policies`
  - Guard enums with `pg_type`
  - Use `ON CONFLICT DO NOTHING` for seed inserts
- Re-run **only** the failing migration, then continue.

If a migration fails due to invalid PL/pgSQL syntax (e.g., `RAISE` args mismatch):
- Patch the function.
- Create a small “resume” SQL file that:
  - `CREATE OR REPLACE FUNCTION ...` (fixed)
  - recreates any dependent triggers
- Apply the resume file with `psql -f`, then continue with remaining migrations.

---

## Common migration failure patterns and fixes

### A) “relation already exists” (table/index)
- Prefer `CREATE TABLE IF NOT EXISTS`.
- For indexes: `CREATE INDEX IF NOT EXISTS` (or guard via `pg_class/pg_indexes` if needed).
- For constraints: guard via `pg_constraint` before adding.

### B) “policy already exists”
Guard with:
```sql
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='<table>' and policyname='<policy>'
  ) then
    create policy "<policy>" on public.<table> ...
  end if;
end $$;
```
Or use `DROP POLICY IF EXISTS ...` then recreate.

### C) “cannot drop function … depends on trigger”
Drop triggers first:
```sql
drop trigger if exists <trigger_name> on public.<table>;
drop function if exists <fn_name>(...);
-- recreate function, then recreate trigger
```

### D) Seed inserts violate unique constraints
Use upserts:
- safest: `ON CONFLICT (...) DO NOTHING`
- if repo seed should win: `ON CONFLICT (...) DO UPDATE SET ...`

### E) `user_roles` seed insert fails (FK to auth.users)
Do not hardcode user UUIDs in migrations. Options:
- Wrap in `IF EXISTS (select 1 from auth.users where id=...)`
- Or remove the insert and assign admin role after signup.

---

## Verification queries (post-migration)

### 1) Schema objects exist
Tables:
```sql
select tablename from pg_tables
where schemaname='public'
and tablename in ('organizations','programs','benefits','scenarios','benchmarks','benefit_defaults','user_roles','audit_logs')
order by tablename;
```

Enum:
```sql
select typname from pg_type where typname='app_role';
```

Functions:
```sql
select proname from pg_proc
join pg_namespace n on n.oid = pg_proc.pronamespace
where n.nspname='public' and proname in ('has_role','log_audit_event','update_updated_at_column','validate_attribution_total');
```

Triggers (audit + validation):
```sql
select tgname, relname
from pg_trigger t
join pg_class c on c.oid=t.tgrelid
join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and relname in ('organizations','programs','benefits','scenarios','user_roles','benefit_defaults','audit_logs')
and not t.tgisinternal
order by relname, tgname;
```

### 2) RLS status
```sql
select relname, relrowsecurity
from pg_class c
join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public'
and relname in ('organizations','programs','benefits','scenarios','benchmarks','benefit_defaults','user_roles','audit_logs');
```

### 3) App smoke tests (in browser)
- Sign up + email confirm
- Sign in
- Create organization
- Create program
- Add benefits
- Add scenario
- Refresh and confirm persistence
- Verify attribution validation behavior (if enabled)
- Verify benchmarks/defaults load

---

## Auth configuration (Supabase)

If email confirmations open `localhost` or wrong domain:
- Supabase → Authentication → URL Configuration
  - Site URL: `https://<production-domain>`
  - Redirect URLs: `https://<production-domain>/email-confirmed` (and optionally wildcard)

---

## Admin access (Supabase)

After Daniel signs up, grant admin role:

```sql
insert into public.user_roles (user_id, role)
values ('<DANIEL_USER_UUID>', 'admin')
on conflict (user_id) do update set role='admin';
```

If the table lacks a unique constraint on `user_id`, use an update-then-insert pattern.

---

## When to stop and ask for help

Stop immediately if:
- A migration includes destructive commands you did not expect (DROP TABLE, TRUNCATE).
- You are unsure which database you are connected to.
- You see repeated auth failures or DNS failures that block DB connectivity.

---

## Codex “default prompt”

Use this when you want Codex to execute runbook steps:

> Follow OPS_RUNBOOK.md. Assume env vars are in `~/supabase-migrate/.env`. Do not print secrets. Stop on first error. Propose minimal safe edits to make migrations rerunnable, then apply only what’s needed and continue.
