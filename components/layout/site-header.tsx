import Link from "next/link"
import { SkipToContent } from "@/components/layout/skip-to-content"
import { Logo } from "@/components/composed/logo"
import { ThemeToggle } from "@/components/composed/theme-toggle"
import { MobileNav } from "@/components/layout/mobile-nav"
import { DesktopNav } from "@/components/layout/site-header-nav"
import { Button } from "@/components/ui/button"

/** 마케팅 페이지 헤더 */
export function SiteHeader() {
  return (
    <>
      <SkipToContent />
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Logo />
            <DesktopNav />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="default" size="sm" asChild className="hidden sm:flex">
              <Link href="/dashboard">대시보드</Link>
            </Button>
            <MobileNav />
          </div>
        </div>
      </header>
    </>
  )
}
