// app/api/stores/route.ts
import { NextResponse } from 'next/server';
import { getStores } from '@/app/data/stores';

export const runtime = 'nodejs'; // Prisma ต้อง Node runtime

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || undefined;
  const minRating = searchParams.get('minRating');
  const onlyOpen = searchParams.get('open') === '1';
  const sort = (searchParams.get('sort') as any) || 'recommended';
  const take = Number(searchParams.get('take') || 20);
  const skip = Number(searchParams.get('skip') || 0);

  const data = await getStores({
    q,
    minRating: minRating ? parseFloat(minRating) : 0,
    onlyOpen,
    take,
    skip,
    sort,
  });

  return NextResponse.json(data);
}
