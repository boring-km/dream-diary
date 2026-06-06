# 꿈 아카이브 — 기술 설계 문서

> 기획 내용은 웹 기획문서(`web-test-pages/dream-archive-plan.html`) 참조.
> 이 문서는 **기술 스택 / 데이터 구조 / 아키텍처**만 다룬다.
> 작성일: 2026-05-30

---

## 1. 단계별 기술 범위

| Phase | 플랫폼 | 핵심 기술 추가 |
|---|---|---|
| **P1 (MVP)** | 웹 (PC 중심) | Next.js + Supabase |
| **P2** | 모바일 앱 | Flutter, 온디바이스 STT, 백그라운드 처리, 푸시, AI 분석(Claude), 결제(Toss) |
| **P3** | 웹+앱 | 전시관(소셜), 모더레이션 파이프라인, AI 이미지 |

> **AI 분석·결제는 MVP 범위 아님.** P1은 순수 꿈 기록 제품 — 인증(로그인), 기록 에디터, 달력/목록, 검색/태그, CRUD. Claude AI 분석과 Toss 결제는 P2 이후 도입.
> **인증은 P1 필수** — RLS(`user_id = auth.uid()`)가 로그인 전제. §2.2.1 참조.
> 단, 결제/AI 대비 스키마(`users.tier`/`users.credits`, `dream_analyses` 등)는 P1에서 미리 확보 → 재작성 방지.

백엔드(Supabase)와 도메인 데이터 모델은 P1에서 확정하고 P2~P3는 확장만 한다. 재작성 없게 설계.

---

## 2. 프레임워크 선택 (결정 + 근거)

### 2.1 웹 프론트/서버 — Next.js (App Router) ✅

**대안 비교**

| 후보 | 장점 | 단점 | 판정 |
|---|---|---|---|
| **Next.js (App Router)** | API Route로 Claude 키/결제 시크릿 서버 은닉, SSR 빠른 로드, Vercel+Supabase 흔한 조합, 결제 웹훅 수신 용이 | SPA보다 약간 무거움 | **채택** |
| Vite + React SPA | 가벼움 | 키 숨기려면 Edge Function 별도 관리, 웹훅 호스트 별도 | 보류 |
| SvelteKit | 가볍고 애니메이션 유리 | 생태계/팀 익숙도 낮음 | 보류 |

**채택 이유**: ① 익숙한 스택 ② SSR 빠른 로드 ③ 배포 단순 ④ (P2+) Claude 키 보안·Toss 웹훅 수신 시 서버 라우트 그대로 활용.

### 2.2 백엔드 — Supabase ✅

Postgres + Auth + Storage + RLS 올인원. 계정/로그인/데이터/스토리지 한 번에. 무료티어로 MVP 검증, 결제 위해 계정+서버 필요한 요건 충족.

- **일반 데이터(꿈 CRUD, 검색)**: 브라우저 → Supabase 직접, **RLS로 본인 데이터만**. ← **P1 범위**
- **민감 작업(AI 분석, 결제 검증)**: 반드시 Next API Route 경유. 시크릿은 서버에만. ← **P2+**

### 2.2.1 인증 — Supabase Auth  *(P1 필수)*

- **방식: 소셜 로그인만.** **Google** + **Apple**. 둘 다 Supabase 네이티브 OAuth 프로바이더 → 커스텀 OIDC 불필요. (Kakao·Naver·이메일/비번은 필요 시 P2 확장)
- 로그인 시 `auth.users` 행 생성 → 트리거로 `public.users` 프로필 행 동기 생성(`id`, `email`, `created_at`). Apple은 이메일 비공개(릴레이) 옵션 → `email` nullable 허용.
- 세션: Supabase SSR 헬퍼(`@supabase/ssr`)로 쿠키 기반, Next App Router 서버/클라이언트 양쪽 세션 공유.
- 모든 도메인 테이블 RLS는 `auth.uid()` 기준 → **인증 없으면 데이터 접근 0**. P1부터 적용.
- 미들웨어로 비로그인 시 기록/목록 라우트 → 로그인 페이지 리다이렉트.

### 2.3 AI — Claude API  *(P2+, MVP 제외)*

- 분석 모델: **Sonnet/Haiku** (원가↓, 한국어 품질 우수). 깊은 해석 옵션만 Opus 검토.
- 호출은 서버(Next API Route)에서만. 결과는 DB 캐시 → 재조회 무료, 재분석만 과금.
- 프롬프트 캐싱 적용(시스템 프롬프트/렌즈 정의 캐시).

### 2.4 결제 — Toss Payments  *(P2+, MVP 제외)*

구독 + 단건 크레딧 둘 다 지원. 웹훅 → Next API Route 검증 → `users.tier` / `users.credits` 갱신. (해외 결제 필요 시 Stripe 병행 검토)

### 2.5 모바일 (P2) — Flutter

moabook에서 검증된 스택. 단일 코드베이스 iOS/Android. 위젯은 네이티브 영역(iOS WidgetKit / Android App Widget).

---

## 3. 데이터 모델 (P1 확정, P2~P3 확장 고려)

Postgres 기준. `auth.users`는 Supabase Auth 관리, 도메인 데이터는 `public` 스키마.

### users (프로필 확장)
```sql
users
  id              uuid  PK  -- auth.users.id 연동
  email           text  null  -- 소셜 이메일 미동의 케이스 대비
  birth_year      int       -- 14세 이상 검증 (P3 전시관 대비)
  tier            text      -- 'free' | 'premium'
  credits         int       -- 단건 분석용 잔여 크레딧
  subscription_expires_at  timestamptz
  created_at      timestamptz
```

