"use client"

import { NavLink } from "@/components/composed/nav-link"
import { MARKETING_NAV_ITEMS } from "@/lib/constants"

/** 데스크톱 네비게이션 — 헤더 내부 클라이언트 컴포넌트 */
export function DesktopNav() {
  return (
    <nav className="hidden items-center gap-4 md:flex">
      {MARKETING_NAV_ITEMS.map((item) => (
        <NavLink key={item.href} href={item.href}>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
