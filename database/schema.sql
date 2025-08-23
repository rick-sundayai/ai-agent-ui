-- ============================================================================
-- AI Agent UI - Database Schema
-- Authentication & User Management System
-- ============================================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

-- User roles for the application
create type user_role as enum ('admin', 'sales_manager', 'recruiter');

-- User status for account management
create type user_status as enum ('active', 'inactive', 'pending', 'invited');

-- Invitation status tracking
create type invitation_status as enum ('pending', 'accepted', 'expired', 'cancelled');

-- ============================================================================
-- TABLES
-- ============================================================================

-- User profiles table (extends Supabase auth.users)
create table public.user_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  email text not null,
  first_name text not null,
  last_name text not null,
  role user_role not null default 'recruiter',
  department text,
  team text,
  status user_status not null default 'pending',
  avatar_url text,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User invitations table
create table public.user_invitations (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  role user_role not null,
  first_name text not null,
  last_name text not null,
  department text,
  team text,
  invited_by uuid references auth.users(id) on delete cascade not null,
  expires_at timestamp with time zone not null default (now() + interval '7 days'),
  token text not null unique,
  status invitation_status not null default 'pending',
  accepted_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Registration requests table (for self-registration workflow)
create table public.registration_requests (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  first_name text not null,
  last_name text not null,
  role user_role not null,
  department text,
  reason text,
  status text not null default 'pending', -- 'pending', 'approved', 'rejected'
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User permissions table (for fine-grained access control)
create table public.user_permissions (
  id uuid default gen_random_uuid() primary key,
  role user_role not null,
  resource text not null, -- e.g., 'users', 'reports', 'candidates'
  action text not null,   -- e.g., 'read', 'write', 'delete', 'admin'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(role, resource, action)
);

-- User activity audit trail
create table public.user_activities (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  action text not null,
  resource text not null,
  resource_id uuid,
  metadata jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Performance indexes
create index idx_user_profiles_user_id on public.user_profiles(user_id);
create index idx_user_profiles_role on public.user_profiles(role);
create index idx_user_profiles_status on public.user_profiles(status);
create index idx_user_profiles_email on public.user_profiles(email);

create index idx_user_invitations_email on public.user_invitations(email);
create index idx_user_invitations_token on public.user_invitations(token);
create index idx_user_invitations_status on public.user_invitations(status);
create index idx_user_invitations_expires_at on public.user_invitations(expires_at);

create index idx_registration_requests_email on public.registration_requests(email);
create index idx_registration_requests_status on public.registration_requests(status);

create index idx_user_permissions_role on public.user_permissions(role);
create index idx_user_permissions_resource on public.user_permissions(resource);

create index idx_user_activities_user_id on public.user_activities(user_id);
create index idx_user_activities_created_at on public.user_activities(created_at);
create index idx_user_activities_action on public.user_activities(action);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Apply updated_at trigger to relevant tables
create trigger update_user_profiles_updated_at 
  before update on public.user_profiles
  for each row execute function update_updated_at_column();

create trigger update_user_invitations_updated_at 
  before update on public.user_invitations
  for each row execute function update_updated_at_column();

create trigger update_registration_requests_updated_at 
  before update on public.registration_requests
  for each row execute function update_updated_at_column();

-- Function to create user profile when user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_profiles (user_id, email, first_name, last_name, role, status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'recruiter'),
    'pending'
  );
  return new;
end;
$$;

-- Trigger to create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
alter table public.user_profiles enable row level security;
alter table public.user_invitations enable row level security;
alter table public.registration_requests enable row level security;
alter table public.user_permissions enable row level security;
alter table public.user_activities enable row level security;

-- User profiles policies
create policy "Users can view their own profile" on public.user_profiles
  for select using (auth.uid() = user_id);

create policy "Users can update their own profile" on public.user_profiles
  for update using (auth.uid() = user_id);

create policy "Admins can view all profiles" on public.user_profiles
  for select using (
    exists (
      select 1 from public.user_profiles
      where user_id = auth.uid() and role = 'admin' and status = 'active'
    )
  );

create policy "Admins can insert profiles" on public.user_profiles
  for insert with check (
    exists (
      select 1 from public.user_profiles
      where user_id = auth.uid() and role = 'admin' and status = 'active'
    )
  );

create policy "Admins can update all profiles" on public.user_profiles
  for update using (
    exists (
      select 1 from public.user_profiles
      where user_id = auth.uid() and role = 'admin' and status = 'active'
    )
  );

create policy "Sales managers can view team profiles" on public.user_profiles
  for select using (
    exists (
      select 1 from public.user_profiles up
      where up.user_id = auth.uid() 
        and up.role = 'sales_manager' 
        and up.status = 'active'
        and (up.team = public.user_profiles.team or public.user_profiles.role = 'recruiter')
    )
  );

-- User invitations policies
create policy "Admins can manage invitations" on public.user_invitations
  for all using (
    exists (
      select 1 from public.user_profiles
      where user_id = auth.uid() and role = 'admin' and status = 'active'
    )
  );

-- Registration requests policies
create policy "Anyone can create registration requests" on public.registration_requests
  for insert with check (true);

create policy "Admins can view all registration requests" on public.registration_requests
  for select using (
    exists (
      select 1 from public.user_profiles
      where user_id = auth.uid() and role = 'admin' and status = 'active'
    )
  );

create policy "Admins can update registration requests" on public.registration_requests
  for update using (
    exists (
      select 1 from public.user_profiles
      where user_id = auth.uid() and role = 'admin' and status = 'active'
    )
  );

-- User permissions policies (read-only for most users)
create policy "Users can view permissions" on public.user_permissions
  for select using (true);

create policy "Admins can manage permissions" on public.user_permissions
  for all using (
    exists (
      select 1 from public.user_profiles
      where user_id = auth.uid() and role = 'admin' and status = 'active'
    )
  );

-- User activities policies
create policy "Users can view their own activities" on public.user_activities
  for select using (auth.uid() = user_id);

create policy "Admins can view all activities" on public.user_activities
  for select using (
    exists (
      select 1 from public.user_profiles
      where user_id = auth.uid() and role = 'admin' and status = 'active'
    )
  );

create policy "System can insert activities" on public.user_activities
  for insert with check (true);

-- ============================================================================
-- DEFAULT PERMISSIONS DATA
-- ============================================================================

-- Insert default permissions for each role
insert into public.user_permissions (role, resource, action) values
  -- Admin permissions (full access)
  ('admin', 'users', 'read'),
  ('admin', 'users', 'write'),
  ('admin', 'users', 'delete'),
  ('admin', 'users', 'admin'),
  ('admin', 'reports', 'read'),
  ('admin', 'reports', 'write'),
  ('admin', 'reports', 'admin'),
  ('admin', 'system', 'admin'),
  ('admin', 'invitations', 'admin'),
  ('admin', 'permissions', 'admin'),
  
  -- Sales Manager permissions
  ('sales_manager', 'users', 'read'),
  ('sales_manager', 'reports', 'read'),
  ('sales_manager', 'reports', 'write'),
  ('sales_manager', 'team', 'read'),
  ('sales_manager', 'team', 'write'),
  ('sales_manager', 'candidates', 'read'),
  ('sales_manager', 'analytics', 'read'),
  
  -- Recruiter permissions
  ('recruiter', 'candidates', 'read'),
  ('recruiter', 'candidates', 'write'),
  ('recruiter', 'profile', 'read'),
  ('recruiter', 'profile', 'write'),
  ('recruiter', 'reports', 'read');

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to check if user has permission
create or replace function public.has_permission(
  user_role user_role,
  resource_name text,
  action_name text
)
returns boolean
language sql
security definer
as $$
  select exists(
    select 1 from public.user_permissions
    where role = user_role
      and resource = resource_name
      and action = action_name
  );
$$;

-- Function to get user profile with role
create or replace function public.get_user_profile(user_uuid uuid)
returns public.user_profiles
language sql
security definer
as $$
  select * from public.user_profiles where user_id = user_uuid limit 1;
$$;

-- Function to log user activity
create or replace function public.log_user_activity(
  action_name text,
  resource_name text,
  resource_uuid uuid default null,
  metadata_json jsonb default null
)
returns uuid
language plpgsql
security definer
as $$
declare
  activity_id uuid;
begin
  insert into public.user_activities (
    user_id, action, resource, resource_id, metadata
  ) values (
    auth.uid(), action_name, resource_name, resource_uuid, metadata_json
  ) returning id into activity_id;
  
  return activity_id;
end;
$$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

comment on table public.user_profiles is 'Extended user profile information linked to Supabase auth.users';
comment on table public.user_invitations is 'Tracks user invitations sent by admins';
comment on table public.registration_requests is 'Handles self-registration requests requiring admin approval';
comment on table public.user_permissions is 'Defines what each role can do with each resource';
comment on table public.user_activities is 'Audit trail of user actions in the system';