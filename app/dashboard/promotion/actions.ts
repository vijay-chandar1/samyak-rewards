'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const promotionSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(1),
  originalPrice: z.number().positive(),
  discountPercent: z.number().min(0).max(100),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  updatedPrice: z.number()
})

async function validateUser() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }
  return session.user.id
}

export async function createPromotion(data: z.infer<typeof promotionSchema>) {
  try {
    const userId = await validateUser()
    
    const promotion = await prisma.promotion.create({
      data: {
        ...data,
        userId,
        startDate: data.startDate ? new Date(data.startDate) : '',
        endDate: data.endDate ? new Date(data.endDate) : '',
      }
    })

    revalidatePath('/dashboard/promotion')
    return { success: true, data: promotion }
  } catch (error) {
    console.error('Failed to create promotion:', error)
    return { success: false, error: 'Failed to create promotion' }
  }
}

export async function updatePromotion(
  promotionId: string,
  data: z.infer<typeof promotionSchema>
) {
  try {
    const userId = await validateUser()
    
    const promotion = await prisma.promotion.update({
      where: {
        id: promotionId,
        userId
      },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : '',
        endDate: data.endDate ? new Date(data.endDate) : '',
      }
    })

    revalidatePath('/dashboard/promotion')
    return { success: true, data: promotion }
  } catch (error) {
    console.error('Failed to update promotion:', error)
    return { success: false, error: 'Failed to update promotion' }
  }
}

export async function deletePromotion(promotionId: string) {
  try {
    const userId = await validateUser()
    
    await prisma.promotion.delete({
      where: {
        id: promotionId,
        userId
      }
    })

    revalidatePath('/dashboard/promotion')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete promotion:', error)
    return { success: false, error: 'Failed to delete promotion' }
  }
}

export async function getPromotions() {
  try {
    const userId = await validateUser()
    
    const promotions = await prisma.promotion.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    return { success: true, data: promotions }
  } catch (error) {
    console.error('Failed to fetch promotions:', error)
    return { success: false, error: 'Failed to fetch promotions' }
  }
}