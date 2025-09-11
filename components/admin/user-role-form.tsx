'use client'

import { useActionState, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ActionState } from '@/app/admin/actions'

type Role = 'ADMIN' | 'ORGANIZA'

export function UserRoleForm({
  userId,
  defaultRole,
  action,
}: {
  userId: string
  defaultRole: Role
  action: (prev: ActionState, formData: FormData) => Promise<ActionState> // server action
}) {
  const [role, setRole] = useState<Role>(defaultRole)
  const [state, formAction, isPending] = useActionState(action, {} as ActionState)

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="role" value={role} />
      <Select value={role} onValueChange={(v: Role) => setRole(v)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ADMIN">ADMIN</SelectItem>
          <SelectItem value="ORGANIZA">ORGANIZA</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit" variant="outline" size="sm" disabled={isPending}>
        {isPending ? 'กำลังบันทึก...' : 'บันทึก'}
      </Button>
      {state?.error && <span className="text-xs text-destructive">{state.error}</span>}
    </form>
  )
}
