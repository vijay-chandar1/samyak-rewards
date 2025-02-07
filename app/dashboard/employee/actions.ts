'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import { Role } from '@prisma/client';

const employeeSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  role: z.nativeEnum(Role)
});

export async function revalidateEmployees() {
  revalidatePath('/dashboard/employee');
}

export async function createEmployee(data: z.infer<typeof employeeSchema>) {
  try {
    const session = await auth();
    const vendorId = session?.user?.id;
    
    if (!vendorId) return { error: 'Unauthorized' };

    const existingEmployee = await prisma.employee.findFirst({
      where: { 
        email: data.email, 
        vendorId: vendorId 
      }
    });

    if (existingEmployee) {
      return { error: 'An employee with this email already exists' };
    }

    const tempPassword = randomBytes(16).toString('hex');

    await prisma.employee.create({
      data: {
        name: '',
        email: data.email,
        password: tempPassword,
        role: data.role,
        status: 'ACTIVE',
        vendorId: vendorId
      }
    });

    await revalidateEmployees();
    return { success: true };
  } catch (error) {
    console.error('Employee creation error:', error);
    return { error: 'Failed to create employee' };
  }
}

export async function deleteEmployee(employeeId: string) {
  try {
    const session = await auth();
    const vendorId = session?.user?.id;
    
    if (!vendorId) return { error: 'Unauthorized' };

    await prisma.employee.delete({
      where: { 
        id: employeeId,
        vendorId: vendorId 
      }
    });

    await revalidateEmployees();
    return { success: true };
  } catch (error) {
    console.error('Employee deletion error:', error);
    return { error: 'Failed to delete employee' };
  }
}

export async function fetchEmployees() {
  try {
    const session = await auth();
    const vendorId = session?.user?.id;
    
    if (!vendorId) return { error: 'Unauthorized' };

    const employees = await prisma.employee.findMany({
      where: { vendorId },
      select: {
        id: true,
        email: true,
        role: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return { employees };
  } catch (error) {
    console.error('Fetching employees error:', error);
    return { error: 'Failed to fetch employees' };
  }
}

export async function updateEmployee(
  employeeId: string, 
  data: { role: Role }
) {
  try {
    const session = await auth();
    const vendorId = session?.user?.id;
    
    if (!vendorId) return { error: 'Unauthorized' };

    await prisma.employee.update({
      where: { 
        id: employeeId,
        vendorId: vendorId 
      },
      data: {
        role: data.role
      }
    });

    await revalidateEmployees();
    return { success: true };
  } catch (error) {
    console.error('Employee update error:', error);
    return { error: 'Failed to update employee' };
  }
}