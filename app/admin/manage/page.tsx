import Link from 'next/link'
import { requireAdmin } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function AdminManagePage() {
  await requireAdmin()

  const [userCount, storeCount] = await Promise.all([
    prisma.user.count(),
    prisma.store.count(),
  ])

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Manage</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>จัดการผู้ใช้ของระบบ</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-3xl font-bold tabular-nums">{userCount.toLocaleString()}</div>
            <Button asChild><Link href="/admin/users">ไปหน้า Users</Link></Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stores</CardTitle>
            <CardDescription>จัดการร้านทั้งหมด</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-3xl font-bold tabular-nums">{storeCount.toLocaleString()}</div>
            <Button asChild><Link href="/admin/stores">ไปหน้า Stores</Link></Button>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
