-- Canvas app baseline schema + RLS
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  handle text not null unique,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.canvases (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  subtitle text not null default '',
  avatar_initials text not null default 'CV',
  status_label text not null default 'At Risk' check (status_label in ('On Track', 'At Risk', 'Behind')),
  share_code text not null default 'CV-DEMO',
  invite_link text not null default '',
  members jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  canvas_id uuid not null references public.canvases(id) on delete cascade,
  title text not null,
  summary text not null default '',
  horizon text not null default 'this_quarter' check (horizon in ('near_term', 'this_quarter', 'yearly')),
  created_at timestamptz not null default now()
);

create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  canvas_id uuid not null references public.canvases(id) on delete cascade,
  text text not null,
  is_done boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  canvas_id uuid not null references public.canvases(id) on delete cascade,
  type text not null check (type in ('principle', 'constraint', 'decision')),
  text text not null,
  source_message_id text,
  created_at timestamptz not null default now()
);

create index if not exists canvases_owner_idx on public.canvases(owner_user_id);
create index if not exists goals_canvas_idx on public.goals(canvas_id);
create index if not exists todos_canvas_idx on public.todos(canvas_id);
create index if not exists memories_canvas_idx on public.memories(canvas_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists canvases_set_updated_at on public.canvases;
create trigger canvases_set_updated_at
before update on public.canvases
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.canvases enable row level security;
alter table public.goals enable row level security;
alter table public.todos enable row level security;
alter table public.memories enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
for select using (auth.uid() = user_id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
for insert with check (auth.uid() = user_id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists canvases_select_owner on public.canvases;
create policy canvases_select_owner on public.canvases
for select using (auth.uid() = owner_user_id);

drop policy if exists canvases_insert_owner on public.canvases;
create policy canvases_insert_owner on public.canvases
for insert with check (auth.uid() = owner_user_id);

drop policy if exists canvases_update_owner on public.canvases;
create policy canvases_update_owner on public.canvases
for update using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);

drop policy if exists canvases_delete_owner on public.canvases;
create policy canvases_delete_owner on public.canvases
for delete using (auth.uid() = owner_user_id);

drop policy if exists goals_select_owner on public.goals;
create policy goals_select_owner on public.goals
for select using (
  exists (
    select 1
    from public.canvases c
    where c.id = goals.canvas_id and c.owner_user_id = auth.uid()
  )
);

drop policy if exists goals_insert_owner on public.goals;
create policy goals_insert_owner on public.goals
for insert with check (
  exists (
    select 1
    from public.canvases c
    where c.id = goals.canvas_id and c.owner_user_id = auth.uid()
  )
);

drop policy if exists goals_delete_owner on public.goals;
create policy goals_delete_owner on public.goals
for delete using (
  exists (
    select 1
    from public.canvases c
    where c.id = goals.canvas_id and c.owner_user_id = auth.uid()
  )
);

drop policy if exists goals_update_owner on public.goals;
create policy goals_update_owner on public.goals
for update using (
  exists (
    select 1
    from public.canvases c
    where c.id = goals.canvas_id and c.owner_user_id = auth.uid()
  )
) with check (
  exists (
    select 1
    from public.canvases c
    where c.id = goals.canvas_id and c.owner_user_id = auth.uid()
  )
);

drop policy if exists todos_select_owner on public.todos;
create policy todos_select_owner on public.todos
for select using (
  exists (
    select 1
    from public.canvases c
    where c.id = todos.canvas_id and c.owner_user_id = auth.uid()
  )
);

drop policy if exists todos_insert_owner on public.todos;
create policy todos_insert_owner on public.todos
for insert with check (
  exists (
    select 1
    from public.canvases c
    where c.id = todos.canvas_id and c.owner_user_id = auth.uid()
  )
);

drop policy if exists todos_update_owner on public.todos;
create policy todos_update_owner on public.todos
for update using (
  exists (
    select 1
    from public.canvases c
    where c.id = todos.canvas_id and c.owner_user_id = auth.uid()
  )
) with check (
  exists (
    select 1
    from public.canvases c
    where c.id = todos.canvas_id and c.owner_user_id = auth.uid()
  )
);

drop policy if exists todos_delete_owner on public.todos;
create policy todos_delete_owner on public.todos
for delete using (
  exists (
    select 1
    from public.canvases c
    where c.id = todos.canvas_id and c.owner_user_id = auth.uid()
  )
);

drop policy if exists memories_select_owner on public.memories;
create policy memories_select_owner on public.memories
for select using (
  exists (
    select 1
    from public.canvases c
    where c.id = memories.canvas_id and c.owner_user_id = auth.uid()
  )
);

drop policy if exists memories_insert_owner on public.memories;
create policy memories_insert_owner on public.memories
for insert with check (
  exists (
    select 1
    from public.canvases c
    where c.id = memories.canvas_id and c.owner_user_id = auth.uid()
  )
);

drop policy if exists memories_update_owner on public.memories;
create policy memories_update_owner on public.memories
for update using (
  exists (
    select 1
    from public.canvases c
    where c.id = memories.canvas_id and c.owner_user_id = auth.uid()
  )
) with check (
  exists (
    select 1
    from public.canvases c
    where c.id = memories.canvas_id and c.owner_user_id = auth.uid()
  )
);

drop policy if exists memories_delete_owner on public.memories;
create policy memories_delete_owner on public.memories
for delete using (
  exists (
    select 1
    from public.canvases c
    where c.id = memories.canvas_id and c.owner_user_id = auth.uid()
  )
);
