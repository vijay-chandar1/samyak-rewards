'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { z } from 'zod';

const taxTypeEnum = z.enum(['IGST', 'CGST', 'SGST', 'UTGST', 'VAT', 'NONE', 'OTHER']);
export type TaxType = z.infer<typeof taxTypeEnum>;

const profileSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, { message: 'Invalid phone number' })
    .optional(),
  companyName: z
    .string()
    .min(2, { message: 'Company name must be at least 2 characters' })
    .max(100, { message: 'Company name cannot exceed 100 characters' })
    .optional(),
  companyLogo: z.array(z.string()).optional(),
  taxDetails: z.array(z.object({
    taxType: taxTypeEnum,
    taxNumber: z
      .string()
      .min(15, { message: 'Tax Number must be 15 characters' })
      .max(15, { message: 'Tax Number must be 15 characters' })
      .regex(/^[0-9A-Z]+$/, {
        message: 'Tax Number can only contain numbers and uppercase letters'
      })
  })).optional(),
  address: z.object({
    street: z.string().max(200).optional(),
    city: z.string().max(50).optional(),
    state: z.string().max(50).optional(),
    country: z.string().max(50).optional(),
    pincode: z.string().regex(/^\d{6}$/, { message: 'Invalid pincode' }).optional()
  }).optional()
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export async function updateProfile(data: ProfileFormData) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    const companyDetailsData = {
      companyName: data.companyName ?? '',
      companyLogo: data.companyLogo?.[0],
      companyAddress: data.address ? JSON.stringify(data.address) : '{}'
    };

    await prisma.user.update({
      where: { id: userId },
      data: {
        phone: data.phoneNumber,
        profileCompletion: true,
        companyDetails: {
          upsert: {
            create: {
              ...companyDetailsData,
              taxDetails: {
                create: data.taxDetails?.map(tax => ({
                  taxType: tax.taxType,
                  taxNumber: tax.taxNumber,
                  vendor: {
                    connect: { id: userId }
                  }
                })) ?? []
              }
            },
            update: {
              ...companyDetailsData,
              taxDetails: {
                deleteMany: {},
                create: data.taxDetails?.map(tax => ({
                  taxType: tax.taxType,
                  taxNumber: tax.taxNumber,
                  vendor: {
                    connect: { id: userId }
                  }
                })) ?? []
              }
            }
          }
        }
      }
    });

    revalidatePath('/dashboard/profile');
    return { success: true };
  } catch (error) {
    console.error('Profile update error:', error);
    return { error: 'Failed to update profile' };
  }
}