"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface NavLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  activeClassName?: string
  onClick?: () => void
}

/** 활성 상태를 자동 감지하는 네비게이션 링크 */
export function NavLink({
  href,
  children,
  className,
  activeClassName,
  onClick,
}: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href))

  return (
    <Link
      href={href}
      onClick={onClick}
      data-active={isActive || undefined}
      className={cn(
        "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
        isActive && "text-foreground",
        isActive && activeClassName,
        className,
      )}
    >
      {children}
    </Link>
  )
}
