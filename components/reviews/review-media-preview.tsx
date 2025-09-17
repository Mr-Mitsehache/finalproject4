'use client'

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Play, ZoomIn } from 'lucide-react'

export function ReviewMediaPreview({
  url,
  kind = 'IMAGE',
  title,
  heightClass = 'h-48',
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
          <div
            className={`
              relative w-full overflow-hidden rounded-lg cursor-pointer 
              bg-black group ${heightClass} shadow-md hover:shadow-lg transition
            `}
          >
            {/* แสดง thumbnail video */}
            <video
              src={url}
              className="h-full w-full object-cover opacity-90 group-hover:opacity-100 transition"
              muted
              playsInline
            />

            {/* Overlay effect */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <Play className="h-10 w-10 text-white drop-shadow-lg" />
            </div>

            {/* Label */}
            <div className="absolute bottom-1 right-2 text-[10px] px-2 py-0.5 rounded bg-black/70 text-white/90">
              คลิกเพื่อเล่น
            </div>
          </div>
        ) : (
          <div
            className={`
              relative w-full overflow-hidden rounded-lg cursor-pointer 
              bg-zinc-100 dark:bg-zinc-800 group ${heightClass} shadow-md hover:shadow-lg transition
            `}
          >
            <img
              src={url}
              alt={title ?? 'review-media'}
              className="h-full w-full object-cover transform group-hover:scale-105 transition duration-300"
            />

            {/* Overlay + Icon */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <ZoomIn className="h-8 w-8 text-white drop-shadow-lg" />
            </div>
          </div>
        )}
      </DialogTrigger>

      {/* Dialog เมื่อกดดูรูป/วิดีโอ */}
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        {kind === 'VIDEO' ? (
          <video src={url} controls className="w-full h-auto" />
        ) : (
          <img src={url} alt={title ?? ''} className="w-full h-auto" />
        )}
      </DialogContent>
    </Dialog>
  )
}
