// app/organiza/stores/page.tsx
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

// ⬇️ ใช้ทั้ง update + delete
import { updateStoreAction, deleteStoreAction } from "./actions";
import { StoreForm } from "@/components/organiza/store-form";

export const revalidate = 0;

export default async function OrgStoresPage() {
  const user = await requireOrgUser();
  const store = await prisma.store.findUnique({ where: { userId: user.id } });

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">จัดการร้าน</h1>
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
            กด “สร้างร้าน” เพื่อเริ่มต้น
          </CardContent>
        </Card>
      ) : (
        <>
          {/* สรุปหน้าร้านสั้น ๆ */}
          <Card className="mb-6">
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>{store.name}</CardTitle>
                <div className="mt-1 text-sm text-muted-foreground">
                  {store.address}
                </div>
              </div>
              <Badge variant={store.isOpen ? "default" : "secondary"}>
                {store.isOpen ? "เปิด" : "ปิด"}
              </Badge>
            </CardHeader>
            <CardContent className="grid gap-2">
              <div>
                <span className="text-muted-foreground">โทร:</span> {store.phone}
              </div>
              {store.hours && (
                <div>
                  <span className="text-muted-foreground">เวลา:</span> {store.hours}
                </div>
              )}
            </CardContent>
            <CardFooter className="gap-3">
              {/* ปุ่มลบยังอยู่ */}
              <form
                action={async () => {
                  "use server";
                  await deleteStoreAction(store.id);
                }}
              >
                <Button variant="destructive" type="submit">
                  ลบร้าน
                </Button>
              </form>
              <Button asChild variant="outline">
                <Link href="/organiza/services">จัดการบริการ</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/stores/${store.id}`} target="_blank">
                  ดูหน้าร้านสาธารณะ
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* ฟอร์มแก้ไขร้าน แสดงบนหน้าเลย */}
          <Card>
            <CardHeader>
              <CardTitle>แก้ไขข้อมูลร้าน</CardTitle>
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
