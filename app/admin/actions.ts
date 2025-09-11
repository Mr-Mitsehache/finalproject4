'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth-helpers'
import { Prisma, Role } from '@prisma/client'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

export type ActionState = { ok?: boolean; error?: string; message?: string }

// -------- USERS --------
const CreateUserSchema = z.object({
  name: z.string().trim().optional().or(z.literal('')).transform(v => v || undefined),
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านอย่างน้อย 6 ตัว'),
  role: z.enum(['ADMIN', 'ORGANIZA']),
})

export async function adminCreateUserAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin()
  const raw = Object.fromEntries(formData.entries())
  const parsed = CreateUserSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues.map(i => i.message).join('\n') }
  }
  const d = parsed.data
  try {
    await prisma.user.create({
      data: {
        name: d.name,
        email: d.email,
        role: d.role as Role,
        password: await bcrypt.hash(d.password, 10),
      },
    })
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { error: 'อีเมลซ้ำ' }
    }
    return { error: e?.message ?? 'สร้างผู้ใช้ไม่สำเร็จ' }
  }
  revalidatePath('/admin/users')
  return { ok: true, message: 'สร้างผู้ใช้สำเร็จ' }
}

const UpdateUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(['ADMIN', 'ORGANIZA']),
})

export async function adminUpdateUserRoleAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin()
  const raw = Object.fromEntries(formData.entries())
  const parsed = UpdateUserRoleSchema.safeParse(raw)
  if (!parsed.success) return { error: 'ข้อมูลไม่ถูกต้อง' }
  const { userId, role } = parsed.data

  try {
    await prisma.user.update({ where: { id: userId }, data: { role: role as Role } })
  } catch (e: any) {
    return { error: e?.message ?? 'อัปเดต Role ไม่สำเร็จ' }
  }
  revalidatePath('/admin/users')
  return { ok: true, message: 'อัปเดต Role สำเร็จ' }
}

const DeleteUserSchema = z.object({ userId: z.string().min(1) })

export async function adminDeleteUserAction(formData: FormData) {
  await requireAdmin()
  const raw = Object.fromEntries(formData.entries())
  const parsed = DeleteUserSchema.safeParse(raw)
  if (!parsed.success) throw new Error('ข้อมูลไม่ถูกต้อง')

  const { userId } = parsed.data
  await prisma.user.delete({ where: { id: userId } }) // FK cascade จะจัดการสิ่งที่สัมพันธ์
  revalidatePath('/admin/users')
}

// -------- STORES --------
const ToggleStoreSchema = z.object({
  storeId: z.string().min(1),
  isOpen: z.enum(['0','1']).transform(v => v === '1'),
})

export async function adminToggleStoreOpenAction(formData: FormData) {
  await requireAdmin()
  const raw = Object.fromEntries(formData.entries())
  const parsed = ToggleStoreSchema.safeParse(raw)
  if (!parsed.success) throw new Error('ข้อมูลไม่ถูกต้อง')

  const { storeId, isOpen } = parsed.data
  await prisma.store.update({ where: { id: storeId }, data: { isOpen } })
  revalidatePath('/admin/stores')
}

const DeleteStoreSchema = z.object({ storeId: z.string().min(1) })

export async function adminDeleteStoreAction(formData: FormData) {
  await requireAdmin()
  const raw = Object.fromEntries(formData.entries())
  const parsed = DeleteStoreSchema.safeParse(raw)
  if (!parsed.success) throw new Error('ข้อมูลไม่ถูกต้อง')

  const { storeId } = parsed.data
  await prisma.store.delete({ where: { id: storeId } })
  revalidatePath('/admin/stores')
}
