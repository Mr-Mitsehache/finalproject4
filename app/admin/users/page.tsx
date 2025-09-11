// app/admin/users/page.tsx
import { requireAdmin } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AdminCreateUserForm } from '@/components/admin/user-form'
import {
  adminCreateUserAction,
  adminDeleteUserAction,
  adminUpdateUserRoleAction,
} from '../actions'
import { ConfirmDeleteForm } from '@/components/admin/confirm-delete-form'
import { UserRoleForm } from '@/components/admin/user-role-form'

export default async function AdminUsersPage() {
  await requireAdmin()
  const users = await prisma.user.findMany({
    orderBy: [{ role: 'asc' }, { createdAt: 'desc' }],
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Users</h1>

      <Card className="mb-8">
        <CardHeader><CardTitle>สร้างผู้ใช้ใหม่</CardTitle></CardHeader>
        <CardContent>
          <AdminCreateUserForm action={adminCreateUserAction} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>รายการผู้ใช้ทั้งหมด</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="py-2 pr-4">อีเมล</th>
                  <th className="py-2 pr-4">ชื่อ</th>
                  <th className="py-2 pr-4">สิทธิ์</th>
                  <th className="py-2 pr-4">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="py-2 pr-4">{u.email}</td>
                    <td className="py-2 pr-4">{u.name ?? '-'}</td>
                    <td className="py-2 pr-4">
                      {/* ✅ ใช้ Client Component เพื่อควบคุม Select + submit */}
                      <UserRoleForm
                        userId={u.id}
                        defaultRole={u.role as 'ADMIN' | 'ORGANIZA'}
                        action={adminUpdateUserRoleAction}
                      />
                    </td>
                    <td className="py-2 pr-4">
                      {/* ✅ ปุ่มลบพร้อม confirm โดยไม่ใส่ onSubmit ใน Server Component */}
                      <ConfirmDeleteForm
                        action={adminDeleteUserAction}
                        hidden={{ userId: u.id }}
                        label="ลบ"
                        confirmText="ลบผู้ใช้นี้?"
                      />
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td className="py-4 text-muted-foreground" colSpan={4}>
                      ยังไม่มีผู้ใช้
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
