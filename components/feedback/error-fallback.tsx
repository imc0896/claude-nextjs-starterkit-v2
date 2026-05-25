"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"

interface ErrorFallbackProps {
  error: Error & { digest?: string }
  onRetry?: () => void
  title?: string
  description?: string
}

/** 재사용 가능한 에러 표시 컴포넌트 */
export function ErrorFallback({
  error,
  onRetry,
  title = "문제가 발생했습니다",
  description = "요청을 처리하는 중 오류가 발생했습니다.",
}: ErrorFallbackProps) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="size-6 text-destructive" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {error.message}
          </p>
        </CardContent>
        {onRetry && (
          <CardFooter className="justify-center">
            <Button variant="outline" onClick={onRetry}>
              다시 시도
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
