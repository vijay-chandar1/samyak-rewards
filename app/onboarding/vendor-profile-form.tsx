'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { CircleUser, ArrowRight, ArrowLeft } from 'lucide-react';

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

export default function MultiStepProfileForm({
  initialData,
  pageTitle = 'Business Profile Setup'
}: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [countryId, setCountryId] = useState<number>(0);
  const [stateId, setStateId] = useState<number>(0);
  const [initialLocationSet, setInitialLocationSet] = useState(false);
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

  useEffect(() => {
    if (initialData?.companyDetails?.companyAddress && !initialLocationSet) {
      try {
        const address = JSON.parse(initialData.companyDetails.companyAddress);
        if (address.country) {
          setSelectedCountry({ name: address.country });
          form.setValue('address.country', address.country);
          if (address.state) {
            setSelectedState({ name: address.state });
            form.setValue('address.state', address.state);
            if (address.city) {
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

      toast.success('Business profile saved successfully');
      router.push('/upgrade');
      router.refresh();
    } catch (error) {
      console.error('Profile submission error:', error);
      toast.error('Failed to save profile information');
    } finally {
      setLoading(false);
    }
  }

  const handleCountryChange = (country: any) => {
    setCountryId(country.id);
    setSelectedCountry(country);
    form.setValue('address.country', country.name);
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
    setSelectedCity(null);
    form.setValue('address.city', '');
  };

  const handleCityChange = (city: any) => {
    setSelectedCity(city);
    form.setValue('address.city', city.name);
  };

  const validateFirstStep = () => {
    const phoneNumber = form.getValues('phoneNumber');
    const companyName = form.getValues('companyName');
    const errors: string[] = [];

    if (!phoneNumber || !/^[6-9]\d{9}$/.test(phoneNumber)) {
      errors.push('Please enter a valid phone number');
    }

    if (!companyName || companyName.length < 2) {
      errors.push('Please enter a valid company name');
    }

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return false;
    }

    return true;
  };

  const goToNextStep = () => {
    if (currentStep === 1 && validateFirstStep()) {
      setCurrentStep(2);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderFirstStep = () => (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="companyLogo"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm font-medium dark:text-white">Company Logo</FormLabel>
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
                className="w-full h-32 border-2 border-dashed rounded-lg hover:border-blue-500 transition-colors
                          dark:border-gray-600 dark:hover:border-blue-400 dark:bg-gray-700"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium dark:text-white">Phone Number *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter phone number"
                  {...field}
                  type="tel"
                  maxLength={10}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium dark:text-white">Company Name *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter company name"
                  {...field}
                  maxLength={100}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </div>

      <Button 
        type="button" 
        onClick={goToNextStep} 
        className="w-full bg-blue-600 hover:bg-blue-700 transition-colors dark:bg-blue-700 dark:hover:bg-blue-800"
      >
        Next Step <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );

  const renderSecondStep = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-white">
          Address Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="address.street"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium dark:text-white">Street Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter street address"
                    {...field}
                    maxLength={200}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address.country"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium dark:text-white">Country</FormLabel>
                <FormControl>
                  <div className="border rounded-md hover:border-blue-500 transition-colors dark:border-gray-600">
                    <CountrySelect
                      onChange={handleCountryChange}
                      placeHolder="Select Country"
                      defaultValue={selectedCountry}
                      inputClassName="w-full p-2 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address.state"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium dark:text-white">State</FormLabel>
                <FormControl>
                  <div className="border rounded-md hover:border-blue-500 transition-colors dark:border-gray-600">
                    <StateSelect
                      countryid={countryId}
                      onChange={handleStateChange}
                      placeHolder="Select State"
                      defaultValue={selectedState}
                      inputClassName="w-full p-2 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address.city"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium dark:text-white">City</FormLabel>
                <FormControl>
                  <div className="border rounded-md hover:border-blue-500 transition-colors dark:border-gray-600">
                    <CitySelect
                      countryid={countryId}
                      stateid={stateId}
                      onChange={handleCityChange}
                      placeHolder="Select City"
                      defaultValue={selectedCity}
                      inputClassName="w-full p-2 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address.pincode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium dark:text-white">Pincode</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter pincode"
                    {...field}
                    maxLength={6}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-white">
          Tax Details
        </h3>
        {form.watch('taxDetails')?.map((_, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border dark:bg-gray-800 dark:border-gray-700">
            <FormField
              control={form.control}
              name={`taxDetails.${index}.taxType`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium dark:text-white">Preferred Tax Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <SelectValue placeholder="Select tax type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      {['IGST', 'CGST', 'SGST', 'UTGST', 'VAT', 'OTHER', 'NONE'].map((type) => (
                        <SelectItem 
                          key={type} 
                          value={type}
                          className="dark:hover:bg-gray-700 dark:focus:bg-gray-700 dark:text-white"
                        >
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`taxDetails.${index}.taxNumber`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium dark:text-white">Tax Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter tax number"
                      {...field}
                      maxLength={15}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col-reverse md:flex-row gap-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={goToPreviousStep} 
          className="w-full md:w-auto dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <Button 
          type="submit" 
          className="w-full md:w-auto md:ml-auto bg-blue-600 hover:bg-blue-700 transition-colors dark:bg-blue-700 dark:hover:bg-blue-800 text-white" 
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center text-white">
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : initialData ? 'Update Profile' : 'Complete Setup'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <Card className="w-full shadow-xl border-0 bg-white/90 backdrop-blur-sm dark:bg-gray-800/90 dark:border-gray-700">
          <CardHeader className="text-center space-y-4">
            <div className="inline-flex items-center justify-center bg-blue-100 p-4 rounded-full dark:bg-blue-900/50">
              <CircleUser className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
                {pageTitle}
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-200">
                Complete your business profile to unlock full features
              </CardDescription>
            </div>
            
            <div className="flex justify-center items-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep === 1 
                  ? 'bg-blue-600 text-white dark:bg-blue-500' 
                  : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                1
              </div>
              <div className="h-px w-8 bg-gray-200 dark:bg-gray-600" />
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep === 2 
                  ? 'bg-blue-600 text-white dark:bg-blue-500' 
                  : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                2
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="max-h-[70vh] overflow-y-auto">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {currentStep === 1 ? renderFirstStep() : renderSecondStep()}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}