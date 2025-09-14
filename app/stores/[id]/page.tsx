// app\stores\[id]\page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Shield, Sparkles } from "lucide-react";

import { revalidatePath } from "next/cache";
import { getStoreById } from "@/app/data/stores";
import { Navbar } from "@/components/navbar";
// review
import { getReviews, createReview } from "@/app/data/reviews";
import { ReviewForm } from "@/components/reviews/review-form";
import { ReviewsList } from "@/components/reviews/reviews-list";
import { ReviewDialogButton } from "@/components/reviews/review-dialog-button";

// ✅ import Prisma type for the card
import type { Service as ServiceModel } from "@prisma/client";
import { ServiceCardFancy } from "@/components/stores/service-card-fancy";

export const revalidate = 60;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const store = await getStoreById(id);
  if (!store) return { title: "Store not found" };
  return {
    title: `${store.name} Stores`,
    description: store.address ?? undefined,
  };
}

export default async function StorePage({ params, searchParams }: Props) {
  const { id } = await params;
  const store = await getStoreById(id);
  if (!store) notFound();

  // --- server action: create review (keep if you'll render the form later) ---
  const sp = (await searchParams) ?? {};
  const starNum = sp.stars ? parseInt(sp.stars, 5) : undefined;
  const stars = starNum && starNum >= 1 && starNum <= 5 ? starNum : undefined;

  // ดึงรีวิวตามตัวกรอง
  const reviews = await getReviews(store.id, { take: 20, stars });

  // server action: submit review (เหมือนเดิม แต่รองรับ media)
  async function createReviewAction(
    _prev: { ok?: boolean; error?: string },
    formData: FormData
  ): Promise<{ ok?: boolean; error?: string }> {
    "use server";
    const storeId = String(formData.get("storeId") ?? "");
    const author = String(formData.get("author") ?? "");
    const rating = Number(formData.get("rating") ?? 0);
    const comment = String(formData.get("comment") ?? "");
    const mediaUrl = String(formData.get("mediaUrl") ?? "");
    const mediaKind = String(formData.get("mediaKind") ?? "") as any;

    try {
      await createReview({
        storeId,
        author,
        rating,
        comment,
        mediaUrl,
        mediaKind:
          mediaKind === "IMAGE" || mediaKind === "VIDEO"
            ? mediaKind
            : undefined,
      });
    } catch (e: any) {
      return { error: e?.message ?? "ส่งรีวิวไม่สำเร็จ" };
    }
    revalidatePath(`/stores/${storeId}`);
    return { ok: true };
  }

  return (
    <div className="pb-16">
      <Navbar />

      {/* HERO */}
      <section className="relative">
        <div
          className="relative overflow-hidden rounded-none md:rounded-2xl"
          style={{}}
        >
          <div className="absolute inset-0 bg-black/60 md:bg-gradient-to-r md:from-black/70 md:to-black/20" />
          <div className="relative z-10 container mx-auto max-w-6xl px-4 py-10 md:py-16">
            {/* dynamic rating line */}
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-white backdrop-blur">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm">
                {store.rating.toFixed(1)}/5 จาก{" "}
                {store.reviewsCount.toLocaleString()} รีวิว
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-white">
              {store.name}
            </h1>

            <p className="mt-3 max-w-2xl text-white/80">
              ดูแลรถของคุณด้วยเทคโนโลยีทันสมัย ผลิตภัณฑ์คุณภาพสูง
              และทีมงานมืออาชีพ เพื่อให้รถของคุณกลับมาเงางามเหมือนใหม่
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="#reviews">ดูรีวิว</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-white/10 text-white border-white/30 hover:bg-white/20"
              >
                <Link href="#services">ดูบริการทั้งหมด</Link>
              </Button>
            </div>

            {/* stats (static example) */}
            <div className="mt-8 grid grid-cols-2 gap-4 text-white/90 sm:grid-cols-4">
              <Stat
                icon={<Users className="h-5 w-5" />}
                title="???"
                subtitle="???"
              />
              <Stat
                icon={<Shield className="h-5 w-5" />}
                title="???"
                subtitle="???"
              />
              <Stat
                icon={<Sparkles className="h-5 w-5" />}
                title={store.services.length.toString()}
                subtitle="รายการบริการ"
              />
              <Stat
                icon={<Star className="h-5 w-5 text-yellow-400 fill-current" />}
                title={store.rating.toFixed(1)}
                subtitle="คะแนนเฉลี่ย"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="container mx-auto max-w-6xl px-4 pt-12">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold">
            บริการคาร์แคร์ <span className="text-sky-600">ครบวงจร</span>
          </h2>
          <p className="mt-2 text-muted-foreground">
            เลือกบริการที่เหมาะกับความต้องการของคุณ ด้วยคุณภาพระดับมืออาชีพ
            และราคาที่คุ้มค่า
          </p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {store.services.length === 0 ? (
            <div className="text-center col-span-full text-muted-foreground">
              ร้านนี้ยังไม่มีบริการในระบบ
            </div>
          ) : (
            store.services.map((svc) => (
              <ServiceCardFancy
                key={svc.id}
                svc={svc as any}
                storeId={store.id}
              />
            ))
          )}
        </div>
      </section>

      {/* ---------- REVIEWS Section ---------- */}
      <section id="reviews" className="container mx-auto max-w-6xl px-4 pt-12">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold">
              รีวิวจากลูกค้า
            </h2>
            <p className="mt-1 text-muted-foreground">
              คะแนนเฉลี่ย {store.rating.toFixed(1)} จาก{" "}
              {store.reviewsCount.toLocaleString()} รีวิว
            </p>
          </div>
          <ReviewDialogButton storeId={store.id} action={createReviewAction} />
        </div>

        {/* ตัวกรอง: ล่าสุด / 5..1 ดาว */}
        <div className="mb-4 inline-flex items-center rounded-md border bg-background p-1">
          {[
            {
              key: "latest",
              label: "ล่าสุด",
              href: `/stores/${store.id}#reviews`,
            },
            {
              key: "5",
              label: "5 ดาว",
              href: `/stores/${store.id}?stars=5#reviews`,
            },
            {
              key: "4",
              label: "4 ดาว",
              href: `/stores/${store.id}?stars=4#reviews`,
            },
            {
              key: "3",
              label: "3 ดาว",
              href: `/stores/${store.id}?stars=3#reviews`,
            },
            {
              key: "2",
              label: "2 ดาว",
              href: `/stores/${store.id}?stars=2#reviews`,
            },
            {
              key: "1",
              label: "1 ดาว",
              href: `/stores/${store.id}?stars=1#reviews`,
            },
          ].map((t) => {
            const active =
              (t.key === "latest" && !stars) ||
              (stars && String(stars) === t.key);
            return (
              <Link
                key={t.key}
                href={t.href}
                className={[
                  "inline-flex items-center rounded-sm px-3 py-1.5 text-sm transition",
                  active
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:bg-muted",
                ].join(" ")}
                aria-current={active ? "page" : undefined}
              >
                {t.label}
              </Link>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>รีวิว{stars ? ` (${stars} ดาว)` : "ล่าสุด"}</CardTitle>
          </CardHeader>
          <CardContent>
            <ReviewsList reviews={reviews as any} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

/* ---------- small bits ---------- */

function Stat({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur">
        {icon}
      </div>
      <div>
        <div className="text-lg font-bold">{title}</div>
        <div className="text-xs opacity-80">{subtitle}</div>
      </div>
    </div>
  );
}

// ✅ Card that matches your Prisma Service model
function ServiceCard({ svc, storeId }: { svc: ServiceModel; storeId: string }) {
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{svc.name}</CardTitle>
        {svc.detail && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {svc.detail}
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {(svc.priceFrom != null || svc.priceTo != null) && (
          <div className="mt-1 text-2xl font-extrabold tabular-nums">
            ฿{(svc.priceFrom ?? 0).toLocaleString()} - ฿
            {svc.priceTo != null ? `${svc.priceTo.toLocaleString()}` : ""}
          </div>
        )}
      </CardContent>

      <CardFooter className="mt-auto">
        <Button asChild className="w-full">
          {/* ✅ Go to your payment page for this service */}
          <Link href={`/stores/${storeId}/payment?serviceId=${svc.id}`}>
            เลือกบริการ
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
