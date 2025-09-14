//components\reviews\reviews-list.tsx
import { Star } from 'lucide-react'
import { ReviewMediaPreview } from './review-media-preview'

type ReviewItem = {
  id: string
  author: string
  rating: number
  comment: string
  date: Date
  mediaUrl?: string | null
  mediaKind?: 'IMAGE' | 'VIDEO' | null
}

export function ReviewsList({ reviews }: { reviews: ReviewItem[] }) {
  if (!reviews.length) {
    return <div className="text-sm text-muted-foreground">ยังไม่มีรีวิว</div>
  }

  return (
    <div className="space-y-4">
      {reviews.map((r) => (
        <div key={r.id} className="rounded border p-3">
          <div className="flex items-center justify-between">
            <div className="font-medium">{r.author}</div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm">{r.rating}/5</span>
            </div>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {new Date(r.date).toLocaleString()}
          </div>
          <p className="mt-2 text-sm">{r.comment}</p>

          {r.mediaUrl && (
            <div className="mt-3">
              <ReviewMediaPreview
                url={r.mediaUrl}
                kind={(r.mediaKind as any) ?? 'IMAGE'}
                title={r.author}
                heightClass="h-48" // ปรับเป็น h-40/h-56 ได้ตามใจ
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
