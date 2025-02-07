'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { RewardPolicyData } from '@/constants/data';

// Helper type for reward calculation result
type RewardCalculationResult = {
  rewardAmount: number;
  rewardType: string;
  transactionId?: string;
  expiresAt?: Date | null;
  description: string;
  metadata?: any;
};

// Helper function to calculate total amount
function calculateTotalAmount(items: any[], discountPercentage: number) {
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);

  const discount = (subtotal * discountPercentage) / 100;

  const taxTotal = items.reduce((sum, item) => {
    const itemTotal = item.price * item.quantity;
    const itemTax = (itemTotal * (item.taxRate || 0)) / 100;
    return sum + itemTax;
  }, 0);

  return subtotal - discount + taxTotal;
}

// Helper function to calculate rewards based on policy
async function calculateRewards(
  userId: string,
  totalAmount: number,
  transactionId?: string
): Promise<RewardCalculationResult> {
  const rewardPolicy = await prisma.rewardPolicy.findFirst({
    where: { userId, isActive: true }
  });

  if (!rewardPolicy || rewardPolicy.type === 'NONE') {
    return {
      rewardAmount: 0,
      rewardType: 'NONE',
      description: 'No rewards applicable'
    };
  }

  const config = rewardPolicy.config as any;
  let rewardAmount = 0;
  let description = '';
  let metadata = {};

  switch (rewardPolicy.type) {
    case 'PERCENTAGE_DISCOUNT':
      rewardAmount = (totalAmount * (config.percentage || 0)) / 100;
      description = `${config.percentage}% instant discount`;
      metadata = { percentage: config.percentage };
      break;

    case 'FIXED_DISCOUNT':
    case 'FLAT_DISCOUNT':
      rewardAmount = config.amount || 0;
      description = `₹${config.amount} instant discount`;
      metadata = { amount: config.amount };
      break;

    case 'PERCENTAGE_CREDIT':
      rewardAmount = (totalAmount * (config.percentage || 0)) / 100;
      description = `${config.percentage}% store credit`;
      metadata = { percentage: config.percentage };
      break;

    case 'FIXED_CREDIT':
      rewardAmount = config.amount || 0;
      description = `₹${config.amount} store credit`;
      metadata = { amount: config.amount };
      break;

    case 'POINT_BASED':
      rewardAmount = totalAmount * (config.pointsPerRupee || 0);
      description = `${rewardAmount} points earned`;
      metadata = { 
        pointsPerRupee: config.pointsPerRupee,
        rupeesPerPoint: config.rupeesPerPoint 
      };
      break;

    case 'CUSTOM':
      try {
        const rules = JSON.parse(config.rules);
        rewardAmount = 0; // Implement custom logic
        description = 'Custom reward applied';
        metadata = { rules };
      } catch (error) {
        rewardAmount = 0;
        description = 'Invalid custom rules';
      }
      break;
  }

  return {
    rewardAmount,
    rewardType: rewardPolicy.type,
    transactionId,
    expiresAt: rewardPolicy.expiry 
      ? new Date(Date.now() + (rewardPolicy.expiry * 24 * 60 * 60 * 1000))
      : null,
    description,
    metadata
  };
}

// Helper function to update customer rewards
async function updateCustomerRewards(
  customer: any,
  vendorId: string,
  rewardCalculation: RewardCalculationResult
) {
  if (rewardCalculation.rewardAmount <= 0) return;

  const currentRewards = customer.rewards as any || {};
  
  // Create new reward entry
  const newRewardEntry = {
    type: rewardCalculation.rewardType,
    amount: rewardCalculation.rewardAmount,
    metadata: rewardCalculation.metadata,
    transactionId: rewardCalculation.transactionId,
    expiresAt: rewardCalculation.expiresAt,
    lastUpdated: new Date()
  };

  // If vendor has existing rewards, append to their array
  if (currentRewards[vendorId]) {
    if (!Array.isArray(currentRewards[vendorId])) {
      // Convert old format to array if needed
      currentRewards[vendorId] = [currentRewards[vendorId]];
    }
    currentRewards[vendorId].push(newRewardEntry);
  } else {
    // Create new array for vendor
    currentRewards[vendorId] = [newRewardEntry];
  }

  await prisma.customer.update({
    where: { id: customer.id },
    data: { rewards: currentRewards }
  });
}

export async function createTransaction(formData: any) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Unauthorized' };
    }

    const totalAmount = calculateTotalAmount(formData.items, formData.discountPercentage);

    let customer = await prisma.customer.findFirst({
      where: {
        phone: formData.phone,
        userId: session.user.id
      }
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          phone: formData.phone,
          isActive: true,
          userId: session.user.id
        }
      });
    }

    const transaction = await prisma.transaction.create({
      data: {
        phone: formData.phone,
        type: formData.type,
        amount: totalAmount,
        discountPercentage: formData.discountPercentage,
        description: formData.description,
        category: formData.category,
        userId: session.user.id,
        customerId: customer.id,
        items: {
          create: formData.items.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            taxRate: item.taxRate,
            totalAmount: item.price * item.quantity,
            category: item.category
          }))
        }
      }
    });

    // Calculate and update rewards after transaction is created
    const rewardCalculation = await calculateRewards(
      session.user.id, 
      totalAmount,
      transaction.id
    );

    if (rewardCalculation.rewardAmount > 0) {
      // Update transaction with reward info
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          reward: {
            amount: rewardCalculation.rewardAmount,
            type: rewardCalculation.rewardType,
            description: rewardCalculation.description,
            expiresAt: rewardCalculation.expiresAt
          }
        }
      });

      // Update customer rewards
      await updateCustomerRewards(
        customer,
        session.user.id,
        rewardCalculation
      );
    }

    revalidatePath('/dashboard/transaction');
    return { success: true, data: transaction };
  } catch (error) {
    console.error('Failed to create transaction:', error);
    return { error: 'Failed to create transaction' };
  }
}

