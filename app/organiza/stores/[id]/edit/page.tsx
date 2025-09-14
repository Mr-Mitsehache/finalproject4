//app\organiza\stores\[id]\edit\page.tsx
import { prisma } from '@/lib/prisma'
import { requireOrgUser } from '@/lib/auth-helpers'
import { notFound } from 'next/navigation'
import { StoreForm } from '@/components/organiza/store-form'
import { updateStoreAction } from '../../actions'

type Props = { params: Promise<{ id: string }> } // 👈 ทำเป็น Promise

export default async function EditStorePage({ params }: Props) {
  const { id } = await params            // 👈 ต้อง await ก่อน
  const user = await requireOrgUser()

  const store = await prisma.store.findUnique({ where: { id } })
  if (!store || store.userId !== user.id) notFound()

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">แก้ไขร้าน</h1>
      <StoreForm
        action={updateStoreAction.bind(null, store.id)}
        defaultValues={store}
        submitText="บันทึกการเปลี่ยนแปลง"
      />
    </div>
  )
}
