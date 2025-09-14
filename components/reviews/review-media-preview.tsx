//components\reviews\review-media-preview.tsx
'use client'

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

export function ReviewMediaPreview({
  url,
  kind = 'IMAGE',
  title,
  heightClass = 'h-48', // ปรับความสูงพรีวิวได้: h-40 / h-48 / h-56 ...
}: {
  url: string
  kind?: 'IMAGE' | 'VIDEO'
  title?: string
  heightClass?: string
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {kind === 'VIDEO' ? (
          <div className={`relative w-full overflow-hidden rounded cursor-pointer bg-black ${heightClass}`}>
            <video src={url} className="h-full w-full object-cover" muted playsInline />
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-white/90 text-[10px] bg-black/10">
              คลิกเพื่อขยาย
            </div>
          </div>
        ) : (
          <img
            src={url}
            alt={title ?? 'review-media'}
            className={`w-full overflow-hidden rounded cursor-pointer object-cover ${heightClass}`}
          />
        )}
      </DialogTrigger>

      <DialogContent className="max-w-3xl">
        {kind === 'VIDEO' ? (
          <video src={url} controls className="w-full h-auto rounded" />
        ) : (
          <img src={url} alt={title ?? ''} className="w-full h-auto rounded" />
        )}
      </DialogContent>
    </Dialog>
  )
}
