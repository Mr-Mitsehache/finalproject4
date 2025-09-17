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
      <div className=" container min-h-screen">
      <div className="flex flex-col container bg-plain mx-auto max-w-6xl px-4 py-6">
        
        <StoreFilters />
        <h1 className="text-2xl font-bold mb-4">ร้านทั้งหมด ({total})</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((s) => (
            <Link key={s.id} href={`/stores/${s.id}`}>
              <Card
                className="relative flex flex-col h-full overflow-hidden rounded-xl transition-transform
             bg-white border border-red-200 shadow-sm
             dark:bg-gradient-to-br dark:from-zinc-900/90 dark:to-black/90
             dark:border-zinc-700/50 
             hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] 
             dark:hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
              >
                {/* รูป + overlay */}
                <div className="relative w-full aspect-[16/9]">
                  <img
                    src={s.imageUrl || "/images/store-default.jpg"}
                    alt={s.name}
                    fill
                    className="object-cover"
                    sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent dark:from-black/80 dark:via-black/40" />

                  {/* ป้ายซ้ายบน */}
                  <div className="absolute left-3 top-3">
                    {s.isOpen ? (
                      <Badge variant="success">เปิด</Badge>
                    ) : (
                      <Badge variant="destructive">ปิด</Badge>
                    )}
                  </div>

                  {/* ป้ายคะแนน */}
                  <div className="absolute right-3 top-3 flex flex-col items-end space-y-2">
                    <div className="inline-flex items-center rounded-full bg-black/80 px-3 py-1 text-xs text-white glow-border">
                      <Star className="mr-1 h-3.5 w-3.5 text-yellow-400 fill-current" />
                      <span className="font-semibold">
                        {s.rating.toFixed(1)}
                      </span>
                    </div>

                    <Badge variant="info">
                      {s.reviewsCount.toLocaleString()} รีวิว
                    </Badge>
                  </div>
                </div>

                {/* เนื้อหา */}
                <CardContent className="flex flex-col flex-1 p-4">
                  <h2 className="text-lg font-extrabold tracking-wide metal-text mb-2  text-black dark:text-white">
                    {s.name}
                  </h2>
                  <div className="space-y-1 text-sm text-zinc-600 dark:text-white-400">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-red-500 dark:text-blue-400" />
                      <span>{s.address}</span>
                    </div>
                  </div>

                  {/* Bottom bar */}
                  <div
                    className="mt-auto pt-3 border-t border-red-200 text-zinc-700 
                    dark:border-zinc-700/50 dark:text-zinc-300 
                    flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-red-500 dark:text-blue-400" />
                      <span>{s.hours || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-red-500 dark:text-green-400" />
                      <span>{s.phone || "-"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        </div>
      </div>
    </>
  );
}
