import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateSettingsPanelAdmin = (
  resolved: ResolvedComponent,
  variant: 'tabs' | 'accordion' | 'sidebar' = 'tabs'
) => {
  const dataSource = resolved.dataSource;

  const getField = (fieldName: string): string => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `propData?.${mapping.sourceField}`;
    }
    // Return undefined/empty for missing data - let component handle gracefully
    // For ID fields
    if (fieldName === 'id' || fieldName.endsWith('Id')) {
      return `propData?.id || ${dataName}?._id`;
    }
    // For array fields
    if (fieldName.match(/items|steps|updates|timeline|list|array|images|products|users|orders|features|links|stats|statistics|metrics|categories|tags|members|avatars|methods|examples|reviews|comments|notifications|messages|events|courses|lessons|modules|posts|articles|videos|photos|data|results|activities|cards|testimonials|faqs|questions|answers|options|choices|variants|attributes|filters|transactions|invoices|payments|receipts|shipments|deliveries/i)) {
      return `propData?.${fieldName} || ([] as any[])`;
    }
    // For object fields
    if (fieldName.match(/address|metadata|config|settings|tracking|gallery/i)) {
      return `propData?.${fieldName} || ({} as any)`;
    }
    // For scalar values - return empty string as fallback
    return `propData?.${fieldName} || ''`;
  };

  // Parse data source for clean prop naming (sanitize to camelCase)
  const sanitizeVariableName = (name: string): string => {
    // Replace dots and underscores with camelCase
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) {
          return part;
        }
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');
  };

  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === '') return 'data';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'data';
  };

  const dataName = getDataPath();
  const entity = dataSource?.split('.').pop() || 'settings';

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'settings'}`;
  };

  const apiRoute = getApiRoute();

  const commonImports = `
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Settings, Shield, Bell, CreditCard, Users, Zap, Save, RotateCcw, X, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';`;

  const variants = {
    tabs: `
${commonImports}

interface SettingsPanelAdminProps {
  ${dataName}?: any;
  className?: string;
  onSave?: (settings: any) => void;
}

export default function SettingsPanelAdmin({ ${dataName}: propData, className, onSave }: SettingsPanelAdminProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const [activeTab, setActiveTab] = useState('general');
  const [isDirty, setIsDirty] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // General settings state
  const [generalSettings, setGeneralSettings] = useState(${getField('generalSettings')});

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState(${getField('securitySettings')});

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState(${getField('notificationSettings')});

  const categories = ${getField('categories')};
  const settingsTitle = ${getField('settingsTitle')};
  const saveChangesButton = ${getField('saveChangesButton')};
  const resetButton = ${getField('resetButton')};
  const unsavedChangesWarning = ${getField('unsavedChangesWarning')};
  const changesSavedSuccess = ${getField('changesSavedSuccess')};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const getIcon = (iconName: string) => {
    const icons: any = { Settings, Shield, Bell, CreditCard, Users, Zap };
    return icons[iconName] || Settings;
  };

  const handleSaveChanges = () => {
    const allSettings = {
      general: generalSettings,
      security: securitySettings,
      notifications: notificationSettings
    };

    console.log('Saving settings:', allSettings);

    if (onSave) {
      onSave(allSettings);
    }

    setIsDirty(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);

    alert(changesSavedSuccess);
  };

  const handleResetDefaults = () => {
    if (confirm('Reset all settings to defaults?')) {
      console.log('Resetting to defaults');
      setGeneralSettings(${getField('generalSettings')});
      setSecuritySettings(${getField('securitySettings')});
      setNotificationSettings(${getField('notificationSettings')});
      setIsDirty(false);
    }
  };

  const handleTabChange = (tab: string) => {
    if (isDirty) {
      if (confirm(unsavedChangesWarning)) {
        setActiveTab(tab);
        setIsDirty(false);
      }
    } else {
      setActiveTab(tab);
    }
    console.log('Tab changed to:', tab);
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = unsavedChangesWarning;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, unsavedChangesWarning]);

  return (
    <div className={cn('min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/20 dark:from-gray-900 dark:via-gray-950 dark:to-blue-950/20 p-6', className)}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 mb-4">{settingsTitle}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 font-medium">Manage your application settings and preferences</p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-8 bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 dark:from-green-900/30 dark:via-emerald-900/20 dark:to-green-900/30 border-2 border-green-300 dark:border-green-700 rounded-2xl p-6 flex items-center gap-4 shadow-lg animate-in fade-in slide-in-from-top duration-300">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
            <p className="text-lg font-bold text-green-900 dark:text-green-100">{changesSavedSuccess}</p>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="flex space-x-2 mb-8 border-b-2 border-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 overflow-x-auto pb-2">
          {categories.map((category: any) => {
            const Icon = getIcon(category.icon);
            return (
              <button
                key={category.id}
                onClick={() => handleTabChange(category.id)}
                className={cn(
                  'flex items-center gap-3 px-6 py-4 font-bold text-base rounded-2xl transition-all duration-300 whitespace-nowrap group',
                  activeTab === category.id
                    ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-xl scale-105 border-2 border-white dark:border-gray-800'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 hover:shadow-lg hover:scale-102 border-2 border-gray-200 dark:border-gray-700'
                )}
              >
                <Icon className={cn("w-5 h-5 transition-transform duration-300", activeTab === category.id ? "scale-110" : "group-hover:scale-110")} />
                {category.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-gradient-to-br from-white via-blue-50/10 to-white dark:from-gray-800 dark:via-blue-900/5 dark:to-gray-800 rounded-3xl shadow-2xl border-2 border-blue-200/50 dark:border-blue-700/50 p-8">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={generalSettings.siteName}
                  onChange={(e) => {
                    setGeneralSettings({ ...generalSettings, siteName: e.target.value });
                    setIsDirty(true);
                  }}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="siteUrl">Site URL</Label>
                <Input
                  id="siteUrl"
                  type="url"
                  value={generalSettings.siteUrl}
                  onChange={(e) => {
                    setGeneralSettings({ ...generalSettings, siteUrl: e.target.value });
                    setIsDirty(true);
                  }}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={generalSettings.timezone}
                    onValueChange={(value) => {
                      setGeneralSettings({ ...generalSettings, timezone: value });
                      setIsDirty(true);
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={generalSettings.language}
                    onValueChange={(value) => {
                      setGeneralSettings({ ...generalSettings, language: value });
                      setIsDirty(true);
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 via-blue-50/20 to-gray-50 dark:from-gray-900/50 dark:via-blue-900/10 dark:to-gray-900/50 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 border-2 border-gray-200/50 dark:border-gray-700/50">
                <div>
                  <Label>Allow Public Registration</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Allow new users to register</p>
                </div>
                <Switch
                  checked={generalSettings.allowRegistration}
                  onCheckedChange={(checked) => {
                    setGeneralSettings({ ...generalSettings, allowRegistration: checked });
                    setIsDirty(true);
                  }}
                />
              </div>

              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 via-blue-50/20 to-gray-50 dark:from-gray-900/50 dark:via-blue-900/10 dark:to-gray-900/50 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 border-2 border-gray-200/50 dark:border-gray-700/50">
                <div>
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Disable site access for maintenance</p>
                </div>
                <Switch
                  checked={generalSettings.maintenanceMode}
                  onCheckedChange={(checked) => {
                    setGeneralSettings({ ...generalSettings, maintenanceMode: checked });
                    setIsDirty(true);
                  }}
                />
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 via-blue-50/20 to-gray-50 dark:from-gray-900/50 dark:via-blue-900/10 dark:to-gray-900/50 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 border-2 border-gray-200/50 dark:border-gray-700/50">
                <div>
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Require 2FA for all users</p>
                </div>
                <Switch
                  checked={securitySettings.twoFactorAuth}
                  onCheckedChange={(checked) => {
                    setSecuritySettings({ ...securitySettings, twoFactorAuth: checked });
                    setIsDirty(true);
                  }}
                />
              </div>

              <div>
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => {
                    setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) });
                    setIsDirty(true);
                  }}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="passwordMinLength">Password Minimum Length</Label>
                <Input
                  id="passwordMinLength"
                  type="number"
                  value={securitySettings.passwordMinLength}
                  onChange={(e) => {
                    setSecuritySettings({ ...securitySettings, passwordMinLength: parseInt(e.target.value) });
                    setIsDirty(true);
                  }}
                  className="mt-1"
                />
              </div>

              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 via-blue-50/20 to-gray-50 dark:from-gray-900/50 dark:via-blue-900/10 dark:to-gray-900/50 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 border-2 border-gray-200/50 dark:border-gray-700/50">
                <div>
                  <Label>Require Special Characters</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Passwords must include special characters</p>
                </div>
                <Switch
                  checked={securitySettings.requireSpecialChars}
                  onCheckedChange={(checked) => {
                    setSecuritySettings({ ...securitySettings, requireSpecialChars: checked });
                    setIsDirty(true);
                  }}
                />
              </div>

              <div>
                <Label htmlFor="loginAttempts">Max Login Attempts</Label>
                <Input
                  id="loginAttempts"
                  type="number"
                  value={securitySettings.loginAttempts}
                  onChange={(e) => {
                    setSecuritySettings({ ...securitySettings, loginAttempts: parseInt(e.target.value) });
                    setIsDirty(true);
                  }}
                  className="mt-1"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Lock account after this many failed attempts</p>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 via-blue-50/20 to-gray-50 dark:from-gray-900/50 dark:via-blue-900/10 dark:to-gray-900/50 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 border-2 border-gray-200/50 dark:border-gray-700/50">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Send email notifications</p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => {
                    setNotificationSettings({ ...notificationSettings, emailNotifications: checked });
                    setIsDirty(true);
                  }}
                />
              </div>

              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 via-blue-50/20 to-gray-50 dark:from-gray-900/50 dark:via-blue-900/10 dark:to-gray-900/50 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 border-2 border-gray-200/50 dark:border-gray-700/50">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Enable push notifications</p>
                </div>
                <Switch
                  checked={notificationSettings.pushNotifications}
                  onCheckedChange={(checked) => {
                    setNotificationSettings({ ...notificationSettings, pushNotifications: checked });
                    setIsDirty(true);
                  }}
                />
              </div>

              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 via-blue-50/20 to-gray-50 dark:from-gray-900/50 dark:via-blue-900/10 dark:to-gray-900/50 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 border-2 border-gray-200/50 dark:border-gray-700/50">
                <div>
                  <Label>Notify on New User</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Alert when new users register</p>
                </div>
                <Switch
                  checked={notificationSettings.notifyOnNewUser}
                  onCheckedChange={(checked) => {
                    setNotificationSettings({ ...notificationSettings, notifyOnNewUser: checked });
                    setIsDirty(true);
                  }}
                />
              </div>

              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 via-blue-50/20 to-gray-50 dark:from-gray-900/50 dark:via-blue-900/10 dark:to-gray-900/50 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 border-2 border-gray-200/50 dark:border-gray-700/50">
                <div>
                  <Label>Notify on Error</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Alert on system errors</p>
                </div>
                <Switch
                  checked={notificationSettings.notifyOnError}
                  onCheckedChange={(checked) => {
                    setNotificationSettings({ ...notificationSettings, notifyOnError: checked });
                    setIsDirty(true);
                  }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={handleResetDefaults}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              {resetButton}
            </Button>

            <div className="flex gap-3">
              {isDirty && (
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mr-3">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">Unsaved changes</span>
                </div>
              )}
              <Button
                onClick={handleSaveChanges}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                disabled={!isDirty}
              >
                <Save className="w-4 h-4" />
                {saveChangesButton}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
    `,

    accordion: `
${commonImports}
import { ChevronDown } from 'lucide-react';

interface SettingsPanelAdminProps {
  ${dataName}?: any;
  className?: string;
  onSave?: (settings: any) => void;
}

export default function SettingsPanelAdmin({ ${dataName}: propData, className, onSave }: SettingsPanelAdminProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const [openSections, setOpenSections] = useState<string[]>(['general']);
  const [isDirty, setIsDirty] = useState(false);

  const [generalSettings, setGeneralSettings] = useState(${getField('generalSettings')});
  const [securitySettings, setSecuritySettings] = useState(${getField('securitySettings')});
  const [notificationSettings, setNotificationSettings] = useState(${getField('notificationSettings')});

  const categories = ${getField('categories')};
  const settingsTitle = ${getField('settingsTitle')};
  const saveChangesButton = ${getField('saveChangesButton')};
  const resetButton = ${getField('resetButton')};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
    console.log('Section toggled:', sectionId);
  };

  const getIcon = (iconName: string) => {
    const icons: any = { Settings, Shield, Bell, CreditCard, Users, Zap };
    return icons[iconName] || Settings;
  };

  const handleSaveChanges = () => {
    const allSettings = {
      general: generalSettings,
      security: securitySettings,
      notifications: notificationSettings
    };

    console.log('Saving settings:', allSettings);

    if (onSave) {
      onSave(allSettings);
    }

    setIsDirty(false);
    alert('Settings saved successfully!');
  };

  const handleResetDefaults = () => {
    if (confirm('Reset all settings to defaults?')) {
      console.log('Resetting to defaults');
      setGeneralSettings(${getField('generalSettings')});
      setSecuritySettings(${getField('securitySettings')});
      setNotificationSettings(${getField('notificationSettings')});
      setIsDirty(false);
    }
  };

  return (
    <div className={cn('min-h-screen bg-gray-50 dark:bg-gray-900 p-6', className)}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{settingsTitle}</h1>
          <p className="text-gray-600 dark:text-gray-400">Expand sections to configure settings</p>
        </div>

        <div className="space-y-4">
          {/* General Settings Accordion */}
          <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader
              className="cursor-pointer"
              onClick={() => toggleSection('general')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <CardTitle className="text-lg">General Settings</CardTitle>
                </div>
                <ChevronDown
                  className={cn(
                    'w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform',
                    openSections.includes('general') && 'transform rotate-180'
                  )}
                />
              </div>
            </CardHeader>
            {openSections.includes('general') && (
              <CardContent className="space-y-4 pt-0">
                <div>
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={generalSettings.siteName}
                    onChange={(e) => {
                      setGeneralSettings({ ...generalSettings, siteName: e.target.value });
                      setIsDirty(true);
                    }}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="siteUrl">Site URL</Label>
                  <Input
                    id="siteUrl"
                    type="url"
                    value={generalSettings.siteUrl}
                    onChange={(e) => {
                      setGeneralSettings({ ...generalSettings, siteUrl: e.target.value });
                      setIsDirty(true);
                    }}
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <Label>Allow Public Registration</Label>
                  <Switch
                    checked={generalSettings.allowRegistration}
                    onCheckedChange={(checked) => {
                      setGeneralSettings({ ...generalSettings, allowRegistration: checked });
                      setIsDirty(true);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <Label>Maintenance Mode</Label>
                  <Switch
                    checked={generalSettings.maintenanceMode}
                    onCheckedChange={(checked) => {
                      setGeneralSettings({ ...generalSettings, maintenanceMode: checked });
                      setIsDirty(true);
                    }}
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Security Settings Accordion */}
          <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader
              className="cursor-pointer"
              onClick={() => toggleSection('security')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <CardTitle className="text-lg">Security Settings</CardTitle>
                </div>
                <ChevronDown
                  className={cn(
                    'w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform',
                    openSections.includes('security') && 'transform rotate-180'
                  )}
                />
              </div>
            </CardHeader>
            {openSections.includes('security') && (
              <CardContent className="space-y-4 pt-0">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <Label>Two-Factor Authentication</Label>
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) => {
                      setSecuritySettings({ ...securitySettings, twoFactorAuth: checked });
                      setIsDirty(true);
                    }}
                  />
                </div>

                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => {
                      setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) });
                      setIsDirty(true);
                    }}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="passwordMinLength">Password Minimum Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={securitySettings.passwordMinLength}
                    onChange={(e) => {
                      setSecuritySettings({ ...securitySettings, passwordMinLength: parseInt(e.target.value) });
                      setIsDirty(true);
                    }}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Notification Settings Accordion */}
          <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader
              className="cursor-pointer"
              onClick={() => toggleSection('notifications')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <CardTitle className="text-lg">Notification Settings</CardTitle>
                </div>
                <ChevronDown
                  className={cn(
                    'w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform',
                    openSections.includes('notifications') && 'transform rotate-180'
                  )}
                />
              </div>
            </CardHeader>
            {openSections.includes('notifications') && (
              <CardContent className="space-y-4 pt-0">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <Label>Email Notifications</Label>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => {
                      setNotificationSettings({ ...notificationSettings, emailNotifications: checked });
                      setIsDirty(true);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <Label>Push Notifications</Label>
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) => {
                      setNotificationSettings({ ...notificationSettings, pushNotifications: checked });
                      setIsDirty(true);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <Label>Notify on New User</Label>
                  <Switch
                    checked={notificationSettings.notifyOnNewUser}
                    onCheckedChange={(checked) => {
                      setNotificationSettings({ ...notificationSettings, notifyOnNewUser: checked });
                      setIsDirty(true);
                    }}
                  />
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleResetDefaults}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            {resetButton}
          </Button>

          <Button
            onClick={handleSaveChanges}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            disabled={!isDirty}
          >
            <Save className="w-4 h-4" />
            {saveChangesButton}
          </Button>
        </div>
      </div>
    </div>
  );
}
    `,

    sidebar: `
${commonImports}

interface SettingsPanelAdminProps {
  ${dataName}?: any;
  className?: string;
  onSave?: (settings: any) => void;
}

export default function SettingsPanelAdmin({ ${dataName}: propData, className, onSave }: SettingsPanelAdminProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const [activeSection, setActiveSection] = useState('general');
  const [isDirty, setIsDirty] = useState(false);

  const [generalSettings, setGeneralSettings] = useState(${getField('generalSettings')});
  const [securitySettings, setSecuritySettings] = useState(${getField('securitySettings')});
  const [notificationSettings, setNotificationSettings] = useState(${getField('notificationSettings')});

  const categories = ${getField('categories')};
  const settingsTitle = ${getField('settingsTitle')};
  const saveChangesButton = ${getField('saveChangesButton')};
  const resetButton = ${getField('resetButton')};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const getIcon = (iconName: string) => {
    const icons: any = { Settings, Shield, Bell, CreditCard, Users, Zap };
    return icons[iconName] || Settings;
  };

  const handleSaveChanges = () => {
    const allSettings = {
      general: generalSettings,
      security: securitySettings,
      notifications: notificationSettings
    };

    console.log('Saving settings:', allSettings);

    if (onSave) {
      onSave(allSettings);
    }

    setIsDirty(false);
    alert('Settings saved successfully!');
  };

  const handleResetDefaults = () => {
    if (confirm('Reset all settings to defaults?')) {
      console.log('Resetting to defaults');
      setGeneralSettings(${getField('generalSettings')});
      setSecuritySettings(${getField('securitySettings')});
      setNotificationSettings(${getField('notificationSettings')});
      setIsDirty(false);
    }
  };

  return (
    <div className={cn('min-h-screen bg-gray-50 dark:bg-gray-900', className)}>
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen p-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{settingsTitle}</h2>
          <nav className="space-y-1">
            {categories.map((category: any) => {
              const Icon = getIcon(category.icon);
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveSection(category.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors',
                    activeSection === category.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {category.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-3xl">
            {/* General Settings */}
            {activeSection === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">General Settings</h3>
                </div>

                <div>
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={generalSettings.siteName}
                    onChange={(e) => {
                      setGeneralSettings({ ...generalSettings, siteName: e.target.value });
                      setIsDirty(true);
                    }}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="siteUrl">Site URL</Label>
                  <Input
                    id="siteUrl"
                    type="url"
                    value={generalSettings.siteUrl}
                    onChange={(e) => {
                      setGeneralSettings({ ...generalSettings, siteUrl: e.target.value });
                      setIsDirty(true);
                    }}
                    className="mt-1"
                  />
                </div>

                <Card className="dark:bg-gray-900/50">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Allow Public Registration</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Allow new users to register</p>
                      </div>
                      <Switch
                        checked={generalSettings.allowRegistration}
                        onCheckedChange={(checked) => {
                          setGeneralSettings({ ...generalSettings, allowRegistration: checked });
                          setIsDirty(true);
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Maintenance Mode</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Disable site access</p>
                      </div>
                      <Switch
                        checked={generalSettings.maintenanceMode}
                        onCheckedChange={(checked) => {
                          setGeneralSettings({ ...generalSettings, maintenanceMode: checked });
                          setIsDirty(true);
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Security Settings */}
            {activeSection === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Security Settings</h3>
                </div>

                <Card className="dark:bg-gray-900/50">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Two-Factor Authentication</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Require 2FA for all users</p>
                      </div>
                      <Switch
                        checked={securitySettings.twoFactorAuth}
                        onCheckedChange={(checked) => {
                          setSecuritySettings({ ...securitySettings, twoFactorAuth: checked });
                          setIsDirty(true);
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Require Special Characters</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">In passwords</p>
                      </div>
                      <Switch
                        checked={securitySettings.requireSpecialChars}
                        onCheckedChange={(checked) => {
                          setSecuritySettings({ ...securitySettings, requireSpecialChars: checked });
                          setIsDirty(true);
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => {
                      setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) });
                      setIsDirty(true);
                    }}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="loginAttempts">Max Login Attempts</Label>
                  <Input
                    id="loginAttempts"
                    type="number"
                    value={securitySettings.loginAttempts}
                    onChange={(e) => {
                      setSecuritySettings({ ...securitySettings, loginAttempts: parseInt(e.target.value) });
                      setIsDirty(true);
                    }}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Notification Settings</h3>
                </div>

                <Card className="dark:bg-gray-900/50">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Email Notifications</Label>
                      <Switch
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked) => {
                          setNotificationSettings({ ...notificationSettings, emailNotifications: checked });
                          setIsDirty(true);
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Push Notifications</Label>
                      <Switch
                        checked={notificationSettings.pushNotifications}
                        onCheckedChange={(checked) => {
                          setNotificationSettings({ ...notificationSettings, pushNotifications: checked });
                          setIsDirty(true);
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Notify on New User</Label>
                      <Switch
                        checked={notificationSettings.notifyOnNewUser}
                        onCheckedChange={(checked) => {
                          setNotificationSettings({ ...notificationSettings, notifyOnNewUser: checked });
                          setIsDirty(true);
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Notify on Error</Label>
                      <Switch
                        checked={notificationSettings.notifyOnError}
                        onCheckedChange={(checked) => {
                          setNotificationSettings({ ...notificationSettings, notifyOnError: checked });
                          setIsDirty(true);
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={handleResetDefaults}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                {resetButton}
              </Button>

              <Button
                onClick={handleSaveChanges}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                disabled={!isDirty}
              >
                <Save className="w-4 h-4" />
                {saveChangesButton}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.tabs;
};
