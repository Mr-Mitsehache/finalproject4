import { Star, Quote, MessageCircle } from "lucide-react"
import { ReviewMediaPreview } from "./review-media-preview"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

type ReviewItem = {
  id: string
  author: string
  rating: number
  comment: string
  date: Date
  mediaUrl?: string | null
  mediaKind?: "IMAGE" | "VIDEO" | null
}

export function ReviewsList({ reviews }: { reviews: ReviewItem[] }) {
  if (!reviews.length) {
    return (
      <div className="text-sm text-muted-foreground italic flex items-center gap-2">
        <MessageCircle className="h-4 w-4" />
        ยังไม่มีรีวิว
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {reviews.map((r) => {
        const initial = r.author?.charAt(0).toUpperCase() || "U"

        return (
          <div
            key={r.id}
            className="
              rounded-2xl border border-border bg-card/80 p-5 shadow-sm
              hover:shadow-md transition-all
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <Avatar className="h-10 w-10">
                  <AvatarImage src={undefined} alt={r.author} />
                  <AvatarFallback className="
                    bg-gradient-to-br 
                    from-red-400 to-pink-500 
                    dark:from-blue-500 dark:to-cyan-500
                    text-white font-semibold
                  ">
                    {initial}
                  </AvatarFallback>
                </Avatar>

                {/* Author + Date */}
                <div>
                  <div className="font-semibold text-foreground flex items-center gap-1">
                    {r.author}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1">
                    <ClockIcon className="h-3 w-3" />
                    {new Date(r.date).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i <= r.rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
                <span className="ml-1 text-sm font-medium">
                  {r.rating}/5
                </span>
              </div>
            </div>

            {/* Comment */}
            <blockquote className="mt-3 border-l-4 border-primary/40 pl-3 text-sm leading-relaxed text-foreground/90">
              <Quote className="inline h-4 w-4 text-primary/60 mr-1" />
              {r.comment}
            </blockquote>

            {/* Media */}
            {r.mediaUrl && (
              <div className="mt-4">
                <ReviewMediaPreview
                  url={r.mediaUrl}
                  kind={(r.mediaKind as any) ?? "IMAGE"}
                  title={r.author}
                  heightClass="h-48 rounded-lg shadow-md hover:shadow-lg transition"
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* Small clock icon */
function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
