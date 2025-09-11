'use client'

import { useActionState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { Service } from '@prisma/client'
import type { ServiceFormState } from '@/app/organiza/services/actions'

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export function ServiceForm({
  action,
  defaultValues,
  submitText = 'บันทึกบริการ',
}: {
  action: (prev: ServiceFormState, formData: FormData) => Promise<ServiceFormState>
  defaultValues?: Partial<Service>
  submitText?: string
}) {
  const [state, formAction, isPending] = useActionState(action, {} as ServiceFormState)

  useEffect(() => {
    if (!defaultValues?.slug) {
      const nameEl = document.getElementById('name') as HTMLInputElement | null
      const slugEl = document.getElementById('slug') as HTMLInputElement | null
      if (nameEl && slugEl) {
        const h = () => { if (!slugEl.value) slugEl.value = slugify(nameEl.value) }
        nameEl.addEventListener('blur', h)
        return () => nameEl.removeEventListener('blur', h)
      }
    }
  }, [defaultValues?.slug])

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="rounded border border-destructive/40 bg-destructive/5 p-2 text-sm text-destructive">
          {state.error}
        </div>
      )}
      {state?.ok && (
        <div className="rounded border border-emerald-400/40 bg-emerald-400/10 p-2 text-sm text-emerald-600">
          บันทึกสำเร็จ
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">ชื่อบริการ</Label>
          <Input id="name" name="name" defaultValue={defaultValues?.name ?? ''} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" defaultValue={defaultValues?.slug ?? ''} placeholder="เช่น basic-wash" required />
        </div>

        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="detail">รายละเอียด</Label>
          <Textarea id="detail" name="detail" defaultValue={defaultValues?.detail ?? ''} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="priceFrom">ราคาเริ่ม</Label>
          <Input id="priceFrom" name="priceFrom" type="number" min={0} defaultValue={defaultValues?.priceFrom ?? ''} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="priceTo">ราคาสูงสุด</Label>
          <Input id="priceTo" name="priceTo" type="number" min={0} defaultValue={defaultValues?.priceTo ?? ''} />
        </div>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'กำลังบันทึก...' : submitText}
      </Button>
    </form>
  )
}
