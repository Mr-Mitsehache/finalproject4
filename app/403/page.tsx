// app/403/page.tsx

export default function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-4xl font-bold text-red-600 mb-4">403 - Forbidden</h1>
      <p className="text-muted-foreground text-lg">
        คุณไม่มีสิทธิ์เข้าถึงหน้านี้
      </p>
    </div>
  )
}
