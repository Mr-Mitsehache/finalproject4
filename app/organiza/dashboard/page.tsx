// app/organiza/dashboard/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireOrgUser } from "@/lib/auth-helpers";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import th from "date-fns/locale/th";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  Star,
} from "lucide-react";
import { KpiDialogCard } from "@/components/common/kpi-dialog-card";

export const revalidate = 0;

export default async function OrganizaDashboardPage() {
  const user = await requireOrgUser();

  const store = await prisma.store.findUnique({
    where: { userId: user.id! },
    include: { _count: { select: { reviews: true } } },
  });

  if (!store) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold">แดชบอร์ด</h1>
        <p className="text-muted-foreground mt-2">
          คุณยังไม่มีร้าน — ไปที่{" "}
          <Link className="underline" href="/organiza/stores">
            จัดการร้าน
          </Link>{" "}
          เพื่อสร้างร้านก่อน
        </p>
      </div>
    );
  }

  // ===== time ranges =====
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfDay   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const start30d   = new Date(now);
  start30d.setDate(now.getDate() - 29);

  // ===== counts =====
  const [total, pending, confirmed, completed, cancelled] = await Promise.all([
    prisma.booking.count({ where: { storeId: store.id } }),
    prisma.booking.count({ where: { storeId: store.id, status: "PENDING" } }),
    prisma.booking.count({ where: { storeId: store.id, status: "CONFIRMED" } }),
    prisma.booking.count({ where: { storeId: store.id, status: "COMPLETED" } }),
    prisma.booking.count({ where: { storeId: store.id, status: "CANCELLED" } }),
  ]);

  // ===== revenue aggregates =====
  const [{ _sum: todaySum }, { _sum: days30Sum }] = await Promise.all([
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { paidAt: { gte: startOfDay, lte: endOfDay }, booking: { storeId: store.id } },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { paidAt: { gte: start30d, lte: endOfDay }, booking: { storeId: store.id } },
    }),
  ]);

  // ===== today & recent tables =====
  const [todayBookings, recentBookings] = await Promise.all([
    prisma.booking.findMany({
      where: { storeId: store.id, date: { gte: startOfDay, lte: endOfDay } },
      orderBy: { date: "asc" },
      include: { service: { select: { name: true } } },
    }),
    prisma.booking.findMany({
      where: { storeId: store.id },
      orderBy: { date: "desc" },
      include: { service: { select: { name: true } } },
      take: 50,
    }),
  ]);

  // ===== lists for KPI dialogs (compact) =====
  const [listAll, listPending, listConfirmed, listCompleted, listCancelled, listReviews] =
    await Promise.all([
      prisma.booking.findMany({
        where: { storeId: store.id },
        orderBy: { date: "desc" },
        include: {
          service: { select: { name: true } },
          payment: { select: { amount: true, method: true } },
        },
        take: 20,
      }),
      prisma.booking.findMany({
        where: { storeId: store.id, status: "PENDING" },
        orderBy: { date: "desc" },
        include: {
          service: { select: { name: true } },
          payment: { select: { amount: true, method: true } },
        },
        take: 20,
      }),
      prisma.booking.findMany({
        where: { storeId: store.id, status: "CONFIRMED" },
        orderBy: { date: "desc" },
        include: {
          service: { select: { name: true } },
          payment: { select: { amount: true, method: true } },
        },
        take: 20,
      }),
      prisma.booking.findMany({
        where: { storeId: store.id, status: "COMPLETED" },
        orderBy: { date: "desc" },
        include: {
          service: { select: { name: true } },
          payment: { select: { amount: true, method: true } },
        },
        take: 20,
      }),
      prisma.booking.findMany({
        where: { storeId: store.id, status: "CANCELLED" },
        orderBy: { date: "desc" },
        include: {
          service: { select: { name: true } },
          payment: { select: { amount: true, method: true } },
        },
        take: 20,
      }),
      prisma.review.findMany({
        where: { storeId: store.id },
        orderBy: { date: "desc" },
        take: 20,
      }),
    ]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">แดชบอร์ด</h1>

      {/* ===== KPI row (click -> Dialog) ===== */}
      <div className="grid gap-4 md:grid-cols-5">
        <KpiDialogCard
          icon={<ClipboardList className="h-4 w-4" />}
          label="ทั้งหมด"
          value={total}
          dialogTitle="Bookings ล่าสุด"
        >
          <BookingsListCompact rows={listAll} />
        </KpiDialogCard>

        <KpiDialogCard
          icon={<Clock className="h-4 w-4" />}
          label="รอดำเนินการ"
          value={pending}
          tone="amber"
          dialogTitle="งานที่รอดำเนินการ"
        >
          <BookingsListCompact rows={listPending} />
        </KpiDialogCard>

        <KpiDialogCard
          icon={<ClipboardList className="h-4 w-4" />}
          label="ยืนยันแล้ว"
          value={confirmed}
          tone="sky"
          dialogTitle="งานที่ยืนยันแล้ว"
        >
          <BookingsListCompact rows={listConfirmed} />
        </KpiDialogCard>

        <KpiDialogCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="เสร็จสิ้น"
          value={completed}
          tone="emerald"
          dialogTitle="งานที่เสร็จสิ้น"
        >
          <BookingsListCompact rows={listCompleted} />
        </KpiDialogCard>

        <KpiDialogCard
          icon={<XCircle className="h-4 w-4" />}
          label="ยกเลิก"
          value={cancelled}
          tone="rose"
          dialogTitle="งานที่ถูกยกเลิก"
        >
          <BookingsListCompact rows={listCancelled} />
        </KpiDialogCard>
      </div>

      {/* ===== Revenue Cards ===== */}
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>รายได้วันนี้</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ฿{(todaySum.amount ?? 0).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              รวมจากการชำระเงินของวันนี้
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>รายได้ 30 วัน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ฿{(days30Sum.amount ?? 0).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              รวมจากรายการล่าสุด (สะสม)
            </div>
          </CardContent>
        </Card>

        <KpiDialogCard
          icon={<Star className="h-4 w-4 text-yellow-500 fill-current" />}
          label="คะแนนรีวิว"
          value={store.rating.toFixed(1)}
          tone="blue"
          dialogTitle={`รีวิวล่าสุด • ทั้งหมด ${store.reviewsCount} รีวิว`}
        >
          <ReviewsListCompact rows={listReviews} />
        </KpiDialogCard>
      </div>

      {/* ===== Today ===== */}
      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">งานวันนี้</h2>
          <Link className="text-sm text-muted-foreground hover:underline" href="/organiza/tasks">
            ไปหน้าจัดการงาน ↗
          </Link>
        </div>
        <BookingsTable rows={todayBookings} emptyText="ยังไม่มีงานวันนี้" />
      </section>

      {/* ===== Recent ===== */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold mb-3">ตาราง Booking (ล่าสุด)</h2>
        <BookingsTable rows={recentBookings} />
      </section>
    </div>
  );
}

/* ================= helpers ================= */

function statusLabel(s: "PENDING"|"CONFIRMED"|"COMPLETED"|"CANCELLED") {
  switch (s) {
    case "PENDING": return "รอดำเนินการ";
    case "CONFIRMED": return "ยืนยันแล้ว";
    case "COMPLETED": return "เสร็จสิ้น";
    case "CANCELLED": return "ยกเลิก";
  }
}

function StatusBadge({ s }: { s: "PENDING"|"CONFIRMED"|"COMPLETED"|"CANCELLED" }) {
  const map: Record<typeof s, { text: string; className: string }> = {
    PENDING:   { text: "รอดำเนินการ", className: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300" },
    CONFIRMED: { text: "ยืนยันแล้ว",  className: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300" },
    COMPLETED: { text: "เสร็จสิ้น",    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300" },
    CANCELLED: { text: "ยกเลิก",      className: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300" },
  };
  const it = map[s];
  return (
    <span className={cn("inline-flex rounded px-2 py-0.5 text-xs font-medium", it.className)}>
      {it.text}
    </span>
  );
}

function BookingsTable({
  rows,
  emptyText = "ยังไม่มีรายการ",
}: {
  rows: Array<{
    id: string;
    date: Date;
    customerName: string;
    carPlate: string;
    status: "PENDING"|"CONFIRMED"|"COMPLETED"|"CANCELLED";
    service?: { name: string } | null;
  }>;
  emptyText?: string;
}) {
  if (!rows.length) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">{emptyText}</CardContent>
      </Card>
    );
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
            {rows.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="whitespace-nowrap">
                  {format(new Date(b.date), "d/M/yyyy HH:mm", { locale: th })}
                </TableCell>
                <TableCell className="font-medium">{b.service?.name ?? "-"}</TableCell>
                <TableCell>{b.customerName}</TableCell>
                <TableCell>{b.carPlate}</TableCell>
                <TableCell><StatusBadge s={b.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/* -------- compact lists for dialogs -------- */

function BookingsListCompact({
  rows,
}: {
  rows: Array<{
    id: string;
    date: Date;
    customerName: string;
    carPlate: string;
    service?: { name: string } | null;
    payment?: { amount: number | null; method?: string | null } | null;
  }>;
}) {
  if (!rows.length) return <div className="text-sm text-muted-foreground">ยังไม่มีรายการ</div>;
  return (
    <div className="divide-y">
      {rows.map((b) => (
        <div key={b.id} className="py-2 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{b.service?.name ?? "-"}</div>
            <div className="text-xs text-muted-foreground truncate">
              {format(new Date(b.date), "d/M/yyyy HH:mm", { locale: th })} • {b.customerName} • {b.carPlate}
            </div>
          </div>
          <div className="text-sm tabular-nums whitespace-nowrap">
            {b.payment?.amount ? `฿${b.payment.amount.toLocaleString()}` : "—"}
          </div>
        </div>
      ))}
    </div>
  );
}

function ReviewsListCompact({
  rows,
}: {
  rows: Array<{ id: string; author: string; rating: number; comment: string; date: Date }>;
}) {
  if (!rows.length) return <div className="text-sm text-muted-foreground">ยังไม่มีรีวิว</div>;
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.id} className="rounded border p-3">
          <div className="flex items-center justify-between">
            <div className="font-medium line-clamp-1">{r.author}</div>
            <span className="inline-flex items-center gap-1 text-xs">
              <Star className="h-3.5 w-3.5 text-yellow-500 fill-current" />
              {r.rating}/5
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {format(new Date(r.date), "d/M/yyyy HH:mm", { locale: th })}
          </div>
          <p className="mt-1 text-sm line-clamp-3">{r.comment}</p>
        </div>
      ))}
    </div>
  );
}
