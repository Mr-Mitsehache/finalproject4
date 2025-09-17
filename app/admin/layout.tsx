//app\admin\layout.tsx
import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth-helpers";
import { Navbar } from "@/components/navbar";
import { AdminTabs } from "@/components/admin/admin-tabs";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdmin();
  return (
    <>
        <Navbar />
    <div className=" container min-h-screen">
      <div className="flex flex-col bg-plain mx-auto max-w-6xl px-4 py-6">
      <div className="min-h-screen">
        <div className="container mx-auto max-w-6xl px-4 pt-6">
          <AdminTabs />
        </div>
        <div className="container mx-auto max-w-6xl px-4 pb-8">
          {children}
        </div>
      </div></div></div>
    </>
  );
}
