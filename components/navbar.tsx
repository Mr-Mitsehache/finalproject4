'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, LogOut, LogIn, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/ModeToggle'
import { useSession, signOut } from 'next-auth/react'

export type NavbarProps = {
  showBack?: boolean
  fallbackPath?: string
}

export function Navbar({ showBack = true, fallbackPath = '/' }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, status } = useSession()
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

  const userName = session?.user?.name || session?.user?.email || ''
  const initials = useMemo(() =>
    userName
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => s.charAt(0).toUpperCase())
      .join('') || 'U',
  [userName])

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Left: Back + App name */}
        <div className="flex items-center gap-2">
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
          <Link href="/" className="select-none text-lg font-semibold tracking-tight hover:opacity-90">
            MyApp
          </Link>
        </div>

        {/* Right: Session-aware actions */}
        <div className="flex items-center gap-2">
          {/* Loading state to avoid layout jump */}
          {status === 'loading' && (
            <div className="h-9 w-[110px] animate-pulse rounded-md bg-muted" aria-hidden />
          )}

          {status === 'unauthenticated' && (
            <Link href="/login" className="hidden sm:block">
              <Button variant="outline">
                <LogIn className="mr-2 h-4 w-4" /> เข้าสู่ระบบ
              </Button>
            </Link>
          )}

          {status === 'authenticated' && (
            <>
              {/* User chip */}
              <div className="hidden items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground/90 shadow-sm sm:flex">
                <div className="grid h-6 w-6 place-items-center rounded-full bg-muted text-xs font-semibold">
                  {initials}
                </div>
                <span className="max-w-[160px] truncate">{userName}</span>
              </div>
              <Button
                variant="ghost"
                className="text-foreground/90 hover:text-foreground"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                <LogOut className="mr-2 h-4 w-4" /> ออกจากระบบ
              </Button>
            </>
          )}

          <ModeToggle />
        </div>
      </div>
    </nav>
  )
}
