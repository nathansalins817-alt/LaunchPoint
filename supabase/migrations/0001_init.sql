-- LaunchPoint database schema
-- Run against a Supabase project via `supabase db push` or the SQL editor.
-- Tables are grouped: core catalog, accounts, submissions/reports, discovery pipeline.

create extension if not exists pg_trgm;

-- ============================================================================
-- CORE CATALOG
-- ============================================================================

create table organizations (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null default '',
  logo_url text,
  website text not null,
  organization_type text not null check (
    organization_type in ('University', 'Government Agency', 'Company', 'Nonprofit', 'Research Institution', 'Foundation')
  ),
  created_at timestamptz not null default now()
);

create table interests (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null
);

create table opportunities (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  organization_id uuid not null references organizations(id) on delete restrict,
  short_description text not null default '',
  description text not null default '',
  category text not null check (
    category in ('Internship','Research','Summer Program','Scholarship','Competition','Volunteering','Entrepreneurship','Fellowship','Academic Program')
  ),
  format text not null check (format in ('remote', 'in-person', 'hybrid')),
  city text,
  state text,
  country text not null default 'United States',
  remote boolean not null default false,
  grad_seniors_eligible boolean not null default false,
  min_age integer,
  max_age integer,
  citizenship_requirement text,
  eligibility_description text not null default '',
  deadline date,
  rolling_deadline boolean not null default false,
  application_open_date date,
  decision_date date,
  program_start_date date,
  program_end_date date,
  cost numeric(10, 2),
  paid boolean not null default false,
  stipend_amount numeric(10, 2),
  financial_aid boolean not null default false,
  activities text[] not null default '{}',
  application_url text not null,
  website_url text not null,
  faq_url text,
  tags text[] not null default '{}',
  featured boolean not null default false,
  status text not null default 'pending' check (status in ('published', 'pending', 'expired', 'rejected', 'draft')),
  -- Data provenance: distinguishes bootstrapped/demo listings from
  -- organization-verified data so the UI never presents a guess as fact.
  is_sample_data boolean not null default false,
  last_verified_at timestamptz,
  verification_status text not null default 'needs_review' check (
    verification_status in ('verified', 'needs_review', 'expired')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table opportunity_interests (
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  interest_id uuid not null references interests(id) on delete cascade,
  primary key (opportunity_id, interest_id)
);

create table opportunity_grades (
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  grade smallint not null check (grade between 8 and 12),
  primary key (opportunity_id, grade)
);

create index idx_opportunities_category on opportunities(category);
create index idx_opportunities_deadline on opportunities(deadline);
create index idx_opportunities_state on opportunities(state);
create index idx_opportunities_status on opportunities(status);
create index idx_opportunities_featured on opportunities(featured) where featured = true;
create index idx_opportunities_org on opportunities(organization_id);
create index idx_opportunities_title_trgm on opportunities using gin (title gin_trgm_ops);
create index idx_opportunities_desc_trgm on opportunities using gin (short_description gin_trgm_ops);
create index idx_organizations_name_trgm on organizations using gin (name gin_trgm_ops);

-- ============================================================================
-- ACCOUNTS
-- ============================================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  grade smallint check (grade between 8 and 12),
  location text,
  opportunity_interests text[] not null default '{}',
  location_preference text check (location_preference in ('remote', 'near-me', 'anywhere')),
  cost_preference text check (cost_preference in ('free-only', 'financial-aid', 'any')),
  onboarding_completed boolean not null default false,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table user_interests (
  user_id uuid not null references profiles(id) on delete cascade,
  interest_id uuid not null references interests(id) on delete cascade,
  primary key (user_id, interest_id)
);

create table saved_opportunities (
  user_id uuid not null references profiles(id) on delete cascade,
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  status text not null default 'Interested' check (
    status in ('Interested', 'Applying', 'Applied', 'Accepted', 'Not Pursuing')
  ),
  saved_at timestamptz not null default now(),
  primary key (user_id, opportunity_id)
);

create index idx_saved_opportunities_user on saved_opportunities(user_id);

-- Prepares deadline alert infrastructure (30/14/7/1-day reminders) without
-- wiring up an email/notification provider yet.
create table deadline_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  days_before smallint not null check (days_before in (30, 14, 7, 1)),
  remind_at timestamptz not null,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, opportunity_id, days_before)
);

create index idx_deadline_reminders_pending on deadline_reminders(remind_at) where sent_at is null;

-- ============================================================================
-- SUBMISSIONS & REPORTS
-- ============================================================================

create table opportunity_submissions (
  id uuid primary key default gen_random_uuid(),
  opportunity_name text not null,
  organization_name text not null,
  website_url text,
  application_url text,
  description text not null,
  category text not null check (
    category in ('Internship','Research','Summer Program','Scholarship','Competition','Volunteering','Entrepreneurship','Fellowship','Academic Program')
  ),
  deadline date,
  eligible_grades smallint[] not null default '{}',
  location text,
  cost text,
  contact_email text not null,
  additional_notes text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  submitted_at timestamptz not null default now()
);

create table opportunity_reports (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  reason text not null check (
    reason in ('Deadline incorrect', 'Program discontinued', 'Eligibility incorrect', 'Broken link', 'Other')
  ),
  details text,
  reporter_email text,
  status text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);

