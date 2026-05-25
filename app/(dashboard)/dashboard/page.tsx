import type { Metadata } from "next"
import { DollarSign, Users, Activity, TrendingUp } from "lucide-react"
import { PageHeader } from "@/components/composed/page-header"
import { StatCard } from "@/components/composed/stat-card"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DASHBOARD_STATS } from "@/lib/constants"

export const metadata: Metadata = {
  title: "대시보드",
}

const STAT_ICONS = [DollarSign, Users, Activity, TrendingUp]

/** 최근 활동 목 데이터 */
const RECENT_ACTIVITIES = [
  { user: "김민수", action: "새 프로젝트 생성", time: "2분 전", status: "완료" },
  { user: "이영희", action: "보고서 업로드", time: "15분 전", status: "완료" },
  { user: "박지훈", action: "설정 변경", time: "1시간 전", status: "진행 중" },
  { user: "정수연", action: "팀원 초대", time: "3시간 전", status: "완료" },
] as const

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="대시보드"
        description="프로젝트 현황을 한눈에 확인하세요."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {DASHBOARD_STATS.map((stat, index) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeType={stat.changeType}
            icon={STAT_ICONS[index]}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
            <CardDescription>팀의 최근 활동 내역입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {RECENT_ACTIVITIES.map((activity) => (
                <div
                  key={`${activity.user}-${activity.time}`}
                  className="flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{activity.user}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.action} · {activity.time}
                    </p>
                  </div>
                  <Badge
                    variant={activity.status === "완료" ? "secondary" : "outline"}
                  >
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>빠른 시작</CardTitle>
            <CardDescription>자주 사용하는 기능에 빠르게 접근하세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "새 프로젝트", desc: "프로젝트 생성" },
                { label: "보고서", desc: "보고서 확인" },
                { label: "팀 관리", desc: "팀원 관리" },
                { label: "설정", desc: "환경 설정" },
              ].map((item) => (
                <Card key={item.label} className="cursor-pointer transition-colors hover:bg-muted/50">
                  <CardContent className="p-4">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
