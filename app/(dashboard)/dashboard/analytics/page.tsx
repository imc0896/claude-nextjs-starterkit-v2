import type { Metadata } from "next"
import { BarChart3 } from "lucide-react"
import { PageHeader } from "@/components/composed/page-header"
import { EmptyState } from "@/components/composed/empty-state"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "분석",
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="분석"
        description="데이터 분석 및 인사이트를 확인합니다."
      />
      <EmptyState
        icon={BarChart3}
        title="분석 데이터가 없습니다"
        description="데이터가 충분히 수집되면 분석 결과가 여기에 표시됩니다."
      >
        <Button variant="outline">데이터 가져오기</Button>
      </EmptyState>
    </div>
  )
}
