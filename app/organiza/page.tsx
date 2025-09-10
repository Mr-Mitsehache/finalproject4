import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Star, Clock, CheckCircle2, Users, Shield, Sparkles, Gauge, Car
} from 'lucide-react'

const heroBg =
  "url('https://images.unsplash.com/photo-1617957743091-51f7d6e7b5d7?q=80&w=1920&auto=format&fit=crop')"

type Service = {
  id: string
  title: string
  price: number
  duration: string
  rating: number
  ratingCount?: number
  img: string
  features: string[]
  badge?: string
  discount?: string
  cta?: string
}

const services: Service[] = [
  {
    id: 'basic-wash',
    title: 'ล้างรถพื้นฐาน',
    price: 299,
    duration: '≈ 45 นาที',
    rating: 4.8,
    img: "https://images.unsplash.com/photo-1592878904946-b3cd65ff9c65?q=80&w=1200&auto=format&fit=crop",
    features: ['ล้างภายนอกครบขั้นตอน', 'ดูดฝุ่นห้องโดยสาร', 'เช็ดทำความสะอาดเบื้องต้น', 'ตรวจเช็กความเงา'],
    badge: 'Best Seller',
    cta: 'เพิ่มลงตะกร้า',
  },
  {
    id: 'interior-detail',
    title: 'ดีเทลภายใน',
    price: 599,
    duration: '≈ 90 นาที',
    rating: 4.8,
    img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200&auto=format&fit=crop",
    features: ['ซักพรม/เบาะ (จุดหลัก)', 'ฆ่าเชื้อกลิ่นอับ', 'เคลือบพลาสติกภายใน', 'ทำความสะอาดซอกลึก'],
    badge: 'ยอดนิยม',
    cta: 'เลือกแพ็กเกจ',
  },
  {
    id: 'polish-coat',
    title: 'ขัดเคลือบสี',
    price: 1299,
    duration: '≈ 3 ชม.',
    rating: 4.8,
    img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop",
    features: ['ขัดลบรอยขีดข่วนเล็กน้อย', 'เคลือบเงา UV', 'เพิ่มความลื่นสัมผัส', 'รับประกัน 3 เดือน'],
    discount: 'ลด 20%',
    cta: 'เลือกแพ็กเกจ',
  },
  {
    id: 'engine-bay',
    title: 'ล้างห้องเครื่อง',
    price: 799,
    duration: '≈ 1 ชม.',
    rating: 4.6,
    img: "https://images.unsplash.com/photo-1542367597-8849eb47a8a2?q=80&w=1200&auto=format&fit=crop",
    features: ['ทำความสะอาดสารตกค้าง', 'เคลือบชิ้นส่วนยาง/พลาสติก', 'เป่าแห้งป้องกันชื้น', 'ตรวจเช็กเบื้องต้น'],
    cta: 'เลือกแพ็กเกจ',
  },
]

export default async function OrganizaPage() {
  const session = await getServerSession(authOptions);
   if (!session) redirect("/login");
  return (
    <div className="pb-16">
      {/* HERO */}<Link href="/api/auth/signout">ออกจากระบบ</Link>
      <section className="relative">
        <div
          className="relative overflow-hidden rounded-none md:rounded-2xl"
          style={{ backgroundImage: heroBg }}
        >
          <div className="absolute inset-0 bg-black/60 md:bg-gradient-to-r md:from-black/70 md:to-black/20" />
          <div className="relative z-10 container mx-auto max-w-6xl px-4 py-10 md:py-16">
            {/* small rating line */}
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-white backdrop-blur">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm">4.8/5 จาก 2,847 รีวิว</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-white">
              บริการ
              <span className="text-cyan-300">คาร์แคร์</span>
              <br className="hidden md:block" />ระดับพรีเมียม
            </h1>

            <p className="mt-3 max-w-2xl text-white/80">
              ดูแลรถของคุณด้วยเทคโนโลยีทันสมัย ผลิตภัณฑ์คุณภาพสูง และทีมงานมืออาชีพ
              เพื่อให้รถของคุณกลับมาเงางามเหมือนใหม่
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/stores">จองบริการเลย</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
                <Link href="#services">ดูบริการทั้งหมด</Link>
              </Button>
            </div>

            {/* stats */}
            <div className="mt-8 grid grid-cols-2 gap-4 text-white/90 sm:grid-cols-4">
              <Stat icon={<Users className="h-5 w-5" />} title="10,000+" subtitle="ลูกค้าไว้ใจ" />
              <Stat icon={<Shield className="h-5 w-5" />} title="5" subtitle="ปีรับประกันคุณภาพ" />
              <Stat icon={<Sparkles className="h-5 w-5" />} title="15+" subtitle="รายการบริการ" />
              <Stat icon={<Star className="h-5 w-5 text-yellow-400 fill-current" />} title="4.8" subtitle="คะแนนเฉลี่ย" />
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="container mx-auto max-w-6xl px-4 pt-12">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold">
            บริการคาร์แคร์ <span className="text-sky-600">ครบวงจร</span>
          </h2>
          <p className="mt-2 text-muted-foreground">
            เลือกบริการที่เหมาะกับความต้องการของคุณ ด้วยคุณภาพระดับมืออาชีพ และราคาที่คุ้มค่า
          </p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <ServiceCard key={s.id} svc={s} />
          ))}
        </div>
      </section>
    </div>
  )
}

/* ---------- small bits ---------- */

function Stat({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur">
        {icon}
      </div>
      <div>
        <div className="text-lg font-bold">{title}</div>
        <div className="text-xs opacity-80">{subtitle}</div>
      </div>
    </div>
  )
}

function ServiceCard({ svc }: { svc: Service }) {
  return (
    <Card className="overflow-hidden">
      {/* image */}
      <div
        className="relative h-36 w-full bg-cover bg-center"
        style={{ backgroundImage: `url('${svc.img}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute left-3 top-3 flex gap-2">
          {svc.badge && (
            <Badge className="bg-white text-black hover:bg-white">{svc.badge}</Badge>
          )}
          {svc.discount && (
            <Badge variant="destructive" className="font-semibold">{svc.discount}</Badge>
          )}
        </div>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{svc.title}</CardTitle>
        <div className="mt-1 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            <span className="font-medium">{svc.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{svc.duration}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="mt-1 text-2xl font-extrabold tabular-nums">
          ฿{svc.price.toLocaleString()}
        </div>
        <ul className="mt-3 space-y-2 text-sm">
          {svc.features.map((f, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full">
          {/* Link to your booking/checkout page as you prefer */}
          <Link href={`/stores?select=${svc.id}`}>{svc.cta ?? 'เลือกแพ็กเกจ'}</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
