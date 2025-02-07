'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { createEmployee } from './actions';
import { Plus } from 'lucide-react';
import { Role } from '@prisma/client';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  role: z.nativeEnum(Role)
});

type FormValues = z.infer<typeof formSchema>;

export default function EmployeeForm() {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      role: Role.EMPLOYEE
    },
    mode: 'onChange'
  });

  async function onSubmit(values: FormValues) {
    try {
      setLoading(true);
      const result = await createEmployee(values);
      
      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Employee added successfully');
      form.reset();
      setOpen(false);
      // Trigger global refresh
      window.dispatchEvent(new Event('employeesUpdated'));
    } catch (error) {
      console.error('Employee submission error:', error);
      toast.error('Failed to save employee information');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="mb-4">
          <Plus className="mr-2 h-4 w-4" /> Add Employee
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter email address" 
                      type="email"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(Role).map((role) => (
                        <SelectItem key={role} value={role}>
                          {role.toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Adding...' : 'Add Employee'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}