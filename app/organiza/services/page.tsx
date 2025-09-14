//app\organiza\services\page.tsx
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { requireOrgUser } from '@/lib/auth-helpers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { deleteServiceAction, restoreServiceAction } from './actions'
import { ConfirmDeleteForm } from '@/components/common/confirm-delete-form' // ใช้ยืนยันตอนเก็บถาวร (soft delete)

export default async function OrgServicesPage() {
  const user = await requireOrgUser()
  const store = await prisma.store.findUnique({ where: { userId: user.id! } })
  if (!store) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">บริการของร้าน</h1>
        <Card>
          <CardHeader><CardTitle>ยังไม่มีร้าน</CardTitle></CardHeader>
          <CardContent className="text-muted-foreground">
            สร้างร้านก่อนที่ <Link className="underline" href="/organiza/stores">หน้า จัดการร้าน</Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const [activeServices, archivedServices] = await Promise.all([
    prisma.service.findMany({
      where: { storeId: store.id, isActive: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.service.findMany({
      where: { storeId: store.id, isActive: false },
      orderBy: { updatedAt: 'desc' },
    }),
  ])

  const CardGrid = ({ svcs, archived = false }: { svcs: any[]; archived?: boolean }) => (
    svcs.length === 0 ? (
      <Card>
        <CardHeader><CardTitle className="text-base">{archived ? 'ไม่มีบริการที่ถูกเก็บ' : 'ยังไม่มีบริการ'}</CardTitle></CardHeader>
        <CardContent className="text-muted-foreground">{archived ? '—' : 'เริ่มเพิ่มบริการแรกของคุณ'}</CardContent>
      </Card>
    ) : (
      <div className="grid gap-4 md:grid-cols-2">
        {svcs.map((svc) => (
          <Card key={svc.id} className="overflow-hidden">
            {/* รูปหัวการ์ด */}
            <div
              className="relative h-32 w-full bg-cover bg-center"
              style={{ backgroundImage: `url('${svc.imageUrl || '/images/service-default.jpg'}')` }}
            />
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">{svc.name}</CardTitle>
                <div className="mt-1 text-xs text-muted-foreground">/{svc.slug}</div>
              </div>
              <div className="flex items-center gap-2">
                {!archived ? (
                  <Badge variant="default">Active</Badge>
                ) : (
                  <Badge variant="secondary">Inactive</Badge>
                )}
                <Badge variant="secondary">ID: {svc.id.slice(0, 6)}…</Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm">
              {(svc.priceFrom != null || svc.priceTo != null) && (
                <div className="mb-2 font-semibold text-sky-600">
                  ราคา: ฿{(svc.priceFrom ?? 0).toLocaleString()}
                  {svc.priceTo != null ? ` – ฿${svc.priceTo.toLocaleString()}` : ''}
                </div>
              )}
              {svc.durationMinutes ? (
                <div className="mb-2 text-xs text-muted-foreground">
                  เวลาให้บริการ ~ {svc.durationMinutes} นาที
                </div>
              ) : null}
              {svc.detail ? <p className="line-clamp-2">{svc.detail}</p> : <p className="text-muted-foreground">—</p>}

              <div className="mt-3 flex flex-wrap gap-2">
                {!archived ? (
                  <>
                    <Button asChild size="sm"><Link href={`/organiza/services/${svc.id}/edit`}>แก้ไข</Link></Button>
                    {/* เก็บถาวร (soft delete) */}
                    <ConfirmDeleteForm
                      action={deleteServiceAction}
                      hidden={{ serviceId: svc.id }}
                      label="เก็บถาวร"
                      confirmText="ยืนยันเก็บบริการนี้?"
                      variant="destructive"
                      size="sm"
                    />
                  </>
                ) : (
                  <>
                    {/* กู้คืน */}
                    <form action={restoreServiceAction}>
                      <input type="hidden" name="serviceId" value={svc.id} />
                      <Button type="submit" size="sm" variant="outline">กู้คืน</Button>
                    </form>
                    {/* (ตัวเลือก) ทำปุ่มลบถาวรจริง หากต้องการ */}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  )

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">บริการของร้าน</h1>
        <Button asChild><Link href="/organiza/services/new">เพิ่มบริการ</Link></Button>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="mb-3 text-lg font-semibold">กำลังใช้งาน</h2>
          <CardGrid svcs={activeServices} archived={false} />
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">ถูกเก็บ/ปิดใช้งาน</h2>
          <CardGrid svcs={archivedServices} archived />
        </section>
      </div>
    </div>
  )
}
