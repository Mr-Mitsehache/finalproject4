import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AutoRedirect from "./AutoRedirect";

export default async function PostLogin() {
  const session = await getServerSession(authOptions);

  // คำนวณปลายทางแบบ server-side แต่ยังไม่ redirect ทันที
  const to = !session?.user?.id
    ? "/login"
    : session.user.role === "ADMIN"
    ? "/admin"
    : session.user.role === "ORGANIZA"
    ? "/organiza/stores"
    : "/";

  // แสดง skeleton หน้าเปล่าที่ดูดี แล้วให้ AutoRedirect พาไปยังหน้าปลายทาง
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white/80 shadow-lg backdrop-blur">
        <div className="p-6">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            <svg viewBox="0 0 24 24" aria-hidden className="h-6 w-6 text-slate-700">
              <path d="M12 3l7.5 4.33v9.34L12 21 4.5 16.67V7.33L12 3z" fill="currentColor" />
            </svg>
          </div>

          <h1 className="text-center text-lg font-semibold text-slate-900">กำลังพาไปยังหน้าถัดไป…</h1>
          <p className="mt-1 text-center text-sm text-slate-600">เรากำลังกำหนดปลายทางตามสิทธิ์ผู้ใช้ของคุณ</p>

          {/* Skeleton กล่องสรุปสั้นๆ */}
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>

          {/* Skeleton บล็อกหลัก */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm">
            <div className="space-y-3">
              <Skeleton className="h-5 w-52" />
              <Skeleton className="h-4 w-72" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>

          {/* สปินเนอร์ + AutoRedirect */}
          <div className="mt-6 flex items-center justify-center gap-2 text-slate-600">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden>
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeOpacity=".15" strokeWidth="3" />
              <path d="M22 12a10 10 0 00-10-10" fill="none" stroke="currentColor" strokeWidth="3" />
            </svg>
            <span className="text-sm">กำลังนำทางไปที่ <span className="font-medium text-slate-900">{to}</span></span>
          </div>

          {/* สั่ง redirect ฝั่ง client หลัง hydrate เพื่อให้ skeleton โชว์ทันที */}
          <AutoRedirect to={to} replace delay={0} />
        </div>
      </div>
    </div>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={"animate-pulse rounded-lg bg-slate-200/80 shadow-sm " + className} />;
}
function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

