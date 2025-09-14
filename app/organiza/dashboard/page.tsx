// app/organiza/dashboard/page.tsx
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { requireOrgUser } from '@/lib/auth-helpers'
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import th from 'date-fns/locale/th'
import { cn } from '@/lib/utils' // ถ้ายังไม่มี utils/cn ให้แทนด้วยฟังก์ชันรวม class เอง

type Search = {
  status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  view?: 'reviews' | 'bookings'       // กด “คะแนนรีวิว” จะใช้ view=reviews
  range?: 'today' | '30d' | 'all'     // (สำรองเผื่อขยาย)
}

export const revalidate = 0

export default async function OrganizaDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<Search>
}) {
  const sp = (await searchParams) ?? {}
  const user = await requireOrgUser()

  const store = await prisma.store.findUnique({
    where: { userId: user.id! },
    include: { _count: { select: { reviews: true } } },
  })
  if (!store) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold">แดชบอร์ด</h1>
        <p className="text-muted-foreground mt-2">คุณยังไม่มีร้าน — ไปที่ <Link className="underline" href="/organiza/stores">จัดการร้าน</Link> เพื่อสร้างร้านก่อน</p>
      </div>
    )
  }

  // ===== Summary counts =====
  const [total, pending, confirmed, completed, cancelled] = await Promise.all([
    prisma.booking.count({ where: { storeId: store.id } }),
    prisma.booking.count({ where: { storeId: store.id, status: 'PENDING' } }),
    prisma.booking.count({ where: { storeId: store.id, status: 'CONFIRMED' } }),
    prisma.booking.count({ where: { storeId: store.id, status: 'COMPLETED' } }),
    prisma.booking.count({ where: { storeId: store.id, status: 'CANCELLED' } }),
  ])

  // ===== Today range =====
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
  const endOfDay   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

  const todayBookings = await prisma.booking.findMany({
    where: { storeId: store.id, date: { gte: startOfDay, lte: endOfDay } },
    orderBy: { date: 'asc' },
    include: { service: { select: { name: true } } },
  })

  // ===== Details panel (from clickable cards) =====
  const statusFilter =
    sp.status && ['PENDING','CONFIRMED','COMPLETED','CANCELLED'].includes(sp.status)
      ? (sp.status as any)
      : undefined

  const [filteredBookings, latestReviews] = await Promise.all([
    statusFilter
      ? prisma.booking.findMany({
          where: { storeId: store.id, status: statusFilter },
          orderBy: { date: 'desc' },
          include: { service: { select: { name: true } } },
          take: 50,
        })
      : Promise.resolve([] as any[]),
    sp.view === 'reviews'
      ? prisma.review.findMany({
          where: { storeId: store.id },
          orderBy: { date: 'desc' },
          take: 30,
        })
      : Promise.resolve([] as any[]),
  ])

  // ===== General bookings table (ล่าสุด 50 รายการ) =====
  const recentBookings = await prisma.booking.findMany({
    where: { storeId: store.id },
    orderBy: { date: 'desc' },
    include: { service: { select: { name: true } } },
    take: 50,
  })

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">แดชบอร์ด</h1>

      {/* ---- Summary clickable cards ---- */}
      <div className="grid gap-4 md:grid-cols-5">
        <SummaryCard label="ทั้งหมด" value={total} href="/organiza/dashboard?view=bookings#details" />
        <SummaryCard label="รอดำเนินการ" value={pending} href="/organiza/dashboard?status=PENDING#details" />
        <SummaryCard label="ยืนยันแล้ว" value={confirmed} href="/organiza/dashboard?status=CONFIRMED#details" />
        <SummaryCard label="เสร็จสิ้น" value={completed} href="/organiza/dashboard?status=COMPLETED#details" />
        <SummaryCard label="ยกเลิก" value={cancelled} href="/organiza/dashboard?status=CANCELLED#details" />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>รายได้รวม</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">฿{/* ใส่ยอดรวมจริงในอนาคต */}—</div>
            <div className="text-xs text-muted-foreground">สะสมทั้งหมด</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>รายได้ 30 วันล่าสุด</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">฿—</div>
            <div className="text-xs text-muted-foreground">อัปเดตอัตโนมัติ</div>
          </CardContent>
        </Card>
        <Link href="/organiza/dashboard?view=reviews#details">
          <Card className="hover:shadow-sm transition">
            <CardHeader><CardTitle>คะแนนรีวิว</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{store.rating.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">{store.reviewsCount} รีวิว</div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* ---- Details Panel (by card click) ---- */}
      <section id="details" className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {sp.view === 'reviews'
              ? 'รายการรีวิวล่าสุด'
              : statusFilter
              ? `รายการสถานะ: ${statusLabel(statusFilter)}`
              : 'เลือกรายการจากการ์ดด้านบน'}
          </h2>
          {(sp.view || statusFilter) && (
            <Link href="/organiza/dashboard" className="text-sm underline text-muted-foreground">
              ล้างตัวกรอง
            </Link>
          )}
        </div>

        {sp.view === 'reviews' ? (
          <Card>
            <CardContent className="pt-6">
              {latestReviews.length === 0 ? (
                <div className="text-sm text-muted-foreground">ยังไม่มีรีวิว</div>
              ) : (
                <div className="space-y-4">
                  {latestReviews.map(r => (
                    <div key={r.id} className="rounded border p-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{r.author}</div>
                        <Badge>{r.rating} / 5</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {format(new Date(r.date), 'd/M/yyyy HH:mm', { locale: th })}
                      </div>
                      <p className="mt-1 text-sm">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : statusFilter ? (
          <BookingsTable rows={filteredBookings} />
        ) : null}
      </section>

      {/* ---- Today ---- */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold mb-3">งานวันนี้</h2>
        <BookingsTable rows={todayBookings} emptyText="ยังไม่มีงานวันนี้" />
      </section>

      {/* ---- Recent bookings ---- */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold mb-3">ตาราง Booking (ล่าสุด)</h2>
        <BookingsTable rows={recentBookings} />
      </section>
    </div>
  )
}

/* ---------------- small components ---------------- */

function SummaryCard({
  label, value, href,
}: {
  label: string; value: number; href: string;
}) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-sm transition">
        <CardHeader><CardTitle className="text-sm font-normal">{label}</CardTitle></CardHeader>
        <CardContent><div className="text-3xl font-bold">{value}</div></CardContent>
      </Card>
    </Link>
  )
}

function statusLabel(s: 'PENDING'|'CONFIRMED'|'COMPLETED'|'CANCELLED') {
  switch (s) {
    case 'PENDING': return 'รอดำเนินการ'
    case 'CONFIRMED': return 'ยืนยันแล้ว'
    case 'COMPLETED': return 'เสร็จสิ้น'
    case 'CANCELLED': return 'ยกเลิก'
  }
}

function StatusBadge({ s }: { s: 'PENDING'|'CONFIRMED'|'COMPLETED'|'CANCELLED' }) {
  const map: Record<typeof s, { text: string; className: string }> = {
    PENDING:   { text: 'รอดำเนินการ', className: 'bg-amber-100 text-amber-800' },
    CONFIRMED: { text: 'ยืนยันแล้ว',  className: 'bg-sky-100 text-sky-800' },
    COMPLETED: { text: 'เสร็จสิ้น',    className: 'bg-emerald-100 text-emerald-800' },
    CANCELLED: { text: 'ยกเลิก',      className: 'bg-rose-100 text-rose-800' },
  }
  const it = map[s]
  return <span className={cn('inline-flex rounded px-2 py-0.5 text-xs font-medium', it.className)}>{it.text}</span>
}

function BookingsTable({
  rows,
  emptyText = 'ยังไม่มีรายการ',
}: {
  rows: Array<{
    id: string
    date: Date
    customerName: string
    carPlate: string
    status: 'PENDING'|'CONFIRMED'|'COMPLETED'|'CANCELLED'
    service?: { name: string } | null
    phone?: string
  }>
  emptyText?: string
}) {
  if (!rows.length) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">{emptyText}</CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>วันเวลา</TableHead>
              <TableHead>บริการ</TableHead>
              <TableHead>ลูกค้า</TableHead>
              <TableHead>ทะเบียน</TableHead>
              <TableHead>สถานะ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(b => (
              <TableRow key={b.id}>
                <TableCell className="whitespace-nowrap">
                  {format(new Date(b.date), 'd/M/yyyy HH:mm', { locale: th })}
                </TableCell>
                <TableCell className="font-medium">{b.service?.name ?? '-'}</TableCell>
                <TableCell>{b.customerName}</TableCell>
                <TableCell>{b.carPlate}</TableCell>
                <TableCell><StatusBadge s={b.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
