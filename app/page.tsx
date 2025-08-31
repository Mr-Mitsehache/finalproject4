'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MapPin, Clock, Phone, Star, Navigation } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ModeToggle } from '@/components/ModeToggle';
import Link from 'next/link';

interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  isOpen: boolean;
  rating: number;
  category: string;
  image: string;
  distance?: string;
  lat?: number;
  lng?: number;
  _distanceKm?: number;
  priceLevel: 1 | 2 | 3 | 4;
  avgPrice: number;
}

const mockStores: Store[] = [
  {
    id: '1',
    name: 'Goofitre Car Care Central(ใก้ลฉัน)',
    address: '123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
    phone: '02-123-4567',
    hours: '08:00 - 20:00',
    isOpen: true,
    rating: 4.8,
    category: 'ล้างรถ',
    image: '/car-svgrepo-com.svg',
    lat: 6.528102674748978, lng: 101.20572591738954,
    priceLevel: 3, avgPrice: 850,
  },
  {
    id: '2',
    name: 'Premium Shine Studio(ไม่มีพิกัด)',
    address: '456 ถนนพระราม 4 แขวงสุริยวงศ์ เขตบางรัก กรุงเทพฯ 10500',
    phone: '02-987-6543',
    hours: '09:00 - 21:00',
    isOpen: true,
    rating: 4.6,
    category: 'ขัดเคลือบ',
    image: '/car-svgrepo-com.svg',
    priceLevel: 4, avgPrice: 1400,
  },
  {
    id: '3',
    name: 'Auto Care Express',
    address: '789 ถนนเพชรบุรี แขวงทุ่งพญาไท เขตราชเทวี กรุงเทพฯ 10400',
    phone: '02-555-1234',
    hours: '07:00 - 19:00',
    isOpen: true,
    rating: 4.4,
    category: 'ซ่อมบำรุง',
    image: '/car-svgrepo-com.svg',
    lat: 13.7533, lng: 100.5380,
    priceLevel: 2, avgPrice: 600,
  },
  {
    id: '4',
    name: 'Crystal Clean Detailing(ปิด)',
    address: '321 ถนนสีลม แขวงสีลม เขตบางรัก กรุงเทพฯ 10500',
    phone: '02-777-8888',
    hours: '10:00 - 22:00',
    isOpen: false,
    rating: 4.9,
    category: 'ดีเทลลิ่ง',
    image: '/car-svgrepo-com.svg',
    lat: 13.7286, lng: 100.5331,
    priceLevel: 4, avgPrice: 1600,
  },
  {
    id: '5',
    name: 'Speed Wash Center(ปิด)',
    address: '654 ถนนลาดพร้าว แขวงจตุจักร เขตจตุจักร กรุงเทพฯ 10900',
    phone: '02-444-5555',
    hours: '06:00 - 18:00',
    isOpen: false,
    rating: 4.2,
    category: 'ล้างรถ',
    image: '/car-svgrepo-com.svg',
    lat: 13.8160, lng: 100.5760,
    priceLevel: 1, avgPrice: 250,
  },
  {
    id: '6',
    name: 'Elite Auto Spa(ปิด)',
    address: '987 ถนนพหลโยธิน แขวงสามเสนใน เขตพญาไท กรุงเทพฯ 10400',
    phone: '02-666-7777',
    hours: '08:30 - 20:30',
    isOpen: false,
    rating: 4.7,
    category: 'สปารถ',
    image: '/car-svgrepo-com.svg',
    lat: 13.7790, lng: 100.5440,
    priceLevel: 3, avgPrice: 900,
  }
];

const categories = ['ทั้งหมด', 'ล้างรถ', 'ขัดเคลือบ', 'ซ่อมบำรุง', 'ดีเทลลิ่ง', 'สปารถ'];
const priceLevels = [1, 2, 3] as const;

type SortKey = 'recommended' | 'rating' | 'distance' | 'priceAsc' | 'priceDesc' | 'openFirst';

