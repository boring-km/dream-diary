# 꿈 아카이브

자다 깬 꿈을 흘려보내지 않도록 — 빠르게 붙잡아 보관하는 한국어 꿈 아카이브.

- 기획: [`docs/`](./docs) (technical-spec, mvp-features)
- 스택: Next.js 16 (App Router) · Supabase (Postgres + Auth + RLS) · Tailwind v4
- MVP 범위: 인증(Google/Apple) · 꿈 기록(CRUD) · 목록/타임라인 · 내보내기
  - AI 해석 · 결제 · 검색/태그는 **P2+** (스키마만 확보)

---

## 셋업

### 1. 의존성

```bash
npm install
```

### 2. Supabase 클라우드 프로젝트

1. [supabase.com](https://supabase.com) → **New project**
   - Region: `Northeast Asia (Seoul)` 권장
   - DB 비밀번호 설정·보관
2. **Settings → API** 에서 복사:
   - `Project URL`
   - `anon` `public` key
3. `.env.local` 생성:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 3. DB 마이그레이션 적용

CLI로 프로젝트 링크 후 push:

```bash
supabase login
supabase link --project-ref <프로젝트-ref>   # Settings > General 의 Reference ID
supabase db push
```

> 또는 Supabase 대시보드 **SQL Editor**에 `supabase/migrations/0001_init.sql` 내용을 붙여 실행.

스키마는 `users`·`dreams`(+ P2/P3용 테이블)와 RLS, `auth.users → public.users` 트리거를 만든다.

### 4. OAuth 프로바이더 설정 (대시보드 → Authentication → Providers)

- **Google**: [Cloud Console](https://console.cloud.google.com)에서 OAuth 클라이언트 생성 → Client ID/Secret 입력
- **Apple**: Apple Developer에서 Service ID/Key 생성 → 입력
- 공통 **Redirect URL** (Supabase가 표시하는 콜백):
  - `https://<프로젝트>.supabase.co/auth/v1/callback`
- 앱쪽 리다이렉트는 `/auth/callback` 라우트가 처리 (코드 작성 완료).
- 로컬 개발: Authentication → URL Configuration 의 **Site URL / Redirect URLs** 에
  `http://localhost:3000` 추가.

### 5. 실행

```bash
npm run dev
```

→ http://localhost:3000

---

## 구조

```
src/
  app/
    page.tsx              랜딩 (로그인 시 /dreams 리다이렉트)
    login/                소셜 로그인 (Google/Apple)
    auth/callback/        OAuth 코드 → 세션 교환
    auth/signout/         로그아웃
    dreams/
      page.tsx            목록 / 타임라인
      new/                새 꿈
      [id]/               상세 + 삭제
      [id]/edit/          수정
      export/             JSON 내보내기
      actions.ts          서버 액션 (create/update/delete)
  components/DreamForm.tsx 기록 폼 (본문만 필수)
  lib/
    supabase/             client / server / proxy 클라이언트
    types.ts format.ts    공유 타입·포맷
  proxy.ts                세션 갱신 + 인증 가드 (구 middleware)
supabase/migrations/      DB 스키마
```

## 명령

```bash
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
npm run lint     # 린트
```
