'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import { createTransaction, updateTransaction } from '../actions';
import { toast } from 'sonner';
import { Transaction, TransactionItem } from '@/constants/data';
import { useRouter } from 'next/navigation';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { BadgeIndianRupee, CreditCard, Banknote, Smartphone, HelpCircle } from 'lucide-react';

const transactionItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  quantity: z
    .number()
    .min(1, 'Quantity must be at least 1')
    .or(z.string().regex(/^\d+$/).transform(Number))
    .refine((val) => val >= 1, {
      message: 'Quantity must be at least 1'
    }),
  price: z
    .number()
    .min(0, 'Price cannot be negative')
    .or(z.string().regex(/^\d*\.?\d*$/).transform(Number))
    .refine((val) => val >= 0, {
      message: 'Price cannot be negative'
    }),
  taxRate: z
    .number()
    .min(0, 'Tax rate cannot be negative')
    .max(100, 'Tax rate cannot exceed 100%')
    .or(z.string().regex(/^\d*\.?\d*$/).transform(Number))
    .refine((val) => val >= 0 && val <= 100, {
      message: 'Tax rate must be between 0 and 100'
    }),
  category: z.string().optional()
});

const formSchema = z.object({
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(10, 'Phone number must not exceed 10 digits')
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number'),
  type: z.enum(['CASH', 'UPI', 'CREDIT', 'DEBIT', 'OTHER'], {
    required_error: 'Please select a transaction type'
  }),
  discountPercentage: z
    .number()
    .min(0, 'Discount cannot be negative')
    .max(100, 'Discount cannot exceed 100%')
    .or(z.string().regex(/^\d*\.?\d*$/).transform(Number))
    .refine((val) => val >= 0 && val <= 100, {
      message: 'Discount must be between 0 and 100'
    })
    .default(0),
  description: z.string().optional(),
  category: z.string().optional(),
  items: z.array(transactionItemSchema).min(1, 'At least one item is required')
});

type FormValues = z.infer<typeof formSchema>;

interface TransactionFormProps {
  initialData?: Transaction & {
    items: TransactionItem[];
  } | null;
}

