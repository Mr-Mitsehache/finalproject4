import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getStoreById } from '@/app/data/stores'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import { Navbar } from "@/components/navbar";
import Link from "next/link";
import { ArrowLeft,} from "lucide-react";

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ serviceId?: string }>
}

export const revalidate = 0

export default async function PaymentPage({ params, searchParams }: Props) {
  const { id } = await params
  const sp = await searchParams
  const serviceId = sp.serviceId ?? ''
  const store = await getStoreById(id)
  if (!store) return redirect('/stores')

  const service = store.services.find(s => s.id === serviceId)
  const defaultAmount = service?.priceFrom ?? 0

  async function createBookingAndPayment(formData: FormData) {
    'use server'
    const storeId = id
    const serviceId = String(formData.get('serviceId') ?? '')
    const customerName = String(formData.get('customerName') ?? '')
    const phone = String(formData.get('phone') ?? '')
    const email = (formData.get('email') as string) || null
    const carModel = String(formData.get('carModel') ?? '')
    const carPlate = String(formData.get('carPlate') ?? '')
    const dateStr = String(formData.get('date') ?? '')
    const note = (formData.get('note') as string) || null
    const method = String(formData.get('method') ?? 'CASH') as 'PROMPTPAY' | 'CASH'
    const amount = Number(formData.get('amount') ?? 0)

    if (!serviceId) throw new Error('Missing serviceId')
    if (!customerName || !phone || !carModel || !carPlate || !dateStr) {
      throw new Error('กรอกข้อมูลให้ครบ')
    }

    const date = new Date(dateStr)

    // ensure service belongs to store
    const svc = await prisma.service.findFirst({ where: { id: serviceId, storeId } })
    if (!svc) throw new Error('Service not found for this store')

    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          storeId,
          serviceId,
          customerName,
          phone,
          email,
          carModel,
          carPlate,
          date,
          note,
          status: 'CONFIRMED',
        },
      })

      await tx.payment.create({
        data: {
          bookingId: booking.id,
          method,
          amount,
          paidAt: new Date(),
        },
      })

      return booking
    })

    revalidatePath(`/stores/${storeId}`)
    redirect(`/stores/${storeId}/payment/success?bookingId=${result.id}`)
  }

  return (
    <>
    <Navbar/>
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <div className="mb-4">
                <Link
                  href={`/stores/${id}`}
                  className="inline-flex items-center text-sm underline hover:no-underline"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to stores
                </Link>
              </div>
      <Card>
        <CardHeader>
          <CardTitle>ชำระเงิน  {store.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createBookingAndPayment} className="space-y-6">
            <input type="hidden" name="serviceId" value={service?.id ?? ''} />

            {/* Service summary */}
            <div className="rounded border p-4">
              <div className="font-medium">บริการที่เลือก</div>
              {service ? (
                <div className="text-sm text-muted-foreground mt-1">
                  {service.name}
                  {service.priceFrom != null || service.priceTo != null ? (
                    <>
                      {' · ราคา '}
                      {service.priceFrom ?? '—'}
                      {service.priceTo != null ? `${service.priceTo}` : ''} ฿
                    </>
                  ) : null}
                </div>
              ) : (
                <div className="text-sm text-red-500 mt-1">ไม่พบบริการในพารามิเตอร์</div>
              )}
            </div>

            {/* Customer */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="customerName">ชื่อผู้จอง</Label>
                <Input id="customerName" name="customerName" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">โทรศัพท์</Label>
                <Input id="phone" name="phone" required />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="email">อีเมล (ถ้ามี)</Label>
                <Input id="email" name="email" type="email" />
              </div>
            </div>

            {/* Car */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="carModel">รุ่นรถ</Label>
                <Input id="carModel" name="carModel" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="carPlate">ทะเบียนรถ</Label>
                <Input id="carPlate" name="carPlate" required />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="date">วัน/เวลา</Label>
                <Input id="date" name="date" type="datetime-local" required />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="note">หมายเหตุ</Label>
                <Textarea id="note" name="note" />
              </div>
            </div>

            {/* Payment */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>วิธีชำระเงิน</Label>
                <RadioGroup defaultValue="CASH" name="method" className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="pm-cash" value="CASH" />
                    <Label htmlFor="pm-cash">เงินสด</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="pm-pp" value="PROMPTPAY" />
                    <Label htmlFor="pm-pp">PromptPay</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">ยอดชำระ (฿)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  min={0}
                  step={1}
                  defaultValue={defaultAmount}
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={!service}>ยืนยันการชำระเงิน</Button>
          </form>
        </CardContent>
      </Card>
    </div>
    </>
  )
}
