//components\stores\service-card-fancy.tsx
'use client'

import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Star } from 'lucide-react'
import { ServiceMediaDialog } from './service-media-dialog'

type ServiceCardProps = {
  svc: {
    id: string
    name: string
    detail?: string | null
    priceFrom?: number | null
    priceTo?: number | null
    imageUrl?: string | null
    videoUrl?: string | null
    durationMinutes?: number | null
  }
  storeId: string
  rating?: number // คะแนนร้าน (มาโชว์บนการ์ด)
}

function minutesToText(min?: number | null) {
  if (!min) return ''
  if (min < 60) return `${min} นาที`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h} ชม. ${m} นาที` : `${h} ชม.`
}

export function ServiceCardFancy({ svc, storeId, rating }: ServiceCardProps) {
  const cover = svc.imageUrl || '/images/service-default.jpg'
  const media: { url: string; kind?: 'image' | 'video' }[] = []
  if (svc.videoUrl) media.push({ url: svc.videoUrl, kind: 'video' })
  if (svc.imageUrl) media.push({ url: svc.imageUrl, kind: 'image' })

  const features =
    (svc.detail || '')
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(Boolean)
      .slice(0, 6) // แสดงสูงสุด 6 ข้อ

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {/* รูปหัวการ์ด */}
      <div className="relative h-40 w-full bg-cover bg-center" style={{ backgroundImage: `url('${cover}')` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {/* ป้ายโปร (ถ้าอยากใช้ภายหลัง) */}
        {/* <Badge className="absolute left-3 top-3 bg-white text-black hover:bg-white">ยอดนิยม</Badge> */}
      </div>

      <CardContent className="pt-4">
        {/* ชื่อ + คะแนน + เวลา */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold">{svc.name}</h3>
            {features.length === 0 && svc.detail && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{svc.detail}</p>
            )}
          </div>
          <div className="shrink-0 text-right">
            {typeof rating === 'number' && (
              <div className="flex items-center justify-end gap-1 text-sm">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="font-semibold">{rating.toFixed(1)}</span>
              </div>
            )}
            {svc.durationMinutes ? (
              <div className="mt-1 flex items-center justify-end gap-1 text-xs text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{minutesToText(svc.durationMinutes)}</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* ราคา */}
        {(svc.priceFrom != null || svc.priceTo != null) && (
          <div className="mt-3 text-2xl font-extrabold text-sky-600 tabular-nums">
            ฿{(svc.priceFrom ?? 0).toLocaleString()}
            {svc.priceTo != null ? ` - ฿${svc.priceTo.toLocaleString()}` : ''}
          </div>
        )}

        {/* รายละเอียดเป็น bullet (ดึงจาก detail ทีละบรรทัด) */}
        {features.length > 0 && (
          <ul className="mt-3 space-y-1.5 text-sm">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">{f}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <CardFooter className="gap-2">
        {media.length > 0 && (
          <ServiceMediaDialog
            title={svc.name}
            media={media}
            trigger={<Button variant="outline" className="w-full">ดูพรีวิว</Button>}
          />
        )}
        <Button asChild className="w-full">
          <Link href={`/stores/${storeId}/payment?serviceId=${svc.id}`}>เลือกบริการ</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
