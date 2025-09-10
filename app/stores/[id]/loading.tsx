export default function LoadingStore() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-1/3 rounded bg-muted" />
        <div className="h-48 rounded bg-muted" />
      </div>
    </div>
  )
}
