'use client'
import { useEffect, useRef } from 'react'
import autoAnimate from '@formkit/auto-animate'

export function AnimatedList({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { ref.current && autoAnimate(ref.current) }, [])
  return <div ref={ref}>{children}</div>
}