function haversineKm(lat1: number, lon1: number, lat2?: number, lon2?: number) {
  if (lat2 == null || lon2 == null) return Number.POSITIVE_INFINITY;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function bahtSigns(level: number) {
  return '฿'.repeat(level);
}

export default function ShowHome() {
  const router = useRouter();

  // base data/state
  const [stores, setStores] = useState<Store[]>(mockStores);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  // user location
  const [hasGeo, setHasGeo] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [geoMsg, setGeoMsg] = useState('');

  // filters (ทั้งหมดอยู่ใน Header)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [onlyOpen, setOnlyOpen] = useState<boolean>(true); // ✅ default เปิด
  const [minRating, setMinRating] = useState<number>(0);   // ✅ จะควบคุมด้วย Select
  const [selectedPriceLevels, setSelectedPriceLevels] = useState<number[]>([]);
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(5); // ✅ default 5 km (กรอกเอง)

  // sort
  const [sortBy, setSortBy] = useState<SortKey>('recommended');

  const handleStoreClick = (s: Store) => setSelectedStore(s);

  const togglePrice = (level: number, checked: boolean) => {
    setSelectedPriceLevels((prev) => (checked ? [...prev, level] : prev.filter((l) => l !== level)));
  };

  const findNearbyStores = () => {
    setGeoMsg('');
    if (!navigator.geolocation) {
      setGeoMsg('เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        const updated = stores.map((s) => {
          const km = haversineKm(latitude, longitude, s.lat, s.lng);
          return {
            ...s,
            _distanceKm: km,
            distance: Number.isFinite(km) ? `${km.toFixed(1)} กม.` : undefined,
          };
        });
        setStores(updated);
        setHasGeo(true);
        setGeoMsg('อัพเดตร้านตามระยะทางใกล้คุณแล้ว');
      },
      (err) => setGeoMsg(err.message || 'ไม่สามารถขอสิทธิ์ตำแหน่งได้'),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const resetFilters = () => {
    // ✅ ล้างทุกอย่าง + ล้างตำแหน่งผู้ใช้
    setSearchTerm('');
    setSelectedCategory('ทั้งหมด');
    setOnlyOpen(true);
    setMinRating(0);
    setSelectedPriceLevels([]);
    setMaxDistanceKm(5);
    setSortBy('recommended');
    setSelectedStore(null);

    setHasGeo(false);
    setUserLocation(null);
    setGeoMsg('');

    // เคลียร์ระยะทางที่เคยคำนวณ
    setStores(
      mockStores.map((s) => ({
        ...s,
        _distanceKm: undefined,
        distance: undefined,
      }))
    );
  };

  const filteredAndSorted = useMemo(() => {
    const q = searchTerm.toLowerCase();

    let list = stores.filter((store) => {
      const matchesSearch =
        store.name.toLowerCase().includes(q) || store.address.toLowerCase().includes(q);
      const matchesCategory = selectedCategory === 'ทั้งหมด' || store.category === selectedCategory;
      const matchesOpen = !onlyOpen || store.isOpen;
      const matchesRating = store.rating >= minRating;
      const matchesPrice =
        selectedPriceLevels.length === 0 || selectedPriceLevels.includes(store.priceLevel);
      const matchesDistance =
        !hasGeo || store._distanceKm == null || !Number.isFinite(store._distanceKm)
          ? true
          : store._distanceKm <= maxDistanceKm;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesOpen &&
        matchesRating &&
        matchesPrice &&
        matchesDistance
      );
    });

    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating || (a._distanceKm ?? Infinity) - (b._distanceKm ?? Infinity);
        case 'distance': {
          const da = a._distanceKm ?? Infinity;
          const db = b._distanceKm ?? Infinity;
          return da - db || b.rating - a.rating;
        }
        case 'priceAsc':
          return a.avgPrice - b.avgPrice || b.rating - a.rating;
        case 'priceDesc':
          return b.avgPrice - a.avgPrice || b.rating - a.rating;
        case 'openFirst':
          return Number(b.isOpen) - Number(a.isOpen) || b.rating - a.rating;
        case 'recommended':
        default: {
          const score = (s: Store) => {
            const openBoost = s.isOpen ? 1 : 0;
            const ratingScore = s.rating / 5;
            const distScore =
              hasGeo && Number.isFinite(s._distanceKm) ? Math.max(0, 1 - (s._distanceKm! / 10)) : 0.5;
            return openBoost * 0.4 + ratingScore * 0.5 + distScore * 0.1;
          };
          return score(b) - score(a);
        }
      }
    });

    return list;
  }, [
    stores,
    searchTerm,
    selectedCategory,
    onlyOpen,
    minRating,
    selectedPriceLevels,
    hasGeo,
    maxDistanceKm,
    sortBy,
  ]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header + Filters (ทั้งหมดอยู่ที่นี่) */}
      <div className="bg-gradient-to-br from-primary/90 to-primary/60 text-primary-foreground py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <h1 className="text-3xl md:text-4xl font-bold">ค้นหาร้านคาร์แคร์</h1>
          <p className="opacity-90 mb-6">เลือกจากร้านที่ตรงใจและอยู่ใกล้คุณ</p>
          <Link href="/login">สนใจเข้าร่วม</Link>
          <ModeToggle/>

          <div className="rounded-xl border bg-background/40 backdrop-blur p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                type="text"
                placeholder="ค้นหาชื่อร้านหรือที่อยู่..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="หมวดหมู่" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2">
                <div>
                  <Label className="text-foreground">สถานะร้าน</Label>
                  <p className="text-xs text-muted-foreground">แสดงเฉพาะร้านที่เปิดอยู่</p>
                </div>
                <Switch checked={onlyOpen} onCheckedChange={(v) => setOnlyOpen(Boolean(v))} />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Rating Select */}
              <div>
                <Label className="mb-2 block">เรตติ้งขั้นต่ำ</Label>
                <Select value={String(minRating)} onValueChange={(v) => setMinRating(parseFloat(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกเรตติ้ง" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">ทั้งหมด</SelectItem>
                    <SelectItem value="3">ตั้งแต่ 3.0+</SelectItem>
                    <SelectItem value="3.5">ตั้งแต่ 3.5+</SelectItem>
                    <SelectItem value="4">ตั้งแต่ 4.0+</SelectItem>
                    <SelectItem value="4.5">ตั้งแต่ 4.5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price checkbox */}
              <div>
                <Label className="mb-2 block">ช่วงราคา</Label>
                <div className="flex flex-wrap gap-3">
                  {priceLevels.map((lvl) => {
                    const checked = selectedPriceLevels.includes(lvl);
                    return (
                      <label key={lvl} className="flex items-center gap-2">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) => togglePrice(lvl, Boolean(v))}
                        />
                        <span className="text-sm">{bahtSigns(lvl)}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Distance input (number) */}
              <div>
                <Label className="mb-2 block">ระยะทางสูงสุด (กม.)</Label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  step="0.5"
                  value={Number.isFinite(maxDistanceKm) ? maxDistanceKm : ''}
                  onChange={(e) => setMaxDistanceKm(Number(e.target.value) || 0)}
                  placeholder="เช่น 5"
                />
                {!hasGeo && (
                  <p className="text-xs text-muted-foreground mt-1">
                    * ระยะทางจะถูกใช้หลังจากกดปุ่ม “ใกล้ฉัน”
                  </p>
                )}
              </div>
            </div>

            {/* Actions row: ใกล้ฉัน / Reset / Sort */}
            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-2">
                <Button onClick={findNearbyStores}>
                  <Navigation className="w-4 h-4 mr-2" />
                  ใกล้ฉัน
                </Button>
                <Button variant="secondary" onClick={resetFilters}>
                  ล้างตัวกรอง
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <Label className="whitespace-nowrap">เรียงลำดับ</Label>
                <Select value={sortBy} onValueChange={(v: SortKey) => setSortBy(v)}>
                  <SelectTrigger className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recommended">แนะนำ</SelectItem>
                    <SelectItem value="rating">เรตติ้งสูงสุด</SelectItem>
                    <SelectItem value="distance">ใกล้ที่สุด</SelectItem>
                    <SelectItem value="priceAsc">ราคาต่ำสุด</SelectItem>
                    <SelectItem value="priceDesc">ราคาสูงสุด</SelectItem>
                    <SelectItem value="openFirst">เปิดอยู่มาก่อน</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {geoMsg && <p className="text-sm text-muted-foreground mt-3">{geoMsg}</p>}
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-foreground">
                ร้านทั้งหมด ({filteredAndSorted.length} ร้าน)
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {filteredAndSorted.map((store) => (
                <Card
                  key={store.id}
                  className="hover:shadow-lg transition-all duration-200 cursor-pointer"
                  onClick={() => handleStoreClick(store)}
                >
                  <CardContent className="p-5 md:p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="w-full md:w-48 h-32 relative bg-muted rounded-lg overflow-hidden">
                        <Image
                          src={store.image}
                          alt={store.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="text-lg md:text-xl font-semibold text-foreground">
                              {store.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={store.isOpen ? 'default' : 'secondary'}>
                                {store.isOpen ? 'เปิด' : 'ปิด'}
                              </Badge>
                              <Badge variant="outline">{store.category}</Badge>
                              <Badge variant="outline">{bahtSigns(store.priceLevel)}</Badge>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="flex items-center justify-end gap-1 mb-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="font-medium">{store.rating}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {store.distance ?? (Number.isFinite(store._distanceKm) ? `${store._distanceKm!.toFixed(1)} กม.` : '')}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ~ {store.avgPrice.toLocaleString()} บาท
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                            <span className="text-muted-foreground">{store.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{store.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{store.hours}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <Card className="h-[28rem]">
                <CardContent className="p-5 h-full">
                  {selectedStore ? (
                    <div className="flex flex-col h-full">
                      <h3 className="text-lg font-semibold mb-4">รายละเอียดร้าน</h3>
                      <div className="space-y-3">
                        <h4 className="font-medium">{selectedStore.name}</h4>
                        <div className="text-sm space-y-2">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <span>{selectedStore.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span>{selectedStore.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{selectedStore.hours}</span>
                          </div>
                        </div>

                        {selectedStore.lat && selectedStore.lng ? (
                          <div className="mt-3 rounded-lg overflow-hidden border">
                            <iframe
                              title="store-map"
                              className="w-full h-100"
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                              src={`https://maps.google.com/maps?q=${selectedStore.lat},${selectedStore.lng}&z=15&output=embed`}
                            />
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-3">ยังไม่มีพิกัดของร้าน</p>
                        )}

                        <Button
                          className="w-full mt-4"
                          onClick={() => router.push(`/stores/${selectedStore.id}`)}
                        >
                          ดูรายละเอียดเต็ม
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <MapPin className="w-12 h-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">แผนที่ร้านค้า</h3>
                      <p className="text-muted-foreground text-sm">
                        คลิกที่ร้านเพื่อดูรายละเอียดและตำแหน่งบนแผนที่
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
