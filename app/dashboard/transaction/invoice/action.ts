'use server'
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { generateInvoicePDF } from '@/lib/invoice';
import { revalidatePath } from 'next/cache';

export async function getTransactionDetails(transactionId: string) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: {
        id: transactionId
      },
      include: {
        customer: true,
        items: true,
        user: {
          include: {
            companyDetails: {
              include: {
                taxDetails: true
              }
            }
          }
        }
      }
    });

    if (!transaction) {
      return { error: 'Transaction not found' };
    }

    // Calculate totals
    const subtotal = transaction.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = (subtotal * transaction.discountPercentage) / 100;
    const tax = transaction.items.reduce((sum, item) => sum + (item.price * item.quantity * item.taxRate / 100), 0);
    const total = subtotal - discountAmount + tax;

    return {
      success: true,
      data: {
        ...transaction,
        subtotal,
        discountAmount,
        tax,
        total,
        items: transaction.items.map((item, index) => [
          index + 1,
          item.name,
          item.quantity,
          item.price,
          item.price * item.quantity,
          transaction.discountPercentage,
          (item.price * item.quantity * transaction.discountPercentage) / 100,
          item.taxRate,
          'GST',
          (item.price * item.quantity * item.taxRate) / 100,
          item.totalAmount
        ])
      }
    };
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return { error: 'Failed to fetch transaction details' };
  }
}

export async function generateAndRecordInvoice(transactionId: string, referenceNumber: string) {
    try {
      const session = await auth();
      if (!session?.user?.id) {
        return { error: 'Unauthorized' };
      }
  
      // Get transaction details
      const transactionResult = await getTransactionDetails(transactionId);
      if ('error' in transactionResult) {
        return { error: transactionResult.error };
      }
  
      const transaction = transactionResult.data;
  
      // Record invoice generation (without metadata)
      await prisma.invoiceGeneration.create({
        data: {
          transactionId,
          referenceNumber,
          generatedBy: session.user.id
        }
      });
  
      // Generate PDF and convert to Base64
      const pdfBuffer = await generateInvoicePDF(transaction);
      const base64PDF = pdfBuffer.toString('base64');
  
      revalidatePath('/dashboard/transaction');
      
      return { 
        success: true, 
        pdfBase64: base64PDF,
        referenceNumber 
      };
    } catch (error) {
      console.error('Error generating invoice:', error);
      return { error: 'Failed to generate invoice' };
    }
  }