// components/organiza/org-tabs.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useRef } from 'react'
import { LayoutDashboard, Store, ListCheck, Wrench } from 'lucide-react'
import clsx from 'clsx'

type TabItem = {
  href: string
  label: string
  icon?: React.ReactNode
  count?: number | string
}

export function OrgTabs({
  className,
  sticky = true,
  items,
}: {
  className?: string
  /** ปักหัวบนสุดเมื่อสกอร์ล */
  sticky?: boolean
  /** ถ้าไม่ส่ง จะใช้ดีฟอลต์ชุด Dashboard/Stores/Services/Tasks */
  items?: TabItem[]
}) {
  const pathname = usePathname()

  const tabs: TabItem[] = useMemo(
    () =>
      items ?? [
        { href: '/organiza/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
        { href: '/organiza/stores',    label: 'Stores',    icon: <Store className="h-4 w-4" /> },
        { href: '/organiza/services',  label: 'Services',  icon: <Wrench className="h-4 w-4" /> },
        { href: '/organiza/tasks',     label: 'Tasks',     icon: <ListCheck className="h-4 w-4" /> },
      ],
    [items]
  )

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  // เลื่อนสกอร์ลแถวแท็บไปหาแท็บที่ active อัตโนมัติ (ดีบนมือถือ)
  const stripRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = stripRef.current?.querySelector<HTMLAnchorElement>('a[data-active="true"]')
    if (el) el.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [pathname])

  return (
    <nav
      aria-label="Organization navigation"
      className={clsx(
        sticky && 'sticky top-14 z-30', // อยู่ใต้ Navbar 56px (h-14)
        className
      )}
    >
      {/* แถบครอบ + มาสก์ขอบให้ดูเนียนเวลา overflow-x */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-background to-transparent rounded-l-md" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-background to-transparent rounded-r-md" />

        <div
          ref={stripRef}
          className="
            no-scrollbar mb-6 overflow-x-auto
            rounded-md border bg-background/80 backdrop-blur
            px-1 py-1 shadow-sm
          "
        >
          <div className="flex min-w-max gap-1">
            {tabs.map((t) => {
              const active = isActive(t.href)
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  prefetch
                  data-active={active ? 'true' : 'false'}
                  aria-current={active ? 'page' : undefined}
                  className={clsx(
                    'group inline-flex items-center gap-2 rounded-[10px] px-3 py-1.5 text-sm transition',
                    // Light = ขาว/แดง, Dark = ดำ/ฟ้า (ตามธีมคุณ)
                    active
                      ? 'bg-primary text-primary-foreground shadow ring-1 ring-primary/60'
                      : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  {t.icon}
                  <span className="whitespace-nowrap">{t.label}</span>

                  {t.count != null && (
                    <span
                      className={clsx(
                        'ml-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px] font-semibold',
                        active
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : 'bg-muted text-foreground/70'
                      )}
                    >
                      {t.count}
                    </span>
                  )}
              
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
