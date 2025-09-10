import { prisma } from '@/lib/prisma'

export async function createReview(opts: {
  storeId: string
  author: string
  rating: number
  comment: string
}) {
  const { storeId, author, rating, comment } = opts

  if (rating < 1 || rating > 5) throw new Error('Rating must be 1..5')

  // create review
  await prisma.review.create({
    data: { storeId, author, rating, comment },
  })

  // recalc average + count
  const agg = await prisma.review.aggregate({
    where: { storeId },
    _avg: { rating: true },
    _count: true,
  })

  await prisma.store.update({
    where: { id: storeId },
    data: {
      rating: agg._avg.rating ?? 0,
      reviewsCount: agg._count,
    },
  })
}

export async function getReviews(storeId: string, take = 10) {
  return prisma.review.findMany({
    where: { storeId },
    orderBy: { date: 'desc' },
    take,
  })
}
