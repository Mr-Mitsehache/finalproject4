// components/common/kpi-dialog-card.tsx
"use client";

import * as React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Tone = "amber" | "sky" | "emerald" | "rose" | "zinc" | "indigo" | "red" | "blue";

const toneMap: Record<Tone, string> = {
  amber:   "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  sky:     "bg-sky-50 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  emerald: "bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  rose:    "bg-rose-50 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300",
  zinc:    "bg-zinc-50 text-zinc-800 dark:bg-zinc-500/15 dark:text-zinc-300",
  indigo:  "bg-indigo-50 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300",
  red:     "bg-red-50 text-red-800 dark:bg-red-500/15 dark:text-red-300",
  blue:    "bg-blue-50 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
};

export function KpiDialogCard({
  icon,
  label,
  value,
  tone,
  dialogTitle,
  children,          // ✅ เนื้อหาในป๊อปอัพ (ฝั่ง Server ส่งมาได้)
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  tone?: Tone;
  dialogTitle?: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="w-full text-left">
        <Card className="hover:shadow-sm transition">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-3xl font-bold tabular-nums">{value}</div>
            <div className={cn("inline-flex h-8 w-8 items-center justify-center rounded-lg", tone ? toneMap[tone] : "bg-muted")}>
              {icon}
            </div>
          </CardContent>
        </Card>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{dialogTitle ?? label}</DialogTitle>
          </DialogHeader>
          <div className="pt-2">{children ?? <div className="text-sm text-muted-foreground">ไม่มีข้อมูล</div>}</div>
        </DialogContent>
      </Dialog>
    </>
  );
}
