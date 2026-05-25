import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { LANDING_FEATURES, SITE_CONFIG } from "@/lib/constants"

/** 히어로 섹션 */
function HeroSection() {
  return (
    <section className="relative py-20 md:py-32">
      <div className="container mx-auto px-4 text-center">
        <Badge variant="secondary" className="mb-4">
          Next.js 16 + shadcn/ui
        </Badge>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          현대적인 웹 애플리케이션을{" "}
          <span className="text-primary">빠르게 시작하세요</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          {SITE_CONFIG.description}.
          사전 구성된 레이아웃, 다크 모드, 반응형 디자인으로
          프로덕션 레디 프로젝트를 즉시 시작할 수 있습니다.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/dashboard">
              시작하기
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="#features">기능 살펴보기</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

/** 피처 섹션 */
function FeaturesSection() {
  return (
    <section id="features" className="border-t bg-muted/40 py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            모든 것이 준비되어 있습니다
          </h2>
          <p className="mt-3 text-muted-foreground">
            프로덕션 환경에 필요한 핵심 기능이 이미 구성되어 있습니다.
          </p>
        </div>
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {LANDING_FEATURES.map((feature) => (
            <Card key={feature.title} className="border-0 bg-background shadow-sm">
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="size-5 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

/** CTA 섹션 */
function CtaSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight">
          지금 바로 시작하세요
        </h2>
        <p className="mt-3 text-muted-foreground">
          몇 분 안에 프로젝트를 설정하고 개발을 시작할 수 있습니다.
        </p>
        <Button size="lg" className="mt-8" asChild>
          <Link href="/dashboard">
            대시보드로 이동
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <CtaSection />
    </>
  )
}
