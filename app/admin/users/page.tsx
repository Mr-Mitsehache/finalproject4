// app/admin/users/page.tsx
import Link from 'next/link'
import { requireAdmin } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AdminCreateUserForm } from '@/components/admin/user-form'
import {
  adminCreateUserAction,
  adminDeleteUserAction,
  adminUpdateUserRoleAction,
} from '../actions'
import { ConfirmDeleteForm } from '@/components/admin/confirm-delete-form'
import { UserRoleForm } from '@/components/admin/user-role-form'
import { Mail, Shield, User2, CalendarClock, Search } from 'lucide-react'

type SP = {
  q?: string
  role?: 'ALL' | 'ADMIN' | 'ORGANIZA'
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: Promise<SP>
}) {
  await requireAdmin()

  const sp = (await searchParams) ?? {}
  const q = (sp.q ?? '').trim()
  const role = (sp.role ?? 'ALL') as SP['role']

  const where: any = {
    AND: [
      role === 'ALL' ? {} : { role },
      q
        ? {
            OR: [
              { email: { contains: q, mode: 'insensitive' } },
              { name: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {},
    ],
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: [{ role: 'asc' }, { createdAt: 'desc' }],
  })

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground">
            จัดการผู้ใช้ทั้งหมด ค้นหาตามอีเมล/ชื่อ และปรับสิทธิ์
          </p>
        </div>

        {/* Server-side search/filter (ไม่มี client handler) */}
        <form
          action="/admin/users"
          method="get"
          className="flex w-full max-w-xl items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              name="q"
              defaultValue={q}
              placeholder="ค้นหาอีเมลหรือชื่อผู้ใช้…"
              className="w-full rounded-md border border-red-300 bg-white/80 pl-9 pr-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-500
                         dark:border-blue-500 dark:bg-zinc-900/70 dark:focus:ring-blue-400 dark:focus:border-blue-400"
            />
            <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>

          <select
            name="role"
            defaultValue={role}
            className="h-9 rounded-md border border-red-300 bg-white/80 px-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-500
                       dark:border-blue-500 dark:bg-zinc-900/70 dark:focus:ring-blue-400 dark:focus:border-blue-400"
          >
            <option value="ALL">สิทธิ์ทั้งหมด</option>
            <option value="ADMIN">ADMIN</option>
            <option value="ORGANIZA">ORGANIZA</option>
          </select>

          <Button type="submit">ค้นหา</Button>
        </form>
      </div>

      {/* Create user */}
      {/* <Card className="mb-8">
        <CardHeader>
          <CardTitle>สร้างผู้ใช้ใหม่</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminCreateUserForm action={adminCreateUserAction} />
        </CardContent>
      </Card> */}

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle>รายการผู้ใช้ทั้งหมด</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-sm text-muted-foreground">ไม่พบผู้ใช้ตามเงื่อนไข</div>
          ) : (
            <>
              {/* Desktop: Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-left text-muted-foreground">
                    <tr>
                      <th className="py-2 pr-4">ผู้ใช้</th>
                      <th className="py-2 pr-4">อีเมล</th>
                      <th className="py-2 pr-4">สิทธิ์</th>
                      <th className="py-2 pr-4">สร้างเมื่อ</th>
                      <th className="py-2 pr-4">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-t">
                        <td className="py-2 pr-4">
                          <div className="flex items-center gap-3">
                            <Avatar email={u.email ?? ''} name={u.name ?? ''} />
                            <div className="min-w-0">
                              <div className="font-medium truncate">{u.name ?? '—'}</div>
                              <div className="text-[11px] text-muted-foreground">ID: {u.id.slice(0, 8)}…</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 pr-4">
                          <div className="flex items-center gap-2 text-xs">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="truncate">{u.email}</span>
                          </div>
                        </td>
                        <td className="py-2 pr-4">
                          {/* Client component: จัดการ select + submit */}
                          <UserRoleForm
                            userId={u.id}
                            defaultRole={u.role as 'ADMIN' | 'ORGANIZA'}
                            action={adminUpdateUserRoleAction}
                          />
                        </td>
                        <td className="py-2 pr-4 whitespace-nowrap text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <CalendarClock className="h-3.5 w-3.5" />
                            <time dateTime={u.createdAt.toISOString()}>
                              {new Date(u.createdAt).toLocaleString('th-TH', {
                                day: '2-digit', month: '2-digit', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                              })}
                            </time>
                          </div>
                        </td>
                        <td className="py-2 pr-4">
                          <div className="flex items-center gap-2">
                            <ConfirmDeleteForm
                              action={adminDeleteUserAction}
                              hidden={{ userId: u.id }}
                              label="ลบ"
                              confirmText="ลบผู้ใช้นี้?"
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
                {users.map((u) => (
                  <div key={u.id} className="rounded border p-3">
                    <div className="flex items-center gap-3">
                      <Avatar email={u.email ?? ''} name={u.name ?? ''} />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{u.name ?? '—'}</div>
                        <div className="text-[11px] text-muted-foreground">ID: {u.id.slice(0, 8)}…</div>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="truncate">{u.email}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <Shield className="h-3.5 w-3.5" />
                        <span>{u.role}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <CalendarClock className="h-3.5 w-3.5" />
                        <time dateTime={u.createdAt.toISOString()}>
                          {new Date(u.createdAt).toLocaleString('th-TH', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </time>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <UserRoleForm
                        userId={u.id}
                        defaultRole={u.role as 'ADMIN' | 'ORGANIZA'}
                        action={adminUpdateUserRoleAction}
                      />
                      <ConfirmDeleteForm
                        action={adminDeleteUserAction}
                        hidden={{ userId: u.id }}
                        label="ลบ"
                        confirmText="ลบผู้ใช้นี้?"
                        variant="destructive"
                        size="sm"
                      />
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

/* ===== Small helper: Avatar จากตัวอักษร ===== */
function Avatar({ email, name }: { email: string; name: string }) {
  const label = (name || email || 'U')
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s.charAt(0).toUpperCase())
    .join('')
  return (
    <div className="grid h-10 w-10 place-items-center rounded-full border border-border bg-white text-foreground shadow-sm dark:bg-zinc-900">
      <User2 className="h-4 w-4 opacity-60 md:hidden" />
      <span className="hidden text-xs font-semibold md:inline">{label}</span>
    </div>
  )
}
