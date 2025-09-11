'use client'

import { useActionState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ActionState } from '@/app/admin/actions'

export function AdminCreateUserForm({
  action,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>
}) {
  const [state, formAction, isPending] = useActionState(action, {} as ActionState)

  useEffect(() => {
    if (state?.ok) {
      // reset form visually
      const form = document.getElementById('create-user-form') as HTMLFormElement | null
      form?.reset()
    }
  }, [state])

  return (
    <form id="create-user-form" action={formAction} className="space-y-4">
      {state?.error && (
        <div className="rounded border border-destructive/40 bg-destructive/5 p-2 text-sm text-destructive">
          {state.error}
        </div>
      )}
      {state?.ok && state.message && (
        <div className="rounded border border-emerald-400/40 bg-emerald-400/10 p-2 text-sm text-emerald-600">
          {state.message}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">ชื่อ</Label>
          <Input id="name" name="name" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">อีเมล</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">รหัสผ่าน</Label>
          <Input id="password" name="password" type="password" required />
        </div>
        <div className="grid gap-2">
          <Label>สิทธิ์</Label>
          <Select name="role" defaultValue="ORGANIZA">
            <SelectTrigger><SelectValue placeholder="เลือกสิทธิ์" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ORGANIZA">ORGANIZA</SelectItem>
              <SelectItem value="ADMIN">ADMIN</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'กำลังบันทึก...' : 'สร้างผู้ใช้'}
      </Button>
    </form>
  )
}
