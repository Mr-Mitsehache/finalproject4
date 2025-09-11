import { requireAdmin } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { adminDeleteStoreAction, adminToggleStoreOpenAction } from '../actions'
import { ConfirmDeleteForm } from '@/components/admin/confirm-delete-form' // 👈 เพิ่ม import

export default async function AdminStoresPage() {
  await requireAdmin()

  const stores = await prisma.store.findMany({
    orderBy: [{ createdAt: 'desc' }],
    include: { user: { select: { email: true } } },
  })

   return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Stores</h1>

      <Card>
        <CardHeader><CardTitle>รายการร้านทั้งหมด</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {stores.length === 0 ? (
            <div className="text-sm text-muted-foreground">ยังไม่มีร้าน</div>
          ) : (
            stores.map((s) => (
              <div key={s.id} className="grid gap-2 rounded border p-3 md:grid-cols-[1fr_auto_auto] md:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{s.name}</div>
                    <Badge variant={s.isOpen ? 'default' : 'secondary'}>
                      {s.isOpen ? 'เปิด' : 'ปิด'}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Owner: {s.user.email} · Tel: {s.phone}
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-1">{s.address}</div>
                </div>

                {/* toggle open (ไม่มี event handler → ใช้ได้เลย) */}
                <form action={adminToggleStoreOpenAction} className="flex justify-end gap-2">
                  <input type="hidden" name="storeId" value={s.id} />
                  <input type="hidden" name="isOpen" value={s.isOpen ? '0' : '1'} />
                  <Button type="submit" variant="outline" size="sm">
                    {s.isOpen ? 'เปลี่ยนเป็น ปิด' : 'เปลี่ยนเป็น เปิด'}
                  </Button>
                </form>

                {/* delete (ใช้ Client Component แทน onSubmit) */}
                <div className="flex justify-end">
                  <ConfirmDeleteForm
                    action={adminDeleteStoreAction}
                    hidden={{ storeId: s.id }}
                    label="ลบร้าน"
                    confirmText="ลบร้านนี้? ข้อมูลที่เกี่ยวข้องจะถูกลบตามความสัมพันธ์"
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
