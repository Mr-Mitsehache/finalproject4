'use client'

// ✅ ใช้ useActionState จาก 'react'
import { useActionState, useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import type { Store } from '@prisma/client'
import type { StoreFormState } from '@/app/organiza/stores/actions'

type Props = {
  action: (prev: StoreFormState, formData: FormData) => Promise<StoreFormState>
  defaultValues?: Partial<Store>
  submitText?: string
}

export function StoreForm({ action, defaultValues, submitText = 'บันทึกร้าน' }: Props) {
  const [state, formAction, isPending] = useActionState(action, {} as StoreFormState)
  const [open, setOpen] = useState<boolean>(defaultValues?.isOpen ?? true)

  // optional: fill lat/lng with browser location
  async function fillLocation() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((pos) => {
      const latEl = document.querySelector<HTMLInputElement>('#lat')
      const lngEl = document.querySelector<HTMLInputElement>('#lng')
      if (latEl) latEl.value = String(pos.coords.latitude)
      if (lngEl) lngEl.value = String(pos.coords.longitude)
    })
  }

  useEffect(() => {
    // keep hidden field synced
    const hidden = document.querySelector<HTMLInputElement>('#isOpenHidden')
    if (hidden) hidden.value = open ? '1' : '0'
  }, [open])

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="rounded border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">ชื่อร้าน</Label>
          <Input id="name" name="name" defaultValue={defaultValues?.name ?? ''} required />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="phone">เบอร์โทร</Label>
          <Input id="phone" name="phone" defaultValue={defaultValues?.phone ?? ''} required />
        </div>

        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="address">ที่อยู่</Label>
          <Textarea id="address" name="address" defaultValue={defaultValues?.address ?? ''} required />
        </div>

        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="imageUrl">รูปหน้าร้าน (URL)</Label>
          <Input id="imageUrl" name="imageUrl" defaultValue={defaultValues?.imageUrl ?? ''} placeholder="https://..." />
        </div>

        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="hours">เวลาเปิด-ปิด (เช่น 08:00 - 20:00)</Label>
          <Input id="hours" name="hours" defaultValue={defaultValues?.hours ?? ''} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="lat">Latitude</Label>
          <Input id="lat" name="lat" defaultValue={defaultValues?.lat?.toString() ?? ''} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="lng">Longitude</Label>
          <Input id="lng" name="lng" defaultValue={defaultValues?.lng?.toString() ?? ''} />
        </div>

        <div className="flex items-center gap-3 sm:col-span-2">
          <Switch id="isOpen" checked={open} onCheckedChange={setOpen} />
          <Label htmlFor="isOpen">สถานะร้านเปิดอยู่</Label>
          <input id="isOpenHidden" type="hidden" name="isOpen" value={open ? '1' : '0'} />
          <Button type="button" variant="outline" onClick={fillLocation} className="ml-auto">
            ใช้พิกัดปัจจุบัน
          </Button>
        </div>
      </div>

      <Button type="submit" disabled={isPending}>{submitText}</Button>
    </form>
  )
}
