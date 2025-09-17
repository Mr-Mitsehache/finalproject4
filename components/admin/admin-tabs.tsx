// components/admin/admin-tabs.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Settings,
  Users2,
  Store as StoreIcon,
} from 'lucide-react'
import clsx from 'clsx'

type TabItem = {
  href: string
  label: string
  icon?: React.ReactNode
  badge?: number | string
  exact?: boolean
}

export function AdminTabs({
  className,
  items,
}: {
  className?: string
  /** ส่งมาเองได้ ถ้าไม่ส่งจะใช้ค่าเริ่มต้น */
  items?: TabItem[]
}) {
  const pathname = usePathname()

  const tabs: TabItem[] =
    items ?? [
      { href: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, exact: false },
      { href: '/admin/manage',    label: 'Manage',    icon: <Settings className="h-4 w-4" />,         exact: false },
      // ตัวอย่างเพิ่มแท็บในอนาคต:
      // { href: '/admin/users',     label: 'Users',     icon: <Users2 className="h-4 w-4" />, badge: 12 },
      // { href: '/admin/stores',    label: 'Stores',    icon: <StoreIcon className="h-4 w-4" /> },
    ]

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : (pathname === href || pathname.startsWith(href + '/'))

  return (
    <div className={clsx('mb-6', className)}>
      <div
        role="tablist"
        aria-label="Admin navigation"
        className={clsx(
          // กล่องหลัก: segmented + scroll ได้บนมือถือ
          'relative inline-flex max-w-full items-center gap-1 overflow-x-auto',
          'rounded-md border bg-background/80 p-1 backdrop-blur supports-[backdrop-filter]:bg-background/60',
          // ซ่อนสโครลบาร์แบบนุ่มๆ
          '[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full',
          'dark:[&::-webkit-scrollbar-thumb]:bg-blue-500/40 [&::-webkit-scrollbar-thumb]:bg-red-400/40'
        )}
      >
        {tabs.map((t) => {
          const active = isActive(t.href, t.exact)
          return (
            <Link
              key={t.href}
              href={t.href}
              role="tab"
              aria-selected={active}
              aria-current={active ? 'page' : undefined}
              className={clsx(
                'group relative inline-flex items-center gap-2 rounded-sm px-3 py-1.5 text-sm transition',
                // ตัวหนังสือตามธีม
                active
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'text-muted-foreground hover:bg-muted',
                // ขอบนอกให้ดูเป็นชิ้นเดียวกับกรอบแม่
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
              )}
            >
              {/* ไอคอน */}
              {t.icon}
              {/* ป้ายชื่อ */}
              <span className="whitespace-nowrap">{t.label}</span>

              {/* Badge (ถ้ามี) */}
              {t.badge != null && (
                <span
                  className={clsx(
                    'ml-1 inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px] font-semibold',
                    active
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-foreground/10 text-foreground/80'
                  )}
                >
                  {t.badge}
                </span>
              )}

              {/* glow เส้นขอบล่างแบบเนียน ๆ */}
              <span
                aria-hidden
                className={clsx(
                  'pointer-events-none absolute inset-x-1 -bottom-0.5 h-0.5 rounded',
                  active
                    ? 'bg-gradient-to-r from-red-500 to-red-400 dark:from-sky-500 dark:to-sky-400'
                    : 'opacity-0 group-hover:opacity-60 transition'
                )}
              />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
