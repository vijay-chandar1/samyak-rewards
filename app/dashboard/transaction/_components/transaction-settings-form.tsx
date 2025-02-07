'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { RewardPolicyType } from '@prisma/client';
import { updateRewardPolicy } from '../actions';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const rewardTypes = [
  {
    value: 'PERCENTAGE_DISCOUNT',
    label: 'Percentage Discount',
    description: 'Discount as a percentage of transaction value',
    requiresExpiry: false
  },
  {
    value: 'FIXED_DISCOUNT',
    label: 'Fixed Discount',
    description: 'Fixed amount discount on transaction',
    requiresExpiry: false
  },
  {
    value: 'FLAT_DISCOUNT',
    label: 'Flat Discount',
    description: 'Same discount amount regardless of value',
    requiresExpiry: false
  },
  {
    value: 'PERCENTAGE_CREDIT',
    label: 'Percentage Credit',
    description: 'Store credit as percentage of transaction',
    requiresExpiry: true
  },
  {
    value: 'FIXED_CREDIT',
    label: 'Fixed Credit',
    description: 'Fixed amount store credit',
    requiresExpiry: true
  },
  {
    value: 'POINT_BASED',
    label: 'Point Based',
    description: 'Earn points for future redemption',
    requiresExpiry: true
  },
  {
    value: 'CUSTOM',
    label: 'Custom Rules',
    description: 'Define custom reward rules',
    requiresExpiry: true
  },
  {
    value: 'NONE',
    label: 'No Rewards',
    description: 'Disable reward system',
    requiresExpiry: false
  }
];

type RewardPolicySettingsProps = {
  currentPolicy?: {
    id: string;
    type: RewardPolicyType;
    config: any;
    expiry?: number | null;
  } | null;
};

const RewardPolicySettings = ({ currentPolicy }: RewardPolicySettingsProps) => {
  const [open, setOpen] = React.useState(false);

  const form = useForm({
    defaultValues: currentPolicy ? {
      type: currentPolicy.type,
      config: currentPolicy.config,
      expiry: currentPolicy.expiry ?? 365
    } : {
      type: 'NONE' as RewardPolicyType,
      config: {},
      expiry: 365
    }
  });

  const watchType = form.watch('type');
  const currentRewardType = rewardTypes.find(type => type.value === watchType);

  const onSubmit = async (data: any) => {
    try {
      if (!currentRewardType?.requiresExpiry) {
        data.expiry = null;
      }

      const result = await updateRewardPolicy(data);
        
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Reward policy updated');
      setOpen(false);
      form.reset();
      setTimeout(() => {
        window.location.reload();
      }, 600);
    } catch (error) {
      toast.error('Failed to save reward policy');
    }
  };

  const renderConfigFields = () => {
    switch (watchType) {
      case 'PERCENTAGE_DISCOUNT':
      case 'PERCENTAGE_CREDIT':
        return (
          <FormField
            control={form.control}
            name="config.percentage"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-sm md:text-base">Percentage Value (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    className="h-9 md:h-10 text-sm md:text-base"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage className="text-xs md:text-sm" />
              </FormItem>
            )}
          />
        );

      case 'FIXED_DISCOUNT':
      case 'FIXED_CREDIT':
      case 'FLAT_DISCOUNT':
        return (
          <FormField
            control={form.control}
            name="config.amount"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-sm md:text-base">Amount (₹)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    className="h-9 md:h-10 text-sm md:text-base"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage className="text-xs md:text-sm" />
              </FormItem>
            )}
          />
        );

      case 'POINT_BASED':
        return (
          <div className="space-y-3 md:space-y-4">
            <FormField
              control={form.control}
              name="config.pointsPerRupee"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-sm md:text-base">Points per Rupee</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      className="h-9 md:h-10 text-sm md:text-base"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage className="text-xs md:text-sm" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="config.rupeesPerPoint"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-sm md:text-base">Rupees per Point (Redemption)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      className="h-9 md:h-10 text-sm md:text-base"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage className="text-xs md:text-sm" />
                </FormItem>
              )}
            />
          </div>
        );

      case 'CUSTOM':
        return (
          <FormField
            control={form.control}
            name="config.rules"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-sm md:text-base">Custom Rules (JSON)</FormLabel>
                <FormControl>
                  <Input
                    className="h-9 md:h-10 text-sm md:text-base"
                    {...field}
                    placeholder='{"customRule1": "value1"}'
                  />
                </FormControl>
                <FormDescription className="text-xs md:text-sm">
                  Enter custom rules in JSON format
                </FormDescription>
                <FormMessage className="text-xs md:text-sm" />
              </FormItem>
            )}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-9 md:h-10 px-3 md:px-4 text-sm md:text-base">
          <Settings2 className="mr-2 h-3 w-3 md:h-4 md:w-4" />
          Reward Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[425px] p-4 md:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl">Reward Policy Settings</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-sm md:text-base">Reward Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-9 md:h-10 text-sm md:text-base">
                        <SelectValue placeholder="Select reward type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {rewardTypes.map((type) => (
                        <SelectItem 
                          key={type.value} 
                          value={type.value}
                          className="text-sm md:text-base"
                        >
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs md:text-sm">
                    {currentRewardType?.description}
                  </FormDescription>
                  <FormMessage className="text-xs md:text-sm" />
                </FormItem>
              )}
            />

            {watchType !== 'NONE' && (
              <Card>
                <CardContent className="pt-4 md:pt-6 space-y-3 md:space-y-4">
                  {renderConfigFields()}
                  
                  {currentRewardType?.requiresExpiry && (
                    <FormField
                      control={form.control}
                      name="expiry"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel className="text-sm md:text-base">Expiry Period (Days)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              className="h-9 md:h-10 text-sm md:text-base"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription className="text-xs md:text-sm">
                            Number of days until the rewards expire
                          </FormDescription>
                          <FormMessage className="text-xs md:text-sm" />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>
            )}

            <Button 
              type="submit" 
              className="w-full h-9 md:h-10 text-sm md:text-base"
            >
              Update Policy
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default RewardPolicySettings;