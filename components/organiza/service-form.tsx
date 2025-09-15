//
"use client";

import { useActionState, useEffect, useState } from "react";
import type { Service } from "@prisma/client";
import type { ServiceFormState } from "@/app/organiza/services/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function ServiceForm({
  action,
  defaultValues,
  submitText = "บันทึกบริการ",
}: {
  action: (
    prev: ServiceFormState,
    formData: FormData
  ) => Promise<ServiceFormState>;
  defaultValues?: Partial<Service>;
  submitText?: string;
}) {
  const [state, formAction, isPending] = useActionState(
    action,
    {} as ServiceFormState
  );

  const [img, setImg] = useState(defaultValues?.imageUrl ?? "");
  const [vid, setVid] = useState(defaultValues?.videoUrl ?? "");
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [slug, setSlug] = useState(defaultValues?.slug ?? "");

  useEffect(() => {
    if (!defaultValues?.slug && name && !slug) {
      setSlug(slugify(name));
    }
  }, [name, slug, defaultValues?.slug]);

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div className="rounded border border-destructive/40 bg-destructive/10 p-2 text-sm text-destructive">
          {state.error}
        </div>
      )}
      {state?.ok && (
        <div className="rounded border border-emerald-400/40 bg-emerald-400/10 p-2 text-sm text-emerald-600">
          บันทึกสำเร็จ
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">ชื่อบริการ</Label>
          <Input
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            name="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="เช่น basic-wash"
            required
          />
        </div>

        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="detail">รายละเอียด (ขึ้นบรรทัดใหม่ = bullet)</Label>
          <Textarea
            id="detail"
            name="detail"
            rows={5}
            defaultValue={defaultValues?.detail ?? ""}
            placeholder={`เช่น
ล้างภายนอกด้วยโฟมพิเศษ
ดูดฝุ่นภายในรถ
เช็ดคอนโซลและแดชบอร์ด`}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="priceFrom">ราคาเริ่ม</Label>
          <Input
            id="priceFrom"
            name="priceFrom"
            type="number"
            min={0}
            defaultValue={defaultValues?.priceFrom ?? ""}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="priceTo">ราคาสูงสุด</Label>
          <Input
            id="priceTo"
            name="priceTo"
            type="number"
            min={0}
            defaultValue={defaultValues?.priceTo ?? ""}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="durationMinutes">เวลาให้บริการ (นาที)</Label>
          <Input
            id="durationMinutes"
            name="durationMinutes"
            type="number"
            min={1}
            placeholder="เช่น 45 หรือ 90"
            defaultValue={(defaultValues as any)?.durationMinutes ?? ""}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="imageUrl">รูปปก (URL http/https)</Label>
          <Input
            id="imageUrl"
            name="imageUrl"
            placeholder="https://..."
            value={img}
            onChange={(e) => setImg(e.target.value)}
          />
          {img && (
            <div className="rounded border p-2">
              <div className="text-xs text-muted-foreground mb-2">
                พรีวิวรูปปก
              </div>
              <div className="aspect-video w-full overflow-hidden rounded bg-muted flex items-center justify-center">
                <img
                  src={img}
                  alt="preview"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/fallback.jpg"; // fallback รูป (คุณต้องมีรูปนี้ใน public/)
                  }}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="videoUrl">วิดีโอพรีวิว (URL http/https)</Label>
          <Input
            id="videoUrl"
            name="videoUrl"
            placeholder="https://..."
            value={vid}
            onChange={(e) => setVid(e.target.value)}
          />
          {vid && (
            <div className="rounded border p-2">
              <div className="text-xs text-muted-foreground mb-2">
                พรีวิววิดีโอ
              </div>
              <div className="aspect-video w-full overflow-hidden rounded bg-black">
                <video
                  src={vid}
                  controls
                  className="h-full w-full object-cover"
                  onError={() => alert("ไม่สามารถโหลดวิดีโอได้")}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "กำลังบันทึก..." : submitText}
      </Button>
    </form>
  );
}
