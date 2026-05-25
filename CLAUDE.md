# CLAUDE.md

@AGENTS.md

## 프로젝트 개요

Next.js 16.2.6 + React 19.2.4 + TypeScript 5 + Tailwind CSS v4 + shadcn/ui 4.8.0 기반 스타터킷. 한국어 UI (`lang="ko"`).

주요 의존성: `radix-ui`, `lucide-react`, `next-themes`, `class-variance-authority`, `usehooks-ts`, `tw-animate-css`

## 명령어

- `npm run dev` — 개발 서버
- `npm run build` — 프로덕션 빌드
- `npm run lint` — ESLint (flat config, core-web-vitals + typescript)
- `npx shadcn add <name>` — shadcn/ui 컴포넌트 추가 → `components/ui/`에 배치

## 아키텍처

### 라우팅 (App Router)

두 개의 Route Group으로 레이아웃 분리:

- **`(marketing)/`** — `SiteHeader` + `SiteFooter` 레이아웃
  - `/` — 랜딩 페이지 (hero, features, CTA)
- **`(dashboard)/`** — `SidebarProvider` + `AppSidebar` + `BreadcrumbNav` 레이아웃
  - `/dashboard` — 메인 대시보드, `/dashboard/analytics`, `/dashboard/users`, `/dashboard/settings`

글로벌 에러/로딩 처리: `app/error.tsx`, `app/loading.tsx`, `app/not-found.tsx`

### 루트 레이아웃 Provider 구조

`html` → `body` → `ThemeProvider` → `TooltipProvider` → `{children}`

폰트: Geist Sans (`--font-geist-sans`) + Geist Mono (`--font-geist-mono`)

### 컴포넌트 구조 (`components/`)

| 디렉토리 | 역할 | 파일 수 |
|---|---|---|
| `ui/` | shadcn/ui 프리미티브. `npx shadcn add`로 관리. 직접 수정 최소화. | 19 |
| `composed/` | 비즈니스 로직 조합 (StatCard, PageHeader, ThemeToggle, Logo, NavLink, SearchInput, UserAvatar, EmptyState, LoadingSkeleton) | 9 |
| `layout/` | 페이지 레이아웃 (SiteHeader, SiteHeaderNav, SiteFooter, AppSidebar, BreadcrumbNav, MobileNav, SkipToContent) | 7 |
| `providers/` | Context Provider (ThemeProvider) | 1 |
| `feedback/` | 에러/로딩/404 UI (ErrorFallback, PageLoading, NotFoundView) | 3 |

### 유틸리티 & 훅

- **`lib/utils.ts`** — `cn()` 함수 (clsx + tailwind-merge). Tailwind 클래스 병합 시 항상 사용.
- **`lib/constants.ts`** — 사이트 설정, 네비게이션, 피처 목록, 대시보드 통계 등 모든 정적 데이터.
- **`lib/types.ts`** — 공유 타입 (NavItem, SiteConfig, FooterLinkGroup).
- **`hooks/use-mobile.ts`** — 모바일 감지 (768px, `useSyncExternalStore`).
- **`hooks/index.ts`** — usehooks-ts re-export (useMediaQuery, useLocalStorage, useDebounceValue, useToggle, useOnClickOutside, useIsClient).

### Import 경로

`@/*` 별칭 = 프로젝트 루트. 예: `@/components/ui/button`, `@/lib/utils`

## 코딩 규칙

- **Server Component 우선**: `"use client"`는 상태/이벤트/브라우저 API 사용 시에만 추가
- **named export 사용**: `export function ComponentName()` — default export는 `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`만 해당
- **Props 인터페이스**: 컴포넌트마다 `interface ComponentNameProps {}` 정의
- **cn() 필수**: Tailwind 클래스를 조건부 병합할 때 반드시 `cn()` 사용
- **접근성 패턴**: `SkipToContent` 컴포넌트로 키보드 네비게이션 지원, 메인 영역에 `id="main-content"` 부여

## 스타일링

- **Tailwind CSS v4** — `@import`문 기반, `tailwind.config` 파일 없음. 설정은 `app/globals.css`의 `@theme inline` 블록.
- **oklch 색상 공간** — CSS 변수가 oklch로 정의됨. `.dark` 클래스로 다크 테마 자동 전환.
- **next-themes** — `attribute="class"`, `defaultTheme="system"`, `enableSystem`, `disableTransitionOnChange`

## shadcn/ui 설정 (`components.json`)

- 스타일: `radix-nova` / 베이스 색상: `neutral` / 아이콘: `lucide` / RSC 활성화
- 경로 alias: `ui` → `@/components/ui`, `components` → `@/components`, `utils` → `@/lib/utils`, `lib` → `@/lib`, `hooks` → `@/hooks`

## Next.js 16 주의사항

이 프로젝트는 **Next.js 16**을 사용합니다. 학습 데이터와 API가 다를 수 있으므로, 코드 작성 전 반드시 문서를 참조하세요.

- 문서 경로: `node_modules/next/dist/docs/01-app/`
  - 시작 가이드: `01-getting-started/`
  - 실용 가이드: `02-guides/` (AI 에이전트 가이드: `ai-agents.md`)
  - API 참조: `03-api-reference/`
- **error.tsx**: `reset` 대신 `unstable_retry` 사용 (Next.js 16 변경)
- **Turbopack**: Next.js 16 기본 번들러 (별도 플래그 불필요)
