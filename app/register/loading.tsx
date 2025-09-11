// app/post-login/loading.tsx
// แสดงระหว่างกำลังโหลด/รอ data ของ route /post-login
// วางไฟล์นี้ที่ app/post-login/loading.tsx แล้ว Next.js จะใช้โดยอัตโนมัติ

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto w-full max-w-6xl p-6" aria-busy="true" aria-live="polite">
        <span className="sr-only">กำลังโหลด...</span>

        {/* Page heading */}
        <div className="space-y-2">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-4 w-72" />
        </div>

        {/* Stats cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>

        {/* Table */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white/80 shadow-lg backdrop-blur">
          <div className="border-b border-slate-200 p-4">
            <Skeleton className="h-5 w-40" />
          </div>
          <div className="p-4">
            <TableSkeleton rows={8} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============= UI Partials ============= //
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={
        "animate-pulse rounded-lg bg-slate-200/80 shadow-sm " + className
      }
    />
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="shrink-0">
          <div className="grid place-items-center rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <Skeleton className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
}

function TableSkeleton({ rows = 6 }: { rows?: number }) {
  const items = Array.from({ length: rows });
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      {/* Table header */}
      <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50/60 p-3">
        <Skeleton className="col-span-5 h-4" />
        <Skeleton className="col-span-3 h-4" />
        <Skeleton className="col-span-2 h-4" />
        <Skeleton className="col-span-2 h-4" />
      </div>
      {/* Rows */}
      <ul className="divide-y divide-slate-200">
        {items.map((_, i) => (
          <li key={i} className="grid grid-cols-12 items-center gap-3 p-3">
            <Skeleton className="col-span-5 h-4" />
            <Skeleton className="col-span-3 h-4" />
            <Skeleton className="col-span-2 h-4" />
            <Skeleton className="col-span-2 h-8" />
          </li>
        ))}
      </ul>
      {/* Footer pagination skeleton */}
      <div className="flex items-center justify-between border-t border-slate-200 p-3">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
}
