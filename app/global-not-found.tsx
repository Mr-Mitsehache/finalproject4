// app/stores/[id]/not-found.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <div className="container mx-auto max-w-2xl px-4 py-20 text-center">
          <h2 className="text-2xl font-bold">ไม่พบร้านที่คุณต้องการ</h2>
          <p className="mt-2 text-muted-foreground">
            อาจมีการลบ หรือรหัสไม่ถูกต้อง
          </p>
          <div className="mt-6">
            <Link href="/">
              <Button>กลับไปหน้าร้านทั้งหมด</Button>
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
