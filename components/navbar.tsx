// components/navbar.tsx
'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/ModeToggle'

type NavbarProps = {
  showBack?: boolean
  fallbackPath?: string
}

export function Navbar({ showBack = true, fallbackPath = '/' }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [canGoBack, setCanGoBack] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCanGoBack(window.history.length > 1)
    }
  }, [])

  const handleBack = () => {
    if (canGoBack) router.back()
    else router.push(fallbackPath)
  }

  const shouldShowBack = showBack && pathname !== '/'

  return (
    <nav className="w-full border-b border-border bg-background px-6 py-4 flex items-center justify-between">
      {/* Left: Back + App name */}
      <div className="flex items-center gap-3">
        {shouldShowBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            aria-label="ย้อนกลับ"
            title={canGoBack ? 'กลับหน้าก่อนหน้า' : 'ไปหน้าแรก'}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <Link href="/" className="text-xl font-bold">
          MyApp
        </Link>
      </div>

      {/* Right: Login / Signout / Theme */}
      <div className="flex items-center gap-4">
        <Link href="/login">
          <Button variant="outline">Login</Button>
        </Link>
        <Link href="/api/auth/signout">ออกจากระบบ</Link>
        <ModeToggle />
      </div>
    </nav>
  )
}
