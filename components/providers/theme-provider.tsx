"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"

/** 테마 프로바이더 — next-themes 래퍼 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
