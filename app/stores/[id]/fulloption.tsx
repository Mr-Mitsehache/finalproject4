import { notFound } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { getStoreById } from "@/app/data/stores";
import { createReview } from "@/app/data/reviews";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Phone,
  Clock,
  Star,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { ReviewsList } from "@/components/reviews/reviews-list";
import { ReviewForm } from "@/components/reviews/review-form";
import { Navbar } from "@/components/navbar";

export const revalidate = 60;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params   
  const store = await getStoreById(id);
  if (!store) return { title: "Store not found" };
  return {
    title: `${store.name} Stores`,
    description: store.address ?? undefined,
  };
}

export default async function StorePage({ params }: Props) {
  const { id } = await params   
  const store = await getStoreById(id);
  if (!store) notFound();

  const mapHref =
    store.lat != null && store.lng != null
      ? `https://www.google.com/maps/search/?api=1&query=${store.lat},${store.lng}`
      : null;

  // --- server action: create review ---
  async function createReviewAction(formData: FormData) {
    "use server";
    const storeId = String(formData.get("storeId") ?? "");
    const author = String(formData.get("author") ?? "");
    const rating = Number(formData.get("rating") ?? 0);
    const comment = String(formData.get("comment") ?? "");

    await createReview({ storeId, author, rating, comment });
    revalidatePath(`/stores/${storeId}`);
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto max-w-5xl px-4 py-6">
        <div className="mb-4">
          <Link
            href="/stores"
            className="inline-flex items-center text-sm underline hover:no-underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to stores
          </Link>
        </div>

        <Card>
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{store.name}</CardTitle>
              <Badge variant={store.isOpen ? "default" : "secondary"}>
                {store.isOpen ? "เปิด" : "ปิด"}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="font-medium">{store.rating.toFixed(1)}</span>
              </div>
              <span>·</span>
              <span>{store.reviewsCount.toLocaleString()} รีวิว</span>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 mt-0.5" />
                  <span>{store.address}</span>
                  {mapHref && (
                    <Link
                      href={mapHref}
                      target="_blank"
                      className="inline-flex items-center ml-2 underline"
                    >
                      Directions <ExternalLink className="ml-1 h-3 w-3" />
                    </Link>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4" />
                  <Link href={`tel:${store.phone}`} className="underline">
                    {store.phone}
                  </Link>
                </div>
                {store.hours && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>{store.hours}</span>
                  </div>
                )}
              </div>

              {/* Services -> Payment */}
              <div className="space-y-2">
                <h3 className="font-semibold">บริการ</h3>
                {store.services.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    ยังไม่มีบริการ
                  </div>
                ) : (
                  <ul className="divide-y">
                    {store.services.map((svc) => (
                      <li
                        key={svc.id}
                        className="py-2 flex items-center justify-between"
                      >
                        <div className="min-w-0">
                          <div className="font-medium truncate">{svc.name}</div>
                          {svc.detail && (
                            <div className="text-xs text-muted-foreground truncate">
                              {svc.detail}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {(svc.priceFrom != null || svc.priceTo != null) && (
                            <div className="text-sm tabular-nums">
                              {svc.priceFrom != null
                                ? svc.priceFrom.toLocaleString()
                                : "—"}
                              {svc.priceTo != null
                                ? `${svc.priceTo.toLocaleString()}`
                                : ""}
                              <span className="ml-1 text-muted-foreground">
                                ฿
                              </span>
                            </div>
                          )}
                          <Button asChild>
                            <Link
                              href={`/stores/${store.id}/payment?serviceId=${svc.id}`}
                            >
                              เลือกบริการ
                            </Link>
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Reviews */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">รีวิวล่าสุด</h3>
                <ReviewsList reviews={store.reviews} />
              </div>
              <div>
                <h3 className="font-semibold mb-2">เขียนรีวิว</h3>
                <ReviewForm onSubmit={createReviewAction} storeId={store.id} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
