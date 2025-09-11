// ===============================
// File: app/post-login/AutoRedirect.tsx
// Client Component: ทำการ redirect หลังจาก hydrate (เห็น skeleton แน่นอน)
// ===============================
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AutoRedirect({
  to,
  replace = true,
  delay = 0,
}: {
  to: string;
  replace?: boolean;
  delay?: number; // หน่วง 0–300ms เพื่อ UX ที่นุ่มนวลขึ้น (ถ้าต้องการ)
}) {
  const router = useRouter();
  useEffect(() => {
    const id = setTimeout(() => {
      if (replace) router.replace(to);
      else router.push(to);
    }, Math.max(0, delay));
    return () => clearTimeout(id);
  }, [to, replace, delay, router]);
  return null;
}
