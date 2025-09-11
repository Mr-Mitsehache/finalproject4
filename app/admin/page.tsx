import { redirect } from 'next/navigation'

export default function AdminIndex() {
  redirect('/admin/dashboard')
}


// import { requireAdmin } from '@/lib/auth-helpers'
// import { prisma } from '@/lib/prisma'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Navbar } from '@/components/navbar'

// export default async function AdminHome() {
//   await requireAdmin()

//   const [userCount, storeCount, reviewCount, bookingCount] = await Promise.all([
//     prisma.user.count(),
//     prisma.store.count(),
//     prisma.review.count(),
//     prisma.booking.count(),
//   ])

//   return (
//   <>
//   <Navbar/>
//     <div className="container mx-auto max-w-6xl px-4 py-8">
//       <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>

//       <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
//         <StatCard title="Users" value={userCount} />
//         <StatCard title="Stores" value={storeCount} />
//         <StatCard title="Reviews" value={reviewCount} />
//         <StatCard title="Bookings" value={bookingCount} />
//       </div>
//     </div>
//     </>
//   )
// }

// function StatCard({ title, value }: { title: string; value: number }) {
//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>{title}</CardTitle>
//       </CardHeader>
//       <CardContent className="text-3xl font-bold tabular-nums">{value.toLocaleString()}</CardContent>
//     </Card>
//   )
// }
