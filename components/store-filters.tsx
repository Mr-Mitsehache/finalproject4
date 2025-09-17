//component/store-filters.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X, Search, Settings2, MapPin, Filter } from "lucide-react";

const MIN_DISTANCE = 0;
const MAX_DISTANCE = 20;
const STEP = 1;

export function StoreFilters({ basePath = "/" }: { basePath?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [openOnly, setOpenOnly] = useState(
    searchParams.get("open") ? searchParams.get("open") === "1" : true // default: Open
  );
  const [sort, setSort] = useState(searchParams.get("sort") || "recommended");

  const [distance, setDistance] = useState<number>(
    Number(searchParams.get("distance")) || 0
  );
  const [lat, setLat] = useState<number | null>(
    searchParams.get("lat") ? Number(searchParams.get("lat")) : null
  );
  const [lng, setLng] = useState<number | null>(
    searchParams.get("lng") ? Number(searchParams.get("lng")) : null
  );

  // Grab location if distance > 0 and coords missing
  useEffect(() => {
    if (distance > 0 && (lat == null || lng == null)) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
        },
        (err) => console.warn("Geolocation error:", err?.message)
      );
    }
  }, [distance, lat, lng]);

  // Build query string
  const nextQS = useMemo(() => {
    const p = new URLSearchParams();
    if (query) p.set("q", query);
    p.set("open", openOnly ? "1" : "0");
    if (sort) p.set("sort", sort);
    if (distance > 0) {
      p.set("distance", String(distance));
      if (lat != null && lng != null) {
        p.set("lat", String(lat));
        p.set("lng", String(lng));
      }
    }
    return p.toString();
  }, [query, openOnly, sort, distance, lat, lng]);

  // Push only when changed
  useEffect(() => {
    const current = searchParams.toString();
    if (nextQS !== current) {
      router.replace(`${basePath}${nextQS ? `?${nextQS}` : ""}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextQS]);

  const clamp = (v: number) =>
    Math.max(MIN_DISTANCE, Math.min(MAX_DISTANCE, isNaN(v) ? 0 : v));

  const inc = () => setDistance((d) => clamp(d + STEP));
  const dec = () => setDistance((d) => clamp(d - STEP));
  const clearDistance = () => {
    setDistance(0);
    setLat(null);
    setLng(null);
  };

  return (
    <div
      className="
    mb-6 flex flex-col gap-6 p-6 rounded-2xl
    border border-border shadow-lg backdrop-blur-sm
    bg-gradient-to-br from-white/90 to-red-50/70
    dark:from-black/70 dark:to-blue-950/40
    transition-all
  "
    >
      {/* Heading */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center justify-center gap-2">
          ยินดีต้อนรับสู่ <span className="text-primary">แพลตฟอร์มของผม</span>
        </h1>
        <h2 className="text-muted-foreground text-sm sm:text-base flex items-center justify-center gap-2">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          เริ่มค้นหาร้านที่ถูกใจได้เลย
        </h2>
      </div>

      {/* Search */}
      <div className="flex justify-center relative">
        <div className="relative w-full sm:w-2/3 lg:w-1/2">
          <Search
            className="
      absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5
      text-primary transition-all duration-300
      group-focus-within:scale-110
      glow-icon
    "
          />
          <Input
  placeholder="ค้นหาร้าน..."
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  className="
    h-12 pl-10 pr-4 rounded-xl
    border border-border shadow-inner
    transition-all duration-300
    focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]
    glow-input
  "
/>

        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-6 justify-center sm:justify-center">
        <Filter className="h-6 w-6 text-primary" />
        {/* Open Only */}
        <div className="flex items-center gap-2">
          <Switch
            id="open-switch"
            checked={openOnly}
            onCheckedChange={setOpenOnly}
          />
          <Label
            htmlFor="open-switch"
            className="text-sm font-medium text-foreground"
          >
            แสดงเฉพาะร้านที่เปิด
          </Label>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger
              className="
            rounded-lg px-3 h-10
            border border-border shadow-sm
            focus:ring-2 focus:ring-primary focus:border-primary
            dark:focus:ring-blue-400 dark:focus:border-blue-400
          "
            >
              <SelectValue placeholder="เรียงลำดับ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">ทั้งหมด (แนะนำ)</SelectItem>
              <SelectItem value="rating_desc">คะแนนมาก → น้อย</SelectItem>
              <SelectItem value="rating_asc">คะแนนน้อย → มาก</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Distance */}
        <div className="flex items-center gap-3">
          <Label
            htmlFor="distance"
            className="whitespace-nowrap text-sm text-foreground flex items-center gap-1"
          >
            <MapPin className="h-4 w-4 text-primary dark:text-blue-400" />
            ระยะทาง (กม.)
          </Label>

          <Input
            id="distance"
            type="number"
            inputMode="numeric"
            min={MIN_DISTANCE}
            max={MAX_DISTANCE}
            step={STEP}
            className="
          w-20 rounded-lg h-10 px-2
          border border-border shadow-sm
          focus:ring-2 focus:ring-primary focus:border-primary
          dark:focus:ring-blue-400 dark:focus:border-blue-400
        "
            value={distance}
            onChange={(e) => setDistance(clamp(Number(e.target.value)))}
            onBlur={(e) => {
              const v = clamp(Number(e.target.value));
              if (v !== distance) setDistance(v);
            }}
            placeholder="กม."
          />

          <Button
            type="button"
            variant="ghost"
            onClick={clearDistance}
            aria-label="ล้างค่า"
            title="ล้างค่า"
            className="
          text-primary hover:bg-primary/10
          dark:text-blue-400 dark:hover:bg-blue-500/20
        "
          >
            <X className="h-4 w-4" />
            ล้างค่า
          </Button>
        </div>
      </div>
    </div>
  );
}
