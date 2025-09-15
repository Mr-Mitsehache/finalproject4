// app/page.tsx
import { StoreFilters } from "@/components/store-filters";
import { getStores } from "@/app/data/stores";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Phone, Clock } from "lucide-react";
import { Navbar } from "@/components/navbar";
import Image from "next/image";

export const revalidate = 60;

export default async function StoresPage({
  searchParams,
}: {
  searchParams?: Promise<{
    q?: string;
    open?: "0" | "1";
    sort?: "recommended" | "rating_asc" | "rating_desc";
    distance?: string;
    lat?: string;
    lng?: string;
  }>;
}) {
  const sp = await searchParams;
  const q = sp?.q ?? "";
  const sort = (sp?.sort as any) ?? "recommended";
  const distance = sp?.distance ? parseFloat(sp.distance) : undefined;
  const userLat = sp?.lat ? parseFloat(sp.lat) : undefined;
  const userLng = sp?.lng ? parseFloat(sp.lng) : undefined;
  const onlyOpen = sp?.open ? sp.open === "1" : true;

  const { items, total } = await getStores({
    q,
    minRating: 0,
    onlyOpen,
    sort,
    distance,
    userLat,
    userLng,
    take: 30,
  });

  return (
    <>
      <Navbar />
      <div className="flex flex-col container mx-auto max-w-6xl px-4 py-6">
        <StoreFilters />
        <h1 className="text-2xl font-bold mb-4">ร้านทั้งหมด ({total})</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((s) => {
            return (
              <Link key={s.id} href={`/stores/${s.id}`}>
                <Card className="hover:shadow-sm transition overflow-hidden flex flex-col h-full">
                  {/* รูป + overlay ซ้าย/ขวาบน (คงของเดิม) */}
                  <div className="relative w-full aspect-[16/9] overflow-hidden">
                    <img
                      src={s.imageUrl || "/images/store-default.jpg"}
                      alt={s.name}
                      fill
                      className="object-cover"
                      sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                      loading="lazy"
                    />
                    {/* ซ้ายบน: เปิด/ปิด */}
                    <div className="absolute left-3 top-3">
                      <span
                        className={`inline-flex h-7 items-center rounded-full px-2 text-xs font-medium leading-none
                        ${s.isOpen ? "bg-emerald-600 text-white" : "bg-red-500 text-white"}`}
                      >
                        {s.isOpen ? "เปิด" : "ปิด"}
                      </span>
                    </div>
                    {/* ขวาบน: คะแนน + รีวิว */}
                    <div className="pointer-events-none absolute right-3 top-3 flex flex-col items-end space-y-1">
                      <div className="inline-flex h-7 items-center rounded-full bg-black/70 px-2 text-xs text-white leading-none">
                        <Star className="mr-1 h-3.5 w-3.5 text-yellow-400 fill-current" />
                        <span className="font-semibold">
                          {s.rating.toFixed(1)}
                        </span>
                      </div>
                      <div className="inline-flex h-7 items-center rounded-full bg-sky-600 px-2 text-xs text-white leading-none">
                        {s.reviewsCount.toLocaleString()} รีวิว
                      </div>
                    </div>
                  </div>

                  {/* เนื้อหาใต้รูป */}
                  <CardContent className=" flex flex-col flex-1">
                    {/* ชื่อ + ที่อยู่ */}
                    <h2 className="text-lg font-semibold mb-2">{s.name}</h2>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5" />
                        <span>{s.address}</span>
                      </div>
                    </div>

                    {/* แถบล่าง: ติดก้นการ์ดเสมอ */}
                    <div className="mt-auto pt-3 border-t border-white/10 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{s.hours || "-"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{s.phone || "-"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
