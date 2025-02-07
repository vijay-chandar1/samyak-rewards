'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUploader } from '@/components/file-uploader';
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
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { User, TaxType } from '@/constants/data';
import { updateProfile } from './actions';
import {
  CitySelect,
  CountrySelect,
  StateSelect,
} from "react-country-state-city";
import "react-country-state-city/dist/react-country-state-city.css";

const formSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, { message: 'Invalid phone number' })
    .optional(),
  companyName: z
    .string()
    .min(2, { message: 'Company name must be at least 2 characters' })
    .max(100, { message: 'Company name cannot exceed 100 characters' })
    .optional(),
  companyLogo: z.array(z.string()).optional(),
  taxDetails: z.array(z.object({
    taxType: z.enum(['IGST', 'CGST', 'SGST', 'UTGST', 'VAT', 'NONE', 'OTHER']),
    taxNumber: z
      .string()
      .min(15, { message: 'Tax Number must be 15 characters' })
      .max(15, { message: 'Tax Number must be 15 characters' })
      .regex(/^[0-9A-Z]+$/, {
        message: 'Tax Number can only contain numbers and uppercase letters'
      })
  })).optional(),
  address: z
    .object({
      street: z
        .string()
        .max(200, { message: 'Street address too long' })
        .optional(),
      city: z.string().max(50, { message: 'City name too long' }).optional(),
      state: z.string().max(50, { message: 'State name too long' }).optional(),
      country: z.string().max(50, { message: 'Country name too long' }).optional(),
      pincode: z
        .string()
        .regex(/^\d{6}$/, { message: 'Invalid pincode' })
        .optional()
    })
    .optional()
});

type FormValues = z.infer<typeof formSchema>;

interface ProfileFormProps {
  initialData?: User;
  pageTitle?: string;
}

