import {
  LayoutDashboard,
  BarChart3,
  Users,
  Settings,
  Zap,
  Shield,
  Paintbrush,
  Blocks,
  Moon,
  Smartphone,
} from "lucide-react"
import type { NavItem, SiteConfig, FooterLinkGroup } from "@/lib/types"

/** 사이트 기본 설정 */
export const SITE_CONFIG: SiteConfig = {
  name: "StarterKit",
  description: "Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui 스타터킷",
  url: "https://example.com",
}

/** 마케팅 페이지 네비게이션 */
export const MARKETING_NAV_ITEMS: NavItem[] = [
  { label: "홈", href: "/" },
  { label: "기능", href: "/#features" },
  { label: "대시보드", href: "/dashboard" },
]

/** 대시보드 네비게이션 */
export const DASHBOARD_NAV_ITEMS: NavItem[] = [
  { label: "대시보드", href: "/dashboard", icon: LayoutDashboard },
  { label: "분석", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "사용자", href: "/dashboard/users", icon: Users },
  { label: "설정", href: "/dashboard/settings", icon: Settings },
]

/** 푸터 링크 */
export const FOOTER_LINK_GROUPS: FooterLinkGroup[] = [
  {
    title: "제품",
    links: [
      { label: "기능", href: "/#features" },
      { label: "대시보드", href: "/dashboard" },
    ],
  },
  {
    title: "리소스",
    links: [
      { label: "문서", href: "#" },
      { label: "GitHub", href: "#" },
    ],
  },
  {
    title: "법적 고지",
    links: [
      { label: "개인정보처리방침", href: "#" },
      { label: "이용약관", href: "#" },
    ],
  },
]

/** 랜딩 페이지 피처 목록 */
export const LANDING_FEATURES = [
  {
    icon: Zap,
    title: "빠른 개발",
    description: "사전 구성된 설정으로 프로젝트를 즉시 시작하세요.",
  },
  {
    icon: Shield,
    title: "타입 안전성",
    description: "TypeScript로 런타임 에러를 사전에 방지합니다.",
  },
  {
    icon: Paintbrush,
    title: "현대적 스타일링",
    description: "Tailwind CSS v4로 빠르고 일관된 UI를 구축합니다.",
  },
  {
    icon: Blocks,
    title: "컴포넌트 라이브러리",
    description: "shadcn/ui의 접근성 높은 컴포넌트를 바로 사용하세요.",
  },
  {
    icon: Moon,
    title: "다크 모드",
    description: "시스템 설정에 맞춘 자동 다크 모드를 지원합니다.",
  },
  {
    icon: Smartphone,
    title: "반응형 디자인",
    description: "모바일부터 데스크톱까지 완벽하게 대응합니다.",
  },
] as const

/** 대시보드 통계 상수 */
export const DASHBOARD_STATS = [
  {
    title: "총 수익",
    value: "₩45,231,890",
    change: "+20.1%",
    changeType: "positive" as const,
  },
  {
    title: "총 사용자",
    value: "2,350",
    change: "+180",
    changeType: "positive" as const,
  },
  {
    title: "활성 세션",
    value: "573",
    change: "-12",
    changeType: "negative" as const,
  },
  {
    title: "전환율",
    value: "3.24%",
    change: "+0.5%",
    changeType: "positive" as const,
  },
] as const
