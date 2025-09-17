'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, LogOut, LogIn } from 'lucide-react'
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
  const initials = useMemo(
    () =>
      userName
        .split(/\s+/)
        .slice(0, 2)
        .map((s) => s.charAt(0).toUpperCase())
        .join('') || 'U',
    [userName]
  )

  return (
    <nav
      className="
        sticky top-0 z-50 w-full backdrop-blur-md transition-all

        /* Light mode */
        bg-white border-b border-red-200 shadow-[0_2px_8px_rgba(239,68,68,0.15)]

        /* Dark mode */
        dark:bg-gradient-to-r dark:from-zinc-950 dark:via-black dark:to-zinc-900
        dark:border-b dark:border-blue-500/40 
        dark:shadow-[0_2px_12px_rgba(59,130,246,0.25)]
      "
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Left: Back + Logo */}
        <div className="flex items-center gap-3">
          {shouldShowBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              aria-label="ย้อนกลับ"
              className="
                rounded-full transition-all
                border border-red-400/60 text-red-600 hover:bg-red-600/10
                dark:border-blue-500/60 dark:text-blue-400 dark:hover:bg-blue-600/20
              "
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Link
            href="/"
            className="
              select-none text-2xl font-extrabold tracking-widest transition-all

              /* Light logo */
              bg-gradient-to-r from-red-600 to-black bg-clip-text text-transparent 
              drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]

              /* Dark logo */
              dark:from-blue-400 dark:to-blue-200 
              dark:drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]
            "
          >
            AutoCare
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {status === 'loading' && (
            <div className="h-9 w-[110px] animate-pulse rounded-md bg-zinc-300 dark:bg-zinc-700/50" />
          )}

          {status === 'unauthenticated' && (
            <Link href="/login" className="hidden sm:block">
              <Button
                variant="outline"
                className="
                  /* Light mode → ขาวแดง */
                  border-red-600/60 text-red-600 bg-white
                  hover:bg-red-600/10 hover:text-red-700
                  hover:shadow-[0_0_10px_rgba(239,68,68,0.5)]
                  
                  /* Dark mode → ดำฟ้า */
                  dark:border-blue-500/70 dark:text-blue-400 dark:bg-zinc-900
                  dark:hover:bg-blue-600/20 
                  dark:hover:shadow-[0_0_12px_rgba(59,130,246,0.6)]
                "
              >
                <LogIn className="mr-2 h-4 w-4" /> เข้าสู่ระบบ
              </Button>
            </Link>
          )}

          {status === 'authenticated' && (
            <>
              {/* User chip */}
              <div
                className="
                  hidden sm:flex items-center gap-2 rounded-full px-3 py-1.5 text-sm shadow-inner transition-all

                  /* Light chip */
                  border border-red-300 bg-white text-red-600

                  /* Dark chip */
                  dark:border-blue-400/60 dark:bg-zinc-900 dark:text-blue-300
                "
              >
                <div
                  className="
                    grid h-7 w-7 place-items-center rounded-full text-xs font-bold shadow-md
                    bg-gradient-to-br from-red-500 to-red-700 text-white
                    dark:from-blue-500 dark:to-blue-700
                  "
                >
                  {initials}
                </div>
                {/* <span className="max-w-[160px] truncate">{userName}</span> */}
              </div>

              <Button
                variant="ghost"
                className="
                  /* Light mode → ขาวแดง */
                  text-red-600 hover:text-red-700 hover:bg-red-600/10 
                  hover:shadow-[0_0_8px_rgba(239,68,68,0.5)]

                  /* Dark mode → ดำฟ้า */
                  dark:text-blue-400 dark:hover:text-blue-300
                  dark:hover:bg-blue-600/20 
                  dark:hover:shadow-[0_0_10px_rgba(59,130,246,0.6)]
                "
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
