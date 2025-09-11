//component/store-filters.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

const MIN_DISTANCE = 0
const MAX_DISTANCE = 20
const STEP = 1

export function StoreFilters({ basePath = '/' }: { basePath?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [openOnly, setOpenOnly] = useState(
    searchParams.get('open') ? searchParams.get('open') === '1' : true // default: Open
  )
  const [sort, setSort] = useState(searchParams.get('sort') || 'recommended')

  const [distance, setDistance] = useState<number>(
    Number(searchParams.get('distance')) || 0
  )
  const [lat, setLat] = useState<number | null>(
    searchParams.get('lat') ? Number(searchParams.get('lat')) : null
  )
  const [lng, setLng] = useState<number | null>(
    searchParams.get('lng') ? Number(searchParams.get('lng')) : null
  )

  // Grab location if distance > 0 and coords missing
  useEffect(() => {
    if (distance > 0 && (lat == null || lng == null)) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude)
          setLng(pos.coords.longitude)
        },
        (err) => console.warn('Geolocation error:', err?.message)
      )
    }
  }, [distance, lat, lng])

  // Build query string
  const nextQS = useMemo(() => {
    const p = new URLSearchParams()
    if (query) p.set('q', query)
    p.set('open', openOnly ? '1' : '0')
    if (sort) p.set('sort', sort)
    if (distance > 0) {
      p.set('distance', String(distance))
      if (lat != null && lng != null) {
        p.set('lat', String(lat))
        p.set('lng', String(lng))
      }
    }
    return p.toString()
  }, [query, openOnly, sort, distance, lat, lng])

  // Push only when changed
  useEffect(() => {
    const current = searchParams.toString()
    if (nextQS !== current) {
      router.replace(`${basePath}${nextQS ? `?${nextQS}` : ''}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextQS])

  const clamp = (v: number) =>
    Math.max(MIN_DISTANCE, Math.min(MAX_DISTANCE, isNaN(v) ? 0 : v))

  const inc = () => setDistance((d) => clamp(d + STEP))
  const dec = () => setDistance((d) => clamp(d - STEP))
  const clearDistance = () => {
    setDistance(0)
    setLat(null)
    setLng(null)
  }

  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
      {/* Search */}
      <Input
        placeholder="ค้นหาร้าน..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* Open Only */}
      <div className="flex items-center space-x-2">
        <Switch id="open-switch" checked={openOnly} onCheckedChange={setOpenOnly} />
        <Label htmlFor="open-switch">แสดงเฉพาะร้านที่เปิด</Label>
      </div>

      {/* Sort */}
      <Select value={sort} onValueChange={setSort}>
        <SelectTrigger>
          <SelectValue placeholder="เรียงลำดับ" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recommended">ทั้งหมด (แนะนำ)</SelectItem>
          <SelectItem value="rating_desc">คะแนนมาก → น้อย</SelectItem>
          <SelectItem value="rating_asc">คะแนนน้อย → มาก</SelectItem>
        </SelectContent>
      </Select>

      {/* Distance with + / − and Clear */}
      <div className="flex items-center gap-2">
        <Label htmlFor="distance" className="whitespace-nowrap">
          ระยะทาง (กม.)
        </Label>

        <div className="flex items-center gap-2">

          <Input
            id="distance"
            type="number"
            inputMode="numeric"
            min={MIN_DISTANCE}
            max={MAX_DISTANCE}
            step={STEP}
            className="w-24"
            value={distance}
            onChange={(e) => setDistance(clamp(Number(e.target.value)))}
            onBlur={(e) => {
              const v = clamp(Number(e.target.value))
              if (v !== distance) setDistance(v)
            }}
            placeholder="กม."
          />

          <Button
            type="button"
            variant="ghost"
            onClick={clearDistance}
            aria-label="ล้างค่า"
            title="ล้างค่า"
          >
            <X className="h-4 w-4 mr-1" />
            ล้างค่า
          </Button>
        </div>
      </div>
    </div>
  )
}
