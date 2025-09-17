'use client'

import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ReviewForm } from './review-form'
import { MessageSquarePlus } from 'lucide-react'

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
        <Button
          className="
            inline-flex items-center gap-2 font-semibold
            bg-red-500 hover:bg-red-600 text-white
            dark:bg-blue-600 dark:hover:bg-blue-700
            shadow-md transition-all
          "
        >
          <MessageSquarePlus className="h-4 w-4" />
          เพิ่มรีวิว
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <MessageSquarePlus className="h-5 w-5 text-primary" />
            เพิ่มรีวิวใหม่
          </DialogTitle>
        </DialogHeader>
        <ReviewForm
          storeId={storeId}
          action={action}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  )
}
