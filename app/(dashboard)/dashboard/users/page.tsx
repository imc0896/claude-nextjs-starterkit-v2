import type { Metadata } from "next"
import { UserPlus } from "lucide-react"
import { PageHeader } from "@/components/composed/page-header"
import { EmptyState } from "@/components/composed/empty-state"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "사용자",
}

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="사용자 관리"
        description="팀원을 관리하고 권한을 설정합니다."
        actions={<Button>사용자 초대</Button>}
      />
      <EmptyState
        icon={UserPlus}
        title="등록된 사용자가 없습니다"
        description="팀원을 초대하여 함께 작업을 시작하세요."
      >
        <Button variant="outline">팀원 초대하기</Button>
      </EmptyState>
    </div>
  )
}
