// components/organiza/service-form.tsx
"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import type { Service } from "@prisma/client";
import type { ServiceFormState } from "@/app/organiza/services/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Image as ImgIcon,
  Video,
  Type,
  Hash,
  CircleDollarSign,
  Timer,
  ListTree,
  Link2,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import clsx from "clsx";

// ---- helpers ----
const httpish = (s: string) => /^https?:\/\//i.test(s.trim());
const clampNum = (n: number, min = 0, max = Number.MAX_SAFE_INTEGER) =>
  isNaN(n) ? 0 : Math.max(min, Math.min(max, n));

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

type LocalErrors = Partial<Record<"priceFrom" | "priceTo" | "durationMinutes" | "imageUrl" | "videoUrl", string>>;

export function ServiceForm({
  action,
  defaultValues,
  submitText = "บันทึกบริการ",
}: {
  action: (prev: ServiceFormState, formData: FormData) => Promise<ServiceFormState>;
  defaultValues?: Partial<Service>;
  submitText?: string;
}) {
  const [state, formAction, isPending] = useActionState(action, {} as ServiceFormState);

  // controlled fields (สำคัญเพื่อ UX ที่ดี)
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [slug, setSlug] = useState(defaultValues?.slug ?? "");
  const [slugLocked, setSlugLocked] = useState(Boolean(defaultValues?.slug)); // ถ้ามี slug อยู่แล้วให้ lock ไว้ก่อน

  const [detail, setDetail] = useState(defaultValues?.detail ?? "");
  const [priceFrom, setPriceFrom] = useState<number | "">(
    typeof defaultValues?.priceFrom === "number" ? defaultValues!.priceFrom : ""
  );
  const [priceTo, setPriceTo] = useState<number | "">(
    typeof defaultValues?.priceTo === "number" ? defaultValues!.priceTo : ""
  );
  const [duration, setDuration] = useState<number | "">(
    (defaultValues as any)?.durationMinutes ?? ""
  );
  const [img, setImg] = useState(defaultValues?.imageUrl ?? "");
  const [vid, setVid] = useState(defaultValues?.videoUrl ?? "");

  const [errors, setErrors] = useState<LocalErrors>({});
  const priceFromRef = useRef<HTMLInputElement>(null);
  const priceToRef = useRef<HTMLInputElement>(null);

  // auto-slug จากชื่อ (ถ้าไม่ล็อก)
  useEffect(() => {
    if (!slugLocked) setSlug(slugify(name));
  }, [name, slugLocked]);

  // client-side validate เบา ๆ
  useEffect(() => {
    const e: LocalErrors = {};
    if (priceFrom !== "" && priceTo !== "" && Number(priceFrom) > Number(priceTo)) {
      e.priceTo = "ราคาสูงสุดต้องมากกว่าหรือเท่ากับราคาเริ่ม";
    }
    if (img && !httpish(img)) e.imageUrl = "ต้องเป็นลิงก์ http/https";
    if (vid && !httpish(vid)) e.videoUrl = "ต้องเป็นลิงก์ http/https";
    if (duration !== "" && Number(duration) < 1) e.durationMinutes = "ต้องมากกว่าหรือเท่ากับ 1 นาที";
    setErrors(e);
  }, [priceFrom, priceTo, img, vid, duration]);

  // bullet preview จาก detail
  const bullets = useMemo(
    () =>
      (detail || "")
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 12),
    [detail]
  );

  // ปรับ format: currency-like
  const formatMoneyOnBlur = (which: "from" | "to") => {
    const v = which === "from" ? priceFrom : priceTo;
    if (v === "") return;
    const n = clampNum(Number(v), 0);
    if (which === "from") setPriceFrom(n);
    else setPriceTo(n);
  };

  const formatDurationOnBlur = () => {
    if (duration === "") return;
    const n = clampNum(Number(duration), 1, 9999);
    setDuration(n);
  };

  return (
    <form action={formAction} className="space-y-6">
      {/* server result banner */}
      {state?.error && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <span>{state.error}</span>
        </div>
      )}
      {state?.ok && (
        <div className="flex items-center gap-2 rounded-md border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-600">
          <CheckCircle2 className="h-4 w-4" />
          <span>บันทึกสำเร็จ</span>
        </div>
      )}

      {/* name + slug */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name" className="inline-flex items-center gap-2">
            <Type className="h-4 w-4 text-muted-foreground" />
            ชื่อบริการ
          </Label>
          <Input
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="เช่น ล้าง+ดูดฝุ่น"
          />
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="slug" className="inline-flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              Slug
            </Label>
            <button
              type="button"
              onClick={() => setSlugLocked((v) => !v)}
              className={clsx(
                "text-xs inline-flex items-center gap-1 rounded px-2 py-1",
                "border border-border text-muted-foreground hover:bg-muted"
              )}
              title={slugLocked ? "ปลดล็อกเพื่อ auto จากชื่อ" : "ล็อกค่าปัจจุบันไม่ให้ auto เปลี่ยน"}
            >
              {slugLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
              {slugLocked ? "ล็อก" : "auto"}
            </button>
          </div>
          <Input
            id="slug"
            name="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="เช่น basic-wash"
            required
          />
        </div>
      </div>

      {/* detail + bullets preview */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="detail" className="inline-flex items-center gap-2">
            <ListTree className="h-4 w-4 text-muted-foreground" />
            รายละเอียด (ขึ้นบรรทัดใหม่ = bullet)
          </Label>
          <Textarea
            id="detail"
            name="detail"
            rows={6}
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder={`เช่น
ล้างภายนอกด้วยโฟมพิเศษ
ดูดฝุ่นภายในรถ
เช็ดคอนโซลและแดชบอร์ด`}
          />
        </div>
        <div className="grid gap-2">
          <div className="text-sm text-muted-foreground">พรีวิวหัวข้อที่จะโชว์บนการ์ดบริการ</div>
          <div className="rounded-lg border bg-background p-3">
            {bullets.length ? (
              <ul className="space-y-1.5 text-sm">
                {bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-muted-foreground">{b}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-muted-foreground">— ไม่มีหัวข้อ —</div>
            )}
          </div>
        </div>
      </div>

      {/* price + duration */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-1.5">
          <Label htmlFor="priceFrom" className="inline-flex items-center gap-2">
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
            ราคาเริ่ม
          </Label>
          <Input
            ref={priceFromRef}
            id="priceFrom"
            name="priceFrom"
            type="number"
            min={0}
            inputMode="numeric"
            value={priceFrom}
            onChange={(e) => setPriceFrom(e.target.value === "" ? "" : Number(e.target.value))}
            onBlur={() => formatMoneyOnBlur("from")}
            placeholder="เช่น 300"
          />
          {errors.priceFrom && <FieldError>{errors.priceFrom}</FieldError>}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="priceTo">ราคาสูงสุด</Label>
          <Input
            ref={priceToRef}
            id="priceTo"
            name="priceTo"
            type="number"
            min={0}
            inputMode="numeric"
            value={priceTo}
            onChange={(e) => setPriceTo(e.target.value === "" ? "" : Number(e.target.value))}
            onBlur={() => formatMoneyOnBlur("to")}
            placeholder="เช่น 800"
          />
          {errors.priceTo && <FieldError>{errors.priceTo}</FieldError>}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="durationMinutes" className="inline-flex items-center gap-2">
            <Timer className="h-4 w-4 text-muted-foreground" />
            เวลาให้บริการ (นาที)
          </Label>
          <Input
            id="durationMinutes"
            name="durationMinutes"
            type="number"
            min={1}
            inputMode="numeric"
            value={duration}
            onChange={(e) => setDuration(e.target.value === "" ? "" : Number(e.target.value))}
            onBlur={formatDurationOnBlur}
            placeholder="เช่น 45 หรือ 90"
          />
          {errors.durationMinutes && <FieldError>{errors.durationMinutes}</FieldError>}
        </div>
      </div>

      {/* media */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="imageUrl" className="inline-flex items-center gap-2">
            <ImgIcon className="h-4 w-4 text-muted-foreground" />
            รูปปก (URL http/https)
          </Label>
          <div className="relative">
            <Input
              id="imageUrl"
              name="imageUrl"
              placeholder="https://..."
              value={img}
              onChange={(e) => setImg(e.target.value)}
              className="pl-8"
            />
            <Link2 className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          {errors.imageUrl && <FieldError>{errors.imageUrl}</FieldError>}
          {img && (
            <div className="rounded border p-2">
              <div className="text-xs text-muted-foreground mb-2">พรีวิวรูปปก</div>
              <div className="aspect-video w-full overflow-hidden rounded bg-muted grid place-items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt="preview"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/images/service-default.jpg";
                  }}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="videoUrl" className="inline-flex items-center gap-2">
            <Video className="h-4 w-4 text-muted-foreground" />
            วิดีโอพรีวิว (URL http/https)
          </Label>
          <div className="relative">
            <Input
              id="videoUrl"
              name="videoUrl"
              placeholder="https://..."
              value={vid}
              onChange={(e) => setVid(e.target.value)}
              className="pl-8"
            />
            <Link2 className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          {errors.videoUrl && <FieldError>{errors.videoUrl}</FieldError>}
          {vid && (
            <div className="rounded border p-2">
              <div className="text-xs text-muted-foreground mb-2">พรีวิววิดีโอ</div>
              <div className="aspect-video w-full overflow-hidden rounded bg-black">
                <video
                  src={vid}
                  controls
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* hidden fields mirrored from controlled ones so server ได้ค่าแน่ ๆ */}
      <input type="hidden" name="name" value={name} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="detail" value={detail} />
      <input type="hidden" name="priceFrom" value={priceFrom === "" ? "" : String(priceFrom)} />
      <input type="hidden" name="priceTo" value={priceTo === "" ? "" : String(priceTo)} />
      <input type="hidden" name="durationMinutes" value={duration === "" ? "" : String(duration)} />
      <input type="hidden" name="imageUrl" value={img} />
      <input type="hidden" name="videoUrl" value={vid} />

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending || Object.keys(errors).length > 0}>
          {isPending ? "กำลังบันทึก..." : submitText}
        </Button>
        {Object.keys(errors).length > 0 && (
          <span className="text-xs text-amber-600 dark:text-amber-300 inline-flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            ตรวจข้อผิดพลาดก่อนบันทึก
          </span>
        )}
      </div>
    </form>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs text-red-600 dark:text-red-400 inline-flex items-center gap-1">
      <AlertTriangle className="h-3.5 w-3.5" />
      {children}
    </div>
  );
}
