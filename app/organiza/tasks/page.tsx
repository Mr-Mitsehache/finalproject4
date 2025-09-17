// app/organiza/tasks/page.tsx
import { prisma } from "@/lib/prisma";
import { requireOrgUser } from "@/lib/auth-helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateBookingStatusAction } from "./actions";
import {
  CheckCircle,
  Clock,
  User,
  CarFront,
  CreditCard,
  XCircle,
  Clipboard,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import type { BookingStatus } from "@prisma/client";
import { startOfDay, endOfDay, parseISO, format } from "date-fns";
import { DatePicker } from "@/components/organiza/date-picker";

// ✅ utility ฟอร์แมทวันที่ไทย
const fmtDay = (d: Date) => format(d, "dd/MM/yyyy");

export default async function OrganizaTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const user = await requireOrgUser();

  const store = await prisma.store.findUnique({
    where: { userId: user.id! },
    select: { id: true, name: true },
  });
  if (!store) {
    return (
      <div className="container mx-auto max-w-5xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>ยังไม่มีร้าน</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              ไปที่{" "}
              <Link href="/organiza/stores" className="underline">
                จัดการร้าน
              </Link>{" "}
              เพื่อสร้างร้านก่อน
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ✅ กำหนดวันจาก query param หรือ default = วันนี้
  const sp = await searchParams;
  const selectedDate = sp?.date ? parseISO(sp.date) : new Date();
  const start = startOfDay(selectedDate);
  const end = endOfDay(selectedDate);

  const bookings = await prisma.booking.findMany({
    where: {
      storeId: store.id,
      date: { gte: start, lte: end },
    },
    orderBy: { date: "asc" },
    include: {
      service: { select: { name: true } },
      payment: { select: { amount: true, method: true, paidAt: true } },
    },
    take: 100,
  });

  // group by status
  const groups: Record<BookingStatus, typeof bookings> = {
    PENDING: [],
    CONFIRMED: [],
    COMPLETED: [],
    CANCELLED: [],
  };
  bookings.forEach((b) => groups[b.status].push(b));

  const totalRevenue = bookings.reduce(
    (sum, b) => sum + (b.payment?.amount ?? 0),
    0
  );

  const badgeForStatus = (s: BookingStatus) => {
    switch (s) {
      case "PENDING":
        return <Badge variant="secondary">รอดำเนินการ</Badge>;
      case "CONFIRMED":
        return <Badge>ยืนยันแล้ว</Badge>;
      case "COMPLETED":
        return <Badge className="bg-emerald-600 text-white">เสร็จสิ้น</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">ยกเลิก</Badge>;
    }
  };

  const fmt = (d: Date) =>
    new Date(d).toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="container mx-auto max-w-6xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Tasks / Bookings</h1>
          <p className="text-muted-foreground">
            ร้าน: {store.name} —{" "}
            <span className="font-medium">{fmtDay(selectedDate)}</span>
          </p>
        </div>

        {/* ✅ Date Picker */}
        <div className="flex items-center gap-2">

          <DatePicker defaultDate={selectedDate} />
        </div>
      </div>

      {/* ✅ summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card className="p-4 text-center">
          <div className="text-xl font-bold text-yellow-600">
            {groups.PENDING.length}
          </div>
          <div className="text-sm text-muted-foreground">รอดำเนินการ</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-xl font-bold text-blue-600">
            {groups.CONFIRMED.length}
          </div>
          <div className="text-sm text-muted-foreground">ยืนยันแล้ว</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-xl font-bold text-emerald-600">
            {groups.COMPLETED.length}
          </div>
          <div className="text-sm text-muted-foreground">เสร็จสิ้น</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-xl font-bold text-red-600">
            {groups.CANCELLED.length}
          </div>
          <div className="text-sm text-muted-foreground">ยกเลิก</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-xl font-bold text-indigo-600">
            ฿{totalRevenue.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">รายได้รวม</div>
        </Card>
      </div>

      {/* ✅ Tabs */}
      <Tabs defaultValue="PENDING" className="w-full">
        <TabsList className="mb-4 flex flex-wrap">
          <TabsTrigger value="PENDING">
            <Clock className="h-4 w-4 mr-1" /> รอดำเนินการ
          </TabsTrigger>
          <TabsTrigger value="CONFIRMED">
            <Clipboard className="h-4 w-4 mr-1" /> ยืนยันแล้ว
          </TabsTrigger>
          <TabsTrigger value="COMPLETED">
            <CheckCircle className="h-4 w-4 mr-1" /> เสร็จสิ้น
          </TabsTrigger>
          <TabsTrigger value="CANCELLED">
            <XCircle className="h-4 w-4 mr-1" /> ยกเลิก
          </TabsTrigger>
        </TabsList>

        {(
          ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as BookingStatus[]
        ).map((st) => (
          <TabsContent key={st} value={st} className="space-y-4">
            {groups[st].length === 0 ? (
              <p className="text-sm text-muted-foreground">ไม่มีรายการ</p>
            ) : (
              groups[st].map((b) => (
                <Card key={b.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold flex items-center gap-2">
                        <User className="h-4 w-4" /> {b.customerName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {fmt(b.date)}
                      </div>
                    </div>
                    {badgeForStatus(b.status)}
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CarFront className="h-4 w-4" />
                      {b.carModel} · {b.carPlate}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {b.service?.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      {b.payment
                        ? `฿${b.payment.amount} (${b.payment.method})`
                        : "ยังไม่ชำระ"}
                    </div>
                  </div>

                  <form
                    action={updateBookingStatusAction}
                    className="mt-3 flex gap-2"
                  >
                    <input type="hidden" name="bookingId" value={b.id} />
                    <select
                      name="status"
                      defaultValue={b.status}
                      className="h-8 rounded border px-2 text-sm"
                    >
                      <option value="PENDING">รอดำเนินการ</option>
                      <option value="CONFIRMED">ยืนยันแล้ว</option>
                      <option value="COMPLETED">เสร็จสิ้น</option>
                      <option value="CANCELLED">ยกเลิก</option>
                    </select>
                    <button
                      type="submit"
                      className="h-8 px-3 rounded bg-primary text-primary-foreground text-sm"
                    >
                      บันทึก
                    </button>
                  </form>
                </Card>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
