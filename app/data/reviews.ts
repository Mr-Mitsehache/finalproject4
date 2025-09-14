// app/data/reviews.ts
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const OptionalHttpUrl = z
  .union([z.string().trim().url(), z.string().length(0)])
  .transform(v => (v ? v : undefined))
  .refine(v => !v || v.startsWith('http://') || v.startsWith('https://'), {
    message: 'กรุณาใช้ http/https',
  })

export const ReviewInput = z
  .object({
    storeId: z.string().min(1),
    author: z.string().min(1, 'กรอกชื่อ').max(100),
    rating: z.coerce.number().int().min(1).max(5),
    comment: z.string().min(1, 'กรอกความคิดเห็น').max(1000),
    mediaUrl: OptionalHttpUrl.optional(),
    mediaKind: z.enum(['IMAGE', 'VIDEO']).optional(),
  })
  // ถ้ามี URL ต้องเลือกชนิดสื่อ
  .refine(d => !d.mediaUrl || !!d.mediaKind, {
    path: ['mediaKind'],
    message: 'กรุณาเลือกชนิดสื่อ',
  })
  // ถ้าไม่มี URL ให้ล้าง mediaKind ทิ้งไปเลย
  .transform(d => (!d.mediaUrl ? { ...d, mediaKind: undefined } : d))

export type ReviewInputType = z.infer<typeof ReviewInput>

export async function getReviews(
  storeId: string,
  opts?: { take?: number; stars?: number }
) {
  const take = opts?.take ?? 20
  const stars = opts?.stars
  return prisma.review.findMany({
    where: { storeId, ...(stars ? { rating: stars } : {}) },
    orderBy: { date: 'desc' },
    take,
  })
}

export async function createReview(input: ReviewInputType) {
  const parsed = ReviewInput.safeParse(input)
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map(i => i.message).join('\n'))
  }
  const { storeId, author, rating, comment, mediaUrl, mediaKind } = parsed.data

  await prisma.$transaction(async (tx) => {
    await tx.review.create({
      data: { storeId, author, rating, comment, mediaUrl, mediaKind },
    })
    const agg = await tx.review.aggregate({
      where: { storeId },
      _avg: { rating: true },
      _count: { _all: true },
    })
    await tx.store.update({
      where: { id: storeId },
      data: {
        rating: agg._avg.rating ?? 0,
        reviewsCount: agg._count._all ?? 0,
      },
    })
  })
}
