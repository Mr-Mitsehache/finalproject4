import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireOrgUser } from "@/lib/auth-helpers";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Building2,
  MapPin,
  Phone,
  Clock,
  Eye,
  Wrench,
  Trash2,
  Store as StoreIcon,
  Star,
  ListChecks,
} from "lucide-react";

import { updateStoreAction, deleteStoreAction } from "./actions";
import { StoreForm } from "@/components/organiza/store-form";

export const revalidate = 0;

export default async function OrgStoresPage() {
  const user = await requireOrgUser();
  const store = await prisma.store.findUnique({
    where: { userId: user.id },
    include: { services: true, reviews: true },
  });

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold flex items-center gap-2">
          <StoreIcon className="h-7 w-7 text-primary" />
          จัดการร้าน
        </h1>
        {!store && (
          <Button asChild>
            <Link href="/organiza/stores/new">สร้างร้าน</Link>
          </Button>
        )}
      </div>

      {!store ? (
        <Card>
          <CardHeader>
            <CardTitle>คุณยังไม่มีร้าน</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            กด <span className="font-semibold">“สร้างร้าน”</span> เพื่อเริ่มต้น
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ✅ Overview + Stats */}
          <Card className="mb-6 shadow-md hover:shadow-lg transition">
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Building2 className="h-5 w-5 text-primary" />
                  {store.name}
                </CardTitle>
                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {store.address}
                </div>
              </div>
              <Badge
                variant={store.isOpen ? "default" : "destructive"}
              >
                {store.isOpen ? "เปิด" : "ปิด"}
              </Badge>
            </CardHeader>

            <CardContent className="grid gap-6">
              {/* Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatBox
                  icon={<Phone className="h-4 w-4 text-primary" />}
                  label="โทร"
                  value={store.phone || "-"}
                />
                <StatBox
                  icon={<Clock className="h-4 w-4 text-primary" />}
                  label="เวลา"
                  value={store.hours || "-"}
                />
                <StatBox
                  icon={<ListChecks className="h-4 w-4 text-sky-500" />}
                  label="บริการ"
                  value={store.services.length.toString()}
                />
                <StatBox
                  icon={<Star className="h-4 w-4 text-yellow-500 fill-current" />}
                  label="รีวิว"
                  value={`${store.reviews.length} รีวิว`}
                />
              </div>
            </CardContent>

            <CardFooter className="gap-3 flex-wrap">
              <form
                action={async () => {
                  "use server";
                  await deleteStoreAction(store.id);
                }}
              >
                <Button
                  variant="destructive"
                  type="submit"
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" /> ลบร้าน
                </Button>
              </form>
              <Button asChild variant="outline" className="flex items-center gap-2">
                <Link href="/organiza/services">
                  <Wrench className="h-4 w-4" /> จัดการบริการ
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex items-center gap-2">
                <Link href={`/stores/${store.id}`} target="_blank">
                  <Eye className="h-4 w-4" /> ดูหน้าร้านสาธารณะ
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* ✅ Edit Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-primary" />
                แก้ไขข้อมูลร้าน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StoreForm
                action={updateStoreAction.bind(null, store.id)}
                defaultValues={store}
                submitText="บันทึกการเปลี่ยนแปลง"
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

/* Small Stat Box */
function StatBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-start gap-1 rounded-lg border border-border bg-card/70 p-3 shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-base font-semibold">{value}</div>
    </div>
  );
}
