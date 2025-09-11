'use client'

import { useRef } from 'react'
import { Button } from '@/components/ui/button'

export function ConfirmDeleteForm({
  action,
  hidden,
  label = 'ลบ',
  confirmText = 'ลบผู้ใช้นี้?',
}: {
  action: (formData: FormData) => Promise<void> // server action
  hidden: Record<string, string>
  label?: string
  confirmText?: string
}) {
  const ref = useRef<HTMLFormElement>(null)

  return (
    <form ref={ref} action={action} className="inline-block">
      {Object.entries(hidden).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={() => {
          if (confirm(confirmText)) ref.current?.requestSubmit()
        }}
      >
        {label}
      </Button>
    </form>
  )
}
