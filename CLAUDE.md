# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## 프로젝트 개요

Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui 기반 스타터킷. 한국어 UI.

## 명령어

- `npm run dev` — 개발 서버 (Turbopack)
- `npm run build` — 프로덕션 빌드
- `npm run start` — 프로덕션 서버
- `npm run lint` — ESLint (flat config, `eslint` 직접 실행)
- `npx shadcn add <component>` — shadcn/ui 컴포넌트 추가

## 아키텍처

### 라우팅 (App Router, `app/` 디렉토리)

두 개의 Route Group으로 레이아웃 분리:

- **`(marketing)/`** — 공개 마케팅 페이지. `SiteHeader` + `SiteFooter` 레이아웃.
  - `/` — 랜딩 페이지 (hero, features, CTA)
- **`(dashboard)/`** — 대시보드 영역. `SidebarProvider` + `AppSidebar` + `BreadcrumbNav` 레이아웃.
  - `/dashboard` — 메인 대시보드 (통계, 활동)
  - `/dashboard/analytics`, `/dashboard/users`, `/dashboard/settings`

### 컴포넌트 구조 (`components/`)

계층적 구조:

| 디렉토리 | 역할 |
|---|---|
| `ui/` | shadcn/ui 프리미티브 (Button, Card, Sidebar 등). `npx shadcn add`로 관리. 직접 수정 최소화. |
| `composed/` | 비즈니스 로직 조합 컴포넌트 (StatCard, PageHeader, ThemeToggle 등) |
| `layout/` | 레이아웃 컴포넌트 (SiteHeader, AppSidebar, SiteFooter 등) |
| `providers/` | Context Provider (ThemeProvider) |
| `feedback/` | 에러/로딩/404 UI 컴포넌트 |

### 주요 유틸리티

- **`lib/utils.ts`** — `cn()` 함수 (clsx + tailwind-merge). 클래스 병합 시 항상 사용.
- **`lib/constants.ts`** — 사이트 설정, 네비게이션 항목, 피처 목록, 대시보드 통계 등 모든 정적 데이터.
- **`lib/types.ts`** — 공유 타입 (NavItem, SiteConfig, FooterLinkGroup).
- **`hooks/use-mobile.ts`** — 모바일 감지 (768px 브레이크포인트, `useSyncExternalStore`).
- **`hooks/index.ts`** — usehooks-ts에서 re-export (useMediaQuery, useLocalStorage 등).

### Import 경로

`@/*` 별칭이 프로젝트 루트를 가리킴. 예: `@/components/ui/button`, `@/lib/utils`.

## 스타일링

- **Tailwind CSS v4** — `@import`문 기반, `tailwind.config` 파일 없음. 설정은 `app/globals.css`의 `@theme` 블록에서 관리.
- **oklch 색상 공간** — CSS 변수가 oklch로 정의됨. 라이트/다크 테마 변수 자동 전환.
- **next-themes** — 시스템 설정 감지 + 수동 토글 지원. `ThemeProvider`가 루트 레이아웃에서 래핑.

## shadcn/ui 설정

- 스타일: `radix-nova` / 베이스 색상: `neutral` / 아이콘: `lucide`
- RSC(React Server Components) 활성화
- 컴포넌트 추가 시 `npx shadcn add <name>` 사용 — `components/ui/`에 자동 배치

## Next.js 16 주의사항

이 프로젝트는 **Next.js 16**을 사용합니다. 학습 데이터와 API가 다를 수 있으므로, 코드 작성 전 `node_modules/next/dist/docs/` 문서를 반드시 참조하세요.
