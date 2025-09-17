// app/admin/manage/page.tsx
import Link from "next/link"
import { requireAdmin } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Store } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default async function AdminManagePage() {
  await requireAdmin()

  // ดึงข้อมูล Users + Stores
  const [userCount, storeCount, adminCount, organizaCount, activeStores, inactiveStores] = await Promise.all([
    prisma.user.count(),
    prisma.store.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { role: "ORGANIZA" } }),
    prisma.store.count({ where: { isOpen: true } }),
    prisma.store.count({ where: { isOpen: false } }),
  ])

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">จัดการระบบ (Admin)</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Users Card */}
        <Card className="hover:shadow-md transition">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-sky-600" />
              Users
            </CardTitle>
            <Badge variant="outline">{userCount} รวม</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Admins</span>
                <span className="font-medium">{adminCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Organizers</span>
                <span className="font-medium">{organizaCount}</span>
              </div>
            </div>
            <Button asChild className="mt-4 w-full">
              <Link href="/admin/users">ไปหน้า Users</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Stores Card */}
        <Card className="hover:shadow-md transition">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-emerald-600" />
              Stores
            </CardTitle>
            <Badge variant="outline">{storeCount} รวม</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">เปิด</span>
                <span className="font-medium text-emerald-600">{activeStores}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ปิด</span>
                <span className="font-medium text-rose-600">{inactiveStores}</span>
              </div>
            </div>
            <Button asChild className="mt-4 w-full" variant="outline">
              <Link href="/admin/stores">ไปหน้า Stores</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
