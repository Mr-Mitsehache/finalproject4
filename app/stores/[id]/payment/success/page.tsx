import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PaymentSuccess({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { bookingId?: string }
}) {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold mb-2">ชำระเงินสำเร็จ</h1>
      {searchParams.bookingId && (
        <p className="text-muted-foreground mb-6">หมายเลขการจอง: {searchParams.bookingId}</p>
      )}
      <div className="flex items-center justify-center gap-3">
        <Button asChild><Link href={`/stores/${params.id}`}>กลับไปหน้าร้าน</Link></Button>
        <Button asChild variant="outline"><Link href="/stores">ร้านทั้งหมด</Link></Button>
      </div>
    </div>
  )
}
