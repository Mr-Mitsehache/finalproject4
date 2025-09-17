// app/admin/stores/page.tsx
import { requireAdmin } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { adminDeleteStoreAction, adminToggleStoreOpenAction } from '../actions'
import { ConfirmDeleteForm } from '@/components/admin/confirm-delete-form'
import { Search, Store, MapPin, Phone, ExternalLink } from 'lucide-react'

type SP = {
  q?: string
  status?: 'open' | 'closed' | 'all'
}

export default async function AdminStoresPage({
  searchParams,
}: {
  searchParams?: Promise<SP>
}) {
  await requireAdmin()
  const sp = (await searchParams) ?? {}
  const q = (sp.q ?? '').trim()
  const status = (sp.status ?? 'all') as SP['status']

  const where: any = {
    AND: [
      status === 'all' ? {} : { isOpen: status === 'open' },
      q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { address: { contains: q, mode: 'insensitive' } },
              { phone: { contains: q, mode: 'insensitive' } },
              { user: { email: { contains: q, mode: 'insensitive' } } },
            ],
          }
        : {},
    ],
  }

  const stores = await prisma.store.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }],
    include: { user: { select: { email: true } } },
  })

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Stores</h1>
        <form
          className="flex w-full max-w-xl items-center gap-2"
          action="/admin/stores"
          method="get"
        >
          <div className="relative flex-1">
            <input
              name="q"
              defaultValue={q}
              placeholder="ค้นหาตามชื่อร้าน/ที่อยู่/เบอร์/อีเมลเจ้าของ…"
              className="w-full rounded-md border border-red-300 bg-white/80 pl-9 pr-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-500
                         dark:border-blue-500 dark:bg-zinc-900/70 dark:focus:ring-blue-400 dark:focus:border-blue-400"
            />
            <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>

          <select
            name="status"
            defaultValue={status}
            className="h-9 rounded-md border border-red-300 bg-white/80 px-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-500
                       dark:border-blue-500 dark:bg-zinc-900/70 dark:focus:ring-blue-400 dark:focus:border-blue-400"
          >
            <option value="all">ทั้งหมด</option>
            <option value="open">เปิด</option>
            <option value="closed">ปิด</option>
          </select>

          <Button type="submit">ค้นหา</Button>
        </form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการร้านทั้งหมด</CardTitle>
        </CardHeader>
        <CardContent>
          {stores.length === 0 ? (
            <div className="text-sm text-muted-foreground">ไม่พบข้อมูลตามเงื่อนไข</div>
          ) : (
            <>
              {/* Desktop: Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-left text-muted-foreground">
                    <tr>
                      <th className="py-2 pr-4">ร้าน</th>
                      <th className="py-2 pr-4">ที่อยู่ / เบอร์</th>
                      <th className="py-2 pr-4">เจ้าของ</th>
                      <th className="py-2 pr-4">สถานะ</th>
                      <th className="py-2 pr-4 text-right">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stores.map((s) => (
                      <tr key={s.id} className="border-t">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-3">
                            {/* Thumb */}
                            <div className="h-10 w-16 overflow-hidden rounded bg-muted">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={s.imageUrl || '/images/store-default.jpg'}
                                alt={s.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium truncate">{s.name}</div>
                              <div className="text-[11px] text-muted-foreground">ID: {s.id.slice(0, 8)}…</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="line-clamp-1">{s.address}</span>
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{s.phone}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="text-xs">{s.user?.email ?? '—'}</div>
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant={s.isOpen ? 'default' : 'secondary'}>
                            {s.isOpen ? 'เปิด' : 'ปิด'}
                          </Badge>
                        </td>
                        <td className="py-3 pl-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/stores/${s.id}`}
                              target="_blank"
                              className="inline-flex items-center rounded-md border px-2.5 py-1.5 text-xs hover:bg-muted"
                            >
                              ดูหน้าร้าน <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                            </Link>

                            {/* toggle open */}
                            <form action={adminToggleStoreOpenAction}>
                              <input type="hidden" name="storeId" value={s.id} />
                              <input type="hidden" name="isOpen" value={s.isOpen ? '0' : '1'} />
                              <Button type="submit" size="sm" variant="outline">
                                {s.isOpen ? 'ปิดร้าน' : 'เปิดร้าน'}
                              </Button>
                            </form>

                            {/* delete */}
                            <ConfirmDeleteForm
                              action={adminDeleteStoreAction}
                              hidden={{ storeId: s.id }}
                              label="ลบร้าน"
                              confirmText="ลบร้านนี้? ข้อมูลที่เกี่ยวข้องจะถูกลบตามความสัมพันธ์"
                              variant="destructive"
                              size="sm"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile: Cards */}
              <div className="md:hidden space-y-3">
                {stores.map((s) => (
                  <div key={s.id} className="rounded border p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-20 overflow-hidden rounded bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={s.imageUrl || '/images/store-default.jpg'}
                          alt={s.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium truncate">{s.name}</div>
                          <Badge variant={s.isOpen ? 'default' : 'secondary'}>
                            {s.isOpen ? 'เปิด' : 'ปิด'}
                          </Badge>
                        </div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">ID: {s.id.slice(0, 8)}…</div>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="line-clamp-2">{s.address}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{s.phone}</span>
                      </div>
                      <div className="mt-1">Owner: {s.user?.email ?? '—'}</div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <Link
                        href={`/stores/${s.id}`}
                        target="_blank"
                        className="inline-flex items-center rounded-md border px-2.5 py-1.5 text-xs hover:bg-muted"
                      >
                        ดูหน้าร้าน <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                      <div className="flex items-center gap-2">
                        <form action={adminToggleStoreOpenAction}>
                          <input type="hidden" name="storeId" value={s.id} />
                          <input type="hidden" name="isOpen" value={s.isOpen ? '0' : '1'} />
                          <Button type="submit" size="sm" variant="outline">
                            {s.isOpen ? 'ปิดร้าน' : 'เปิดร้าน'}
                          </Button>
                        </form>
                        <ConfirmDeleteForm
                          action={adminDeleteStoreAction}
                          hidden={{ storeId: s.id }}
                          label="ลบ"
                          confirmText="ลบร้านนี้? ข้อมูลที่เกี่ยวข้องจะถูกลบตามความสัมพันธ์"
                          variant="destructive"
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
