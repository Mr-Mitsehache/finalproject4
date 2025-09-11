// app/organiza/services/actions.ts
'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireOrgUser } from '@/lib/auth-helpers'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

export type ServiceFormState = { ok?: boolean; error?: string }

const ServiceSchema = z.object({
  name: z.string().min(2, 'ชื่อบริการอย่างน้อย 2 ตัวอักษร').max(100),
  slug: z.string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, 'slug ต้องเป็น a-z, 0-9 และเครื่องหมาย - เท่านั้น')
    .min(2, 'slug อย่างน้อย 2 ตัวอักษร'),
  detail: z.string().optional().or(z.literal('')).transform(v => v || undefined),
  priceFrom: z.union([z.coerce.number().nonnegative(), z.string().length(0)]).transform(v => typeof v === 'number' ? v : undefined),
  priceTo:   z.union([z.coerce.number().nonnegative(), z.string().length(0)]).transform(v => typeof v === 'number' ? v : undefined),
}).refine(d => (d.priceFrom ?? 0) <= (d.priceTo ?? Infinity), { path: ['priceTo'], message: 'ช่วงราคาต้องมากกว่า/เท่ากับราคาเริ่มต้น' })

function parse(formData: FormData) {
  const raw = Object.fromEntries(formData.entries())
  // auto slug จาก name หากว่าง
  if (!raw['slug'] && raw['name']) {
    raw['slug'] = String(raw['name'])
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
  }
  return ServiceSchema.safeParse(raw)
}

export async function createServiceAction(_prev: ServiceFormState, formData: FormData): Promise<ServiceFormState> {
  const user = await requireOrgUser()
  const store = await prisma.store.findUnique({ where: { userId: user.id! }, select: { id: true } })
  if (!store) return { error: 'คุณยังไม่มีร้าน' }

  const parsed = parse(formData)
  if (!parsed.success) return { error: parsed.error.issues.map(i => i.message).join('\n') }

  const d = parsed.data
  try {
    await prisma.service.create({
      data: {
        storeId: store.id,
        name: d.name,
        slug: d.slug,
        detail: d.detail,
        priceFrom: d.priceFrom,
        priceTo: d.priceTo,
      },
    })
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { error: 'slug ซ้ำในร้านของคุณ' }
    }
    return { error: e?.message ?? 'สร้างบริการไม่สำเร็จ' }
  }

  revalidatePath('/organiza/services')
  revalidatePath(`/stores/${store.id}`)
  return { ok: true }
}

export async function updateServiceAction(serviceId: string, _prev: ServiceFormState, formData: FormData): Promise<ServiceFormState> {
  const user = await requireOrgUser()
  const store = await prisma.store.findUnique({ where: { userId: user.id! }, select: { id: true } })
  if (!store) return { error: 'คุณยังไม่มีร้าน' }

  // ตรวจว่า service เป็นของร้านนี้จริง
  const svc = await prisma.service.findUnique({ where: { id: serviceId } })
  if (!svc || svc.storeId !== store.id) return { error: 'ไม่พบบริการของคุณ' }

  const parsed = parse(formData)
  if (!parsed.success) return { error: parsed.error.issues.map(i => i.message).join('\n') }

  const d = parsed.data
  try {
    await prisma.service.update({
      where: { id: serviceId },
      data: {
        name: d.name,
        slug: d.slug,
        detail: d.detail,
        priceFrom: d.priceFrom,
        priceTo: d.priceTo,
      },
    })
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { error: 'slug ซ้ำในร้านของคุณ' }
    }
    return { error: e?.message ?? 'อัปเดตบริการไม่สำเร็จ' }
  }

  revalidatePath('/organiza/services')
  revalidatePath(`/stores/${store.id}`)
  return { ok: true }
}

export async function deleteServiceAction(formData: FormData) {
  const user = await requireOrgUser()
  const serviceId = String(formData.get('serviceId') ?? '')
  const svc = await prisma.service.findUnique({ where: { id: serviceId } })
  if (!svc) throw new Error('ไม่พบบริการ')
  const store = await prisma.store.findUnique({ where: { userId: user.id! }, select: { id: true } })
  if (!store || svc.storeId !== store.id) throw new Error('ไม่ได้รับอนุญาต')

  await prisma.service.delete({ where: { id: serviceId } })
  revalidatePath('/organiza/services')
  revalidatePath(`/stores/${store.id}`)
}
