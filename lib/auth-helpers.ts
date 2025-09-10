// lib/auth-helpers.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function requireOrgUser() {
  const s = await getServerSession(authOptions)
  if (!s?.user?.id) redirect('/login')
  if (s.user.role !== 'ORGANIZA' && s.user.role !== 'ADMIN') redirect('/') // หรือ /403
  return s.user
}

export async function requireAdmin() {
  const s = await getServerSession(authOptions)
  if (!s?.user?.id) redirect('/login')
  if (s.user.role !== 'ADMIN') redirect('/') // หรือ /403
  return s.user
}
