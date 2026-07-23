create type report_target as enum ('question', 'answer');

create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references users(id),
  target_type report_target not null,
  target_id uuid not null,
  created_at timestamptz not null default now(),
  unique (reporter_id, target_type, target_id)
);

alter table reports enable row level security;
