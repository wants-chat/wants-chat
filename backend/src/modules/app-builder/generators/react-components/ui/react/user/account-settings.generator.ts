import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateAccountSettings = (
  resolved: ResolvedComponent,
  variant: 'general' | 'security' | 'privacy' | 'notifications' | 'billing' = 'general'
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

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'account-settings'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'accountSettings';

  const variants = {
    general: `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccountSettingsProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function AccountSettings({ ${dataName}: propData, className }: AccountSettingsProps) {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};
  const sourceData = ${dataName} || {};

  const [firstName, setFirstName] = useState(${getField('firstName')});
  const [lastName, setLastName] = useState(${getField('lastName')});
  const [email, setEmail] = useState(${getField('email')});
  const [username, setUsername] = useState(${getField('username')});
  const [phone, setPhone] = useState(${getField('phone')});
  const [language, setLanguage] = useState(${getField('language')});
  const [timezone, setTimezone] = useState(${getField('timezone')});

  const avatar = ${getField('avatar')};
  const saveChangesButton = ${getField('saveChangesButton')};
  const cancelButton = ${getField('cancelButton')};
  const generalSettingsTitle = ${getField('generalSettingsTitle')};
  const accountInfoTitle = ${getField('accountInfoTitle')};

  if (isLoading && !propData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/20 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Event handlers
  const handleSaveChanges = () => {
    console.log('Saving general settings:', { firstName, lastName, email, username, phone, language, timezone });
    alert(\`Settings saved successfully!\\n\\nName: \${firstName} \${lastName}\\nEmail: \${email}\\nUsername: \${username}\`);
  };

  const handleCancel = () => {
    console.log('Cancel clicked');
    alert('Changes discarded');
    // Reset form
    setFirstName(${getField('firstName')});
    setLastName(${getField('lastName')});
    setEmail(${getField('email')});
    setUsername(${getField('username')});
    setPhone(${getField('phone')});
    setLanguage(${getField('language')});
    setTimezone(${getField('timezone')});
  };

  const handleAvatarUpload = () => {
    console.log('Avatar upload clicked');
    alert('Opening file picker to upload profile picture...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/20 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className={cn("max-w-4xl mx-auto p-4 lg:p-8", className)}>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent mb-8">{generalSettingsTitle}</h1>

        {/* Profile Picture */}
        <Card className="dark:bg-gray-800 border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-xl backdrop-blur-sm mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <img
                src={avatar}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover"
              />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">Profile Picture</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  JPG, GIF or PNG. Max size of 2MB.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAvatarUpload}
                  className="dark:border-gray-600"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload New Picture
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card className="dark:bg-gray-800 border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-xl backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="text-xl bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">{accountInfoTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
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
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="dark:border-gray-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {cancelButton}
          </Button>
          <Button
            onClick={handleSaveChanges}
            className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 hover:from-blue-700 hover:via-blue-800 hover:to-blue-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {saveChangesButton}
          </Button>
        </div>
      </div>
    </div>
  );
}
    `,

    security: `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Shield, Lock, Smartphone, Monitor, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccountSettingsProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function AccountSettings({ ${dataName}: propData, className }: AccountSettingsProps) {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};
  const sourceData = ${dataName} || {};

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(${getField('twoFactorEnabled')});
  const [loginNotifications, setLoginNotifications] = useState(${getField('loginNotifications')});

  const activeSessions = ${getField('activeSessions')};
  const securityTitle = ${getField('securityTitle')};
  const passwordTitle = ${getField('passwordTitle')};
  const twoFactorTitle = ${getField('twoFactorTitle')};
  const activeSessionsTitle = ${getField('activeSessionsTitle')};
  const updatePasswordButton = ${getField('updatePasswordButton')};
  const enable2FAButton = ${getField('enable2FAButton')};
  const disable2FAButton = ${getField('disable2FAButton')};
  const revokeSessionButton = ${getField('revokeSessionButton')};

  if (isLoading && !propData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Event handlers
  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    console.log('Updating password');
    alert('Password updated successfully!\\nYou will be logged out and need to sign in with your new password.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleToggle2FA = () => {
    const newValue = !twoFactorEnabled;
    setTwoFactorEnabled(newValue);
    console.log(\`2FA toggled: \${newValue}\`);
    if (newValue) {
      alert('Setting up Two-Factor Authentication...\\n\\n1. Install an authenticator app\\n2. Scan the QR code\\n3. Enter the verification code');
    } else {
      alert('Two-Factor Authentication disabled\\nYour account is less secure without 2FA');
    }
  };

  const handleToggleLoginNotifications = () => {
    const newValue = !loginNotifications;
    setLoginNotifications(newValue);
    console.log(\`Login notifications toggled: \${newValue}\`);
    alert(\`Login notifications \${newValue ? 'enabled' : 'disabled'}\`);
  };

  const handleRevokeSession = (session: any) => {
    console.log('Revoking session:', session);
    alert(\`Revoke session?\\n\\nDevice: \${session.device}\\nLocation: \${session.location}\\n\\nThis device will be signed out immediately.\`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className={cn("max-w-4xl mx-auto p-4 lg:p-8", className)}>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{securityTitle}</h1>

        {/* Change Password */}
        <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5" />
              {passwordTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1"
              />
            </div>

            <Button
              onClick={handleUpdatePassword}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {updatePasswordButton}
            </Button>
          </CardContent>
        </Card>

        {/* Two-Factor Authentication */}
        <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {twoFactorTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Add an extra layer of security to your account
                </p>
                <div className="flex items-center gap-2">
                  <Badge className={twoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
              <Button
                onClick={handleToggle2FA}
                className={twoFactorEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
              >
                {twoFactorEnabled ? disable2FAButton : enable2FAButton}
              </Button>
            </div>

            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Switch
                  checked={loginNotifications}
                  onCheckedChange={handleToggleLoginNotifications}
                />
                <Label className="cursor-pointer">Send login notifications</Label>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get notified via email when someone logs into your account
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              {activeSessionsTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeSessions.map((session: any) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      {session.device.includes('iPhone') ? (
                        <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Monitor className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">{session.device}</span>
                        {session.current && (
                          <Badge className="bg-green-100 text-green-800 text-xs">Current</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {session.location} • {session.lastActive}
                      </p>
                    </div>
                  </div>
                  {!session.current && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevokeSession(session)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                      {revokeSessionButton}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
    `,

    privacy: `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Eye, EyeOff, Lock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccountSettingsProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function AccountSettings({ ${dataName}: propData, className }: AccountSettingsProps) {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};
  const sourceData = ${dataName} || {};

  const [profileVisibility, setProfileVisibility] = useState(${getField('profileVisibility')});
  const [showEmail, setShowEmail] = useState(${getField('showEmail')});
  const [showPhone, setShowPhone] = useState(${getField('showPhone')});
  const [searchable, setSearchable] = useState(${getField('searchable')});
  const [showActivityStatus, setShowActivityStatus] = useState(${getField('showActivityStatus')});
  const [allowTagging, setAllowTagging] = useState(${getField('allowTagging')});

  const privacyTitle = ${getField('privacyTitle')};
  const visibilityTitle = ${getField('visibilityTitle')};
  const privacyControlsTitle = ${getField('privacyControlsTitle')};
  const saveChangesButton = ${getField('saveChangesButton')};

  if (isLoading && !propData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Event handlers
  const handleSaveChanges = () => {
    console.log('Saving privacy settings:', {
      profileVisibility,
      showEmail,
      showPhone,
      searchable,
      showActivityStatus,
      allowTagging
    });
    alert(\`Privacy settings saved!\\n\\nProfile Visibility: \${profileVisibility}\\nShow Email: \${showEmail}\\nShow Phone: \${showPhone}\`);
  };

  const handleToggle = (setting: string, currentValue: boolean) => {
    const newValue = !currentValue;
    console.log(\`Toggle \${setting}: \${newValue}\`);

    switch(setting) {
      case 'showEmail': setShowEmail(newValue); break;
      case 'showPhone': setShowPhone(newValue); break;
      case 'searchable': setSearchable(newValue); break;
      case 'showActivityStatus': setShowActivityStatus(newValue); break;
      case 'allowTagging': setAllowTagging(newValue); break;
    }
  };

  const handleVisibilityChange = (value: string) => {
    setProfileVisibility(value);
    console.log(\`Profile visibility changed to: \${value}\`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className={cn("max-w-4xl mx-auto p-4 lg:p-8", className)}>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{privacyTitle}</h1>

        {/* Profile Visibility */}
        <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center gap-2">
              <Eye className="w-5 h-5" />
              {visibilityTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={profileVisibility} onValueChange={handleVisibilityChange}>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <RadioGroupItem value="public" id="public" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="public" className="font-medium cursor-pointer text-gray-900 dark:text-white">
                      Public
                    </Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Anyone can see your profile and posts
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <RadioGroupItem value="friends" id="friends" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="friends" className="font-medium cursor-pointer text-gray-900 dark:text-white">
                      Friends Only
                    </Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Only your friends can see your profile and posts
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <RadioGroupItem value="private" id="private" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="private" className="font-medium cursor-pointer text-gray-900 dark:text-white">
                      Private
                    </Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Only you can see your profile. Others need your approval to follow
                    </p>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Privacy Controls */}
        <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5" />
              {privacyControlsTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="font-medium text-gray-900 dark:text-white">Show Email Address</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Display your email address on your public profile
                  </p>
                </div>
                <Switch
                  checked={showEmail}
                  onCheckedChange={() => handleToggle('showEmail', showEmail)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="font-medium text-gray-900 dark:text-white">Show Phone Number</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Display your phone number on your public profile
                  </p>
                </div>
                <Switch
                  checked={showPhone}
                  onCheckedChange={() => handleToggle('showPhone', showPhone)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="font-medium text-gray-900 dark:text-white">Searchable Profile</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Allow search engines to index your profile
                  </p>
                </div>
                <Switch
                  checked={searchable}
                  onCheckedChange={() => handleToggle('searchable', searchable)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="font-medium text-gray-900 dark:text-white">Show Activity Status</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Let others see when you're online
                  </p>
                </div>
                <Switch
                  checked={showActivityStatus}
                  onCheckedChange={() => handleToggle('showActivityStatus', showActivityStatus)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="font-medium text-gray-900 dark:text-white">Allow Tagging</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Allow others to tag you in posts and photos
                  </p>
                </div>
                <Switch
                  checked={allowTagging}
                  onCheckedChange={() => handleToggle('allowTagging', allowTagging)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSaveChanges}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saveChangesButton}
          </Button>
        </div>
      </div>
    </div>
  );
}
    `,

    notifications: `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, Mail, Smartphone, MessageSquare, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccountSettingsProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function AccountSettings({ ${dataName}: propData, className }: AccountSettingsProps) {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};
  const sourceData = ${dataName} || {};

  const [emailNotifications, setEmailNotifications] = useState(${getField('emailNotifications')});
  const [pushNotifications, setPushNotifications] = useState(${getField('pushNotifications')});
  const [smsNotifications, setSmsNotifications] = useState(${getField('smsNotifications')});
  const [notifyComments, setNotifyComments] = useState(${getField('notifyComments')});
  const [notifyLikes, setNotifyLikes] = useState(${getField('notifyLikes')});
  const [notifyFollows, setNotifyFollows] = useState(${getField('notifyFollows')});
  const [notifyMessages, setNotifyMessages] = useState(${getField('notifyMessages')});
  const [notifyUpdates, setNotifyUpdates] = useState(${getField('notifyUpdates')});
  const [weeklyDigest, setWeeklyDigest] = useState(${getField('weeklyDigest')});
  const [monthlyReport, setMonthlyReport] = useState(${getField('monthlyReport')});

  const notificationsTitle = ${getField('notificationsTitle')};
  const emailNotificationsTitle = ${getField('emailNotificationsTitle')};
  const pushNotificationsTitle = ${getField('pushNotificationsTitle')};
  const saveChangesButton = ${getField('saveChangesButton')};

  if (isLoading && !propData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Event handlers
  const handleSaveChanges = () => {
    console.log('Saving notification settings:', {
      emailNotifications,
      pushNotifications,
      smsNotifications,
      notifyComments,
      notifyLikes,
      notifyFollows,
      notifyMessages,
      notifyUpdates,
      weeklyDigest,
      monthlyReport
    });
    alert('Notification preferences saved successfully!');
  };

  const handleToggle = (setting: string, setter: Function, currentValue: boolean) => {
    const newValue = !currentValue;
    setter(newValue);
    console.log(\`Toggle \${setting}: \${newValue}\`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className={cn("max-w-4xl mx-auto p-4 lg:p-8", className)}>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{notificationsTitle}</h1>

        {/* Notification Channels */}
        <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 dark:text-white">Notification Channels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <Label className="font-medium text-gray-900 dark:text-white">Email Notifications</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications via email</p>
                  </div>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={() => handleToggle('emailNotifications', setEmailNotifications, emailNotifications)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <Label className="font-medium text-gray-900 dark:text-white">Push Notifications</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receive push notifications on your devices</p>
                  </div>
                </div>
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={() => handleToggle('pushNotifications', setPushNotifications, pushNotifications)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <Label className="font-medium text-gray-900 dark:text-white">SMS Notifications</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receive important alerts via SMS</p>
                  </div>
                </div>
                <Switch
                  checked={smsNotifications}
                  onCheckedChange={() => handleToggle('smsNotifications', setSmsNotifications, smsNotifications)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Notifications */}
        <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Activity Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium text-gray-900 dark:text-white">Comments</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">When someone comments on your posts</p>
                </div>
                <Switch
                  checked={notifyComments}
                  onCheckedChange={() => handleToggle('notifyComments', setNotifyComments, notifyComments)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium text-gray-900 dark:text-white">Likes</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">When someone likes your posts</p>
                </div>
                <Switch
                  checked={notifyLikes}
                  onCheckedChange={() => handleToggle('notifyLikes', setNotifyLikes, notifyLikes)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium text-gray-900 dark:text-white">New Followers</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">When someone follows you</p>
                </div>
                <Switch
                  checked={notifyFollows}
                  onCheckedChange={() => handleToggle('notifyFollows', setNotifyFollows, notifyFollows)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium text-gray-900 dark:text-white">Direct Messages</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">When you receive a new message</p>
                </div>
                <Switch
                  checked={notifyMessages}
                  onCheckedChange={() => handleToggle('notifyMessages', setNotifyMessages, notifyMessages)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium text-gray-900 dark:text-white">Product Updates</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">News about product updates and features</p>
                </div>
                <Switch
                  checked={notifyUpdates}
                  onCheckedChange={() => handleToggle('notifyUpdates', setNotifyUpdates, notifyUpdates)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Digest & Reports */}
        <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 dark:text-white">Digest & Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium text-gray-900 dark:text-white">Weekly Digest</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Summary of your activity every week</p>
                </div>
                <Switch
                  checked={weeklyDigest}
                  onCheckedChange={() => handleToggle('weeklyDigest', setWeeklyDigest, weeklyDigest)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium text-gray-900 dark:text-white">Monthly Report</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Detailed analytics report every month</p>
                </div>
                <Switch
                  checked={monthlyReport}
                  onCheckedChange={() => handleToggle('monthlyReport', setMonthlyReport, monthlyReport)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSaveChanges}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saveChangesButton}
          </Button>
        </div>
      </div>
    </div>
  );
}
    `,

    billing: `
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Download, Calendar, DollarSign, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccountSettingsProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function AccountSettings({ ${dataName}: propData, className }: AccountSettingsProps) {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};
  const sourceData = ${dataName} || {};

  const plan = ${getField('plan')};
  const billingCycle = ${getField('billingCycle')};
  const nextBillingDate = ${getField('nextBillingDate')};
  const amount = ${getField('amount')};
  const paymentMethod = ${getField('paymentMethod')};
  const billingAddress = ${getField('billingAddress')};
  const billingHistory = ${getField('billingHistory')};

  const billingTitle = ${getField('billingTitle')};
  const currentPlanTitle = ${getField('currentPlanTitle')};

  if (isLoading && !propData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  const paymentMethodTitle = ${getField('paymentMethodTitle')};
  const billingHistoryTitle = ${getField('billingHistoryTitle')};
  const updatePaymentButton = ${getField('updatePaymentButton')};
  const downloadInvoiceButton = ${getField('downloadInvoiceButton')};
  const upgradePlanButton = ${getField('upgradePlanButton')};
  const cancelPlanButton = ${getField('cancelPlanButton')};

  // Event handlers
  const handleUpgradePlan = () => {
    console.log('Upgrade plan clicked');
    alert(\`Upgrade from \${plan}?\\n\\nAvailable plans:\\n- Basic: $9.99/mo\\n- Professional: $29.99/mo\\n- Enterprise: $99.99/mo\`);
  };

  const handleCancelPlan = () => {
    console.log('Cancel plan clicked');
    alert(\`Cancel \${plan} subscription?\\n\\nYour subscription will remain active until \${nextBillingDate}.\\n\\nYou will lose access to premium features after cancellation.\`);
  };

  const handleUpdatePayment = () => {
    console.log('Update payment method clicked');
    alert('Opening payment method editor...\\n\\nEnter new card details:\\n- Card number\\n- Expiry date\\n- CVV\\n- Billing address');
  };

  const handleDownloadInvoice = (invoice: any) => {
    console.log('Download invoice clicked:', invoice);
    alert(\`Downloading invoice \${invoice.invoice}\\n\\nDate: \${invoice.date}\\nAmount: \${invoice.amount}\\nStatus: \${invoice.status}\`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className={cn("max-w-4xl mx-auto p-4 lg:p-8", className)}>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{billingTitle}</h1>

        {/* Current Plan */}
        <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              {currentPlanTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{plan}</h3>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                    {billingCycle}
                  </Badge>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{amount}<span className="text-base font-normal text-gray-600 dark:text-gray-400">/month</span></p>
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Next billing date: {nextBillingDate}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleUpgradePlan}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {upgradePlanButton}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelPlan}
                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 dark:border-red-900"
              >
                {cancelPlanButton}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              {paymentMethodTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{paymentMethod}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Expires 12/2025</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                Active
              </Badge>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Billing Address</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{billingAddress}</p>
            </div>

            <Button
              onClick={handleUpdatePayment}
              variant="outline"
              className="dark:border-gray-600"
            >
              {updatePaymentButton}
            </Button>
          </CardContent>
        </Card>

        {/* Billing History */}
        <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 dark:text-white">{billingHistoryTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {billingHistory.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.date}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Invoice {item.invoice}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">{item.amount}</p>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs">
                        {item.status}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadInvoice(item)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.general;
};
