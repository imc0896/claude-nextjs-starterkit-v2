import type { Metadata } from "next"
import { PageHeader } from "@/components/composed/page-header"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "설정",
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="설정"
        description="계정 및 애플리케이션 설정을 관리합니다."
      />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>프로필</CardTitle>
            <CardDescription>공개 프로필 정보를 설정합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input id="name" placeholder="이름을 입력하세요" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input id="email" type="email" placeholder="이메일을 입력하세요" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">소개</Label>
              <Textarea
                id="bio"
                placeholder="간단한 자기소개를 작성하세요"
                rows={3}
              />
            </div>
            <Separator />
            <div className="flex justify-end">
              <Button>저장</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>알림</CardTitle>
            <CardDescription>알림 수신 설정을 관리합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">이메일 알림</p>
                <p className="text-xs text-muted-foreground">
                  중요 업데이트를 이메일로 받습니다.
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">마케팅 이메일</p>
                <p className="text-xs text-muted-foreground">
                  새로운 기능과 업데이트 소식을 받습니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
