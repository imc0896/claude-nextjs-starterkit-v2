---
description: 'src/components/ 폴더에 React 함수형 컴포넌트를 생성합니다'
argument-hint: '컴포넌트 이름 (예: UserProfile, SearchBar)'
allowed-tools:
  [
    'Write',
    'Read',
    'Glob',
  ]
---

# Claude 명령어: Add Component

`components/` 폴더에 TypeScript + Tailwind CSS 기반 React 함수형 컴포넌트를 생성합니다.

## 입력

- `$1`: 컴포넌트 이름 (PascalCase 권장, 예: `UserProfile`)

## 프로세스

1. `$1`이 PascalCase가 아니면 PascalCase로 변환 (예: `user-profile` → `UserProfile`)
2. 파일명은 컴포넌트 이름을 kebab-case로 변환하여 사용 (예: `UserProfile` → `user-profile.tsx`)
3. `components/` 폴더에 동일한 파일이 이미 존재하는지 확인
4. 존재하면 사용자에게 알리고 중단
5. 존재하지 않으면 아래 템플릿으로 파일 생성

## 템플릿

```tsx
interface {ComponentName}Props {

}

/** {ComponentName} 컴포넌트 */
export function {ComponentName}({ }: {ComponentName}Props) {
  return (
    <div className="">
      {ComponentName}
    </div>
  );
}
```

## 규칙

- `"use client"` 지시문은 기본적으로 추가하지 않음 (서버 컴포넌트 우선 원칙)
- props 인터페이스는 항상 정의
- default export 대신 named export 사용
- Tailwind CSS 클래스를 사용한 스타일링
- 컴포넌트 파일 생성 후 전체 경로를 사용자에게 알려줌
