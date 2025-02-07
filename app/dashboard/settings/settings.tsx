'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Globe, Moon, Sun, Monitor, CreditCard, User, Terminal, DownloadCloud, Trash2, Info } from 'lucide-react';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { updateUserSettings } from './actions';
import { Subscription } from '@prisma/client';
import { Skeleton } from '@/components/ui/skeleton';
import type { Prisma } from '@prisma/client';

type UserSettings = {
  theme?: 'light' | 'dark' | 'system';
  language?: 'en' | 'hi' | 'gu' | 'mr';
  tooltips?: boolean;
};

type LoadingStates = {
  language: boolean;
  theme: boolean;
  tooltips: boolean;
};

export function Settings({ 
  subscription,
  initialSettings 
}: { 
  subscription?: Subscription | null;
  initialSettings?: Prisma.JsonValue; 
}) {
  const { data: session, update } = useSession();
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'system',
    tooltips: true,
    language: 'en',
    ...(initialSettings as UserSettings)
  });
  
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    language: false,
    theme: false,
    tooltips: false
  });

  const handleSettingChange = async (key: keyof UserSettings, value: unknown) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    setLoadingStates(prev => ({ ...prev, [key]: true }));
    
    try {
      await updateUserSettings(session?.user?.email!, newSettings);
      await update({
        ...session,
        user: {
          ...session?.user,
          settings: newSettings
        }
      });
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
    
    setLoadingStates(prev => ({ ...prev, [key]: false }));
  };

  return (
    <Tabs defaultValue="general" className="w-full space-y-4 sm:space-y-6">
      <TabsList className="w-full flex flex-wrap gap-1 sm:gap-2 h-auto p-1 sm:p-2">
        <TabsTrigger value="general" className="flex-1 min-w-[100px] sm:min-w-[140px] text-xs sm:text-sm">
          <Sun className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          General
        </TabsTrigger>
        <TabsTrigger value="billing" className="flex-1 min-w-[100px] sm:min-w-[140px] text-xs sm:text-sm">
          <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          Billing
        </TabsTrigger>
        <TabsTrigger value="profile" className="flex-1 min-w-[100px] sm:min-w-[140px] text-xs sm:text-sm">
          <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="advanced" className="flex-1 min-w-[100px] sm:min-w-[140px] text-xs sm:text-sm">
          <Terminal className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          Advanced
        </TabsTrigger>
      </TabsList>

      {/* General Settings Tab */}
      <TabsContent value="general">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">General Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            {/* Language Section */}
            <div className="flex flex-col space-y-3 sm:space-y-4 p-3 sm:p-4 rounded-lg border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2 text-sm sm:text-base">
                    <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                    Language
                  </Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Select your preferred language
                  </p>
                </div>
                <Select 
                  value={settings?.language || 'en'}
                  onValueChange={(value) => handleSettingChange('language', value as UserSettings['language'])}
                  disabled={loadingStates.language}
                >
                  <SelectTrigger className="w-full sm:w-[180px] text-xs sm:text-sm">
                    {loadingStates.language ? <Skeleton className="h-3 sm:h-4 w-[80px] sm:w-[100px]" /> : <SelectValue />}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="gu">Gujarati</SelectItem>
                    <SelectItem value="mr">Marathi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Theme Section */}
            <div className="flex flex-col space-y-3 sm:space-y-4 p-3 sm:p-4 rounded-lg border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2 text-sm sm:text-base">
                    <Monitor className="w-3 h-3 sm:w-4 sm:h-4" />
                    Theme
                  </Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Customize your interface appearance
                  </p>
                </div>
                <Select 
                  value={settings?.theme || 'system'}
                  onValueChange={(value) => handleSettingChange('theme', value as UserSettings['theme'])}
                  disabled={loadingStates.theme}
                >
                  <SelectTrigger className="w-full sm:w-[180px] text-xs sm:text-sm">
                    {loadingStates.theme ? <Skeleton className="h-3 sm:h-4 w-[80px] sm:w-[100px]" /> : <SelectValue />}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <span className="flex items-center gap-2">
                        <Sun className="w-3 h-3 sm:w-4 sm:h-4" /> Light
                      </span>
                    </SelectItem>
                    <SelectItem value="dark">
                      <span className="flex items-center gap-2">
                        <Moon className="w-3 h-3 sm:w-4 sm:h-4" /> Dark
                      </span>
                    </SelectItem>
                    <SelectItem value="system">
                      <span className="flex items-center gap-2">
                        <Monitor className="w-3 h-3 sm:w-4 sm:h-4" /> System
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tooltips Section */}
            <div className="flex flex-col space-y-3 sm:space-y-4 p-3 sm:p-4 rounded-lg border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2 text-sm sm:text-base">
                    <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                    Tooltips
                  </Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Show helpful tooltips throughout the app
                  </p>
                </div>
                <Switch
                  checked={settings?.tooltips ?? true}
                  onCheckedChange={(value) => handleSettingChange('tooltips', value)}
                  disabled={loadingStates.tooltips}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Billing Settings Tab */}
      <TabsContent value="billing">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Subscription Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            <div className="flex flex-col space-y-3 sm:space-y-4 p-3 sm:p-4 rounded-lg border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="space-y-0.5">
                  <Label className="text-sm sm:text-base">Current Plan</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {subscription?.status === 'TRIAL' ? (
                      `Free Trial (${Math.ceil((new Date(subscription.trialEndsAt!).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining)`
                    ) : subscription?.status === 'PREMIUM' ? (
                      "Pro Plan - ₹999/month"
                    ) : (
                      "Basic Plan"
                    )}
                  </p>
                </div>
                {subscription?.status === 'BASIC' ? (
                  <Button className="w-full sm:w-auto text-xs sm:text-sm">Start Free Trial</Button>
                ) : subscription?.status === 'TRIAL' ? (
                  <Button className="w-full sm:w-auto text-xs sm:text-sm">Upgrade to Pro</Button>
                ) : (
                  <Button variant="outline" className="w-full sm:w-auto text-xs sm:text-sm">
                    Manage Subscription
                  </Button>
                )}
              </div>
            </div>

            {subscription?.status === 'PREMIUM' && (
              <div className="flex flex-col space-y-3 sm:space-y-4 p-3 sm:p-4 rounded-lg border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="space-y-0.5">
                    <Label className="text-sm sm:text-base">Renewal Date</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {new Date(subscription.updatedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <Button variant="destructive" className="w-full sm:w-auto text-xs sm:text-sm">
                    Cancel Subscription
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Profile Settings Tab */}
      <TabsContent value="profile">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Profile Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            <div className="space-y-2 p-3 sm:p-4 rounded-lg border">
              <Label className="text-sm sm:text-base">Name</Label>
              <input
                type="text"
                defaultValue={session?.user?.name || ''}
                className="w-full p-2 border rounded-md mt-2 text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-2 p-3 sm:p-4 rounded-lg border">
              <Label className="text-sm sm:text-base">Email</Label>
              <input
                type="email"
                defaultValue={session?.user?.email || ''}
                className="w-full p-2 border rounded-md mt-2 text-xs sm:text-sm"
                disabled
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Advanced Settings Tab */}
      <TabsContent value="advanced">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Advanced Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            <div className="flex flex-col space-y-3 sm:space-y-4 p-3 sm:p-4 rounded-lg border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2 text-sm sm:text-base">
                    <DownloadCloud className="w-3 h-3 sm:w-4 sm:h-4" />
                    Data Export
                  </Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Download all your personal data
                  </p>
                </div>
                <Button variant="outline" className="w-full sm:w-auto text-xs sm:text-sm">
                  Request Export
                </Button>
              </div>
            </div>

            <div className="flex flex-col space-y-3 sm:space-y-4 p-3 sm:p-4 rounded-lg border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2 text-sm sm:text-base">
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    Delete Account
                  </Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Permanently remove your account
                  </p>
                </div>
                <Button variant="destructive" className="w-full sm:w-auto text-xs sm:text-sm">
                  Delete Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}