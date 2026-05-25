import { Separator } from "@/components/ui/separator"

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

/** 페이지 제목 + 설명 + 액션 버튼 영역 */
export function PageHeader({
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <Separator />
    </div>
  )
}
