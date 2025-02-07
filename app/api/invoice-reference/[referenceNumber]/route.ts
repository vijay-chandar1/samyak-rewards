import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateInvoicePDF } from '@/lib/invoice';
import { auth } from '@/auth';
import QRCode from 'qrcode';

export async function GET(
  request: NextRequest,
  { params }: { params: { referenceNumber: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's geolocation from request headers
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');
    
    // Generate QR code for the invoice reference
    const qrCodeDataUrl = await QRCode.toDataURL(params.referenceNumber);

    // Extract the shortId from the reference number (INV-YYYYMMDD-shortId)
    const shortId = params.referenceNumber.split('-')[2];
    
    if (!shortId) {
      return NextResponse.json(
        { error: 'Invalid reference number format' },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: {
          startsWith: shortId
        }
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
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Calculate totals
    const subtotal = transaction.items.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );
    const discountAmount = (subtotal * transaction.discountPercentage) / 100;
    const tax = transaction.items.reduce(
      (sum, item) => sum + (item.price * item.quantity * item.taxRate / 100),
      0
    );
    const total = subtotal - discountAmount + tax;

    const formattedData = {
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
    };

    // Record invoice generation with specific metadata
    await prisma.invoiceGeneration.create({
      data: {
        transactionId: transaction.id,
        referenceNumber: params.referenceNumber,
        generatedBy: session.user.id,
        metadata: {
          qrCode: qrCodeDataUrl,
          userLocation: {
            ip,
            userAgent,
            timestamp: new Date().toISOString()
          }
        }
      }
    });

    // Generate and return the PDF
    const pdfBuffer = await generateInvoicePDF(formattedData);
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="invoice-${params.referenceNumber}.pdf"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}