// app/organiza/layout.tsx
import type { ReactNode } from "react";
import { requireOrgUser } from "@/lib/auth-helpers";
import { Navbar } from "@/components/navbar";
import { OrgTabs } from "@/components/organiza/org-tabs"; // ← คอมโพเนนต์แท็บ (client)
import { ListCheck, Wrench, Store, LayoutDashboard } from "lucide-react";

export default async function OrganizaLayout({
  children,
}: {
  children: ReactNode;
}) {
  // กันสิทธิ์ฝั่ง server (มี middleware อยู่แล้วก็ได้, อันนี้ช่วยชัวร์ขึ้น)
  await requireOrgUser();

  return (
    <>
      <Navbar />
      <div className=" container min-h-screen">
        {/* ใส่แท็บไว้ส่วนบนของทุกหน้าภายใต้ /organiza */}
        <div className="flex flex-col container bg-plain mx-auto max-w-6xl px-4 py-6">
          <div className="">
            <OrgTabs
              items={[
                {
                  href: "/organiza/dashboard",
                  label: "Dashboard",
                  icon: <LayoutDashboard className="h-4 w-4" />,
                },
                {
                  href: "/organiza/stores",
                  label: "Stores",
                  icon: <Store className="h-4 w-4" />,
                },
                {
                  href: "/organiza/services",
                  label: "Services",
                  icon: <Wrench className="h-4 w-4" />,
                  count: 8,
                },
                {
                  href: "/organiza/tasks",
                  label: "Tasks",
                  icon: <ListCheck className="h-4 w-4" />,
                  count: 3,
                },
              ]}
            />
          </div>

          {/* เนื้อหาของแต่ละหน้า */}
          {children}
        </div>
      </div>
    </>
  );
}