-- ============================================================================
-- DISCOVERY PIPELINE (sections 38-53)
-- ============================================================================

create table discovery_sources (
  id uuid primary key default gen_random_uuid(),
  organization_name text not null,
  source_url text not null,
  source_type text not null check (
    source_type in ('university', 'company', 'government', 'nonprofit', 'research_institution', 'scholarship_org', 'competition')
  ),
  active boolean not null default true,
  check_frequency text not null default 'weekly' check (check_frequency in ('daily', 'weekly', 'monthly')),
  last_checked_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create table discovery_runs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references discovery_sources(id) on delete cascade,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'running' check (status in ('running', 'completed', 'failed')),
  opportunities_found integer not null default 0,
  errors text
);

create table discovered_opportunities (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references discovery_sources(id) on delete cascade,
  raw_title text not null,
  raw_content text not null default '',
  -- Structured extraction output (see lib/discovery/schema.ts) kept as JSON
  -- because its shape evolves with the extractor; confidence_score is
  -- promoted to a real column so the admin queue can sort/filter on it.
  extracted_data jsonb not null default '{}',
  confidence_score numeric(4, 3) not null default 0,
  duplicate_of_id uuid references opportunities(id) on delete set null,
  review_status text not null default 'new' check (
    review_status in ('new', 'needs_review', 'possible_duplicate', 'approved', 'rejected', 'saved_for_later')
  ),
  discovered_at timestamptz not null default now(),
  last_checked_at timestamptz not null default now()
);

create index idx_discovered_opportunities_status on discovered_opportunities(review_status);

create table opportunity_changes (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  field_name text not null,
  old_value text,
  new_value text,
  source_url text,
  detected_at timestamptz not null default now(),
  review_status text not null default 'pending' check (review_status in ('pending', 'accepted', 'ignored'))
);

create index idx_opportunity_changes_pending on opportunity_changes(review_status) where review_status = 'pending';

-- ============================================================================
-- HELPERS
-- ============================================================================

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select is_admin from profiles where id = auth.uid()), false);
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger opportunities_set_updated_at
  before update on opportunities
  for each row execute function public.set_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table organizations enable row level security;
alter table interests enable row level security;
alter table opportunities enable row level security;
alter table opportunity_interests enable row level security;
alter table opportunity_grades enable row level security;
alter table profiles enable row level security;
alter table user_interests enable row level security;
alter table saved_opportunities enable row level security;
alter table deadline_reminders enable row level security;
alter table opportunity_submissions enable row level security;
alter table opportunity_reports enable row level security;
alter table discovery_sources enable row level security;
alter table discovery_runs enable row level security;
alter table discovered_opportunities enable row level security;
alter table opportunity_changes enable row level security;

-- Public catalog data: readable by anyone, writable only by admins.
create policy "organizations are publicly readable" on organizations for select using (true);
create policy "admins manage organizations" on organizations for all using (public.is_admin()) with check (public.is_admin());

create policy "interests are publicly readable" on interests for select using (true);
create policy "admins manage interests" on interests for all using (public.is_admin()) with check (public.is_admin());

create policy "published opportunities are publicly readable" on opportunities
  for select using (status = 'published' or public.is_admin());
create policy "admins manage opportunities" on opportunities for insert with check (public.is_admin());
create policy "admins update opportunities" on opportunities for update using (public.is_admin());
create policy "admins delete opportunities" on opportunities for delete using (public.is_admin());

create policy "opportunity_interests are publicly readable" on opportunity_interests for select using (true);
create policy "admins manage opportunity_interests" on opportunity_interests for all using (public.is_admin()) with check (public.is_admin());

create policy "opportunity_grades are publicly readable" on opportunity_grades for select using (true);
create policy "admins manage opportunity_grades" on opportunity_grades for all using (public.is_admin()) with check (public.is_admin());

-- Accounts: users manage their own rows; admins can see everything.
create policy "users read own profile" on profiles for select using (auth.uid() = id or public.is_admin());
create policy "users update own profile" on profiles for update using (auth.uid() = id);
create policy "users insert own profile" on profiles for insert with check (auth.uid() = id);

create policy "users manage own interests" on user_interests for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users manage own saved opportunities" on saved_opportunities for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users manage own reminders" on deadline_reminders for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- Lets the admin dashboard show reminder counts across all users. Sending
-- reminders still goes through the service-role cron worker, not this policy.
create policy "admins read all reminders" on deadline_reminders for select using (public.is_admin());

-- Submissions & reports: anyone (incl. anonymous) may submit; only admins review.
create policy "anyone can submit an opportunity" on opportunity_submissions for insert with check (true);
create policy "admins read submissions" on opportunity_submissions for select using (public.is_admin());
create policy "admins update submissions" on opportunity_submissions for update using (public.is_admin());

create policy "anyone can report an opportunity" on opportunity_reports for insert with check (true);
create policy "admins manage reports" on opportunity_reports for select using (public.is_admin());
create policy "admins update reports" on opportunity_reports for update using (public.is_admin());

-- Discovery pipeline is entirely internal.
create policy "admins manage discovery_sources" on discovery_sources for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage discovery_runs" on discovery_runs for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage discovered_opportunities" on discovered_opportunities for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage opportunity_changes" on opportunity_changes for all using (public.is_admin()) with check (public.is_admin());
