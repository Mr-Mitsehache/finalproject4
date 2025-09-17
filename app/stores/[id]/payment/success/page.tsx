import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowLeft, Home } from "lucide-react";

export default async function PaymentSuccess({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ bookingId?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const bookingId = sp.bookingId ?? "";

  return (
    <div className="container mx-auto max-w-2xl px-4 py-24 text-center">
      {/* กล่องแจ้งเตือน */}
      <div className="rounded-2xl border border-green-400/40 bg-green-50 dark:bg-green-900/30 shadow-lg p-8">
        <div className="flex flex-col items-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 animate-bounce" />

          <h1 className="mt-4 text-3xl font-bold text-foreground">
            ชำระเงินสำเร็จ
          </h1>

          {bookingId && (
            <p className="mt-2 text-muted-foreground text-sm">
              หมายเลขการจอง:{" "}
              <span className="font-semibold text-foreground">{bookingId}</span>
            </p>
          )}

          <p className="mt-4 text-sm text-muted-foreground max-w-md">
            ขอบคุณที่ใช้บริการ 🎉 ทีมงานของเราจะติดต่อกลับเพื่อยืนยันรายละเอียด
          </p>

          {/* ปุ่มลิงก์ */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
            <Button asChild className="w-full sm:w-auto">
              <Link href={`/stores/${id}`} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                กลับไปหน้าร้าน
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                ร้านทั้งหมด
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
