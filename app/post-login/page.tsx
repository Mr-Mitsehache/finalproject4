// app/post-login/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function PostLogin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const role = session.user.role
  if (role === 'ADMIN') redirect('/admin')
  if (role === 'ORGANIZA') redirect('/organiza/stores')
  redirect('/') // fallback
}
