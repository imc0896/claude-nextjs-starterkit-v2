---
name: recurring-issues
description: 이 프로젝트에서 반복적으로 나타나는 코드 이슈 및 컨벤션 위반 패턴 기록
metadata:
  type: project
---

## 확인된 이슈 (2026-05-25 초기 리뷰 기준)

### ESLint 오류 (심각)
- `user-profile.tsx`: 빈 인터페이스 `interface UserProfileProps {}` 선언 → `@typescript-eslint/no-empty-object-type` 오류 발생.
  - 해결: props가 없으면 인터페이스 자체를 제거하거나 `type UserProfileProps = Record<string, never>` 사용.

### 미완성 컴포넌트 패턴
- `user-profile.tsx`: 빈 Props 인터페이스, 하드코딩된 텍스트 "UserProfile", 빈 className — 구현 없이 추가된 플레이스홀더 상태.

### 접근성 이슈
- `dialog.tsx` 닫기 버튼 `<span className="sr-only">Close</span>` — 영어로 되어 있음. 한국어(`닫기`) 권장.
- `dialog.tsx` `DialogFooter`의 `showCloseButton`이 `false`일 때 표시되는 기본 Close 버튼도 영어.
- `card.tsx`의 `CardTitle`이 `<div>` 태그 사용 — 의미론적으로 `<h3>` 등이 더 적절할 수 있으나, shadcn/ui v4 설계상 호출부에서 헤딩 계층을 제어하는 방식임 (인지 필요).

### 코드 스타일 비일관성
- `src/components/ui/` 하위 파일들은 세미콜론 없는 스타일(shadcn/ui 기본 포맷).
- `src/components/` 커스텀 파일들은 세미콜론 포함 스타일.
- → shadcn/ui 생성 파일은 이 스타일을 유지하고, 커스텀 파일만 프로젝트 컨벤션 적용.

### package.json 잠재적 중복 의존성
- `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-label`, `@radix-ui/react-slot` 개별 패키지와 `radix-ui` 통합 패키지가 동시에 설치됨.
- shadcn/ui CLI가 자동으로 추가한 것으로, 현재는 문제없으나 향후 `radix-ui` 단일 패키지로 통일 검토 가능.

### `@eslint/eslintrc` 불필요 devDependency
- `package.json`에 `@eslint/eslintrc`가 devDependency로 포함되어 있으나, `eslint.config.mjs`는 FlatCompat를 사용하지 않음 (CLAUDE.md 지침 준수).
- 실제로 import되지 않으므로 제거 가능한 불필요한 의존성.
