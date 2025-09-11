// app/stores/page.tsx
import { StoreFilters } from "@/components/store-filters";
import { getStores } from "@/app/data/stores";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Phone, Clock } from "lucide-react";
import { Navbar } from "@/components/navbar";

export const revalidate = 60; // ISR 1 นาที

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
  const sp = await searchParams
  const q = sp?.q ?? "";
  const sort = (sp?.sort as any) ?? "recommended";
  const distance = sp?.distance
    ? parseFloat(sp.distance)
    : undefined;
  const userLat = sp?.lat ? parseFloat(sp.lat) : undefined;
  const userLng = sp?.lng ? parseFloat(sp.lng) : undefined;

  // default to open=true when not specified
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
      <div className="container mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">ร้านทั้งหมด ({total})</h1>

        <StoreFilters />

        {/* ร้านค้า */}
        <div className="grid grid-cols-1 gap-6">
          {items.map((s) => (
            <Link key={s.id} href={`/stores/${s.id}`}>
              <Card className="hover:shadow-sm transition">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold">{s.name}</h2>
                        <Badge variant={s.isOpen ? "default" : "secondary"}>
                          {s.isOpen ? "เปิด" : "ปิด"}
                        </Badge>
                      </div>
                      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5" />
                          <span>{s.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{s.phone}</span>
                        </div>
                        {s.hours ? (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{s.hours}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-medium">
                          {s.rating.toFixed(1)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {s.reviewsCount.toLocaleString()} รีวิว
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
