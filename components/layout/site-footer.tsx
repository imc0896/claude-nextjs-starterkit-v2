import Link from "next/link"
import { Logo } from "@/components/composed/logo"
import { Separator } from "@/components/ui/separator"
import { SITE_CONFIG, FOOTER_LINK_GROUPS } from "@/lib/constants"

/** 마케팅 페이지 푸터 */
export function SiteFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <Logo />
            <p className="text-sm text-muted-foreground">
              {SITE_CONFIG.description}
            </p>
          </div>
          {FOOTER_LINK_GROUPS.map((group) => (
            <div key={group.title} className="space-y-3">
              <h3 className="text-sm font-semibold">{group.title}</h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Separator className="my-8" />
        <p className="text-center text-sm text-muted-foreground">
          &copy; {currentYear} {SITE_CONFIG.name}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
