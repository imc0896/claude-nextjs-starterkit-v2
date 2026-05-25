---
name: project-architecture
description: 이 프로젝트의 핵심 아키텍처 결정 사항 — CSS-first TailwindCSS v4, shadcn/ui v4 통합, 서버/클라이언트 컴포넌트 분리 패턴
metadata:
  type: project
---

Next.js 16 App Router 기반 한국어 스타터킷.

**Why:** 빠른 프로젝트 시작을 위한 표준화된 기반 코드. 한국어 웹 서비스 개발에 최적화.

**How to apply:** 아래 설계 원칙을 리뷰 시 체크포인트로 활용.

## 핵심 설계 결정

- `tailwind.config.*` 없음. 디자인 토큰은 `globals.css`의 `@theme inline` 블록에서만 관리.
- CSS 변수는 `:root`(라이트)와 `.dark`(다크) 양쪽 모두 정의 필수.
- 애니메이션: `tw-animate-css` 사용 (`tailwindcss-animate` 아님).
- `components.json`의 `tailwind.config`는 빈 문자열 `""` — v4 호환 모드.
- 서버 컴포넌트(`page.tsx`)와 클라이언트 컴포넌트(`demo-section.tsx`) 명확히 분리.
- 인터랙티브 로직은 반드시 `"use client"` 파일로 분리할 것.
- `<html lang="ko" suppressHydrationWarning>` 필수 패턴 (next-themes hydration 경고 방지).
- Pretendard 폰트: `next/font` 미사용, `pretendard` npm 패키지로 로컬 로드.
- ESLint 9 Flat config: `FlatCompat` 사용 금지, `eslint-config-next/*`를 직접 spread.
- shadcn/ui 컴포넌트: `src/components/ui/` 경로 고정.
- `@radix-ui/*` 패키지와 `radix-ui` (통합 패키지) 병행 사용 중 — 두 가지 import 패턴 모두 정상.

## 파일 역할
- `src/app/page.tsx` — 서버 컴포넌트, 안내 페이지
- `src/components/demo-section.tsx` — `"use client"`, 인터랙티브 데모
- `src/components/mode-toggle.tsx` — `"use client"`, 다크모드 토글
- `src/components/theme-provider.tsx` — `"use client"`, next-themes 래퍼
- `src/lib/utils.ts` — `cn()` 헬퍼 (clsx + tailwind-merge)
