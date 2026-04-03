import React from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Switch } from '../../ui/switch';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import Icon from '@mdi/react';
import { 
  mdiBell, 
  mdiPalette, 
  mdiTranslate, 
  mdiShieldCheck,
  mdiCloudSync,
  mdiLogout,
  mdiDeleteForever
} from '@mdi/js';

interface Settings {
  notifications: {
    mealReminders: boolean;
    waterReminders: boolean;
    weightTracking: boolean;
    achievements: boolean;
  };
  units: {
    weight: 'kg' | 'lb';
    height: 'cm' | 'ft';
    water: 'ml' | 'oz';
  };
  theme: 'light' | 'dark' | 'system';
  language: string;
  privacy: {
    shareProgress: boolean;
    publicProfile: boolean;
  };
}

interface SettingsMenuProps {
  settings: Settings;
  onSettingChange: (category: string, setting: string, value: any) => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({
  settings,
  onSettingChange,
  onLogout,
  onDeleteAccount
}) => {
  return (
    <div className="space-y-6">
      {/* Notifications */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon path={mdiBell} size={1} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="meal-reminders" className="cursor-pointer">Meal Reminders</Label>
            <Switch
              id="meal-reminders"
              checked={settings.notifications.mealReminders}
              onCheckedChange={(checked) => onSettingChange('notifications', 'mealReminders', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="water-reminders" className="cursor-pointer">Water Reminders</Label>
            <Switch
              id="water-reminders"
              checked={settings.notifications.waterReminders}
              onCheckedChange={(checked) => onSettingChange('notifications', 'waterReminders', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="weight-tracking" className="cursor-pointer">Weight Tracking</Label>
            <Switch
              id="weight-tracking"
              checked={settings.notifications.weightTracking}
              onCheckedChange={(checked) => onSettingChange('notifications', 'weightTracking', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="achievements" className="cursor-pointer">Achievements</Label>
            <Switch
              id="achievements"
              checked={settings.notifications.achievements}
              onCheckedChange={(checked) => onSettingChange('notifications', 'achievements', checked)}
            />
          </div>
        </div>
      </Card>

      {/* Units */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Units</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="weight-unit">Weight</Label>
            <Select 
              value={settings.units.weight} 
              onValueChange={(value) => onSettingChange('units', 'weight', value)}
            >
              <SelectTrigger id="weight-unit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">Kilograms (kg)</SelectItem>
                <SelectItem value="lb">Pounds (lb)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="height-unit">Height</Label>
            <Select 
              value={settings.units.height} 
              onValueChange={(value) => onSettingChange('units', 'height', value)}
            >
              <SelectTrigger id="height-unit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cm">Centimeters (cm)</SelectItem>
                <SelectItem value="ft">Feet/Inches (ft)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="water-unit">Water</Label>
            <Select 
              value={settings.units.water} 
              onValueChange={(value) => onSettingChange('units', 'water', value)}
            >
              <SelectTrigger id="water-unit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ml">Milliliters (ml)</SelectItem>
                <SelectItem value="oz">Ounces (oz)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Appearance */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon path={mdiPalette} size={1} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Appearance</h3>
        </div>
        <div>
          <Label htmlFor="theme">Theme</Label>
          <Select 
            value={settings.theme} 
            onValueChange={(value) => onSettingChange('appearance', 'theme', value)}
          >
            <SelectTrigger id="theme">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Privacy */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon path={mdiShieldCheck} size={1} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Privacy</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="share-progress" className="cursor-pointer">Share Progress</Label>
            <Switch
              id="share-progress"
              checked={settings.privacy.shareProgress}
              onCheckedChange={(checked) => onSettingChange('privacy', 'shareProgress', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="public-profile" className="cursor-pointer">Public Profile</Label>
            <Switch
              id="public-profile"
              checked={settings.privacy.publicProfile}
              onCheckedChange={(checked) => onSettingChange('privacy', 'publicProfile', checked)}
            />
          </div>
        </div>
      </Card>

      {/* Account Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Account</h3>
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start" onClick={onLogout}>
            <Icon path={mdiLogout} size={0.8} className="mr-2" />
            Log Out
          </Button>
          <Button variant="destructive" className="w-full justify-start" onClick={onDeleteAccount}>
            <Icon path={mdiDeleteForever} size={0.8} className="mr-2" />
            Delete Account
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SettingsMenu;