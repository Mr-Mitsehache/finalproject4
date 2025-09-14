//components\reviews\review-form.tsx
'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type FormState = { ok?: boolean; error?: string }

export function ReviewForm({
  storeId,
  action,
  onSuccess,
}: {
  storeId: string
  action: (prev: FormState, formData: FormData) => Promise<FormState>
  onSuccess?: () => void
}) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(action, {} as FormState)

  // ควบคุมค่าของ Select เพื่อส่งผ่าน hidden input
  const [rating, setRating] = useState('5')
  const [kind, setKind] = useState<'IMAGE' | 'VIDEO' | ''>('')
  const [url, setUrl] = useState('')

  useEffect(() => {
    if (state?.ok) {
      const form = document.getElementById('review-form') as HTMLFormElement | null
      form?.reset()
      setRating('5')
      setKind('')
      setUrl('')
      router.refresh()
      onSuccess?.()
    }
  }, [state, router, onSuccess])

  return (
    <form id="review-form" action={formAction} className="space-y-4">
      {state?.error && (
        <div className="rounded border border-destructive/40 bg-destructive/10 p-2 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <input type="hidden" name="storeId" value={storeId} />
      {/* hidden inputs สำหรับ Select */}
      <input type="hidden" name="rating" value={rating} />
      {/* ถ้าไม่มี URL จะส่งค่าว่าง -> ฝั่ง zod จะล้าง kind ออกให้เอง */}
      <input type="hidden" name="mediaKind" value={kind} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="author">ชื่อของคุณ</Label>
          <Input id="author" name="author" placeholder="เช่น คุณเอ" required />
        </div>
        <div className="grid gap-2">
          <Label>ให้คะแนน</Label>
          <Select value={rating} onValueChange={setRating}>
            <SelectTrigger><SelectValue placeholder="เลือกระดับ" /></SelectTrigger>
            <SelectContent>
              {[5,4,3,2,1].map(n => (
                <SelectItem key={n} value={String(n)}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="comment">ความคิดเห็น</Label>
        <Textarea id="comment" name="comment" placeholder="บอกเล่าประสบการณ์ของคุณ..." required />
      </div>

      {/* แนบสื่อ (ตัวเลือก) */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label>ชนิดสื่อ (ไม่บังคับ)</Label>
          <Select value={kind} onValueChange={(v: any) => setKind(v)}>
            <SelectTrigger><SelectValue placeholder="เลือกเป็นรูป/วิดีโอ หรือปล่อยว่าง" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="IMAGE">รูปภาพ</SelectItem>
              <SelectItem value="VIDEO">วิดีโอ</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="mediaUrl">ลิงก์สื่อ (http/https) (ไม่บังคับ)</Label>
          <Input
            id="mediaUrl"
            name="mediaUrl"
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
      </div>

      {/* preview เล็ก ๆ */}
      {url && (
        <div className="rounded border p-2">
          <div className="text-xs mb-2 text-muted-foreground">ตัวอย่าง:</div>
          <div className="aspect-video w-full overflow-hidden rounded">
            {kind === 'VIDEO' ? (
              <video src={url} controls className="h-full w-full" />
            ) : (
              <img src={url} alt="preview" className="h-full w-full object-cover" />
            )}
          </div>
        </div>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? 'กำลังส่งรีวิว...' : 'ส่งรีวิว'}
      </Button>
    </form>
  )
}
