"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Star,
  Play,
  Crown,
  DollarSign,
  ListChecks,
  Sparkles,
} from "lucide-react";
import { ServiceMediaDialog } from "./service-media-dialog";

type ServiceCardProps = {
  svc: {
    id: string;
    name: string;
    detail?: string | null;
    priceFrom?: number | null;
    priceTo?: number | null;
    imageUrl?: string | null;
    videoUrl?: string | null;
    durationMinutes?: number | null;
  };
  storeId: string;
  rating?: number;
};

function minutesToText(min?: number | null) {
  if (!min) return "";
  if (min < 60) return `${min} นาที`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} ชม. ${m} นาที` : `${h} ชม.`;
}

export function ServiceCardFancy({ svc, storeId, rating }: ServiceCardProps) {
  const cover = svc.imageUrl || "/images/service-default.jpg";
  const media: { url: string; kind?: "image" | "video" }[] = [];
  if (svc.videoUrl) media.push({ url: svc.videoUrl, kind: "video" });
  if (svc.imageUrl) media.push({ url: svc.imageUrl, kind: "image" });

  const isFeatured =
    !!svc.videoUrl || (typeof rating === "number" && rating >= 4.5);

  const features =
    (svc.detail || "")
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 6);

  return (
    <Card
      className={`
        group overflow-hidden flex h-full flex-col
        border border-border/70 rounded-xl
        bg-gradient-to-b from-white/92 to-white/70
        dark:from-zinc-900/80 dark:to-zinc-900/60
        shadow-sm transition-all
        hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(0,0,0,0.15)]
        hover:ring-1 hover:ring-[var(--primary)]/30
      `}
    >
      {/* รูปหัวการ์ด */}
      <div className="relative w-full aspect-[16/9] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url('${cover}')` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/30 to-transparent" />

        {/* ป้ายซ้ายบน */}
        <div className="absolute left-3 top-3 flex items-center gap-2">
          {isFeatured && (
            <Badge className="bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md shadow-[var(--primary)]/40">
              <Crown className="mr-1 h-3.5 w-3.5" />
              ยอดนิยม
            </Badge>
          )}
          {media.length > 0 && (
            <Badge className="bg-white/90 text-foreground hover:bg-white">
              <Play className="mr-1 h-3.5 w-3.5" />
              พรีวิว
            </Badge>
          )}
        </div>

        {/* ป้ายขวาบน */}
        <div className="absolute right-3 top-3 flex flex-col items-end gap-2">
          {typeof rating === "number" && (
            <div className="inline-flex items-center rounded-full bg-black/70 px-2 py-1 text-xs text-white">
              <Star className="mr-1 h-3.5 w-3.5 text-yellow-400 fill-current" />
              <span className="font-semibold">{rating.toFixed(1)}</span>
            </div>
          )}
          {svc.durationMinutes ? (
            <div className="inline-flex items-center rounded-full bg-black/60 px-2 py-1 text-[11px] text-white">
              <Clock className="mr-1 h-3.5 w-3.5" />
              {minutesToText(svc.durationMinutes)}
            </div>
          ) : null}
        </div>
      </div>

      {/* เนื้อหา */}
      <CardContent className="flex-1 pt-4">
        <h3
          className="text-base font-extrabold tracking-tight text-foreground line-clamp-2"
          title={svc.name}
        >
          {svc.name}
        </h3>

        {/* ราคา */}
        {(svc.priceFrom != null || svc.priceTo != null) && (
          <div className="mt-3 flex items-center gap-2 text-[1.35rem] font-black tabular-nums text-[var(--primary)] drop-shadow">
            <DollarSign className="h-5 w-5" />
            ฿{(svc.priceFrom ?? 0).toLocaleString()}
            {svc.priceTo != null ? ` - ฿${svc.priceTo.toLocaleString()}` : ""}
          </div>
        )}

        {/* bullets */}
        {features.length > 0 && (
          <ul className="mt-3 grid grid-cols-1 gap-1.5 text-sm">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <ListChecks className="h-4 w-4 text-[var(--primary)]" />
                <span className="text-muted-foreground">{f}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <CardFooter className="gap-2 p-4 pt-0">
        {media.length > 0 && (
          <ServiceMediaDialog
            title={svc.name}
            media={media}
            trigger={
              <Button
                variant="outline"
                className="w-full border-border hover:border-[var(--primary)] hover:text-[var(--primary)] hover:shadow-[0_0_12px_var(--primary)]"
              >
                <Play className="mr-2 h-4 w-4" />
                ดูพรีวิว
              </Button>
            }
          />
        )}

        <Button
          asChild
          className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] hover:brightness-110 hover:shadow-[0_0_16px_var(--primary)]"
        >
          <Link href={`/stores/${storeId}/payment?serviceId=${svc.id}`}>
            <Sparkles className="mr-2 h-4 w-4" />
            เลือกบริการ
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