export async function updateTransaction(id: string, formData: any) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Unauthorized' };
    }

    const currentTransaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        items: true,
        customer: true
      }
    });

    if (!currentTransaction) {
      return { error: 'Transaction not found' };
    }

    // Create audit record
    await prisma.transactionAudit.create({
      data: {
        transactionId: id,
        userId: session.user.id,
        originalValues: currentTransaction as any
      }
    });

    const totalAmount = calculateTotalAmount(formData.items, formData.discountPercentage);
    
    // Handle customer updates if phone number changed
    let customerId = currentTransaction.customerId;
    if (currentTransaction.phone !== formData.phone) {
      let customer = await prisma.customer.findFirst({
        where: {
          phone: formData.phone,
          userId: session.user.id
        }
      });

      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            phone: formData.phone,
            isActive: true,
            userId: session.user.id
          }
        });
      }

      customerId = customer.id;

      // Calculate new rewards
      const rewardCalculation = await calculateRewards(
        session.user.id, 
        totalAmount,
        id
      );

      if (rewardCalculation.rewardAmount > 0) {
        // Update customer rewards
        await updateCustomerRewards(
          customer,
          session.user.id,
          rewardCalculation
        );
      }
    }

    // Delete existing items
    await prisma.transactionItem.deleteMany({
      where: { transactionId: id }
    });

    // Update transaction
    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        phone: formData.phone,
        type: formData.type,
        amount: totalAmount,
        discountPercentage: formData.discountPercentage,
        description: formData.description,
        category: formData.category,
        customerId,
        items: {
          create: formData.items.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            taxRate: item.taxRate,
            totalAmount: item.price * item.quantity,
            category: item.category
          }))
        }
      }
    });

    revalidatePath('/dashboard/transaction');
    return { success: true, data: transaction };
  } catch (error) {
    console.error('Failed to update transaction:', error);
    return { error: 'Failed to update transaction' };
  }
}

export async function deleteTransaction(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Unauthorized' };
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        items: true,
        customer: true
      }
    });

    if (!transaction) {
      return { error: 'Transaction not found' };
    }

    // Create audit record
    await prisma.transactionAudit.create({
      data: {
        transactionId: id,
        userId: session.user.id,
        originalValues: transaction as any
      }
    });

    // Delete related records
    await prisma.$transaction([
      prisma.transactionItem.deleteMany({
        where: { transactionId: id }
      }),
      prisma.invoiceGeneration.deleteMany({
        where: { transactionId: id }
      }),
      prisma.transaction.delete({
        where: { id }
      })
    ]);

    revalidatePath('/dashboard/transaction');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete transaction:', error);
    return { error: 'Failed to delete transaction' };
  }
}

export async function updateRewardPolicy(data: RewardPolicyData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Unauthorized' };
    }

    // Clean up config based on policy type
    let cleanConfig = {};
    let expiryDays: number | null = null;

    switch (data.type) {
      case 'PERCENTAGE_DISCOUNT':
      case 'PERCENTAGE_CREDIT':
        cleanConfig = {
          percentage: data.config.percentage || 0
        };
        if (data.type === 'PERCENTAGE_CREDIT') {
          expiryDays = data.expiry || 365;
        }
        break;

      case 'FIXED_DISCOUNT':
      case 'FIXED_CREDIT':
      case 'FLAT_DISCOUNT':
        cleanConfig = {
          amount: data.config.amount || 0
        };
        if (data.type === 'FIXED_CREDIT') {
          expiryDays = data.expiry || 365;
        }
        break;

      case 'POINT_BASED':
        cleanConfig = {
          pointsPerRupee: data.config.pointsPerRupee || 0,
          rupeesPerPoint: data.config.rupeesPerPoint || 0
        };
        expiryDays = data.expiry || 365;
        break;

      case 'CUSTOM':
        cleanConfig = {
          rules: data.config.rules || ''
        };
        break;

      case 'NONE':
        cleanConfig = {};
        break;
    }

    // Find existing policy
    const existingPolicy = await prisma.rewardPolicy.findFirst({
      where: { userId: session.user.id }
    });

    const baseData = {
      type: data.type,
      config: cleanConfig,
      name: `${data.type} Policy`,
      isActive: true,
      expiry: expiryDays,
      expiresAt: expiryDays ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000) : null
    };

    if (existingPolicy) {
      const policy = await prisma.rewardPolicy.update({
        where: { id: existingPolicy.id },
        data: baseData
      });
      
      return { success: true, data: policy };
    } else {
      const policy = await prisma.rewardPolicy.create({
        data: {
          ...baseData,
          userId: session.user.id
        }
      });
      
      revalidatePath('/dashboard/transaction');
      return { success: true, data: policy };
    }
  } catch (error) {
    console.error('Failed to update reward policy:', error);
    return { error: 'Failed to update reward policy' };
  }
}