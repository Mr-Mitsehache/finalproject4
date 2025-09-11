// app/organiza/tasks/page.tsx
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { requireOrgUser } from '@/lib/auth-helpers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { BookingStatus } from '@prisma/client'

// Next 15: searchParams ต้องเป็น Promise แล้ว await
export default async function OrganizaTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const user = await requireOrgUser()

  // หา “ร้านของฉัน” (ตาม schema: userId unique)
  const store = await prisma.store.findUnique({
    where: { userId: user.id! },
    select: { id: true, name: true },
  })

  if (!store) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Tasks / Bookings</h1>
        <Card>
          <CardHeader>
            <CardTitle>ยังไม่มีร้าน</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            สร้างร้านก่อนที่ <Link className="underline" href="/organiza/stores">หน้า จัดการร้าน</Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const sp = await searchParams
  const statusParam = (sp?.status || '').toUpperCase()

  // อนุญาตเฉพาะสถานะที่มีจริงใน enum
  const allowed: BookingStatus[] = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']
  const statusFilter: BookingStatus | undefined =
    (allowed as string[]).includes(statusParam) ? (statusParam as BookingStatus) : undefined

  // ดึงรายการจองของร้านนี้
  const bookings = await prisma.booking.findMany({
    where: {
      storeId: store.id,
      ...(statusFilter ? { status: statusFilter } : {}),
    },
    orderBy: { date: 'desc' },
    take: 100, // เอามากสุด 100 รายการ (ปรับได้)
    include: {
      service: { select: { name: true } },
      payment: { select: { amount: true, method: true, paidAt: true } },
    },
  })

  const statTabs: Array<{ key: 'ALL' | BookingStatus; label: string }> = [
    { key: 'ALL', label: 'ทั้งหมด' },
    { key: 'PENDING', label: 'รอดำเนินการ' },
    { key: 'CONFIRMED', label: 'ยืนยันแล้ว' },
    { key: 'COMPLETED', label: 'เสร็จสิ้น' },
    { key: 'CANCELLED', label: 'ยกเลิก' },
  ]

  const isActive = (key: string) =>
    (key === 'ALL' && !statusFilter) || key === statusFilter

  const fmtDateTime = (d: Date) =>
    new Date(d).toLocaleString() // ปรับ locale/format ได้ตามต้องการ

  const badgeForStatus = (s: BookingStatus) => {
    switch (s) {
      case 'PENDING':
        return <Badge variant="secondary">รอดำเนินการ</Badge>
      case 'CONFIRMED':
        return <Badge>ยืนยันแล้ว</Badge>
      case 'COMPLETED':
        return <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white">เสร็จสิ้น</Badge>
      case 'CANCELLED':
        return <Badge variant="destructive">ยกเลิก</Badge>
      default:
        return <Badge>{s}</Badge>
    }
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Tasks / Bookings</h1>
      <p className="text-muted-foreground mb-6">ร้าน: {store.name}</p>

      {/* แท็บฟิลเตอร์สถานะด้วยลิงก์ (ไม่มี event handler) */}
      <div className="mb-4 inline-flex items-center rounded-md border bg-background p-1">
        {statTabs.map((t) => {
          const href =
            t.key === 'ALL'
              ? '/organiza/tasks'
              : `/organiza/tasks?status=${t.key}`
          return (
            <Link
              key={t.key}
              href={href}
              className={[
                'inline-flex items-center rounded-sm px-3 py-1.5 text-sm transition',
                isActive(t.key) ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:bg-muted',
              ].join(' ')}
              aria-current={isActive(t.key) ? 'page' : undefined}
            >
              {t.label}
            </Link>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            รายการจอง{statusFilter ? ` (${statTabs.find(s => s.key === statusFilter)?.label})` : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="text-sm text-muted-foreground">ยังไม่มีรายการ</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr>
                    <th className="py-2 pr-4">วันเวลา</th>
                    <th className="py-2 pr-4">ลูกค้า</th>
                    <th className="py-2 pr-4">บริการ</th>
                    <th className="py-2 pr-4">รถ</th>
                    <th className="py-2 pr-4">สถานะ</th>
                    <th className="py-2 pr-4">ชำระเงิน</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} className="border-t">
                      <td className="py-2 pr-4 whitespace-nowrap">
                        {fmtDateTime(b.date)}
                      </td>
                      <td className="py-2 pr-4">
                        <div className="font-medium">{b.customerName}</div>
                        <div className="text-xs text-muted-foreground">{b.phone}{b.email ? ` · ${b.email}` : ''}</div>
                      </td>
                      <td className="py-2 pr-4">
                        <div className="font-medium">{b.service?.name ?? '-'}</div>
                        {b.note && (
                          <div className="text-xs text-muted-foreground line-clamp-1">{b.note}</div>
                        )}
                      </td>
                      <td className="py-2 pr-4">
                        <div>{b.carModel}</div>
                        <div className="text-xs text-muted-foreground">{b.carPlate}</div>
                      </td>
                      <td className="py-2 pr-4">
                        {badgeForStatus(b.status)}
                      </td>
                      <td className="py-2 pr-4 whitespace-nowrap">
                        {b.payment
                          ? <>
                              <div className="font-medium">
                                ฿{b.payment.amount.toLocaleString()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {b.payment.method} {b.payment.paidAt ? `· ${fmtDateTime(b.payment.paidAt)}` : ''}
                              </div>
                            </>
                          : <span className="text-muted-foreground">—</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
