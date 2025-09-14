//components\stores\service-media-dialog.tsx
'use client'

import { useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type MediaItem = { url: string; kind?: 'image' | 'video' }
function guessKind(url: string): 'image' | 'video' {
  const lower = url.split('?')[0].toLowerCase()
  return /\.(mp4|webm|ogg)$/.test(lower) ? 'video' : 'image'
}

export function ServiceMediaDialog({
  title,
  trigger,
  media,
}: {
  title: string
  trigger: React.ReactNode
  media: Array<MediaItem>
}) {
  const normalized = useMemo(
    () => (media ?? []).map(m => ({ url: m.url, kind: m.kind ?? guessKind(m.url) })),
    [media]
  )
  const [index, setIndex] = useState(0)
  const cur = normalized[index]

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>

        {normalized.length === 0 ? (
          <div className="aspect-video w-full rounded bg-muted grid place-items-center text-sm text-muted-foreground">
            ไม่มีสื่อพรีวิว
          </div>
        ) : cur.kind === 'video' ? (
          <div className="aspect-video w-full overflow-hidden rounded">
            <video src={cur.url} controls className="h-full w-full" />
          </div>
        ) : (
          <div className="aspect-video w-full overflow-hidden rounded">
            <img src={cur.url} alt={title} className="h-full w-full object-cover" />
          </div>
        )}

        {normalized.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pt-1">
            {normalized.map((m, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={[
                  'h-16 w-24 shrink-0 overflow-hidden rounded border',
                  i === index ? 'ring-2 ring-primary' : 'opacity-75 hover:opacity-100',
                ].join(' ')}
              >
                {m.kind === 'video'
                  ? <div className="grid h-full w-full place-items-center text-xs bg-muted">VIDEO</div>
                  : <img src={m.url} alt="" className="h-full w-full object-cover" />}
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
