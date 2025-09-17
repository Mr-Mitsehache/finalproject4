// app/stores/[id]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Users, Shield, Sparkles } from "lucide-react";

import { revalidatePath } from "next/cache";
import { getStoreById } from "@/app/data/stores";
import { Navbar } from "@/components/navbar";
// review
import { getReviews, createReview } from "@/app/data/reviews";
import { ReviewsList } from "@/components/reviews/reviews-list";
import { ReviewDialogButton } from "@/components/reviews/review-dialog-button";

// ✅ Prisma type
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

  const sp = (await searchParams) ?? {};
  const starNum = sp.stars ? parseInt(sp.stars, 5) : undefined;
  const stars = starNum && starNum >= 1 && starNum <= 5 ? starNum : undefined;

  const reviews = await getReviews(store.id, { take: 20, stars });

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
    <>
        <Navbar />
    <div className=" container min-h-screen">
      <div className="container bg-plain mx-auto max-w-6xl px-4 py-6">

        {/* HERO */}
        <section className="relative">
          <div className="relative overflow-hidden rounded-none md:rounded-2xl">
            {/* overlay */}
            <div
              className="absolute inset-0 
            bg-gradient-to-r from-black/80 via-black/50 to-transparent
            dark:from-black/90 dark:via-black/70 dark:to-transparent
          "
            />
            <div className="relative z-10 container mx-auto max-w-6xl px-4 py-10 md:py-16">
              {/* rating line */}
              <div
                className="mb-3 inline-flex items-center gap-2 rounded-full 
              bg-white/10 px-3 py-1 text-white backdrop-blur"
              >
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm">
                  {store.rating.toFixed(1)}/5 จาก{" "}
                  {store.reviewsCount.toLocaleString()} รีวิว
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-white drop-shadow">
                {store.name}
              </h1>

              <p className="mt-3 max-w-2xl text-white/80">
                ดูแลรถของคุณด้วยเทคโนโลยีทันสมัย ผลิตภัณฑ์คุณภาพสูง
                และทีมงานมืออาชีพ เพื่อให้รถของคุณกลับมาเงางามเหมือนใหม่
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-red-500 dark:bg-blue-600 text-white shadow-lg"
                >
                  <Link href="#reviews">ดูรีวิว</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                >
                  <Link href="#services">ดูบริการทั้งหมด</Link>
                </Button>
              </div>

              {/* stats */}
              <div className="mt-8 grid grid-cols-2 gap-4 text-white sm:grid-cols-4">
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
                  subtitle="บริการ"
                />
                <Stat
                  icon={
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  }
                  title={store.rating.toFixed(1)}
                  subtitle="คะแนนเฉลี่ย"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section
          id="services"
          className="container mx-auto max-w-6xl px-4 pt-12"
        >
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold">
              บริการคาร์แคร์{" "}
              <span className="text-red-500 dark:text-blue-400">ครบวงจร</span>
            </h2>
            <p className="mt-2 text-muted-foreground">
              เลือกบริการที่เหมาะกับความต้องการของคุณ ด้วยคุณภาพระดับมืออาชีพ
              และราคาที่คุ้มค่า
            </p>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {store.services.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground">
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

        {/* REVIEWS */}
        <section
          id="reviews"
          className="container mx-auto max-w-6xl px-4 pt-12"
        >
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold">
                รีวิวจากลูกค้า{" "}
                <span className="text-red-500 dark:text-blue-400">จริง</span>
              </h2>
              <p className="mt-1 text-muted-foreground">
                คะแนนเฉลี่ย {store.rating.toFixed(1)} จาก{" "}
                {store.reviewsCount.toLocaleString()} รีวิว
              </p>
            </div>
            <ReviewDialogButton
              storeId={store.id}
              action={createReviewAction}
            />
          </div>

          {/* filter */}
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
                    "inline-flex items-center rounded-md px-3 py-1.5 text-sm transition-all",
                    active
                      ? "bg-red-500 text-white shadow-md shadow-red-500/50 dark:bg-blue-500 dark:shadow-blue-500/40"
                      : "text-muted-foreground hover:bg-muted/50",
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
    </div>
    </>
  );
}

/* ---------- Stat ---------- */
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
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full
        bg-red-500/10 text-red-600 shadow-inner shadow-red-200
        dark:bg-blue-500/10 dark:text-blue-400 dark:shadow-blue-900/40"
      >
        {icon}
      </div>
      <div>
        <div className="text-lg font-bold">{title}</div>
        <div className="text-xs opacity-80">{subtitle}</div>
      </div>
    </div>
  );
}
