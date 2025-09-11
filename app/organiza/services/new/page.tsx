// app/organiza/services/new/page.tsx
import { requireOrgUser } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ServiceForm } from '@/components/organiza/service-form'
import { createServiceAction } from '../actions'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function NewServicePage() {
  const user = await requireOrgUser()
  const store = await prisma.store.findUnique({ where: { userId: user.id! } })
  if (!store) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Card>
          <CardHeader><CardTitle>ยังไม่มีร้าน</CardTitle></CardHeader>
          <CardContent className="text-muted-foreground">
            สร้างร้านก่อนที่ <Link className="underline" href="/organiza/stores">หน้า จัดการร้าน</Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">เพิ่มบริการใหม่</h1>
        <Button asChild variant="outline"><Link href="/organiza/services">กลับ</Link></Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          <ServiceForm action={createServiceAction} submitText="สร้างบริการ" />
        </CardContent>
      </Card>
    </div>
  )
}
