'use server'

import { prisma } from "@/lib/db"
import { auth } from "@/auth"

export async function validateProfileCompletion() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      },
      select: {
        profileCompletion: true
      }
    });

    if (!user?.profileCompletion) {
      return { error: "Please complete your profile first" };
    }

    return { success: true };
  } catch (error) {
    console.error("Profile validation error:", error);
    return { error: "Failed to validate profile" };
  }
}