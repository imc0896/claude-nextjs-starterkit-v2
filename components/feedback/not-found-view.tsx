import { FileQuestion } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"

interface NotFoundViewProps {
  title?: string
  description?: string
  backHref?: string
  backLabel?: string
}

/** 재사용 가능한 404 표시 컴포넌트 */
export function NotFoundView({
  title = "페이지를 찾을 수 없습니다",
  description = "요청하신 페이지가 존재하지 않거나 이동되었습니다.",
  backHref = "/",
  backLabel = "홈으로 돌아가기",
}: NotFoundViewProps) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
            <FileQuestion className="size-6 text-muted-foreground" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Button variant="outline" asChild>
            <Link href={backHref}>{backLabel}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
