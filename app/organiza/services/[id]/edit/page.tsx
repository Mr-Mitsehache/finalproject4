// app/organiza/services/[id]/edit/page.tsx
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireOrgUser } from '@/lib/auth-helpers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ServiceForm } from '@/components/organiza/service-form'
import { updateServiceAction } from '../../actions'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

type Props = { params: Promise<{ id: string }> } // Next 15: await params

export default async function EditServicePage({ params }: Props) {
  const { id } = await params
  const user = await requireOrgUser()
  const store = await prisma.store.findUnique({ where: { userId: user.id! } })
  if (!store) notFound()

  const svc = await prisma.service.findUnique({ where: { id } })
  if (!svc || svc.storeId !== store.id) notFound()

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">แก้ไขบริการ</h1>
        <Button asChild variant="outline"><Link href="/organiza/services">กลับ</Link></Button>
      </div>
      <Card>
        <CardHeader><CardTitle>{svc.name}</CardTitle></CardHeader>
        <CardContent>
          <ServiceForm
            action={updateServiceAction.bind(null, svc.id)}
            defaultValues={svc}
            submitText="บันทึกการเปลี่ยนแปลง"
          />
        </CardContent>
      </Card>
    </div>
  )
}
