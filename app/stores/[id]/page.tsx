import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Users, Shield, Sparkles } from "lucide-react"

import { revalidatePath } from "next/cache"
import { getStoreById } from "@/app/data/stores"
import { createReview } from "@/app/data/reviews"
import { Navbar } from "@/components/navbar"

// ✅ import Prisma type for the card
import type { Service as ServiceModel } from "@prisma/client"

export const revalidate = 60

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const store = await getStoreById(id)
  if (!store) return { title: "Store not found" }
  return {
    title: `${store.name} Stores`,
    description: store.address ?? undefined,
  }
}

export default async function StorePage({ params }: Props) {
  const { id } = await params
  const store = await getStoreById(id)
  if (!store) notFound()

  // --- server action: create review (keep if you'll render the form later) ---
  async function createReviewAction(formData: FormData) {
    "use server"
    const storeId = String(formData.get("storeId") ?? "")
    const author = String(formData.get("author") ?? "")
    const rating = Number(formData.get("rating") ?? 0)
    const comment = String(formData.get("comment") ?? "")

    await createReview({ storeId, author, rating, comment })
    revalidatePath(`/stores/${storeId}`)
  }

  return (
    <div className="pb-16">
      <Navbar />

      {/* HERO */}
      <section className="relative">
        <div
          className="relative overflow-hidden rounded-none md:rounded-2xl"
          style={{ }}
        >
          <div className="absolute inset-0 bg-black/60 md:bg-gradient-to-r md:from-black/70 md:to-black/20" />
          <div className="relative z-10 container mx-auto max-w-6xl px-4 py-10 md:py-16">
            {/* dynamic rating line */}
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-white backdrop-blur">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm">
                {store.rating.toFixed(1)}/5 จาก {store.reviewsCount.toLocaleString()} รีวิว
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-white">
              {store.name}
            </h1>

            <p className="mt-3 max-w-2xl text-white/80">
              ดูแลรถของคุณด้วยเทคโนโลยีทันสมัย ผลิตภัณฑ์คุณภาพสูง และทีมงานมืออาชีพ
              เพื่อให้รถของคุณกลับมาเงางามเหมือนใหม่
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href={`/stores/${store.id}`}>จองบริการเลย</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-white/10 text-white border-white/30 hover:bg-white/20"
              >
                <Link href="#services">ดูบริการทั้งหมด</Link>
              </Button>
            </div>

            {/* stats (static example) */}
            <div className="mt-8 grid grid-cols-2 gap-4 text-white/90 sm:grid-cols-4">
              <Stat icon={<Users className="h-5 w-5" />} title="10,000+" subtitle="ลูกค้าไว้ใจ" />
              <Stat icon={<Shield className="h-5 w-5" />} title="5" subtitle="ปีรับประกันคุณภาพ" />
              <Stat icon={<Sparkles className="h-5 w-5" />} title="15+" subtitle="รายการบริการ" />
              <Stat icon={<Star className="h-5 w-5 text-yellow-400 fill-current" />} title={store.rating.toFixed(1)} subtitle="คะแนนเฉลี่ย" />
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="container mx-auto max-w-6xl px-4 pt-12">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold">
            บริการคาร์แคร์ <span className="text-sky-600">ครบวงจร</span>
          </h2>
          <p className="mt-2 text-muted-foreground">
            เลือกบริการที่เหมาะกับความต้องการของคุณ ด้วยคุณภาพระดับมืออาชีพ และราคาที่คุ้มค่า
          </p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {store.services.length === 0 ? (
            <div className="text-sm text-muted-foreground">ยังไม่มีบริการ</div>
          ) : (
            store.services.map((svc) => (
              <ServiceCard key={svc.id} svc={svc} storeId={store.id} />
            ))
          )}
        </div>
      </section>
    </div>
  )
}

/* ---------- small bits ---------- */

function Stat({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur">
        {icon}
      </div>
      <div>
        <div className="text-lg font-bold">{title}</div>
        <div className="text-xs opacity-80">{subtitle}</div>
      </div>
    </div>
  )
}

// ✅ Card that matches your Prisma Service model
function ServiceCard({
  svc,
  storeId,
}: {
  svc: ServiceModel
  storeId: string
}) {
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{svc.name}</CardTitle>
        {svc.detail && (
          <p className="text-sm text-muted-foreground line-clamp-3">{svc.detail}</p>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {(svc.priceFrom != null || svc.priceTo != null) && (
          <div className="mt-1 text-2xl font-extrabold tabular-nums">
            ฿{(svc.priceFrom ?? 0).toLocaleString()}
            {svc.priceTo != null ? `${svc.priceTo.toLocaleString()}` : ""}
          </div>
        )}
      </CardContent>

      <CardFooter className="mt-auto">
        <Button asChild className="w-full">
          {/* ✅ Go to your payment page for this service */}
          <Link href={`/stores/${storeId}/payment?serviceId=${svc.id}`}>
            เลือกบริการ
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
