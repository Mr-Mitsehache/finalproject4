"use client"

import { useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Play } from "lucide-react"

type MediaItem = { url: string; kind?: "image" | "video" }
function guessKind(url: string): "image" | "video" {
  const lower = url.split("?")[0].toLowerCase()
  return /\.(mp4|webm|ogg)$/.test(lower) ? "video" : "image"
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
    () =>
      (media ?? []).map((m) => ({
        url: m.url,
        kind: m.kind ?? guessKind(m.url),
      })),
    [media]
  )
  const [index, setIndex] = useState(0)
  const cur = normalized[index]

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="
          max-w-3xl overflow-hidden
          border border-red-300 dark:border-blue-500/50
          bg-white/90 dark:bg-zinc-900/90
          shadow-2xl backdrop-blur-xl
          rounded-2xl p-4
        "
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
        </DialogHeader>

        {normalized.length === 0 ? (
          <div className="aspect-video w-full rounded bg-muted grid place-items-center text-sm text-muted-foreground">
            ไม่มีสื่อพรีวิว
          </div>
        ) : cur.kind === "video" ? (
          <div className="aspect-video w-full overflow-hidden rounded-xl shadow-lg">
            <video
              src={cur.url}
              controls
              className="h-full w-full object-cover rounded-xl"
            />
          </div>
        ) : (
          <div className="aspect-video w-full overflow-hidden rounded-xl shadow-lg">
            <img
              src={cur.url}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        )}

        {normalized.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pt-3">
            {normalized.map((m, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={[
                  "relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border transition-all",
                  i === index
                    ? "ring-2 ring-red-500 dark:ring-blue-400 shadow-md"
                    : "opacity-75 hover:opacity-100 hover:ring-1 hover:ring-border",
                ].join(" ")}
              >
                {m.kind === "video" ? (
                  <div className="grid h-full w-full place-items-center bg-black/40 text-white">
                    <Play className="h-6 w-6" />
                  </div>
                ) : (
                  <img
                    src={m.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
