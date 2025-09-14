//components\reviews\review-dialog-button.tsx
'use client'

import { useState, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ReviewForm } from './review-form'

type FormState = { ok?: boolean; error?: string }

export function ReviewDialogButton({
  storeId,
  action,
}: {
  storeId: string
  action: (prev: FormState, formData: FormData) => Promise<FormState>
}) {
  const [open, setOpen] = useState(false)
  const handleSuccess = useCallback(() => setOpen(false), [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>เพิ่มรีวิว</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>เพิ่มรีวิว</DialogTitle>
        </DialogHeader>
        <ReviewForm storeId={storeId} action={action} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}
