"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Logo } from "@/components/composed/logo"
import { NavLink } from "@/components/composed/nav-link"
import { ThemeToggle } from "@/components/composed/theme-toggle"
import { MARKETING_NAV_ITEMS } from "@/lib/constants"

/** 모바일 시트 네비게이션 */
export function MobileNav() {
  const [open, setOpen] = useState(false)

  const closeSheet = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="size-5" />
          <span className="sr-only">메뉴 열기</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle>
            <Logo />
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="my-4 flex-1">
          <nav className="flex flex-col gap-2 px-2">
            {MARKETING_NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 hover:bg-muted"
                onClick={closeSheet}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </ScrollArea>
        <Separator />
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-muted-foreground">테마</span>
          <ThemeToggle />
        </div>
      </SheetContent>
    </Sheet>
  )
}
