'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { createGiftCard, updateGiftCard } from './actions';
import { toast } from 'sonner';
import { GiftCard } from '@prisma/client';
import { useEffect } from 'react';

const giftCardSchema = z.object({
  amount: z.number()
    .min(100, "Minimum amount is ₹100")
    .max(100000, "Maximum amount is ₹100,000"),
  description: z.string()
    .min(1, "Description is required")
    .max(500, "Description cannot exceed 500 characters"),
  validityDays: z.number()
    .min(1, "Validity must be at least 1 day")
    .max(3650, "Validity cannot exceed 10 years"),
  terms: z.string().max(1000, "Terms cannot exceed 1000 characters").optional(),
});

type GiftCardFormValues = z.infer<typeof giftCardSchema>;

interface GiftCardFormProps {
  initialData?: Partial<GiftCard>;
  onSuccess?: () => void;
}

export default function GiftCardForm({ initialData, onSuccess }: GiftCardFormProps) {
  const isEdit = !!initialData?.id;

  const form = useForm<GiftCardFormValues>({
    resolver: zodResolver(giftCardSchema),
    defaultValues: {
      amount: 500,
      description: '',
      validityDays: 30,
      terms: ''
    }
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        amount: initialData.amount || 500,
        description: initialData.description || '',
        validityDays: initialData.validityDays || 30,
        terms: initialData.terms || ''
      });
    }
  }, [initialData, form]);

  const handleSubmit = async (values: GiftCardFormValues) => {
    try {
      if (isEdit && initialData?.id) {
        await updateGiftCard(initialData.id, values);
      } else {
        await createGiftCard(values);
      }
      
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} gift card: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(handleSubmit)} 
        className="space-y-6 p-4"
        noValidate // Disable browser validation
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount (₹)</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    min="100"
                    step="100"
                    {...field}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      field.onChange(isNaN(value) ? 0 : value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="validityDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Validity (Days)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    {...field}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      field.onChange(isNaN(value) ? 0 : value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Terms & Conditions</FormLabel>
                <FormControl>
                  <Textarea {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onSuccess?.()}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={form.formState.isSubmitting}
            aria-disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Processing...' : isEdit ? 'Update' : 'Create'} Gift Card
          </Button>
        </div>
      </form>
    </Form>
  );
}