alter table users add column ref_code text unique;
alter table users add column ref_rewarded_count integer not null default 0;

create table referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references users(id),
  invited_id uuid not null unique references users(id),
  created_at timestamptz not null default now()
);

alter table referrals enable row level security;
