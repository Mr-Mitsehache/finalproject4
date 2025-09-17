// components/organiza/store-form.tsx
'use client'

import { useActionState, useEffect, useMemo, useState } from 'react'
import type { Store } from '@prisma/client'
import type { StoreFormState } from '@/app/organiza/stores/actions'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  Building2,
  Phone,
  MapPin,
  Link2,
  Clock,
  Navigation,
  Image as ImgIcon,
  AlertTriangle,
  CheckCircle2,
  Crosshair,
  LocateFixed,
  ExternalLink,
} from 'lucide-react'
import clsx from 'clsx'

type Props = {
  action: (prev: StoreFormState, formData: FormData) => Promise<StoreFormState>
  defaultValues?: Partial<Store>
  submitText?: string
}

const isHttpUrl = (s: string) => !s || /^https?:\/\//i.test(s.trim())
const isNum = (v: string) => v === '' || !isNaN(Number(v))

const QUICK_HOURS = ['08:00 - 20:00', '09:00 - 18:00', '10:00 - 22:00']

export function StoreForm({ action, defaultValues, submitText = 'บันทึกร้าน' }: Props) {
  const [state, formAction, isPending] = useActionState(action, {} as StoreFormState)
  const [open, setOpen] = useState<boolean>(defaultValues?.isOpen ?? true)

  // controlled fields (ให้ UX เสถียร)
  const [name, setName] = useState(defaultValues?.name ?? '')
  const [phone, setPhone] = useState(defaultValues?.phone ?? '')
  const [address, setAddress] = useState(defaultValues?.address ?? '')
  const [imageUrl, setImageUrl] = useState(defaultValues?.imageUrl ?? '')
  const [hours, setHours] = useState(defaultValues?.hours ?? '')
  const [lat, setLat] = useState(defaultValues?.lat?.toString() ?? '')
  const [lng, setLng] = useState(defaultValues?.lng?.toString() ?? '')

  // errors เบื้องต้น
  const [err, setErr] = useState<{ imageUrl?: string; lat?: string; lng?: string }>({})

  useEffect(() => {
    const e: typeof err = {}
    if (imageUrl && !isHttpUrl(imageUrl)) e.imageUrl = 'ต้องเป็นลิงก์ http/https'
    if (!isNum(lat)) e.lat = 'ต้องเป็นตัวเลข'
    if (!isNum(lng)) e.lng = 'ต้องเป็นตัวเลข'
    setErr(e)
  }, [imageUrl, lat, lng])

  // sync hidden for Switch (server actions คาดชื่อ isOpen)
  useEffect(() => {
    const hidden = document.getElementById('isOpenHidden') as HTMLInputElement | null
    if (hidden) hidden.value = open ? '1' : '0'
  }, [open])

  // เติมพิกัดจากเบราว์เซอร์
  async function fillLocation() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(String(pos.coords.latitude))
        setLng(String(pos.coords.longitude))
      },
      (err) => {
        console.warn('Geolocation error:', err?.message)
        alert('ไม่สามารถเข้าถึงพิกัดได้')
      }
    )
  }

  const mapsHref = useMemo(() => {
    if (!lat || !lng || !isNum(lat) || !isNum(lng)) return ''
    const q = `${lat},${lng}`
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`
  }, [lat, lng])

  return (
    <form action={formAction} className="space-y-6">
      {/* Server result banners */}
      {state?.error && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <span>{state.error}</span>
        </div>
      )}
      {state?.ok && (
        <div className="flex items-center gap-2 rounded-md border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-600">
          <CheckCircle2 className="h-4 w-4" />
          <span>บันทึกสำเร็จ</span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Name */}
        <div className="grid gap-2">
          <Label htmlFor="name" className="inline-flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            ชื่อร้าน
          </Label>
          <Input
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="เช่น Garage Pro Detailing"
          />
        </div>

        {/* Phone */}
        <div className="grid gap-2">
          <Label htmlFor="phone" className="inline-flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            เบอร์โทร
          </Label>
          <Input
            id="phone"
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            placeholder="08x-xxx-xxxx"
          />
        </div>

        {/* Address */}
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="address" className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            ที่อยู่
          </Label>
          <Textarea
            id="address"
            name="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            required
            placeholder="เลขที่, ถนน, แขวง/ตำบล, เขต/อำเภอ, จังหวัด, รหัสไปรษณีย์"
          />
        </div>

        {/* Image URL + preview */}
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="imageUrl" className="inline-flex items-center gap-2">
            <ImgIcon className="h-4 w-4 text-muted-foreground" />
            รูปหน้าร้าน (URL)
          </Label>
          <div className="relative">
            <Input
              id="imageUrl"
              name="imageUrl"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="pl-8"
            />
            <Link2 className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          {err.imageUrl && <FieldError>{err.imageUrl}</FieldError>}
          {imageUrl && (
            <div className="rounded-lg border p-2">
              <div className="text-xs text-muted-foreground mb-2">พรีวิวรูป</div>
              <div className="aspect-[16/9] w-full overflow-hidden rounded bg-muted grid place-items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="store-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = '/images/store-default.jpg'
                  }}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          )}
        </div>

        {/* Hours + quick chips */}
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="hours" className="inline-flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            เวลาเปิด-ปิด
          </Label>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              id="hours"
              name="hours"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="เช่น 08:00 - 20:00"
              className="w-full sm:w-72"
            />
            <div className="flex flex-wrap gap-2">
              {QUICK_HOURS.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHours(h)}
                  className={clsx(
                    'rounded-md border px-2.5 py-1 text-xs',
                    'hover:bg-muted text-muted-foreground'
                  )}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lat/Lng + actions */}
        <div className="grid gap-2">
          <Label htmlFor="lat" className="inline-flex items-center gap-2">
            <Crosshair className="h-4 w-4 text-muted-foreground" />
            Latitude
          </Label>
          <Input
            id="lat"
            name="lat"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="13.7xxxx"
          />
          {err.lat && <FieldError>{err.lat}</FieldError>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="lng" className="inline-flex items-center gap-2">
            <Navigation className="h-4 w-4 text-muted-foreground" />
            Longitude
          </Label>
          <Input
            id="lng"
            name="lng"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="100.5xxxx"
          />
          {err.lng && <FieldError>{err.lng}</FieldError>}
        </div>

        <div className="flex items-center gap-3 sm:col-span-2">
          <Switch id="isOpen" checked={open} onCheckedChange={setOpen} />
          <Label htmlFor="isOpen">สถานะร้านเปิดอยู่</Label>
          <input id="isOpenHidden" type="hidden" name="isOpen" value={open ? '1' : '0'} />

          <div className="ml-auto flex items-center gap-2">
            <Button type="button" variant="outline" onClick={fillLocation} title="ใช้พิกัดปัจจุบัน">
              <LocateFixed className="mr-2 h-4 w-4" /> ใช้พิกัดปัจจุบัน
            </Button>
            <a
              href={mapsHref || '#'}
              target="_blank"
              rel="noreferrer"
              aria-disabled={!mapsHref}
              className={clsx(
                'inline-flex items-center rounded-md border px-3 py-2 text-sm',
                mapsHref
                  ? 'hover:bg-muted'
                  : 'pointer-events-none opacity-50'
              )}
              title={mapsHref ? 'เปิดในแผนที่' : 'กรอก lat/lng ก่อน'}
            >
              เปิดแผนที่ <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {/* hidden mirrors — เผื่อ lib ฝั่ง server ตรวจค่าจาก form field ตรง ๆ */}
      <input type="hidden" name="name" value={name} />
      <input type="hidden" name="phone" value={phone} />
      <input type="hidden" name="address" value={address} />
      <input type="hidden" name="imageUrl" value={imageUrl} />
      <input type="hidden" name="hours" value={hours} />
      <input type="hidden" name="lat" value={lat} />
      <input type="hidden" name="lng" value={lng} />

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending || Object.keys(err).length > 0}>
          {isPending ? 'กำลังบันทึก...' : submitText}
        </Button>
        {Object.keys(err).length > 0 && (
          <span className="text-xs text-amber-600 dark:text-amber-300 inline-flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            ตรวจข้อผิดพลาดก่อนบันทึก
          </span>
        )}
      </div>
    </form>
  )
}

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs text-red-600 dark:text-red-400 inline-flex items-center gap-1">
      <AlertTriangle className="h-3.5 w-3.5" />
      {children}
    </div>
  )
}
