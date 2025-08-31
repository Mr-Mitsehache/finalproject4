// app/stores/[id]/page.tsx
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StoreReviewsPanel } from "@/components/store-reviews-panel";

import {
  MapPin,
  Phone,
  Clock,
  Star,
  Navigation,
  ArrowLeft,
  Sparkles,
  SprayCan,
  Brush,
  Droplets,
  CircleDollarSign,
  Timer,
} from "lucide-react";

// ===== Types =====
type Store = {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  isOpen: boolean;
  rating: number; // 0..5
  reviewsCount: number;
  category: string;
  image: string;
  lat?: number;
  lng?: number;
  priceLevel: 1 | 2 | 3 | 4;
  avgPrice: number;
};

type Review = {
  id: string;
  author: string;
  avatar?: string;
  rating: number; // 1..5
  comment: string;
  date: string; // ISO string
};

type Service = {
  slug: string;
  name: string;
  summary: string;
  priceFrom?: number;
  priceTo?: number;
  durationMin?: number;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

// ===== Mock Data (คุณสามารถย้ายไป DB/Prisma ได้ภายหลัง) =====
const mockStores: Store[] = [
  {
    id: "1",
    name: "Goofitre Car Care Central",
    address: "123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110",
    phone: "02-123-4567",
    hours: "08:00 - 20:00",
    isOpen: true,
    rating: 4.8,
    reviewsCount: 184,
    category: "ล้างรถ",
    image: "/placeholder.svg",
    lat: 13.7234,
    lng: 100.585,
    priceLevel: 3,
    avgPrice: 850,
  },
  {
    id: "2",
    name: "Premium Shine Studio",
    address: "456 ถนนพระราม 4 แขวงสุริยวงศ์ เขตบางรัก กรุงเทพฯ 10500",
    phone: "02-987-6543",
    hours: "09:00 - 21:00",
    isOpen: true,
    rating: 4.6,
    reviewsCount: 92,
    category: "ขัดเคลือบ",
    image: "/placeholder.svg",
    lat: 13.7295,
    lng: 100.531,
    priceLevel: 4,
    avgPrice: 1400,
  },
  {
    id: "3",
    name: "Auto Care Express",
    address: "789 ถนนเพชรบุรี แขวงทุ่งพญาไท เขตราชเทวี กรุงเทพฯ 10400",
    phone: "02-555-1234",
    hours: "07:00 - 19:00",
    isOpen: false,
    rating: 4.4,
    reviewsCount: 58,
    category: "ซ่อมบำรุง",
    image: "/placeholder.svg",
    lat: 13.7533,
    lng: 100.538,
    priceLevel: 2,
    avgPrice: 600,
  },
  {
    id: "4",
    name: "Crystal Clean Detailing",
    address: "321 ถนนสีลม แขวงสีลม เขตบางรัก กรุงเทพฯ 10500",
    phone: "02-777-8888",
    hours: "10:00 - 22:00",
    isOpen: true,
    rating: 4.9,
    reviewsCount: 210,
    category: "ดีเทลลิ่ง",
    image: "/placeholder.svg",
    lat: 13.7286,
    lng: 100.5331,
    priceLevel: 4,
    avgPrice: 1600,
  },
  {
    id: "5",
    name: "Speed Wash Center",
    address: "654 ถนนลาดพร้าว แขวงจตุจักร เขตจตุจักร กรุงเทพฯ 10900",
    phone: "02-444-5555",
    hours: "06:00 - 18:00",
    isOpen: true,
    rating: 4.2,
    reviewsCount: 33,
    category: "ล้างรถ",
    image: "/placeholder.svg",
    lat: 13.816,
    lng: 100.576,
    priceLevel: 1,
    avgPrice: 250,
  },
  {
    id: "6",
    name: "Elite Auto Spa",
    address: "987 ถนนพหลโยธิน แขวงสามเสนใน เขตพญาไท กรุงเทพฯ 10400",
    phone: "02-666-7777",
    hours: "08:30 - 20:30",
    isOpen: false,
    rating: 4.7,
    reviewsCount: 121,
    category: "สปารถ",
    image: "/placeholder.svg",
    lat: 13.779,
    lng: 100.544,
    priceLevel: 3,
    avgPrice: 900,
  },
];

const mockReviews: Record<string, Review[]> = {
  "1": [
    {
      id: "r1",
      author: "Narin K.",
      rating: 5,
      comment: "ล้างละเอียด เงาวับ บริการดีมากครับ",
      date: "2025-08-20",
      avatar: "",
    },
    {
      id: "r2",
      author: "Ploy S.",
      rating: 5,
      comment: "จองคิวสะดวก งานเนียน คุ้มราคา",
      date: "2025-08-10",
      avatar: "",
    },
    {
      id: "r3",
      author: "Anusorn T.",
      rating: 4,
      comment: "รอคิวนิดหน่อย แต่ผลลัพธ์ดี",
      date: "2025-08-03",
      avatar: "",
    },
  ],
  "2": [
    {
      id: "r1",
      author: "Beam J.",
      rating: 5,
      comment: "เคลือบเงาดีมาก สีรถสดขึ้น",
      date: "2025-08-18",
      avatar: "",
    },
    {
      id: "r2",
      author: "Mook M.",
      rating: 4,
      comment: "สถานที่สะอาด บริการดี",
      date: "2025-08-05",
      avatar: "",
    },
  ],
  "3": [
    {
      id: "r1",
      author: "Golf P.",
      rating: 4,
      comment: "ซ่อมเร็ว ราคาเหมาะสม",
      date: "2025-07-29",
      avatar: "",
    },
  ],
  "4": [
    {
      id: "r1",
      author: "Jane R.",
      rating: 5,
      comment: "ดีเทลลิ่งระดับเทพ แนะนำสุดๆ",
      date: "2025-08-22",
      avatar: "",
    },
    {
      id: "r2",
      author: "Ake C.",
      rating: 5,
      comment: "เงางามกริบทุกซอกมุม",
      date: "2025-08-11",
      avatar: "",
    },
  ],
  "5": [
    {
      id: "r1",
      author: "Patty",
      rating: 4,
      comment: "ราคาประหยัด เสร็จไว",
      date: "2025-08-15",
      avatar: "",
    },
  ],
  "6": [
    {
      id: "r1",
      author: "Ton",
      rating: 5,
      comment: "สปารถหอมมาก งานดี",
      date: "2025-08-09",
      avatar: "",
    },
  ],
};

const mockServices: Record<string, Service[]> = {
  default: [
    {
      slug: "wash-basic",
      name: "ล้าง+ดูดฝุ่น",
      summary: "ล้างภายนอก ดูดฝุ่นภายใน เคลือบน้ำยาเบื้องต้น",
      priceFrom: 200,
      priceTo: 350,
      durationMin: 30,
      icon: Droplets,
    },
    {
      slug: "wax-detail",
      name: "ขัด+เคลือบแว็กซ์",
      summary: "ขัดลบรอยขนแมว เคลือบแว็กซ์เพิ่มความเงา",
      priceFrom: 800,
      priceTo: 1500,
      durationMin: 90,
      icon: Sparkles,
    },
    {
      slug: "ceramic-coat",
      name: "เคลือบเซรามิก",
      summary: "ชั้นเคลือบปกป้องสีรถ เสริมความเงางามยาวนาน",
      priceFrom: 4500,
      priceTo: 9000,
      durationMin: 240,
      icon: SprayCan,
    },
    {
      slug: "interior-care",
      name: "ดูแลภายใน",
      summary: "ซักเบาะ พรม เคลือบพลาสติก/หนัง",
      priceFrom: 1200,
      priceTo: 2500,
      durationMin: 120,
      icon: Brush,
    },
  ],
};

// ===== Helpers =====
function getStoreById(id: string): Store | undefined {
  return mockStores.find((s) => s.id === id);
}

function getReviewsByStore(id: string): Review[] {
  return mockReviews[id] ?? [];
}

function getServicesByStore(id: string): Service[] {
  // ในอนาคต: ดึงตามร้านจริง; ตอนนี้ใช้ default
  return mockServices["default"];
}

function bahtSigns(level: number) {
  return "฿".repeat(level);
}

function formatPriceRange(a?: number, b?: number) {
  if (!a && !b) return "-";
  if (a && b) return `${a.toLocaleString()} - ${b.toLocaleString()} บาท`;
  if (a) return `เริ่มที่ ${a.toLocaleString()} บาท`;
  return `${b!.toLocaleString()} บาท`;
}

function RatingStars({ value }: { value: number }) {
  // แสดงดาวเต็ม/ครึ่งแบบง่าย (ปัด .5 ขึ้น)
  const rounded = Math.round(value * 2) / 2;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i + 1 <= Math.floor(rounded);
        const half = !filled && i + 0.5 === rounded;
        return (
          <Star
            key={i}
            className={`h-4 w-4 ${
              filled
                ? "fill-yellow-500 text-yellow-500"
                : half
                ? "text-yellow-500"
                : "text-muted-foreground"
            }`}
          />
        );
      })}
    </div>
  );
}

