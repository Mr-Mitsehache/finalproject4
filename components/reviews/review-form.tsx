'use client'

import { useFormStatus } from 'react-dom'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

type Props = {
  onSubmit: (formData: FormData) => void
  storeId: string
}

function SubmitBtn() {
  const { pending } = useFormStatus()
  return <Button type="submit" disabled={pending}>{pending ? 'กำลังบันทึก...' : 'ส่งรีวิว'}</Button>
}

export function ReviewForm({ onSubmit, storeId }: Props) {
  const [rating, setRating] = useState('5')

  return (
    <form action={onSubmit} className="space-y-4">
      <input type="hidden" name="storeId" value={storeId} />
      <div className="grid gap-2">
        <Label htmlFor="author">ชื่อผู้รีวิว</Label>
        <Input id="author" name="author" placeholder="ชื่อของคุณ" required />
      </div>
      <div className="grid gap-2">
        <Label>คะแนน</Label>
        <RadioGroup
          name="rating"
          value={rating}
          onValueChange={setRating}
          className="flex items-center gap-4"
        >
          {[1,2,3,4,5].map(n => (
            <div key={n} className="flex items-center space-x-2">
              <RadioGroupItem id={`r${n}`} value={String(n)} />
              <Label htmlFor={`r${n}`}>{n}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="comment">ความคิดเห็น</Label>
        <Textarea id="comment" name="comment" placeholder="บอกเล่าประสบการณ์ของคุณ..." required />
      </div>
      <SubmitBtn />
    </form>
  )
}