export default function ProfileForm({
  initialData,
  pageTitle = initialData ? 'Update Profile' : 'Complete Your Profile'
}: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [countryId, setCountryId] = useState<number>(0);
  const [stateId, setStateId] = useState<number>(0);
  const [initialLocationSet, setInitialLocationSet] = useState(false);

  // Track selected location items
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [selectedState, setSelectedState] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState<any>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: initialData?.phone || '',
      companyName: initialData?.companyDetails?.companyName || '',
      companyLogo: initialData?.companyDetails?.companyLogo 
        ? [initialData.companyDetails.companyLogo] 
        : [],
      taxDetails: initialData?.companyDetails?.taxDetails || [{
        taxType: 'NONE' as TaxType,
        taxNumber: ''
      }],
      address: initialData?.companyDetails?.companyAddress
        ? JSON.parse(initialData.companyDetails.companyAddress)
        : {
            street: '',
            city: '',
            state: '',
            country: '',
            pincode: ''
          }
    },
    mode: 'onChange'
  });

  // Initialize location data from saved profile
  useEffect(() => {
    if (initialData?.companyDetails?.companyAddress && !initialLocationSet) {
      try {
        const address = JSON.parse(initialData.companyDetails.companyAddress);
        
        if (address.country) {
          // Set country
          setSelectedCountry({ name: address.country });
          form.setValue('address.country', address.country);

          if (address.state) {
            // Set state
            setSelectedState({ name: address.state });
            form.setValue('address.state', address.state);

            if (address.city) {
              // Set city
              setSelectedCity({ name: address.city });
              form.setValue('address.city', address.city);
            }
          }
        }
        setInitialLocationSet(true);
      } catch (error) {
        console.error('Error parsing address:', error);
      }
    }
  }, [initialData, form, initialLocationSet]);

  // Handle form submission
  async function onSubmit(values: FormValues) {
    try {
      setLoading(true);

      const validation = formSchema.safeParse(values);
      if (!validation.success) {
        validation.error.errors.forEach((err) => {
          toast.error(err.message);
        });
        return;
      }

      const result = await updateProfile(values);
      
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(
        initialData
          ? 'Profile updated successfully'
          : 'Profile information saved successfully'
      );
      
      router.push('/dashboard/overview');
      router.refresh();
    } catch (error) {
      console.error('Profile submission error:', error);
      toast.error('Failed to save profile information');
    } finally {
      setLoading(false);
    }
  }

  // Handle location selection changes
  const handleCountryChange = (country: any) => {
    setCountryId(country.id);
    setSelectedCountry(country);
    form.setValue('address.country', country.name);
    
    // Reset dependent fields
    setStateId(0);
    setSelectedState(null);
    setSelectedCity(null);
    form.setValue('address.state', '');
    form.setValue('address.city', '');
  };

  const handleStateChange = (state: any) => {
    setStateId(state.id);
    setSelectedState(state);
    form.setValue('address.state', state.name);
    
    // Reset city
    setSelectedCity(null);
    form.setValue('address.city', '');
  };

  const handleCityChange = (city: any) => {
    setSelectedCity(city);
    form.setValue('address.city', city.name);
  };

  return (
    <div className="min-h-screen w-full bg-background p-4 md:p-8 lg:p-12">
      <div className="mx-auto w-full max-w-full">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-left text-3xl font-bold">
              {pageTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                {/* Company Logo Upload */}
                <FormField
                  control={form.control}
                  name="companyLogo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Logo</FormLabel>
                      <FormControl>
                        <FileUploader
                          value={field.value}
                          onValueChange={field.onChange}
                          maxFiles={1}
                          maxSize={2 * 1024 * 1024}
                          accept={{
                            'image/png': ['.png'],
                            'image/jpeg': ['.jpg', '.jpeg'],
                            'image/svg+xml': ['.svg']
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Phone Number */}
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter phone number"
                            {...field}
                            type="tel"
                            maxLength={10}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Company Name */}
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter company name"
                            {...field}
                            maxLength={100}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Tax Details Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Tax Details</h3>
                  {form.watch('taxDetails')?.map((_, index) => (
                    <div key={index} className="grid grid-cols-1 gap-6 md:grid-cols-2 p-4 border rounded-lg">
                      {/* Tax Type */}
                      <FormField
                        control={form.control}
                        name={`taxDetails.${index}.taxType`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tax Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select tax type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="IGST">IGST</SelectItem>
                                <SelectItem value="CGST">CGST</SelectItem>
                                <SelectItem value="SGST">SGST</SelectItem>
                                <SelectItem value="UTGST">UTGST</SelectItem>
                                <SelectItem value="VAT">VAT</SelectItem>
                                <SelectItem value="OTHER">OTHER</SelectItem>
                                <SelectItem value="NONE">NONE</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Tax Number */}
                      <FormField
                        control={form.control}
                        name={`taxDetails.${index}.taxNumber`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tax Number</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter tax number"
                                {...field}
                                maxLength={15}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>

                {/* Address Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Address Details (Optional)
                  </h3>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Street */}
                    <FormField
                      control={form.control}
                      name="address.street"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter street address"
                              {...field}
                              maxLength={200}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Country */}
                    <FormField
                      control={form.control}
                      name="address.country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <div className="shadow-sm rounded-md">
                              <CountrySelect
                                onChange={handleCountryChange}
                                placeHolder="Select Country"
                                defaultValue={selectedCountry}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* State */}
                    <FormField
                      control={form.control}
                      name="address.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <div className="shadow-sm rounded-md">
                              <StateSelect
                                countryid={countryId}
                                onChange={handleStateChange}
                                placeHolder="Select State"
                                defaultValue={selectedState}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* City */}
                    <FormField
                      control={form.control}
                      name="address.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <div className="shadow-sm rounded-md">
                              <CitySelect
                                countryid={countryId}
                                stateid={stateId}
                                onChange={handleCityChange}
                                placeHolder="Select City"
                                defaultValue={selectedCity}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Pincode */}
                    <FormField
                      control={form.control}
                      name="address.pincode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pincode</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter pincode"
                              {...field}
                              maxLength={6}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading
                    ? 'Saving...'
                    : initialData
                    ? 'Update Profile'
                    : 'Complete Profile'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}