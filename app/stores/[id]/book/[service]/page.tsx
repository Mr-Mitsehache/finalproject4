// app/stores/[id]/book/[service]/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Car,
  CreditCard,
  MapPin,
  Phone,
  Receipt,
} from "lucide-react";
import Image from "next/image";

// ===== Mock (ควรย้ายไป DB/Prisma ภายหลัง) =====
type Store = {
  id: string;
  name: string;
  address: string;
  phone: string;
  image: string;
  isOpen: boolean;
  priceLevel: 1 | 2 | 3 | 4;
};
type Service = {
  slug: string;
  name: string;
  summary: string;
  priceFrom?: number;
  priceTo?: number;
};

const mockStores: Store[] = [
  {
    id: "1",
    name: "Goofitre Car Care Central",
    address: "123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110",
    phone: "02-123-4567",
    image: "/placeholder.svg",
    isOpen: true,
    priceLevel: 3,
  },
  {
    id: "2",
    name: "Premium Shine Studio",
    address: "456 ถนนพระราม 4 แขวงสุริยวงศ์ เขตบางรัก กรุงเทพฯ 10500",
    phone: "02-987-6543",
    image: "/placeholder.svg",
    isOpen: true,
    priceLevel: 4,
  },
  {
    id: "3",
    name: "Auto Care Express",
    address: "789 ถนนเพชรบุรี แขวงทุ่งพญาไท เขตราชเทวี กรุงเทพฯ 10400",
    phone: "02-555-1234",
    image: "/placeholder.svg",
    isOpen: false,
    priceLevel: 2,
  },
  {
    id: "4",
    name: "Crystal Clean Detailing",
    address: "321 ถนนสีลม แขวงสีลม เขตบางรัก กรุงเทพฯ 10500",
    phone: "02-777-8888",
    image: "/placeholder.svg",
    isOpen: true,
    priceLevel: 4,
  },
  {
    id: "5",
    name: "Speed Wash Center",
    address: "654 ถนนลาดพร้าว แขวงจตุจักร เขตจตุจักร กรุงเทพฯ 10900",
    phone: "02-444-5555",
    image: "/placeholder.svg",
    isOpen: true,
    priceLevel: 1,
  },
  {
    id: "6",
    name: "Elite Auto Spa",
    address: "987 ถนนพหลโยธิน แขวงสามเสนใน เขตพญาไท กรุงเทพฯ 10400",
    phone: "02-666-7777",
    image: "/placeholder.svg",
    isOpen: false,
    priceLevel: 3,
  },
];

const mockServices: Record<string, Service[]> = {
  default: [
    {
      slug: "wash-basic",
      name: "ล้าง+ดูดฝุ่น",
      summary: "ล้างภายนอก ดูดฝุ่นภายใน เคลือบน้ำยาเบื้องต้น",
      priceFrom: 200,
      priceTo: 350,
    },
    {
      slug: "wax-detail",
      name: "ขัด+เคลือบแว็กซ์",
      summary: "ขัดลบรอยขนแมว เคลือบแว็กซ์เพิ่มความเงา",
      priceFrom: 800,
      priceTo: 1500,
    },
    {
      slug: "ceramic-coat",
      name: "เคลือบเซรามิก",
      summary: "ชั้นเคลือบปกป้องสีรถ เสริมความเงางามยาวนาน",
      priceFrom: 4500,
      priceTo: 9000,
    },
    {
      slug: "interior-care",
      name: "ดูแลภายใน",
      summary: "ซักเบาะ พรม เคลือบพลาสติก/หนัง",
      priceFrom: 1200,
      priceTo: 2500,
    },
  ],
};

function getStore(id: string) {
  return mockStores.find((s) => s.id === id);
}
function getService(slug: string): Service | undefined {
  return mockServices.default.find((s) => s.slug === slug);
}
function baht(n: number) {
  return n.toLocaleString("th-TH");
}
function bahtSigns(level: number) {
  return "฿".repeat(level);
}
function midPrice(sv: Service) {
  if (sv.priceFrom && sv.priceTo)
    return Math.round((sv.priceFrom + sv.priceTo) / 2);
  if (sv.priceFrom) return sv.priceFrom;
  if (sv.priceTo) return sv.priceTo;
  return 0;
}

