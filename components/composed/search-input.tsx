"use client"

import { Search } from "lucide-react"
import { useDebounceValue } from "@/hooks"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useEffect } from "react"

interface SearchInputProps {
  placeholder?: string
  className?: string
  onSearch?: (value: string) => void
  debounceMs?: number
}

const DEFAULT_DEBOUNCE_MS = 300

/** 디바운스 검색 입력 */
export function SearchInput({
  placeholder = "검색...",
  className,
  onSearch,
  debounceMs = DEFAULT_DEBOUNCE_MS,
}: SearchInputProps) {
  const [debouncedValue, setValue] = useDebounceValue("", debounceMs)

  useEffect(() => {
    if (onSearch && debouncedValue) {
      onSearch(debouncedValue)
    }
  }, [debouncedValue, onSearch])

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        className="pl-9"
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  )
}