### dreams (핵심 엔티티)
```sql
dreams
  id              uuid  PK
  user_id         uuid  FK -> users.id   -- 외부 비노출(익명)
  title           text  null             -- 비면 날짜 자동
  content         text                   -- 다듬어진 본문
  raw_transcript  text  null             -- P2 음성 원본 전사(참고용)
  dreamed_at      date                   -- 꿈 꾼 날 (created_at과 분리)
  emotion         text  null             -- 단일 선택 (아래 enum)
  status          text                   -- 'draft' | 'private' | 'public'
  content_warnings text[]                -- P3 전시관용 자가태그
  flagged_by_ai   bool  default false    -- P3 모더레이션
  flagged_reports int   default 0        -- P3
  published_at    timestamptz null       -- public 전환 시점
  created_at      timestamptz
  updated_at      timestamptz
```

`status`/`content_warnings`/`flagged_*`는 P1에선 미사용이지만 P3 전시관 재작성 방지를 위해 스키마에 미리 포함. P1은 `status` 기본 `private`.

**emotion enum**: `fear`(무서움) `funny`(웃김) `sad`(슬픔) `strange`(이상함) `peaceful`(평온) `anxious`(불안) `happy`(기쁨)

**content_warning enum**: `violence` `death` `sexual` `self_harm`

### tags + dream_tags (사전 정의 풀 + 다대다)
```sql
tags
  id      uuid PK
  name    text                 -- 사전정의 풀 (자유입력 X)
  kind    text                 -- '인물'|'장소'|'감정'|'사물'|'테마'
  is_preset bool default true

dream_tags
  dream_id  uuid FK
  tag_id    uuid FK
  PK (dream_id, tag_id)
```
태그는 자유입력 대신 **사전정의 풀 30~50개**에서 선택. 이유: 검색 분산·노이즈·부적절 입력 방지. 예: 쫓김/비행/추락/물/불/죽은사람/가족/학교/직장/변신/동물/악몽/자각몽/반복/어린시절 등.

### dream_analyses (AI 결과 캐시)
```sql
dream_analyses
  id              uuid PK
  dream_id        uuid FK -> dreams.id
  user_id         uuid FK
  lens            text         -- 'haemong'(전통해몽)|'psych'(심리)|'emotion'(감정)
  summary         text
  emotions        jsonb        -- 추출 감정 분포
  themes          jsonb        -- 주제/상징
  interpretation  text         -- 해석 본문 (차분한 톤)
  model           text         -- 사용 모델 기록
  created_at      timestamptz
```
재분석 시에만 크레딧/구독 차감. 동일 dream+lens 캐시 존재 시 무료 재조회.

### reactions / reports (P3 전시관)
```sql
reactions
  id uuid PK, user_id uuid FK, dream_id uuid FK
  type text  -- 'empathy'|'memorable'|'similar'
  created_at timestamptz

reports
  id uuid PK, reporter_id uuid FK, dream_id uuid FK
  reason text, created_at timestamptz, resolved_at timestamptz null
```
P1 미구현. 스키마 설계만 확보.

---

## 4. 아키텍처

```
[브라우저 — Next.js App Router]
  기록 에디터 / 달력·목록 / 검색·태그 / 꿈 상세           ← P1
        │
        ├── Supabase Client (직접)  ── Auth · dreams CRUD · 검색 · RLS   ← P1
        │
        └── Next API Routes (서버)  ── Claude API 호출 · Toss 웹훅 검증   ← P2+
                                        (Claude 키 / 결제 시크릿 은닉)
[Supabase]  Postgres + Auth + Storage(P2 음성)
[Claude API]  요약·감정·주제·해석 (lens별)        ← P2+
[Toss]  구독 + 단건 크레딧                          ← P2+
```

**P1 MVP 경계**: 브라우저 ↔ Supabase(직접, RLS)만. 서버 API Route·외부 서비스(Claude/Toss) 없음.

**보안 경계 원칙**
- 모든 테이블 RLS: `user_id = auth.uid()` 본인 데이터만. (P3 public dream만 예외 정책) ← **P1 적용**
- (P2+) Claude API 키, Toss 시크릿 → **서버(Next API Route)에만**. 브라우저 노출 절대 금지.
- (P2+) AI 분석/결제 차감은 서버에서 검증 후 수행.

---

## 5. P2 음성 처리 (모바일)

기존 dream-gallery-spec 기반.

- **iOS**: `SFSpeechRecognizer` (`requiresOnDeviceRecognition = true`)
- **Android**: `SpeechRecognizer` (`EXTRA_PREFER_OFFLINE`, API 31+)
- **청크 분할**: `AVAudioEngine`(iOS) / `AudioRecord`(Android) RMS 모니터링, 0.8~1.5초 무음 = 컷
- **백그라운드**: iOS `BGProcessingTask` / Android `WorkManager`
- **fallback**: whisper.cpp 온디바이스 (앱 크기 트레이드오프)
- **프라이버시**: 원본 음성은 디바이스에만, 서버엔 전사 텍스트만 동기화

---

## 6. P3 모더레이션 (전시관)

- AI 자동 필터: 자해·성적·폭력·혐오 (한국어 분류기 / OpenAI Moderation 등)
- 검출 시 게시 보류 → 확인 요청 또는 차단
- 신고 누적 시 자동 비공개
- 신규 가입 24시간 게시 제한, 14세 이상 정책, 19금 차단 (정보통신망법 준수)

---

## 7. 배포

- 웹: Vercel (Next.js) + Supabase 클라우드
- 빌드/테스트 CI는 구현 단계에서 확정
- 환경변수(P1): Supabase URL/anon 키. service_role 키는 서버 환경에만.
- 환경변수(P2+): Claude 키, Toss 시크릿 → 서버 환경에만.
