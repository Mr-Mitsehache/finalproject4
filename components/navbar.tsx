'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/ModeToggle'

export function Navbar() {
  return (
    <nav className="w-full border-b border-border bg-background px-6 py-4 flex items-center justify-between">
      {/* Left side - App Name */}
      <Link href="/" className="text-xl font-bold">
        MyApp
      </Link>

      {/* Right side - Login & Theme Toggle */}
      <div className="flex items-center gap-4">
        <Link href="/login">
          <Button variant="outline">Login</Button>
        </Link>
        <ModeToggle />
      </div>
    </nav>
  )
}
