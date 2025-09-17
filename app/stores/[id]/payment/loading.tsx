// app/stores/loading.tsx
"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { usePathname } from "next/navigation"
import { useMemo } from "react"

export default function LoadingStores() {
  const pathname = usePathname()

  // mapping path -> label
  const destination = useMemo(() => {
    if (!pathname) return "หน้าถัดไป"
    if (pathname.includes("/payment")) return "หน้าชำระเงิน"
    if (pathname.includes("/success")) return "หน้าสำเร็จ"
    if (pathname.includes("/stores/[id]")) return "หน้าร้าน"
    if (pathname.includes("/")) return "หน้าร้านทั้งหมด"
    return pathname
  }, [pathname])

  return (
    <div className="w-full h-screen border 
        border-red-300 dark:border-blue-500/50
        bg-white/70 dark:bg-zinc-900/70
        shadow-xl backdrop-blur-md glow-border p-8">

      {/* Title */}
      <h1 className="text-center text-xl font-extrabold metal-text">
        กำลังพาไปยังหน้าถัดไป…
      </h1>
      <p className="mt-1 text-center text-sm text-muted-foreground">
        เรากำลังกำหนดปลายทางตามสิทธิ์ผู้ใช้ของคุณ
      </p>

      {/* Gauge Loader */}
      <div className="mt-10 flex flex-col items-center gap-3 text-muted-foreground">
        <div className="gauge">
          <div className="gauge-needle"></div>
        </div>
        <span className="text-sm">
          กำลังนำทางไปที่{" "}
          <span className="font-medium text-foreground">{destination}</span>
        </span>
      </div>

      {/* Dashboard Stat Skeletons */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
      </div>

      {/* Content Skeleton */}
      <div className="mt-8 rounded-2xl border border-border bg-card/70 p-6 shadow-inner">
        <div className="space-y-4">
          <Skeleton variant="line" className="w-48 h-5" />
          <Skeleton variant="line" className="w-72 h-4" />
          <Skeleton variant="block" className="h-40 w-full" />
        </div>
      </div>
    </div>
  )
}

/* Stat Card Skeleton */
function StatSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card/80 p-4 shadow-md">
      <div className="space-y-3">
        <Skeleton variant="line" className="w-20 h-4" />
        <Skeleton variant="line" className="w-16 h-6" />
        <Skeleton variant="line" className="w-28 h-3" />
      </div>
    </div>
  )
}
