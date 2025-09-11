// app/admin/dashboard/page.tsx
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-helpers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { BookingStatus } from '@prisma/client'

// ฟังก์ชันช่วย format
const fmtNum = (n?: number | null) => (n ?? 0).toLocaleString()
const fmtTH = (d: Date | string) => new Date(d).toLocaleString()
const fmtMoney = (n?: number | null) => `฿${fmtNum(n)}`

// เปอร์เซ็นต์การเปลี่ยนแปลง (เชิงบวก/ลบ)
function pctChange(curr: number, prev: number) {
  if (!prev && !curr) return 0
  if (!prev) return 100
  return Math.round(((curr - prev) / prev) * 100)
}

// ทำ sparkline ขนาดเล็กด้วย SVG (ฝั่ง server)
function Sparkline({ values, width = 260, height = 60, pad = 6 }: { values: number[]; width?: number; height?: number; pad?: number }) {
  const n = values.length
  if (n <= 1) {
    return (
      <svg width={width} height={height} aria-hidden="true">
        <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="currentColor" opacity="0.2" />
      </svg>
    )
  }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const dx = (width - pad * 2) / (n - 1)
  const range = Math.max(1, max - min)
  const pts = values.map((v, i) => {
    const x = pad + i * dx
    const y = pad + (height - pad * 2) * (1 - (v - min) / range)
    return [x, y] as const
  })
  const d = pts.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ')
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

export default async function AdminDashboardPage() {
  await requireAdmin()

  const now = new Date()
  const dayMs = 24 * 60 * 60 * 1000

  const start14 = new Date(now.getTime() - 14 * dayMs)
  const start7 = new Date(now.getTime() - 7 * dayMs)
  const prev7Start = new Date(now.getTime() - 14 * dayMs)
  const last30 = new Date(now.getTime() - 30 * dayMs)
  const prev30Start = new Date(now.getTime() - 60 * dayMs)

  // ดึงข้อมูลหลักแบบขนาน
  const [
    userCount,
    storeCount,
    bookingCount,
    revenueAll,
    payments14d,
    payments7d,
    paymentsPrev7d,
    payments30d,
    paymentsPrev30d,
    bookingsByStatus,
    recentBookings,
    recentUsers,
    topStores,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.store.count(),
    prisma.booking.count(),

    prisma.payment.aggregate({
      _sum: { amount: true },
    }),

    prisma.payment.findMany({
      where: { paidAt: { gte: start14 } },
      select: { amount: true, paidAt: true },
      orderBy: { paidAt: 'asc' },
    }),

    prisma.payment.findMany({
      where: { paidAt: { gte: start7 } },
      select: { amount: true },
    }),
    prisma.payment.findMany({
      where: { paidAt: { gte: prev7Start, lt: start7 } },
      select: { amount: true },
    }),

    prisma.payment.findMany({
      where: { paidAt: { gte: last30 } },
      select: { amount: true },
    }),
    prisma.payment.findMany({
      where: { paidAt: { gte: prev30Start, lt: last30 } },
      select: { amount: true },
    }),

    // groupBy status (ไม่ orderBy aggregate เพื่อความเข้ากันได้)
    prisma.booking.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),

    prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        store: { select: { name: true } },
        service: { select: { name: true } },
      },
    }),

    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),

    prisma.store.findMany({
      orderBy: [{ reviewsCount: 'desc' }, { rating: 'desc' }],
      take: 5,
      select: { id: true, name: true, rating: true, reviewsCount: true, isOpen: true },
    }),
  ])

  const sum = (arr: { amount: number }[]) => arr.reduce((a, b) => a + (b.amount ?? 0), 0)
  const rev7 = sum(payments7d)
  const revPrev7 = sum(paymentsPrev7d)
  const rev30 = sum(payments30d)
  const revPrev30 = sum(paymentsPrev30d)

  // ทำ series 14 วัน (ตามวันที่, ไม่มี timezone พิเศษ)
  const days: string[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * dayMs)
    const key = d.toISOString().slice(0, 10) // YYYY-MM-DD
    days.push(key)
  }
  const bucket14 = Object.fromEntries(days.map((d) => [d, 0]))
  for (const p of payments14d) {
    if (!p.paidAt) continue
    const key = new Date(p.paidAt).toISOString().slice(0, 10)
    if (bucket14[key] != null) bucket14[key] += p.amount ?? 0
  }
  const series14 = days.map((d) => bucket14[d])

  // ทำ distribution ของสถานะ
  const statusMap = new Map<BookingStatus, number>()
  for (const g of bookingsByStatus) statusMap.set(g.status as BookingStatus, g._count._all)
  const pending = statusMap.get('PENDING') ?? 0
  const confirmed = statusMap.get('CONFIRMED') ?? 0
  const completed = statusMap.get('COMPLETED') ?? 0
  const cancelled = statusMap.get('CANCELLED') ?? 0
  const totalForDist = pending + confirmed + completed + cancelled || 1 // กันหารศูนย์

  return (
    <>
      {/* ส่วนหัว */}
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* การ์ดสรุปหลัก */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Users" value={userCount} />
        <StatCard title="Stores" value={storeCount} />
        <StatCard title="Bookings" value={bookingCount} />
        <StatCard title="Revenue (All)" valueLabel={fmtMoney(revenueAll._sum.amount)} />
      </div>

      {/* รายได้ + สถานะการจอง + sparkline */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Revenue</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">7 วันล่าสุด</div>
              <div className="text-lg font-bold">{fmtMoney(rev7)}</div>
            </div>
            <div className="text-xs">
              เปลี่ยนแปลงจากช่วงก่อนหน้า:{' '}
              <span className={pctChange(rev7, revPrev7) >= 0 ? 'text-emerald-600' : 'text-destructive'}>
                {pctChange(rev7, revPrev7)}%
              </span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-muted-foreground">30 วันล่าสุด</div>
              <div className="text-lg font-bold">{fmtMoney(rev30)}</div>
            </div>
            <div className="text-xs">
              เปลี่ยนแปลงจากช่วงก่อนหน้า:{' '}
              <span className={pctChange(rev30, revPrev30) >= 0 ? 'text-emerald-600' : 'text-destructive'}>
                {pctChange(rev30, revPrev30)}%
              </span>
            </div>

            <div className="mt-2 text-xs text-muted-foreground">แนวโน้ม 14 วันล่าสุด</div>
            <div className="mt-1">
              <Sparkline values={series14} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Bookings Status</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <StatusRow label="Pending" value={pending} total={totalForDist} />
              <StatusRow label="Confirmed" value={confirmed} total={totalForDist} />
              <StatusRow label="Completed" value={completed} total={totalForDist} />
              <StatusRow label="Cancelled" value={cancelled} total={totalForDist} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Top Stores</CardTitle></CardHeader>
          <CardContent>
            {topStores.length === 0 ? (
              <div className="text-sm text-muted-foreground">ยังไม่มีข้อมูล</div>
            ) : (
              <ul className="space-y-2 text-sm">
                {topStores.map((s) => (
                  <li key={s.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={s.isOpen ? 'default' : 'secondary'}>{s.isOpen ? 'เปิด' : 'ปิด'}</Badge>
                      <Link href={`/stores/${s.id}`} className="font-medium hover:underline">{s.name}</Link>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{s.rating.toFixed(1)} ★</div>
                      <div className="text-xs text-muted-foreground">{fmtNum(s.reviewsCount)} รีวิว</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ตารางกิจกรรมล่าสุด */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>การจองล่าสุด</CardTitle></CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <div className="text-sm text-muted-foreground">ยังไม่มีรายการ</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-left text-muted-foreground">
                    <tr>
                      <th className="py-2 pr-4">วันที่</th>
                      <th className="py-2 pr-4">ร้าน</th>
                      <th className="py-2 pr-4">บริการ</th>
                      <th className="py-2 pr-4">ลูกค้า</th>
                      <th className="py-2 pr-4">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((b) => (
                      <tr key={b.id} className="border-t">
                        <td className="py-2 pr-4 whitespace-nowrap">{fmtTH(b.createdAt)}</td>
                        <td className="py-2 pr-4">
                          <Link href={`/stores/${b.storeId}`} className="hover:underline">
                            {b.store?.name ?? '-'}
                          </Link>
                        </td>
                        <td className="py-2 pr-4">{b.service?.name ?? '-'}</td>
                        <td className="py-2 pr-4">
                          <div className="font-medium">{b.customerName}</div>
                          <div className="text-xs text-muted-foreground">{b.phone}{b.email ? ` · ${b.email}` : ''}</div>
                        </td>
                        <td className="py-2 pr-4">
                          <Badge variant={
                            b.status === 'COMPLETED' ? 'default'
                            : b.status === 'CONFIRMED' ? 'default'
                            : b.status === 'PENDING' ? 'secondary'
                            : 'destructive'
                          }>
                            {b.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>สมาชิกใหม่</CardTitle></CardHeader>
          <CardContent>
            {recentUsers.length === 0 ? (
              <div className="text-sm text-muted-foreground">ยังไม่มีข้อมูล</div>
            ) : (
              <ul className="space-y-3 text-sm">
                {recentUsers.map((u) => (
                  <li key={u.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{u.name ?? u.email}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </div>
                    <div className="text-right">
                      <Badge variant={u.role === 'ADMIN' ? 'default' : 'secondary'}>
                        {u.role}
                      </Badge>
                      <div className="text-xs text-muted-foreground">{fmtTH(u.createdAt)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function StatCard({ title, value, valueLabel }: { title: string; value?: number; valueLabel?: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-3xl font-bold tabular-nums">
        {valueLabel ?? fmtNum(value)}
      </CardContent>
    </Card>
  )
}

function StatusRow({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = Math.round((value / total) * 100)
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <div className="text-muted-foreground">{label}</div>
        <div className="font-semibold tabular-nums">{fmtNum(value)} ({pct}%)</div>
      </div>
      <div className="mt-1 h-2 w-full rounded bg-muted overflow-hidden">
        <div
          className="h-2 rounded bg-primary"
          style={{ width: `${pct}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
