// app/organiza/dashboard/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireOrgUser } from "@/lib/auth-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function OrganizaDashboardPage() {
  const user = await requireOrgUser();

  // หา “ร้านของฉัน”
  const store = await prisma.store.findUnique({
    where: { userId: user.id! },
    select: {
      id: true,
      name: true,
      isOpen: true,
      hours: true,
      rating: true,
      reviewsCount: true,
      address: true,
      phone: true,
    },
  });

  if (!store) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Organiza Dashboard</h1>
        <Card>
          <CardHeader>
            <CardTitle>ยังไม่มีร้าน</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            สร้างร้านก่อนที่{" "}
            <Link className="underline" href="/organiza/stores">
              หน้า จัดการร้าน
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const now = new Date();
  const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // ดึงสถิติต่าง ๆ แบบขนาน
  const [
    totalBookings,
    pendingCount,
    confirmedCount,
    completedCount,
    cancelledCount,
    revenueAll,
    revenue30d,
    upcoming,
    topServiceGroups,
  ] = await Promise.all([
    prisma.booking.count({ where: { storeId: store.id } }),
    prisma.booking.count({ where: { storeId: store.id, status: "PENDING" } }),
    prisma.booking.count({ where: { storeId: store.id, status: "CONFIRMED" } }),
    prisma.booking.count({ where: { storeId: store.id, status: "COMPLETED" } }),
    prisma.booking.count({ where: { storeId: store.id, status: "CANCELLED" } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { booking: { storeId: store.id } },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        booking: { storeId: store.id },
        paidAt: { gte: last30 },
      },
    }),
    prisma.booking.findMany({
      where: { storeId: store.id, date: { gte: now } },
      orderBy: { date: "asc" },
      take: 5,
      include: { service: { select: { name: true } } },
    }),
    prisma.booking.groupBy({
      by: ["serviceId"],
      where: { storeId: store.id },
      _count: { _all: true },
    }),
  ]);

  const topServiceGroupsSorted = [...topServiceGroups]
    .sort((a, b) => b._count._all - a._count._all)
    .slice(0, 5);

  const topServiceIds = topServiceGroupsSorted.map(g => g.serviceId)
  const topServices = topServiceIds.length
    ? await prisma.service.findMany({
        where: { id: { in: topServiceIds }, storeId: store.id },
        select: { id: true, name: true },
      })
    : []

  const topServicesDisplay = topServiceGroupsSorted.map((g) => ({
    id: g.serviceId,
    name: topServices.find((s) => s.id === g.serviceId)?.name ?? "—",
    count: g._count._all,
  }));

  const statusCards: Array<{
    label: string;
    value: number;
    variant?: "ok" | "warn" | "danger";
  }> = [
    { label: "ทั้งหมด", value: totalBookings },
    { label: "รอดำเนินการ", value: pendingCount, variant: "warn" },
    { label: "ยืนยันแล้ว", value: confirmedCount, variant: "ok" },
    { label: "เสร็จสิ้น", value: completedCount, variant: "ok" },
    { label: "ยกเลิก", value: cancelledCount, variant: "danger" },
  ];

  const fmt = (n?: number | null) => (n ?? 0).toLocaleString();
  const fmtTH = (d: Date) => new Date(d).toLocaleString();

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ภาพรวมร้าน</h1>
          <div className="mt-1 text-muted-foreground">{store.name}</div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={store.isOpen ? "default" : "secondary"}>
            {store.isOpen ? "เปิด" : "ปิด"}
          </Badge>
          {store.hours && (
            <span className="text-sm text-muted-foreground">{store.hours}</span>
          )}
          <Button asChild variant="outline" size="sm">
            <Link href={`/stores/${store.id}`}>ดูหน้าร้านสาธารณะ</Link>
          </Button>
          <Button asChild size="sm">
            <Link href={`/organiza/stores/${store.id}/edit`}>แก้ไขร้าน</Link>
          </Button>
        </div>
      </div>

      {/* แถวสถิติ */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statusCards.map((c, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{c.label}</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold tabular-nums">
              {fmt(c.value)}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* รายได้ + เรตติ้ง */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>รายได้รวม</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold tabular-nums">
            ฿{fmt(revenueAll._sum.amount)}
            <div className="mt-1 text-sm text-muted-foreground">
              สะสมทั้งหมด
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>รายได้ 30 วันล่าสุด</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold tabular-nums">
            ฿{fmt(revenue30d._sum.amount)}
            <div className="mt-1 text-sm text-muted-foreground">
              ตั้งแต่ {last30.toLocaleDateString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>คะแนนรีวิว</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">
              {store.rating.toFixed(1)}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {store.reviewsCount.toLocaleString()} รีวิว
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
