"use client";

import * as React from "react";
import { Star, Plus, Timer, CircleDollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

export type Review = {
  id: string;
  author: string;
  avatar?: string;
  rating: number; // 1..5
  comment: string;
  date: string; // ISO
};

function initialsOf(name: string) {
  return (
    name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"
  );
}

function RatingStars({ value }: { value: number }) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i + 1 <= Math.floor(rounded);
        const half = !filled && i + 0.5 === rounded;
        return (
          <Star
            key={i}
            className={`h-4 w-4 ${
              filled
                ? "fill-yellow-500 text-yellow-500"
                : half
                ? "text-yellow-500"
                : "text-muted-foreground"
            }`}
          />
        );
      })}
    </div>
  );
}

type FilterKey = "all" | "5" | "4" | "3" | "2" | "1";

export function StoreReviewsPanel({
  storeName,
  initialReviews,
  initialAvgRating,
  initialCount,
}: {
  storeName: string;
  initialReviews: Review[];
  initialAvgRating: number;
  initialCount: number;
}) {
  const [reviews, setReviews] = React.useState<Review[]>(initialReviews);
  const [filter, setFilter] = React.useState<FilterKey>("all");
  const [open, setOpen] = React.useState(false);

  // ฟอร์มเพิ่มรีวิว
  const [name, setName] = React.useState("");
  const [rating, setRating] = React.useState<"5" | "4" | "3" | "2" | "1">("5");
  const [comment, setComment] = React.useState("");

  const filteredReviews = React.useMemo(() => {
    switch (filter) {
      case "5":
        return reviews.filter((r) => r.rating === 5);
      case "4":
        return reviews.filter((r) => r.rating >= 4 && r.rating < 5);
      case "3":
        return reviews.filter((r) => r.rating >= 3 && r.rating < 4);
      case "2":
        return reviews.filter((r) => r.rating >= 2 && r.rating < 3);
      case "1":
        return reviews.filter((r) => r.rating >= 1 && r.rating < 2);
      case "all":
      default:
        return reviews;
    }
  }, [reviews, filter]);

  const visibleCount = filteredReviews.length;
  const avg = React.useMemo(() => {
    if (reviews.length === 0) return initialAvgRating;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / reviews.length;
  }, [reviews, initialAvgRating]);

  function addReview(e: React.FormEvent) {
    e.preventDefault();
    const n = name.trim() || "ผู้ใช้";
    const c = comment.trim();
    const r = parseInt(rating, 10);
    if (!c) return; // กันค่าว่างแบบง่าย

    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : String(Date.now());

    const newItem: Review = {
      id,
      author: n,
      rating: r,
      comment: c,
      date: new Date().toISOString(),
      avatar: "",
    };
    setReviews((prev) => [newItem, ...prev]);
    // รีเซ็ตฟอร์มและปิด dialog
    setName("");
    setRating("5");
    setComment("");
    setOpen(false);
  }

  return (
    <div className="w-full md:w-64 rounded-lg border p-4">
      {/* สรุปเรตติ้ง + ตัวกรอง + ปุ่มเพิ่มรีวิว */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <RatingStars value={avg} />
            <span className="text-sm text-muted-foreground">
              {avg.toFixed(1)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            รีวิวทั้งหมด{" "}
            {(
              initialCount + Math.max(0, reviews.length - initialReviews.length)
            ).toLocaleString()}{" "}
            รีวิว
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              เพิ่มรีวิว
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>เพิ่มรีวิวให้ {storeName}</DialogTitle>
            </DialogHeader>

            <form onSubmit={addReview} className="space-y-4">
              <div className="grid grid-cols-1 gap-2">
                <label className="text-sm font-medium">ชื่อของคุณ</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น Narin K."
                />
              </div>

              <div className="grid grid-cols-1 gap-2">
                <label className="text-sm font-medium">ให้คะแนน</label>
                <Select
                  value={rating}
                  onValueChange={(v) => setRating(v as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกดาว" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 ดาว</SelectItem>
                    <SelectItem value="4">4 ดาว</SelectItem>
                    <SelectItem value="3">3 ดาว</SelectItem>
                    <SelectItem value="2">2 ดาว</SelectItem>
                    <SelectItem value="1">1 ดาว</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <label className="text-sm font-medium">ความคิดเห็น</label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="เล่าประสบการณ์ของคุณ…"
                  className="min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground">
                  * จำเป็นต้องกรอกข้อความรีวิว
                </p>
              </div>

              <DialogFooter className="gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    ยกเลิก
                  </Button>
                </DialogClose>
                <Button type="submit">บันทึกรีวิว</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Separator className="my-3" />

      {/* ตัวกรองดาว */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm text-muted-foreground">ตัวกรอง:</span>
        <Select value={filter} onValueChange={(v: FilterKey) => setFilter(v)}>
          <SelectTrigger className="h-8 w-[8.5rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            <SelectItem value="5">5 ดาว</SelectItem>
            <SelectItem value="4">4 ดาว</SelectItem>
            <SelectItem value="3">3 ดาว</SelectItem>
            <SelectItem value="2">2 ดาว</SelectItem>
            <SelectItem value="1">1 ดาว</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground ml-auto">
          {visibleCount} รายการ
        </span>
      </div>

      {/* รายการรีวิว */}
      <ScrollArea className="h-73 pr-2">
        <div className="space-y-3">
          {filteredReviews.map((r) => (
            <div key={r.id} className="flex gap-3">
              <Avatar>
                {r.avatar ? (
                  <AvatarImage src={r.avatar} alt={r.author} />
                ) : null}
                <AvatarFallback>{initialsOf(r.author)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{r.author}</p>
                  <span className="text-xs text-muted-foreground">
                    {new Date(r.date).toLocaleDateString("th-TH")}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <RatingStars value={r.rating} />
                  <span className="text-xs text-muted-foreground">
                    {r.rating.toFixed(1)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-foreground/90">{r.comment}</p>
              </div>
            </div>
          ))}
          {filteredReviews.length === 0 && (
            <p className="text-sm text-muted-foreground">
              ยังไม่มีรีวิวที่ตรงกับตัวกรอง
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
