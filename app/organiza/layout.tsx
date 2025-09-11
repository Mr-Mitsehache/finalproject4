// app/organiza/layout.tsx
import type { ReactNode } from 'react'
import { requireOrgUser } from '@/lib/auth-helpers'
import { Navbar } from '@/components/navbar'
import { OrgTabs } from '@/components/organiza/org-tabs' // ← คอมโพเนนต์แท็บ (client)

export default async function OrganizaLayout({ children }: { children: ReactNode }) {
  // กันสิทธิ์ฝั่ง server (มี middleware อยู่แล้วก็ได้, อันนี้ช่วยชัวร์ขึ้น)
  await requireOrgUser()

  return (
    <>
      <Navbar />
      {/* ใส่แท็บไว้ส่วนบนของทุกหน้าภายใต้ /organiza */}
      <div className="container mx-auto max-w-6xl px-4 pt-6">
        <OrgTabs />
      </div>

      {/* เนื้อหาของแต่ละหน้า */}
      {children}
    </>
  )
}