export default function BookServicePage({
  params,
}: {
  params: { id: string; service: string };
}) {
  const router = useRouter();
  const store = getStore(params.id);
  const service = getService(params.service);

  // ฟอร์มสถานะ
  const [customerName, setCustomerName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [carBrand, setCarBrand] = React.useState("");
  const [carModel, setCarModel] = React.useState("");
  const [carPlate, setCarPlate] = React.useState("");
  const [date, setDate] = React.useState<string>("");
  const [time, setTime] = React.useState<string>("");
  const [note, setNote] = React.useState("");

  type Pay = "card" | "promptpay" | "cash";
  const [payment, setPayment] = React.useState<Pay>("card");

  // ถ้าไม่พบข้อมูล
  if (!store || !service) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-10">
        <p className="text-sm text-muted-foreground">
          ไม่พบร้านหรือบริการที่เลือก
        </p>
        <div className="mt-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> ย้อนกลับ
          </Button>
        </div>
      </div>
    );
  }
  // คำนวณราคา
  const base = midPrice(service);
  const vat = Math.round(base * 0.07);
  const total = base + vat;

  // จำลอง submit
  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // (ในโปรดักชัน ตรงนี้จะ call API -> สร้าง booking -> redirect/success)
    alert(
      `จองสำเร็จ!\n\nร้าน: ${store.name}\nบริการ: ${service.name}\nวันเวลา: ${
        date || "-"
      } ${time || ""}\nยอดชำระ: ${baht(total)} บาท\nวิธีชำระ: ${payment}`
    );
    router.push(`/stores/${store.id}`);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-5xl px-4 py-6">
        {/* Back */}
        <div className="mb-4">
          <Link href={`/stores/${store.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              กลับไปหน้าร้าน
            </Button>
          </Link>
        </div>

        {/* Header: ร้าน + บริการ */}
        <div className="flex flex-col gap-4 md:flex-row">
          <Card className="flex-1 overflow-hidden">
            <div className="relative h-40 w-full bg-muted">
              <Image
                src={store.image}
                alt={store.name}
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
            <CardContent className="p-5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold">{store.name}</h1>
                <Badge variant={store.isOpen ? "default" : "secondary"}>
                  {store.isOpen ? "เปิดตอนนี้" : "ปิดอยู่"}
                </Badge>
                <Badge variant="outline">{bahtSigns(store.priceLevel)}</Badge>
              </div>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5" />
                  <span>{store.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <a
                    href={`tel:${store.phone.replace(/[^0-9]/g, "")}`}
                    className="hover:underline"
                  >
                    {store.phone}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:w-[22rem]">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-1">
                <Receipt className="h-4 w-4" />
                <h2 className="font-semibold">สรุปรายการ</h2>
              </div>
              <p className="text-sm text-muted-foreground">{service.name}</p>
              <p className="mt-1 text-sm">{service.summary}</p>
              <Separator className="my-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>ราคาบริการ</span>
                  <span>{baht(base)} บาท</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>VAT 7%</span>
                  <span>{baht(vat)} บาท</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>ยอดรวม</span>
                  <span>{baht(total)} บาท</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking + Payment */}
        <form
          onSubmit={onSubmit}
          className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Left: Form */}
          <Card className="md:col-span-2">
            <CardContent className="p-5 space-y-6">
              {/* ข้อมูลผู้จอง */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BadgeCheck className="h-4 w-4" />
                  <h3 className="font-semibold">ข้อมูลผู้จอง</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>ชื่อ-นามสกุล</Label>
                    <Input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="เช่น วรวิชญ์ ใจดี"
                      required
                    />
                  </div>
                  <div>
                    <Label>เบอร์โทร</Label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="เช่น 0812345678"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>อีเมล (ไม่บังคับ)</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* ข้อมูลรถ */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Car className="h-4 w-4" />
                  <h3 className="font-semibold">ข้อมูลรถ</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>ยี่ห้อ</Label>
                    <Input
                      value={carBrand}
                      onChange={(e) => setCarBrand(e.target.value)}
                      placeholder="Toyota"
                      required
                    />
                  </div>
                  <div>
                    <Label>รุ่น</Label>
                    <Input
                      value={carModel}
                      onChange={(e) => setCarModel(e.target.value)}
                      placeholder="Yaris"
                      required
                    />
                  </div>
                  <div>
                    <Label>ทะเบียน</Label>
                    <Input
                      value={carPlate}
                      onChange={(e) => setCarPlate(e.target.value)}
                      placeholder="กก-1234"
                      required
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* เลือกวันเวลา */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CalendarDays className="h-4 w-4" />
                  <h3 className="font-semibold">วันและเวลา</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Label>วันที่รับบริการ</Label>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>เวลาที่สะดวก</Label>
                    <Select value={time} onValueChange={setTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกเวลา" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "09:00",
                          "10:00",
                          "11:00",
                          "13:00",
                          "14:00",
                          "15:00",
                          "16:00",
                        ].map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-4">
                  <Label>หมายเหตุ (ถ้ามี)</Label>
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="แจ้งความต้องการเพิ่มเติม เช่น โฟมหนา-เน้นล้อ ฯลฯ"
                  />
                </div>
              </div>

              <Separator />

              {/* วิธีชำระเงิน */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4" />
                  <h3 className="font-semibold">วิธีชำระเงิน</h3>
                </div>
                <RadioGroup
                  value={payment}
                  onValueChange={(v) => setPayment(v as any)}
                  className="grid gap-3 md:grid-cols-3"
                >
                  <div className="flex items-center space-x-2 rounded-lg border p-3">
                    <RadioGroupItem value="card" id="pay-card" />
                    <Label htmlFor="pay-card" className="cursor-pointer">
                      บัตรเครดิต/เดบิต
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-lg border p-3">
                    <RadioGroupItem value="promptpay" id="pay-pp" />
                    <Label htmlFor="pay-pp" className="cursor-pointer">
                      PromptPay (QR)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-lg border p-3">
                    <RadioGroupItem value="cash" id="pay-cash" />
                    <Label htmlFor="pay-cash" className="cursor-pointer">
                      ชำระที่ร้าน
                    </Label>
                  </div>
                </RadioGroup>

                {/* ฟอร์มชำระย่อยตามวิธีที่เลือก */}
                <div className="mt-4">
                  {payment === "card" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <Label>หมายเลขบัตร</Label>
                        <Input
                          inputMode="numeric"
                          placeholder="4242 4242 4242 4242"
                        />
                      </div>
                      <div>
                        <Label>ชื่อบนบัตร</Label>
                        <Input placeholder="NAME SURNAME" />
                      </div>
                      <div>
                        <Label>เดือน/ปี (MM/YY)</Label>
                        <Input placeholder="12/29" />
                      </div>
                      <div>
                        <Label>CVC</Label>
                        <Input inputMode="numeric" placeholder="123" />
                      </div>
                    </div>
                  )}

                  {payment === "promptpay" && (
                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        สแกน QR เพื่อชำระ — ระบบจะยืนยันอัตโนมัติหลังชำระสำเร็จ
                      </p>
                      <div className="relative w-56 h-56 bg-muted rounded mx-auto overflow-hidden">
                        {/* ใส่รูป QR จริงภายหลัง */}
                        <Image
                          src="/placeholder.svg"
                          alt="PromptPay QR"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {payment === "cash" && (
                    <p className="text-sm text-muted-foreground">
                      ชำระด้วยเงินสดหรือโอนได้ที่ร้านในวันรับบริการ
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full">
                  ยืนยันการจองและชำระเงิน {total ? `(${baht(total)} บาท)` : ""}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right: Preview สรุปวันเวลา/ผู้จอง */}
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <CalendarDays className="h-4 w-4" />
                <h3 className="font-semibold">รายละเอียดการจอง</h3>
              </div>
              <div className="text-sm">
                <div className="flex justify-between">
                  <span>บริการ</span>
                  <span className="font-medium">{service.name}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>วันที่</span>
                  <span>{date || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span>เวลา</span>
                  <span>{time || "-"}</span>
                </div>
              </div>

              <Separator className="my-2" />

              <div className="flex items-center gap-2 mb-1">
                <Phone className="h-4 w-4" />
                <h3 className="font-semibold">ผู้จอง</h3>
              </div>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>ชื่อ</span>
                  <span>{customerName || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span>เบอร์</span>
                  <span>{phone || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span>อีเมล</span>
                  <span>{email || "-"}</span>
                </div>
              </div>

              <Separator className="my-2" />

              <div className="flex items-center gap-2 mb-1">
                <Car className="h-4 w-4" />
                <h3 className="font-semibold">รถของคุณ</h3>
              </div>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>ยี่ห้อ/รุ่น</span>
                  <span>
                    {carBrand && carModel ? `${carBrand} ${carModel}` : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>ทะเบียน</span>
                  <span>{carPlate || "-"}</span>
                </div>
              </div>

              <Separator className="my-2" />

              <div className="text-sm">
                <div className="flex justify-between">
                  <span>ชำระด้วย</span>
                  <span className="uppercase">{payment}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>ยอดรวม</span>
                  <span className="font-semibold">{baht(total)} บาท</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
