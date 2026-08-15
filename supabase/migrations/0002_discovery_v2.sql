-- Discovery pipeline v2: one-click approve (auto-publish), admin search
-- preferences, deterministic match scoring, and search-batch history.
-- Run this after 0001_init.sql.

-- Review audit trail: who approved/denied a discovered candidate, and when.
alter table discovered_opportunities
  add column reviewed_at timestamptz,
  add column reviewed_by uuid references auth.users(id) on delete set null,
  add column match_score smallint check (match_score between 0 and 100),
  add column search_id uuid,
  add column admin_note text;

-- One row per "Find New Opportunities" run (manual click or scheduled cron),
-- so the admin can see search history grouped the way it happened rather
-- than only per-source. discovered_opportunities.search_id ties each
-- candidate back to the run that found it.
create table discovery_searches (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  triggered_by text not null default 'manual' check (triggered_by in ('manual', 'cron')),
  sources_scanned integer not null default 0,
  opportunities_found integer not null default 0
);

alter table discovered_opportunities
  add constraint discovered_opportunities_search_id_fkey
  foreign key (search_id) references discovery_searches(id) on delete set null;

create index idx_discovered_opportunities_search on discovered_opportunities(search_id);
create index idx_discovery_searches_started on discovery_searches(started_at);

-- Admin-configured interests/types/eligibility the discovery pipeline scores
-- candidates against. Single-row settings table (one admin's preferences
-- drive the whole pipeline today - see AGENTS.md if this ever needs to
-- become per-admin).
create table discovery_preferences (
  id uuid primary key default gen_random_uuid(),
  interests text[] not null default '{}',
  opportunity_types text[] not null default '{}',
  min_grade smallint check (min_grade between 8 and 12),
  max_grade smallint check (max_grade between 8 and 12),
  min_age smallint,
  max_age smallint,
  format_preference text check (format_preference in ('remote', 'in-person', 'hybrid', 'any')),
  geographic_notes text,
  updated_at timestamptz not null default now()
);

insert into discovery_preferences (interests, opportunity_types, format_preference)
values ('{}', '{}', 'any');

alter table discovery_searches enable row level security;
alter table discovery_preferences enable row level security;

create policy "admins manage discovery_searches" on discovery_searches for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage discovery_preferences" on discovery_preferences for all using (public.is_admin()) with check (public.is_admin());
