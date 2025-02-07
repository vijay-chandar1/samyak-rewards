'use client';

import { createPromotion, updatePromotion } from '../actions';
import { FileUploader } from '@/components/file-uploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Promotion } from '@/constants/data';
import PageContainer from '@/components/layout/page-container';

const formSchema = z
  .object({
    name: z.string().min(2, {
      message: 'Promotion name must be at least 2 characters.'
    }),
    category: z.string().min(1, {
      message: 'Category is required.'
    }),
    originalPrice: z.coerce.number().positive({
      message: 'Original price must be a positive number.'
    }),
    discountPercent: z.coerce.number().min(0).max(100, {
      message: 'Discount percentage must be between 0 and 100.'
    }),
    description: z.string().optional(),
    images: z.array(z.string()).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    isActive: z.boolean().optional().default(true)
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return end >= start;
      }
      return true;
    },
    {
      message: 'End date must be after or equal to start date.',
      path: ['endDate']
    }
  );

type PromotionFormValues = z.infer<typeof formSchema>;

export default function PromotionForm({
  initialData,
  pageTitle
}: {
  initialData: Promotion | null;
  pageTitle: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState(0);

  const defaultValues: Partial<PromotionFormValues> = {
    name: initialData?.name || '',
    category: initialData?.category || '',
    originalPrice: initialData?.originalPrice || 0,
    discountPercent: initialData?.discountPercent || 0,
    description: initialData?.description || '',
    images: initialData?.images || [],
    startDate: initialData?.startDate
      ? new Date(initialData.startDate).toISOString().split('T')[0]
      : '',
    endDate: initialData?.endDate
      ? new Date(initialData.endDate).toISOString().split('T')[0]
      : '',
    isActive: initialData?.isActive ?? true
  };

  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: 'onChange'
  });

  useEffect(() => {
    const originalPrice = form.getValues('originalPrice');
    const discountPercent = form.getValues('discountPercent');
    const calculatedPrice = originalPrice * (1 - discountPercent / 100);
    setCalculatedPrice(Number(calculatedPrice.toFixed(2)));
  }, [form.watch('originalPrice'), form.watch('discountPercent')]);

  async function onSubmit(values: PromotionFormValues) {
    try {
      setLoading(true);

      const submissionData = {
        ...values,
        updatedPrice: calculatedPrice
      };

      const result = initialData
        ? await updatePromotion(initialData.id, submissionData)
        : await createPromotion(submissionData);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success(
        initialData
          ? 'Promotion updated successfully'
          : 'Promotion created successfully'
      );

      router.push('/dashboard/promotion');
      router.refresh();
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to save promotion');
    } finally {
      setLoading(false);
    }
  }

  const categories = [
    { value: 'electronics-appliances', label: 'Electronics & Appliances' },
    { value: 'furniture-home', label: 'Furniture & Home' },
    { value: 'clothing-accessories', label: 'Clothing & Accessories' },
    { value: 'health-beauty', label: 'Health & Beauty' },
    { value: 'groceries-essentials', label: 'Groceries & Essentials' },
    { value: 'sports-outdoors', label: 'Sports & Outdoors' },
    { value: 'toys-kids', label: 'Toys & Kids' },
    { value: 'others', label: 'Others' }
  ];

  return (
    <PageContainer>
      <Card className="mx-auto w-full">
        <CardHeader>
          <CardTitle className="text-left text-2xl font-bold">
            {pageTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <div className="space-y-6">
                    <FormItem className="w-full">
                      <FormLabel>Images</FormLabel>
                      <FormControl>
                        <FileUploader
                          value={field.value}
                          onValueChange={field.onChange}
                          maxFiles={4}
                          maxSize={4 * 1024 * 1024}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </div>
                )}
              />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Promotion Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter promotion name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem
                              key={category.value}
                              value={category.value}
                            >
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="originalPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Original Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Enter original price"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discountPercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Percentage</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          placeholder="Enter discount percentage"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Offer Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={calculatedPrice}
                      disabled
                      placeholder="Auto-calculated offer price"
                    />
                  </FormControl>
                </FormItem>

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          placeholder="Select start date"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          placeholder="Select end date"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Active Promotion
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter product description"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={loading}>
                {initialData ? 'Update Promotion' : 'Add Promotion'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </PageContainer>
  );
}