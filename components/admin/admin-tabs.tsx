'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Settings } from 'lucide-react'
import clsx from 'clsx'

export function AdminTabs({ className }: { className?: string }) {
  const pathname = usePathname()
  const tabs = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: '/admin/manage',    label: 'Manage',    icon: <Settings className="h-4 w-4" /> },
  ]
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <div className={clsx('mb-6', className)}>
      <div className="inline-flex items-center rounded-md border bg-background p-1">
        {tabs.map(t => (
          <Link
            key={t.href}
            href={t.href}
            className={clsx(
              'inline-flex items-center gap-2 rounded-sm px-3 py-1.5 text-sm transition',
              isActive(t.href)
                ? 'bg-primary text-primary-foreground shadow'
                : 'text-muted-foreground hover:bg-muted'
            )}
            aria-current={isActive(t.href) ? 'page' : undefined}
          >
            {t.icon}
            <span>{t.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
