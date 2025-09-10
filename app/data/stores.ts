import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

type GetStoresOptions = {
  q?: string
  minRating?: number
  onlyOpen?: boolean
  sort?: 'recommended' | 'rating_asc' | 'rating_desc'
  distance?: number
  userLat?: number
  userLng?: number
  take?: number
}

export async function getStoreById(id: string) {
  return prisma.store.findUnique({
    where: { id },
    include: {
      services: { orderBy: { name: 'asc' } },
      reviews: { orderBy: { date: 'desc' } },
    },
  })
}

export async function getStores({
  q,
  minRating = 0,
  onlyOpen = false,
  sort = 'recommended',
  distance,
  userLat,
  userLng,
  take = 30,
}: GetStoresOptions) {
  // -------- Normal Prisma path (no distance) --------
  const where: Prisma.StoreWhereInput = {
    rating: { gte: minRating },
    ...(q
      ? {
          OR: [
            { name: { contains: q } },     // no mode on MySQL
            { address: { contains: q } },
          ],
        }
      : {}),
    ...(onlyOpen ? { isOpen: true } : {}),
  }

  let orderBy: Prisma.StoreOrderByWithRelationInput | undefined
  switch (sort) {
    case 'rating_desc':
      orderBy = { rating: 'desc' }
      break
    case 'rating_asc':
      orderBy = { rating: 'asc' }
      break
    default:
      orderBy = { reviewsCount: 'desc' } // recommended
      break
  }

  // -------- Distance path (raw SQL), SAFE + TiDB friendly --------
  if (distance && userLat != null && userLng != null) {
    const qLike = q ? `%${q}%` : null

    // Build optional WHERE fragments inline (no Prisma.join)
    const whereOpen = onlyOpen ? Prisma.sql`AND isOpen = true` : Prisma.sql``
    const whereQ = qLike
      ? Prisma.sql`AND (name LIKE ${qLike} OR address LIKE ${qLike})`
      : Prisma.sql``

    const orderSql =
      sort === 'rating_asc'
        ? Prisma.sql`rating ASC`
        : sort === 'rating_desc'
        ? Prisma.sql`rating DESC`
        : Prisma.sql`distance ASC`

    const rows = await prisma.$queryRaw<
      Array<{
        id: string
        name: string
        address: string
        phone: string | null
        rating: number
        reviewsCount: number
        isOpen: boolean
        hours: string | null
        lat: number | null
        lng: number | null
        distance: number
      }>
    >(Prisma.sql`
      SELECT
        id, name, address, phone, rating, reviewsCount, isOpen, hours, lat, lng,
        (6371 * ACOS(
          COS(RADIANS(${userLat})) *
          COS(RADIANS(lat)) *
          COS(RADIANS(lng) - RADIANS(${userLng})) +
          SIN(RADIANS(${userLat})) *
          SIN(RADIANS(lat))
        )) AS distance
      FROM Store
      WHERE
        lat IS NOT NULL
        AND lng IS NOT NULL
        AND rating >= ${minRating}
        ${whereOpen}
        ${whereQ}
      HAVING distance <= ${distance}
      ORDER BY ${orderSql}
      LIMIT ${take}
    `)

      return { items: rows, total: rows.length }
  }

  // -------- Fallback (no distance) --------
  const [items, total] = await Promise.all([
    prisma.store.findMany({ where, orderBy, take }),
    prisma.store.count({ where }),
  ])

  return { items, total }
}
