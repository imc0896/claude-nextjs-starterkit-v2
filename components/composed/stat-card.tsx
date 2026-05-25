import type { LucideIcon } from "lucide-react"
import { TrendingUp, TrendingDown } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon?: LucideIcon
}

/** 통계 카드 컴포넌트 */
export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
}: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className="size-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={cn(
            "mt-1 flex items-center gap-1 text-xs",
            changeType === "positive" && "text-emerald-600 dark:text-emerald-400",
            changeType === "negative" && "text-red-600 dark:text-red-400",
            changeType === "neutral" && "text-muted-foreground",
          )}>
            {changeType === "positive" && <TrendingUp className="size-3" />}
            {changeType === "negative" && <TrendingDown className="size-3" />}
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
