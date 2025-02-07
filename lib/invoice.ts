import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import QRCode from 'qrcode';

const generateQRCodeDataURL = async (url: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(url, {
      width: 100,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

const splitTextToFitWidth = (
  doc: jsPDF,
  text: string,
  maxWidth: number
): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = doc.getTextWidth(currentLine + ' ' + word);
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
};

const formatAddress = (addressObj: any): string => {
  try {
    if (typeof addressObj === 'string') {
      addressObj = JSON.parse(addressObj);
    }
    
    const parts = [];
    if (addressObj.street) parts.push(addressObj.street);
    if (addressObj.city) parts.push(addressObj.city);
    if (addressObj.state) parts.push(addressObj.state);
    if (addressObj.country) parts.push(addressObj.country);
    if (addressObj.pincode) parts.push(addressObj.pincode);
    
    return parts.join(', ');
  } catch (error) {
    return addressObj?.toString() || '';
  }
};

const addHeader = (doc: jsPDF, data: any, margin: number, pageWidth: number): number => {
  let yPos = margin;
  const contentWidth = pageWidth - margin * 2;

  // Company Logo
  if (data.user.companyDetails?.companyLogo) {
    doc.addImage(
      data.user.companyDetails.companyLogo,
      'PNG',
      pageWidth - margin - 20,
      margin + 3,
      18,
      18
    );
  }

  // Company Header
  if (data.user.companyDetails?.companyName) {
    doc.setFontSize(16);
    doc.setTextColor(44, 62, 80);
    doc.setFont('helvetica', 'bold');
    doc.text(data.user.companyDetails.companyName, margin + 3, yPos + 12);
    yPos += 20;
  }

  // Company Address and Contact
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);

  // Address
  const address = formatAddress(data.user.companyDetails?.companyAddress);
  if (address) {
    const addressLines = splitTextToFitWidth(doc, address, contentWidth / 2);
    addressLines.forEach((line) => {
      if (line.trim()) {
        doc.text(line, margin + 3, yPos);
        yPos += 4;
      }
    });
    yPos += 3;
  }

  // Contact Details
  const contactDetails = [];
  if (data.user.phone) contactDetails.push(`Tel: ${data.user.phone}`);
  if (data.user.email) contactDetails.push(`Email: ${data.user.email}`);
  
  const taxDetails = data.user.companyDetails?.taxDetails?.[0];
  if (taxDetails?.taxNumber) contactDetails.push(`Tax Number: ${taxDetails.taxNumber}`);
  if (taxDetails?.taxType) contactDetails.push(`Tax Type: ${taxDetails.taxType}`);

  contactDetails.forEach((text) => {
    doc.text(text, margin + 3, yPos);
    yPos += 4;
  });

  return yPos;
};

const addFooter = (doc: jsPDF, pageWidth: number, pageHeight: number) => {
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  const footer = 'This is a computer-generated invoice and does not require a physical signature.';
  const footerWidth = doc.getTextWidth(footer);
  doc.text(footer, (pageWidth - footerWidth) / 2, pageHeight - 15);
};

export const generateInvoicePDF = async (data: any) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 12;
    const contentWidth = pageWidth - margin * 2;

    let yPos = addHeader(doc, data, margin, pageWidth);

    // Invoice Title
    yPos += 15;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(44, 62, 80);
    const title = 'INVOICE';
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, yPos);

    const rectStartY = yPos + 5;
    yPos += 12;

    // Invoice Details
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);

    const date = new Date(data.createdAt);
    const formattedDate = format(date, 'yyyyMMdd');
    const shortId = data.id.split('-')[0];
    const referenceNumber = `INV-${formattedDate}-${shortId}`;

    const leftColX = margin + 3;
    const rightColX = pageWidth - margin - 35;

    doc.text(`Ref No: ${referenceNumber}`, leftColX, yPos);
    doc.text(`Date: ${format(date, 'dd/MM/yyyy')}`, rightColX, yPos);

    // Customer Details
    yPos += 12;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(44, 62, 80);
    doc.text('Bill To:', leftColX, yPos);

    yPos += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);

    const customerDetails = [];
    if (data.customer?.name) customerDetails.push(`Name: ${data.customer.name}`);
    
    const customerAddress = formatAddress(data.customer?.address);
    if (customerAddress) customerDetails.push(`Address: ${customerAddress}`);
    
    if (data.customer?.phone) customerDetails.push(`Phone: ${data.customer.phone}`);
    if (data.customer?.email) customerDetails.push(`Email: ${data.customer.email}`);
    if (data.customer?.taxNumber) customerDetails.push(`Tax Number: ${data.customer.taxNumber}`);

    customerDetails.forEach((detail) => {
      doc.text(detail, leftColX, yPos);
      yPos += 5;
    });

    // Items Table
    yPos += 10;
    autoTable(doc, {
      startY: yPos,
      margin: { left: margin + 3, right: margin + 3 },
      head: [
        [
          { content: 'S.No', styles: { halign: 'center' } },
          { content: 'Items', styles: { halign: 'left' } },
          { content: 'Qty', styles: { halign: 'center' } },
          { content: 'Price', styles: { halign: 'right' } },
          { content: 'Subtotal', styles: { halign: 'right' } },
          { content: 'Disc %', styles: { halign: 'center' } },
          { content: 'Disc Amt', styles: { halign: 'right' } },
          { content: 'Tax %', styles: { halign: 'center' } },
          { content: 'Tax Type', styles: { halign: 'center' } },
          { content: 'Tax Amt', styles: { halign: 'right' } },
          { content: 'Total', styles: { halign: 'right' } }
        ]
      ],
      body: data.items,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
        font: 'helvetica'
      },
      headStyles: {
        fillColor: [244, 244, 244],
        textColor: [44, 62, 80],
        fontStyle: 'bold',
        lineWidth: 0.1
      },
      bodyStyles: {
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 10 },
        3: { cellWidth: 15 },
        4: { cellWidth: 15 },
        5: { cellWidth: 12 },
        6: { cellWidth: 15 },
        7: { cellWidth: 12 },
        8: { cellWidth: 15 },
        9: { cellWidth: 15 },
        10: { cellWidth: 18 }
      },
      didDrawPage: (data) => {
        data.settings.margin.top = margin;
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 8;
    const summaryHeight = 50;
    const termsHeight = data.description ? 40 : 0;
    const qrCodeHeight = 45;
    const footerHeight = 20;
    const totalRequiredSpace = summaryHeight + termsHeight + qrCodeHeight + footerHeight;

    let summaryYPos: number;
    
    if (finalY + totalRequiredSpace > pageHeight) {
      doc.addPage();
      summaryYPos = margin + 10;
    } else {
      summaryYPos = finalY + 10;
    }

    // Summary Section
    const summaryBoxX = pageWidth - margin - 80;
    const summaryBoxWidth = 75;
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(250, 250, 250);
    doc.rect(summaryBoxX, summaryYPos, summaryBoxWidth, 32, 'F');

    const addSummaryLine = (label: string, value: number) => {
      doc.setFont('helvetica', 'normal');
      doc.text(label, summaryBoxX + 3, summaryYPos + 5);
      doc.setFont('helvetica', 'bold');
      doc.text(
        `${value.toFixed(2)}`,
        summaryBoxX + summaryBoxWidth - 3,
        summaryYPos + 5,
        { align: 'right' }
      );
      summaryYPos += 8;
    };

    addSummaryLine('Subtotal:', data.subtotal);
    addSummaryLine('Discount:', data.discountAmount);
    addSummaryLine('Tax:', data.tax);

    summaryYPos += 2;
    doc.setFillColor(244, 244, 244);
    doc.rect(summaryBoxX, summaryYPos - 4, summaryBoxWidth, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Total:', summaryBoxX + 3, summaryYPos + 2);
    doc.text(
      `${data.total.toFixed(2)}`,
      summaryBoxX + summaryBoxWidth - 3,
      summaryYPos + 2,
      { align: 'right' }
    );

    // Content Border
    const totalPages = (doc.internal as any).getNumberOfPages();
    const qrCodeY = doc.internal.pageSize.getHeight() - margin - 45;
    
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.1);
      
      if (i === 1) {
        doc.rect(
          margin,
          rectStartY,
          pageWidth - (margin * 2),
          i === totalPages ? qrCodeY - rectStartY - 10 : pageHeight - rectStartY - margin
        );
      } else if (i === totalPages) {
        doc.rect(
          margin,
          margin,
          pageWidth - (margin * 2),
          qrCodeY - margin - 10
        );
      } else {
        doc.rect(
          margin,
          margin,
          pageWidth - (margin * 2),
          pageHeight - (margin * 2)
        );
      }
    }

    // Terms & Conditions
    if (data.description) {
      const termsY = qrCodeY - 30;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Terms & Conditions:', margin + 3, termsY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const terms = splitTextToFitWidth(doc, data.description, contentWidth - 85);
      let currentY = termsY + 5;
      terms.forEach((line) => {
        doc.text(line, margin + 3, currentY);
        currentY += 4;
      });
    }

    // QR Code
    const qrCodeDataURL = await generateQRCodeDataURL(
      `${process.env.NEXT_PUBLIC_API_URL}/api/invoice-reference/${referenceNumber}`
    );
    const qrCodeSize = 20;
    const qrCodeX = (pageWidth - qrCodeSize) / 2;
    doc.addImage(qrCodeDataURL, 'PNG', qrCodeX, qrCodeY, qrCodeSize, qrCodeSize);

    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'Scan QR code to view digital invoice',
      pageWidth / 2,
      qrCodeY + qrCodeSize + 5,
      { align: 'center' }
    );
    // Footer
    addFooter(doc, pageWidth, pageHeight);

    const pdfBuffer = doc.output('arraybuffer');
    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};