export default function TransactionForm({ initialData }: TransactionFormProps) {
  const router = useRouter();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      phone: initialData.phone,
      type: initialData.type,
      discountPercentage: initialData.discountPercentage,
      description: initialData.description || '',
      category: initialData.category || '',
      items: initialData.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        taxRate: item.taxRate,
        category: item.category || ''
      }))
    } : {
      type: 'CASH',
      discountPercentage: 0,
      items: [{ name: '', quantity: 1, price: 0, taxRate: 0, category: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    name: 'items',
    control: form.control
  });

  const watchItems = form.watch('items');
  const watchDiscountPercentage = form.watch('discountPercentage');

  const calculateTotals = React.useCallback(() => {
    const subtotal = watchItems?.reduce((sum, item) => {
      const itemTotal = (item.price || 0) * (item.quantity || 0);
      return sum + itemTotal;
    }, 0) || 0;

    const discount = (subtotal * (watchDiscountPercentage || 0)) / 100;

    const taxTotal = watchItems?.reduce((sum, item) => {
      const itemTotal = (item.price || 0) * (item.quantity || 0);
      const itemTax = (itemTotal * (item.taxRate || 0)) / 100;
      return sum + itemTax;
    }, 0) || 0;

    const total = subtotal - discount + taxTotal;

    return { subtotal, discount, taxTotal, total };
  }, [watchItems, watchDiscountPercentage]);

  const totals = calculateTotals();

  async function onSubmit(values: FormValues) {
    try {
      if (initialData) {
        const result = await updateTransaction(initialData.id, values);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success('Transaction updated successfully');
          router.push('/dashboard/transaction');
          router.refresh();
        }
      } else {
        const result = await createTransaction(values);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success('Transaction created successfully');
          form.reset();
          router.push('/dashboard/transaction');
          router.refresh();
        }
      }
    } catch (error) {
      toast.error('Failed to save transaction');
    }
  }

  const transactionTypes = [
    { id: 'CASH', label: 'Cash', icon: BadgeIndianRupee },
    { id: 'UPI', label: 'UPI', icon: Smartphone },
    { id: 'CREDIT', label: 'Credit', icon: CreditCard },
    { id: 'DEBIT', label: 'Debit', icon: Banknote },
    { id: 'OTHER', label: 'Other', icon: HelpCircle },
  ];

  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl font-bold">
          {initialData ? 'Edit Transaction' : 'New Transaction'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm md:text-base">Phone Number *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter 10-digit phone number"
                        {...field}
                        maxLength={10}
                        inputMode="numeric"
                        className="bg-muted/50 border-none h-10 md:h-11 text-sm md:text-base"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm md:text-base">Transaction Type *</FormLabel>
                    <div className="bg-muted/50 border-none rounded-lg p-1 md:p-2">
                      <RadioGroup
                        className="grid grid-cols-3 gap-1 md:grid-cols-5 md:gap-2"
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        {transactionTypes.map((type) => (
                          <FormItem key={type.id} className="flex flex-col items-center space-y-1">
                            <RadioGroupItem value={type.id} id={type.id} className="hidden" />
                            <label
                              htmlFor={type.id}
                              className={`cursor-pointer w-full flex flex-col items-center gap-1 ${
                                field.value === type.id ? 'text-primary' : 'text-muted-foreground'
                              }`}
                            >
                              <div className={`
                                w-full p-1 md:p-2 rounded-md border-2 flex items-center justify-center
                                ${field.value === type.id 
                                  ? 'border-primary bg-primary/10' 
                                  : 'border-muted/50 bg-background hover:border-primary/30'}
                                transition-colors
                              `}>
                                <type.icon className="h-3 w-3 md:h-4 md:w-4" />
                              </div>
                              <span className="text-xs text-center leading-tight">{type.label}</span>
                            </label>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </div>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base md:text-lg font-semibold">Items</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs md:text-sm"
                  onClick={() =>
                    append({
                      name: '',
                      quantity: 1,
                      price: 0,
                      taxRate: 0,
                      category: ''
                    })
                  }
                >
                  <Plus className="mr-1 h-3 w-3 md:h-4 md:w-4" />
                  Add Item
                </Button>
              </div>

              <div className="hidden md:block">
                <Table className="border rounded-lg">
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="text-xs md:text-sm">Name *</TableHead>
                      <TableHead className="text-xs md:text-sm">Quantity *</TableHead>
                      <TableHead className="text-xs md:text-sm">Price *</TableHead>
                      <TableHead className="text-xs md:text-sm">Tax Rate (%)</TableHead>
                      <TableHead className="text-xs md:text-sm">Category</TableHead>
                      <TableHead className="text-xs md:text-sm">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id} className="hover:bg-muted/10">
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    className="bg-muted/50 border-none h-8 md:h-10 text-xs md:text-sm"
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    {...field}
                                    className="bg-muted/50 border-none h-8 md:h-10 text-xs md:text-sm"
                                    onChange={(e) =>
                                      field.onChange(Number(e.target.value))
                                    }
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.price`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    {...field}
                                    className="bg-muted/50 border-none h-8 md:h-10 text-xs md:text-sm"
                                    onChange={(e) =>
                                      field.onChange(Number(e.target.value))
                                    }
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.taxRate`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    {...field}
                                    className="bg-muted/50 border-none h-8 md:h-10 text-xs md:text-sm"
                                    onChange={(e) =>
                                      field.onChange(Number(e.target.value))
                                    }
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.category`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    className="bg-muted/50 border-none h-8 md:h-10 text-xs md:text-sm"
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-2"
                            onClick={() => remove(index)}
                            disabled={fields.length === 1}
                          >
                            <Trash2 className="h-3 w-3 md:h-4 md:w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Items List */}
              <div className="md:hidden space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id} className="relative bg-muted/10 p-4">
                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.name`}
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel className="text-xs">Name *</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="bg-background h-8 text-xs"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Qty *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                className="bg-background h-8 text-xs"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Price *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                className="bg-background h-8 text-xs"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.taxRate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Tax (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                className="bg-background h-8 text-xs"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.category`}
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel className="text-xs">Category</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="bg-background h-8 text-xs"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-1"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="discountPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm md:text-base">Discount %</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        className="bg-muted/50 border-none h-10 md:h-11 text-sm md:text-base"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <Card className="bg-muted/10 border-primary/20">
                <CardContent className="p-4 md:pt-4">
                  <div className="space-y-2 text-sm md:text-base">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{totals.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span className="text-green-500">-₹{totals.discount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span className="text-red-500">+₹{totals.taxTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-2">
                      <span>Total:</span>
                      <span className="text-primary">₹{totals.total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base">Description</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-muted/50 border-none h-10 md:h-11 text-sm md:text-base"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base">Category</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-muted/50 border-none h-10 md:h-11 text-sm md:text-base"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-11 text-sm md:text-base">
              {initialData ? 'Update Transaction' : 'Create Transaction'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}