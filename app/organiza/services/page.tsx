// app/organiza/services/page.tsx
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { requireOrgUser } from "@/lib/auth-helpers"
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { deleteServiceAction, restoreServiceAction } from "./actions"
import { ConfirmDeleteForm } from "@/components/common/confirm-delete-form"
import { Clock, Edit, ArchiveRestore, Trash2 } from "lucide-react"

export default async function OrgServicesPage() {
  const user = await requireOrgUser()
  const store = await prisma.store.findUnique({ where: { userId: user.id! } })

  if (!store) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">บริการของร้าน</h1>
        <Card>
          <CardHeader>
            <CardTitle>ยังไม่มีร้าน</CardTitle>
            <CardDescription>
              สร้างร้านก่อนที่ <Link className="underline" href="/organiza/stores">หน้า จัดการร้าน</Link>
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const [activeServices, archivedServices] = await Promise.all([
    prisma.service.findMany({
      where: { storeId: store.id, isActive: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.service.findMany({
      where: { storeId: store.id, isActive: false },
      orderBy: { updatedAt: "desc" },
    }),
  ])

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">บริการของร้าน</h1>
        <Button asChild>
          <Link href="/organiza/services/new">+ เพิ่มบริการใหม่</Link>
        </Button>
      </div>

      {/* Active services */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">กำลังใช้งาน</h2>
        {activeServices.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>ยังไม่มีบริการ</CardTitle>
              <CardDescription>เพิ่มบริการแรกของคุณเลย</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeServices.map((svc) => (
              <Card key={svc.id} className="overflow-hidden flex flex-col">
                <div
                  className="relative h-32 bg-cover bg-center"
                  style={{ backgroundImage: `url('${svc.imageUrl || "/images/service-default.jpg"}')` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
                <CardHeader className="flex flex-col items-start">
                  <CardTitle>{svc.name}</CardTitle>
                  <CardDescription>/{svc.slug}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 text-sm space-y-2">
                  {(svc.priceFrom != null || svc.priceTo != null) && (
                    <div className="font-semibold text-sky-600">
                      ราคา: ฿{(svc.priceFrom ?? 0).toLocaleString()}
                      {svc.priceTo != null && ` – ฿${svc.priceTo.toLocaleString()}`}
                    </div>
                  )}
                  {svc.durationMinutes && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      ~ {svc.durationMinutes} นาที
                    </div>
                  )}
                  {svc.detail ? (
                    <p className="line-clamp-2">{svc.detail}</p>
                  ) : (
                    <p className="text-muted-foreground">—</p>
                  )}
                </CardContent>
                <div className="flex justify-end gap-2 px-6 pb-4">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/organiza/services/${svc.id}/edit`}>
                      <Edit className="h-4 w-4 mr-1" /> แก้ไข
                    </Link>
                  </Button>
                  <ConfirmDeleteForm
                    action={deleteServiceAction}
                    hidden={{ serviceId: svc.id }}
                    label={<><Trash2 className="h-4 w-4 mr-1" /> เก็บถาวร</>}
                    confirmText="ยืนยันเก็บบริการนี้?"
                    variant="destructive"
                    size="sm"
                  />
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Archived services */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">ถูกเก็บ/ปิดใช้งาน</h2>
        {archivedServices.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>ไม่มีบริการที่ถูกเก็บ</CardTitle>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {archivedServices.map((svc) => (
              <Card key={svc.id} className="overflow-hidden flex flex-col">
                <div
                  className="relative h-32 bg-cover bg-center"
                  style={{ backgroundImage: `url('${svc.imageUrl || "/images/service-default.jpg"}')` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary">Inactive</Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>{svc.name}</CardTitle>
                  <CardDescription>/{svc.slug}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 text-sm">
                  {svc.detail ? (
                    <p className="line-clamp-2">{svc.detail}</p>
                  ) : (
                    <p className="text-muted-foreground">—</p>
                  )}
                </CardContent>
                <div className="flex justify-end gap-2 px-6 pb-4">
                  <form action={restoreServiceAction}>
                    <input type="hidden" name="serviceId" value={svc.id} />
                    <Button type="submit" size="sm" variant="outline">
                      <ArchiveRestore className="h-4 w-4 mr-1" /> กู้คืน
                    </Button>
                  </form>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
