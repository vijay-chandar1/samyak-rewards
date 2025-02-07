// app/components/forms/customer-form.tsx
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Customer } from '@/constants/data';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCustomer, updateCustomer  } from '../actions';

const formSchema = z.object({
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, { message: 'Phone number must be exactly 10 digits' })
    .refine(
      (value) => {
        const invalidPatterns = [
          /^0{10}$/, // All zeros
          /^1{10}$/, // All ones
          /^2{10}$/ // All twos
        ];
        return !invalidPatterns.some((pattern) => pattern.test(value));
      },
      { message: 'Invalid phone number' }
    ),
  name: z
    .string()
    .optional()
    .refine(
      (value) =>
        value === undefined || value === '' || /^[a-zA-Z\s'-]+$/.test(value),
      {
        message: 'Name can only contain letters, spaces, hyphens, and apostrophes'
      }
    ),
  email: z
    .union([
      z.string().email({ message: 'Invalid email address' }),
      z.string().length(0, { message: '' }),
      z.undefined()
    ])
    .optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'NA']).optional(),
  taxNumber: z
    .string()
    .max(15, { message: 'Tax Number cannot exceed 15 characters' })
    .regex(/^[0-9A-Z]*$/, {
      message: 'Tax Number can only contain numbers and uppercase letters'
    })
    .optional()
});

interface CustomerFormProps {
  initialData?: Customer;
  pageTitle?: string;
}

export function CustomerForm({
  initialData,
  pageTitle = initialData ? 'Update Customer' : 'Create New Customer'
}: CustomerFormProps) {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: initialData?.phone || '',
      name: initialData?.name || '',
      email: initialData?.email || '',
      gender: initialData?.gender || 'NA',
      taxNumber: initialData?.taxNumber || ''
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      const result = initialData
        ? await updateCustomer(initialData.id, formData)
        : await createCustomer(formData);

      if (result.success) {
        toast.success(
          initialData
            ? 'Customer updated successfully'
            : 'Customer created successfully'
        );
        router.push('/dashboard/customer');
        router.refresh();
      } else {
        toast.error(result.error || 'Operation failed');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Form submission error:', error);
    }
  }

  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-left text-2xl font-bold">
          {pageTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter 10-digit phone number"
                        maxLength={10}
                        {...field}
                        onChange={(e) => {
                          const numericValue = e.target.value
                            .replace(/\D/g, '')
                            .slice(0, 10);
                          field.onChange(numericValue);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter customer name"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter email address"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                        <SelectItem value="NA">Not Specified</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="taxNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TAX Number (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter TAX number"
                        maxLength={15}
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const upperCaseValue = e.target.value.toUpperCase();
                          const alphanumericValue = upperCaseValue.replace(
                            /[^0-9A-Z]/g,
                            ''
                          );
                          field.onChange(alphanumericValue);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit">
              {initialData ? 'Update Customer' : 'Create Customer'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}