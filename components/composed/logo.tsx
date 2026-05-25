import Link from "next/link"
import { Blocks } from "lucide-react"
import { SITE_CONFIG } from "@/lib/constants"

interface LogoProps {
  showText?: boolean
}

/** 사이트 로고 컴포넌트 */
export function Logo({ showText = true }: LogoProps) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Blocks className="size-5 text-primary" />
      {showText && (
        <span className="text-lg font-bold tracking-tight">
          {SITE_CONFIG.name}
        </span>
      )}
    </Link>
  )
}
