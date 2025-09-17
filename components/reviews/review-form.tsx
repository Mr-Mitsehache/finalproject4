'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { User, Star, MessageSquare, Image as ImageIcon, Video } from 'lucide-react'

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
    <form id="review-form" action={formAction} className="space-y-5">
      {state?.error && (
        <div className="rounded-lg border border-red-300 bg-red-100/50 p-3 text-sm text-red-700 flex items-center gap-2">
          ⚠️ {state.error}
        </div>
      )}

      <input type="hidden" name="storeId" value={storeId} />
      <input type="hidden" name="rating" value={rating} />
      <input type="hidden" name="mediaKind" value={kind} />

      {/* Author + Rating */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="author" className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" /> ชื่อของคุณ
          </Label>
          <Input id="author" name="author" placeholder="เช่น คุณเอ" required />
        </div>
        <div className="grid gap-2">
          <Label className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" /> ให้คะแนน
          </Label>
          <Select value={rating} onValueChange={setRating}>
            <SelectTrigger>
              <SelectValue placeholder="เลือกระดับ" />
            </SelectTrigger>
            <SelectContent>
              {[5, 4, 3, 2, 1].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  ⭐ {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Comment */}
      <div className="grid gap-2">
        <Label htmlFor="comment" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" /> ความคิดเห็น
        </Label>
        <Textarea
          id="comment"
          name="comment"
          placeholder="บอกเล่าประสบการณ์ของคุณ..."
          required
        />
      </div>

      {/* Media */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label className="flex items-center gap-2">
            {kind === 'VIDEO' ? (
              <Video className="h-4 w-4 text-blue-500" />
            ) : (
              <ImageIcon className="h-4 w-4 text-emerald-500" />
            )}
            ชนิดสื่อ (ไม่บังคับ)
          </Label>
          <Select value={kind} onValueChange={(v: any) => setKind(v)}>
            <SelectTrigger>
              <SelectValue placeholder="เลือกรูป/วิดีโอ หรือปล่อยว่าง" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IMAGE">รูปภาพ</SelectItem>
              <SelectItem value="VIDEO">วิดีโอ</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="mediaUrl">ลิงก์สื่อ (ไม่บังคับ)</Label>
          <Input
            id="mediaUrl"
            name="mediaUrl"
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
      </div>

      {/* Preview */}
      {url && (
        <div className="rounded-lg border p-3 bg-card/50">
          <div className="text-xs mb-2 text-muted-foreground">🔎 ตัวอย่างสื่อ:</div>
          <div className="aspect-video w-full overflow-hidden rounded-lg shadow">
            {kind === 'VIDEO' ? (
              <video src={url} controls className="h-full w-full" />
            ) : (
              <img src={url} alt="preview" className="h-full w-full object-cover" />
            )}
          </div>
        </div>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'กำลังส่งรีวิว...' : '✨ ส่งรีวิว'}
      </Button>
    </form>
  )
}
