import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { requireOrgUser } from '@/lib/auth-helpers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { deleteServiceAction } from './actions'
import { ConfirmDeleteForm } from '@/components/admin/confirm-delete-form' // ใช้ตัวเดิมได้

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

  const services = await prisma.service.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">บริการของร้าน</h1>
        <Button asChild><Link href="/organiza/services/new">เพิ่มบริการ</Link></Button>
      </div>

      {services.length === 0 ? (
        <Card>
          <CardHeader><CardTitle>ยังไม่มีบริการ</CardTitle></CardHeader>
          <CardContent className="text-muted-foreground">เริ่มเพิ่มบริการแรกของคุณ</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {services.map(svc => (
            <Card key={svc.id}>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{svc.name}</CardTitle>
                  <div className="mt-1 text-xs text-muted-foreground">/{svc.slug}</div>
                </div>
                <Badge variant="secondary">ID: {svc.id.slice(0, 6)}…</Badge>
              </CardHeader>
              <CardContent className="text-sm">
                {svc.detail ? <p className="mb-2">{svc.detail}</p> : <p className="text-muted-foreground mb-2">—</p>}
                {(svc.priceFrom != null || svc.priceTo != null) && (
                  <div className="font-semibold">
                    ราคา: ฿{(svc.priceFrom ?? 0).toLocaleString()}
                    {svc.priceTo != null ? ` – ฿${svc.priceTo.toLocaleString()}` : ''}
                  </div>
                )}
                <div className="mt-3 flex gap-2">
                  <Button asChild size="sm"><Link href={`/organiza/services/${svc.id}/edit`}>แก้ไข</Link></Button>
                  <ConfirmDeleteForm
                    action={deleteServiceAction}
                    hidden={{ serviceId: svc.id }}
                    label="ลบ"
                    confirmText="ลบบริการนี้?"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