function ReviewItem({ r }: { r: Review }) {
  const initials = r.author
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="flex gap-3">
      <Avatar>
        {r.avatar ? <AvatarImage src={r.avatar} alt={r.author} /> : null}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="font-medium">{r.author}</p>
          <span className="text-xs text-muted-foreground">
            {new Date(r.date).toLocaleDateString("th-TH")}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <RatingStars value={r.rating} />
          <span className="text-xs text-muted-foreground">
            {r.rating.toFixed(1)}
          </span>
        </div>
        <p className="mt-2 text-sm text-foreground/90">{r.comment}</p>
      </div>
    </div>
  );
}

// ===== Page Component (Server Component) =====
export default function StorePage({ params }: { params: { id: string } }) {
  const store = getStoreById(params.id);
  if (!store) return notFound();

  const reviews = getReviewsByStore(store.id);
  const services = getServicesByStore(store.id);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-6">
        {/* Back */}
        <div className="mb-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              ย้อนกลับ
            </Button>
          </Link>
        </div>

        {/* ===== Top: Store Hero + Summary ===== */}
        <Card className="overflow-hidden">
          <div className="relative h-56 w-full bg-muted">
            <Image
              src={store.image}
              alt={store.name}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          </div>

          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold">{store.name}</h1>
                  <Badge variant={store.isOpen ? "default" : "secondary"}>
                    {store.isOpen ? "เปิดตอนนี้" : "ปิดอยู่"}
                  </Badge>
                  <Badge variant="outline">{store.category}</Badge>
                  <Badge variant="outline">{bahtSigns(store.priceLevel)}</Badge>
                </div>
                <Separator />
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    <span>{store.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Separator orientation="vertical" />
                    <Phone className="h-4 w-4" />
                    <a
                      className="hover:underline"
                      href={`tel:${store.phone.replace(/[^0-9]/g, "")}`}
                    >
                      {store.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>เวลาให้บริการ: {store.hours}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Separator orientation="vertical" />
                    <Navigation className="h-4 w-4" />
                    {store.lat && store.lng ? (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        เริ่มนำทาง
                      </a>
                    ) : (
                      <span>ยังไม่มีพิกัด</span>
                    )}
                  </div>
                  <div>
                    {/* ===== Map Section ===== */}
                    {store.lat && store.lng ? (
                      <div className="rounded-xl w-3xl h-82 overflow-hidden">
                        <iframe
                          title="store-map"
                          className="w-full h-full"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          src={`https://maps.google.com/maps?q=${store.lat},${store.lng}&z=16&output=embed`}
                        />
                      </div>
                    ) : (
                      <Card className="mt-6">
                        <CardContent className="p-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>ยังไม่มีพิกัดของร้าน</span>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </div>

              {/* Rating summary */}
              <StoreReviewsPanel
                storeName={store.name}
                initialReviews={reviews}
                initialAvgRating={store.rating}
                initialCount={store.reviewsCount}
              />
            </div>
          </CardContent>
        </Card>

        {/* ===== Bottom: Services Summary ===== */}
        <div className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((sv) => {
              const Icon = sv.icon ?? Sparkles;
              return (
                <Card key={sv.slug} className="hover:shadow-sm transition">
                  <CardContent className="p-5">
                    <div className="flex gap-3">
                      <div className="mt-1">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{sv.name}</h3>
                          {sv.durationMin ? (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <Timer className="h-3.5 w-3.5" />~{sv.durationMin}{" "}
                              นาที
                            </span>
                          ) : null}
                          {sv.priceFrom || sv.priceTo ? (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <CircleDollarSign className="h-3.5 w-3.5" />
                              {formatPriceRange(sv.priceFrom, sv.priceTo)}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {sv.summary}
                        </p>

                        <div className="mt-3">
                          {/* ในอนาคตให้ลิงก์ไปหน้า service detail ของร้านนี้ */}
                          <Button size="sm" asChild>
                            <Link href={`/stores/${store.id}/book/${sv.slug}`}>
                              จองบริการ
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== (ทางเลือก) สร้าง static paths + ISR =====
export async function generateStaticParams() {
  return mockStores.map((s) => ({ id: s.id }));
}

// ISR: รีเฟรชทุก 5 นาที (ปรับตามต้องการ)
export const revalidate = 300;
