'use client';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Transaction } from '@/constants/data';
import { Edit, MoreHorizontal, Trash, File } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { deleteTransaction } from '../../actions';
import { generateAndRecordInvoice } from '../../invoice/action';
import { format } from 'date-fns';
import { validateProfileCompletion } from '@/actions/profile-validation';

interface CellActionProps {
  data: Transaction;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const onConfirm = async () => {
    try {
      setLoading(true);
      const result = await deleteTransaction(data.id);
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Transaction deleted successfully');
        router.refresh();
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const handleInvoiceDownload = async () => {
    try {

      // Profile completion check
      const validation = await validateProfileCompletion();

      if (validation.error) {
        toast.error(validation.error);
        router.push('/dashboard/profile');
        return;
      }

      setLoading(true);
      toast.loading('Generating invoice...');

      const date = new Date();
      const formattedDate = format(date, 'yyyyMMdd');
      const shortId = data.id.split('-')[0];
      const referenceNumber = `INV-${formattedDate}-${shortId}`;

      const result = await generateAndRecordInvoice(data.id, referenceNumber);

      if (result.error || !result.pdfBase64) {
        throw new Error(result.error || 'Failed to generate PDF');
      }

      // Convert base64 to blob and download
      const binaryString = window.atob(result.pdfBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${result.referenceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.dismiss();
      toast.success(`Invoice ${result.referenceNumber} downloaded successfully`);
    } catch (error: any) {
      console.error('Invoice download error:', error);
      toast.dismiss();
      toast.error(error.message || 'Failed to download invoice');
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/transaction/${data.id}`)}
          >
            <Edit className="mr-2 h-4 w-4" /> Update
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleInvoiceDownload}>
            <File className="mr-2 h-4 w-4" /> Invoice
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
