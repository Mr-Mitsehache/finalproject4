type Review = {
  id: string
  author: string
  rating: number
  comment: string
  date: string | Date
}

export function ReviewsList({ reviews }: { reviews: Review[] }) {
  if (!reviews?.length) {
    return <div className="text-sm text-muted-foreground">ยังไม่มีรีวิว</div>
  }
  return (
    <ul className="space-y-3">
      {reviews.map((rev) => (
        <li key={rev.id} className="text-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold tabular-nums">{rev.rating}/5</span>
            <span className="text-muted-foreground">
              {new Date(rev.date).toLocaleDateString()}
            </span>
          </div>
          <div className="mt-1">{rev.comment}</div>
          <div className="text-xs text-muted-foreground mt-1">by {rev.author}</div>
        </li>
      ))}
    </ul>
  )
}
