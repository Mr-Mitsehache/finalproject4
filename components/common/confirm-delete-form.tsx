//components\common\confirm-delete-form.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

type ButtonVariant = React.ComponentProps<typeof Button>['variant']
type ButtonSize = React.ComponentProps<typeof Button>['size']

export function ConfirmDeleteForm({
  action,
  hidden,
  label = 'ลบ',
  confirmText = 'ยืนยันลบรายการนี้?',
  variant = 'destructive',
  size = 'sm',
}: {
  action: (formData: FormData) => Promise<void> | void
  hidden?: Record<string, string>
  label?: string
  confirmText?: string
  variant?: ButtonVariant
  size?: ButtonSize
}) {
  const [submitting, setSubmitting] = useState(false)

  // ทำ confirm ฝั่ง client ก่อน submit จริง
  const clientAction = async (formData: FormData) => {
    const ok = window.confirm(confirmText)
    if (!ok) return
    try {
      setSubmitting(true)
      await action(formData)       // เรียก server action จริง
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form action={clientAction}>
      {hidden &&
        Object.entries(hidden).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
      <Button type="submit" variant={variant} size={size} disabled={submitting}>
        {submitting ? 'กำลังลบ...' : label}
      </Button>
    </form>
  )
}
