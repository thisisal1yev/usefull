create type user_role as enum ('learner','teacher','coach','admin');
create type plan_tier as enum ('free','premium','gold');
create type ui_lang as enum ('uz','en');
create type exam_type as enum ('ielts','sat');
create type match_status as enum ('pending','accepted','declined');
create type teacher_status as enum ('pending','approved','rejected');
create type booking_type as enum ('free','paid');
create type booking_status as enum ('booked','cancelled','completed');

create table users (
  id uuid primary key default gen_random_uuid(),
  tg_id bigint not null unique,
  first_name text not null default '',
  username text,
  ui_lang ui_lang not null default 'uz',
  level text,
  goal text,
  availability text,
  role user_role not null default 'learner',
  plan plan_tier not null default 'free',
  plan_expires_at timestamptz,
  onboarded boolean not null default false,
  created_at timestamptz not null default now()
);

create table match_requests (
  id uuid primary key default gen_random_uuid(),
  from_user uuid not null references users(id),
  to_user uuid not null references users(id),
  status match_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (from_user, to_user)
);

create table exam_questions (
  id uuid primary key default gen_random_uuid(),
  exam exam_type not null default 'ielts',
  part text not null,
  topic text,
  question text not null,
  author_id uuid references users(id),
  published_at timestamptz not null default now()
);

create table community_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  body text not null,
  is_removed boolean not null default false,
  created_at timestamptz not null default now()
);

create table answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references community_questions(id) on delete cascade,
  user_id uuid not null references users(id),
  body text not null,
  is_removed boolean not null default false,
  created_at timestamptz not null default now()
);

create table teachers (
  user_id uuid primary key references users(id),
  bio text not null default '',
  experience text,
  certificates_url text,
  status teacher_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table teacher_slots (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references teachers(user_id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (teacher_id, starts_at)
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null unique references teacher_slots(id),
  learner_id uuid not null references users(id),
  type booking_type not null,
  status booking_status not null default 'booked',
  created_at timestamptz not null default now()
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  tier plan_tier not null,
  stars_tx_id text unique,
  starts_at timestamptz not null default now(),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table coach_assignments (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null unique references users(id),
  coach_id uuid not null references users(id),
  created_at timestamptz not null default now()
);

alter table users enable row level security;
alter table match_requests enable row level security;
alter table exam_questions enable row level security;
alter table community_questions enable row level security;
alter table answers enable row level security;
alter table teachers enable row level security;
alter table teacher_slots enable row level security;
alter table bookings enable row level security;
alter table subscriptions enable row level security;
alter table coach_assignments enable row level security;
