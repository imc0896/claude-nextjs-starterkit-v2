import type { LucideIcon } from "lucide-react"

/** 네비게이션 링크 타입 */
export interface NavItem {
  label: string
  href: string
  icon?: LucideIcon
  description?: string
  children?: NavItem[]
}

/** 사이트 설정 타입 */
export interface SiteConfig {
  name: string
  description: string
  url: string
}

/** 푸터 링크 그룹 타입 */
export interface FooterLinkGroup {
  title: string
  links: { label: string; href: string }[]
}
