-- 꿈 아카이브 초기 스키마
-- MVP(P1): users, dreams 만 사용. 나머지(tags/dream_tags/dream_analyses/reactions/reports)는
-- 재작성 방지를 위해 스키마만 미리 확보. 상세: docs/technical-spec.md §3.

-- ── enums ───────────────────────────────────────────────────────────────
create type dream_emotion as enum
  ('fear', 'funny', 'sad', 'strange', 'peaceful', 'anxious', 'happy');

create type dream_status as enum ('draft', 'private', 'public');

create type user_tier as enum ('free', 'premium');

-- ── users (프로필 확장) ──────────────────────────────────────────────────
create table public.users (
  id                       uuid primary key references auth.users (id) on delete cascade,
  email                    text,                              -- 소셜 이메일 미동의 대비 nullable
  birth_year               int,
  tier                     user_tier   not null default 'free',
  credits                  int         not null default 0,    -- P2+ 결제
  subscription_expires_at  timestamptz,
  created_at               timestamptz not null default now()
);

-- ── dreams (핵심 엔티티) ─────────────────────────────────────────────────
create table public.dreams (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.users (id) on delete cascade,
  title             text,                                     -- 비면 앱에서 날짜로 표시
  content           text not null,                            -- MVP 유일 필수 필드
  raw_transcript    text,                                     -- P2 음성 원본 전사
  dreamed_at        date not null default current_date,       -- 꿈 꾼 날 (created_at과 분리)
  emotion           dream_emotion,
  status            dream_status not null default 'private',
  content_warnings  text[]       not null default '{}',       -- P3 전시관
  flagged_by_ai     boolean      not null default false,      -- P3
  flagged_reports   int          not null default 0,          -- P3
  published_at      timestamptz,                              -- P3 public 전환 시점
  created_at        timestamptz  not null default now(),
  updated_at        timestamptz  not null default now()
);

create index dreams_user_id_dreamed_at_idx
  on public.dreams (user_id, dreamed_at desc, created_at desc);

-- ── tags + dream_tags (P2+ 검색·태그, 스키마만) ──────────────────────────
create table public.tags (
  id        uuid primary key default gen_random_uuid(),
  name      text not null,
  kind      text not null,                                    -- 인물|장소|감정|사물|테마
  is_preset boolean not null default true
);

create table public.dream_tags (
  dream_id uuid not null references public.dreams (id) on delete cascade,
  tag_id   uuid not null references public.tags (id)  on delete cascade,
  primary key (dream_id, tag_id)
);

-- ── dream_analyses (P2+ AI 캐시, 스키마만) ───────────────────────────────
create table public.dream_analyses (
  id              uuid primary key default gen_random_uuid(),
  dream_id        uuid not null references public.dreams (id) on delete cascade,
  user_id         uuid not null references public.users (id)  on delete cascade,
  lens            text not null,                              -- haemong|psych|emotion
  summary         text,
  emotions        jsonb,
  themes          jsonb,
  interpretation  text,
  model           text,
  created_at      timestamptz not null default now()
);

-- ── reactions / reports (P3 전시관, 스키마만) ────────────────────────────
create table public.reactions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users (id)  on delete cascade,
  dream_id   uuid not null references public.dreams (id) on delete cascade,
  type       text not null,                                   -- empathy|memorable|similar
  created_at timestamptz not null default now(),
  unique (user_id, dream_id, type)
);

create table public.reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.users (id)  on delete cascade,
  dream_id    uuid not null references public.dreams (id) on delete cascade,
  reason      text,
  created_at  timestamptz not null default now(),
  resolved_at timestamptz
);

-- ── updated_at 자동 갱신 ─────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger dreams_set_updated_at
  before update on public.dreams
  for each row execute function public.set_updated_at();

-- ── auth.users → public.users 프로필 동기 생성 ───────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── RLS: 본인 데이터만 ───────────────────────────────────────────────────
alter table public.users          enable row level security;
alter table public.dreams         enable row level security;
alter table public.tags           enable row level security;
alter table public.dream_tags     enable row level security;
alter table public.dream_analyses enable row level security;
alter table public.reactions      enable row level security;
alter table public.reports        enable row level security;

-- users: 본인 프로필만 조회/수정
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);
create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- dreams: 본인 꿈 전부 (P3에서 public 예외 정책 추가 예정)
create policy "dreams_select_own" on public.dreams
  for select using (auth.uid() = user_id);
create policy "dreams_insert_own" on public.dreams
  for insert with check (auth.uid() = user_id);
create policy "dreams_update_own" on public.dreams
  for update using (auth.uid() = user_id);
create policy "dreams_delete_own" on public.dreams
  for delete using (auth.uid() = user_id);

-- tags: 프리셋 풀은 누구나 읽기 (P2+ 쓰기 정책 별도)
create policy "tags_select_all" on public.tags
  for select using (true);

-- dream_tags: 본인 꿈에 달린 것만
create policy "dream_tags_select_own" on public.dream_tags
  for select using (
    exists (select 1 from public.dreams d
            where d.id = dream_id and d.user_id = auth.uid())
  );
create policy "dream_tags_write_own" on public.dream_tags
  for all using (
    exists (select 1 from public.dreams d
            where d.id = dream_id and d.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.dreams d
            where d.id = dream_id and d.user_id = auth.uid())
  );

-- dream_analyses / reactions / reports: 본인 것만 (P2+/P3 확장)
create policy "analyses_own" on public.dream_analyses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "reactions_own" on public.reactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "reports_own" on public.reports
  for all using (auth.uid() = reporter_id) with check (auth.uid() = reporter_id);
