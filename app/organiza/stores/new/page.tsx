import { StoreForm } from '@/components/organiza/store-form'
import { createStoreAction } from '../actions'
import { requireOrgUser } from '@/lib/auth-helpers'

export default async function NewStorePage() {
  await requireOrgUser()
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">สร้างร้านใหม่</h1>
      <StoreForm action={createStoreAction} submitText="สร้างร้าน" />
    </div>
  )
}
