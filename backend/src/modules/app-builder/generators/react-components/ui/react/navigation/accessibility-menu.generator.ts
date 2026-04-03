import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateAccessibilityMenu = (
  resolved: ResolvedComponent,
  variant: 'panel' | 'modal' | 'floating' = 'panel'
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
    return `/${dataSource || 'accessibility-menu'}`;
  };

  const apiRoute = getApiRoute();

  // Derive entity name for query key
  const entity = dataSource ? dataSource.split('.').pop() || 'accessibilityMenu' : 'accessibilityMenu';

  const commonImports = `
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Eye,
  Type,
  Contrast,
  Keyboard,
  Move,
  AlignLeft,
  Focus,
  RotateCcw,
  Save,
  Settings,
  X,
  Check,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';`;

  const variants = {
    panel: `
${commonImports}

interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
  screenReaderMode: boolean;
  keyboardNavigation: boolean;
  reduceMotion: boolean;
  textSpacing: boolean;
  focusHighlight: boolean;
}

interface AccessibilityMenuProps {
  ${dataName}?: any;
  className?: string;
  onSettingsChange?: (settings: AccessibilitySettings) => void;
}

const AccessibilityMenuComponent: React.FC<AccessibilityMenuProps> = ({
  ${dataName}: propData,
  className,
  onSettingsChange
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const accessibilityData = ${dataName} || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const resetLabel = ${getField('resetLabel')};
  const saveLabel = ${getField('saveLabel')};

  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: ${getField('fontSize')},
    highContrast: ${getField('highContrast')},
    screenReaderMode: ${getField('screenReaderMode')},
    keyboardNavigation: ${getField('keyboardNavigation')},
    reduceMotion: ${getField('reduceMotion')},
    textSpacing: ${getField('textSpacing')},
    focusHighlight: ${getField('focusHighlight')}
  });

  const [hasChanges, setHasChanges] = useState(false);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleSettingChange = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleReset = () => {
    const defaults: AccessibilitySettings = {
      fontSize: ${getField('fontSize')},
      highContrast: false,
      screenReaderMode: false,
      keyboardNavigation: false,
      reduceMotion: false,
      textSpacing: false,
      focusHighlight: false
    };
    setSettings(defaults);
    applySettings(defaults);
    setHasChanges(false);
  };

  const handleSave = () => {
    applySettings(settings);
    setHasChanges(false);
  };

  const applySettings = (settings: AccessibilitySettings) => {
    // Apply font size
    document.documentElement.style.fontSize = \`\${settings.fontSize}px\`;

    // Apply high contrast
    document.documentElement.classList.toggle('high-contrast', settings.highContrast);

    // Apply screen reader mode
    document.documentElement.classList.toggle('screen-reader-mode', settings.screenReaderMode);

    // Apply keyboard navigation
    document.documentElement.classList.toggle('keyboard-nav', settings.keyboardNavigation);

    // Apply reduced motion
    document.documentElement.classList.toggle('reduce-motion', settings.reduceMotion);

    // Apply text spacing
    document.documentElement.classList.toggle('increased-spacing', settings.textSpacing);

    // Apply focus highlight
    document.documentElement.classList.toggle('focus-highlight', settings.focusHighlight);

    // Save to localStorage
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));

    if (onSettingsChange) {
      onSettingsChange(settings);
    }
  };

  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibilitySettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      applySettings(parsed);
    }
  }, []);

  return (
    <div className={cn("min-h-screen bg-gray-50 flex items-center justify-center p-4", className)}>
      <style>{\`
        .high-contrast {
          filter: contrast(1.5);
        }
        .reduce-motion * {
          animation-duration: 0.01ms !important;
          transition-duration: 0.01ms !important;
        }
        .increased-spacing p {
          line-height: 2;
          word-spacing: 0.3em;
        }
        .focus-highlight *:focus {
          outline: 3px solid #2563eb !important;
          outline-offset: 3px !important;
        }
      \`}</style>

      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            {title}
          </CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Font Size */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Type className="w-5 h-5 text-gray-600" />
                <Label htmlFor="font-size-slider">{${getField('fontSizeLabel')}}</Label>
              </div>
              <span className="text-sm font-medium">{settings.fontSize}px</span>
            </div>
            <Slider
              id="font-size-slider"
              min={12}
              max={24}
              step={1}
              value={[settings.fontSize]}
              onValueChange={(value) => handleSettingChange('fontSize', value[0])}
              aria-label="Adjust font size"
            />
            <p className="text-sm text-gray-600">{${getField('fontSizeDescription')}}</p>
          </div>

          <Separator />

          {/* High Contrast */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <Contrast className="w-5 h-5 text-gray-600 mt-1" />
              <div className="flex-1">
                <Label htmlFor="high-contrast">{${getField('highContrastLabel')}}</Label>
                <p className="text-sm text-gray-600 mt-1">{${getField('highContrastDescription')}}</p>
              </div>
            </div>
            <Switch
              id="high-contrast"
              checked={settings.highContrast}
              onCheckedChange={(checked) => handleSettingChange('highContrast', checked)}
              aria-label="Toggle high contrast mode"
            />
          </div>

          <Separator />

          {/* Screen Reader Mode */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <Eye className="w-5 h-5 text-gray-600 mt-1" />
              <div className="flex-1">
                <Label htmlFor="screen-reader">{${getField('screenReaderLabel')}}</Label>
                <p className="text-sm text-gray-600 mt-1">{${getField('screenReaderDescription')}}</p>
              </div>
            </div>
            <Switch
              id="screen-reader"
              checked={settings.screenReaderMode}
              onCheckedChange={(checked) => handleSettingChange('screenReaderMode', checked)}
              aria-label="Toggle screen reader mode"
            />
          </div>

          <Separator />

          {/* Keyboard Navigation */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <Keyboard className="w-5 h-5 text-gray-600 mt-1" />
              <div className="flex-1">
                <Label htmlFor="keyboard-nav">{${getField('keyboardNavLabel')}}</Label>
                <p className="text-sm text-gray-600 mt-1">{${getField('keyboardNavDescription')}}</p>
              </div>
            </div>
            <Switch
              id="keyboard-nav"
              checked={settings.keyboardNavigation}
              onCheckedChange={(checked) => handleSettingChange('keyboardNavigation', checked)}
              aria-label="Toggle keyboard navigation"
            />
          </div>

          <Separator />

          {/* Reduce Motion */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <Move className="w-5 h-5 text-gray-600 mt-1" />
              <div className="flex-1">
                <Label htmlFor="reduce-motion">{${getField('reduceMotionLabel')}}</Label>
                <p className="text-sm text-gray-600 mt-1">{${getField('reduceMotionDescription')}}</p>
              </div>
            </div>
            <Switch
              id="reduce-motion"
              checked={settings.reduceMotion}
              onCheckedChange={(checked) => handleSettingChange('reduceMotion', checked)}
              aria-label="Toggle reduce motion"
            />
          </div>

          <Separator />

          {/* Text Spacing */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <AlignLeft className="w-5 h-5 text-gray-600 mt-1" />
              <div className="flex-1">
                <Label htmlFor="text-spacing">{${getField('textSpacingLabel')}}</Label>
                <p className="text-sm text-gray-600 mt-1">{${getField('textSpacingDescription')}}</p>
              </div>
            </div>
            <Switch
              id="text-spacing"
              checked={settings.textSpacing}
              onCheckedChange={(checked) => handleSettingChange('textSpacing', checked)}
              aria-label="Toggle text spacing"
            />
          </div>

          <Separator />

          {/* Focus Highlight */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <Focus className="w-5 h-5 text-gray-600 mt-1" />
              <div className="flex-1">
                <Label htmlFor="focus-highlight">{${getField('focusHighlightLabel')}}</Label>
                <p className="text-sm text-gray-600 mt-1">{${getField('focusHighlightDescription')}}</p>
              </div>
            </div>
            <Switch
              id="focus-highlight"
              checked={settings.focusHighlight}
              onCheckedChange={(checked) => handleSettingChange('focusHighlight', checked)}
              aria-label="Toggle focus highlight"
            />
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {resetLabel}
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveLabel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessibilityMenuComponent;
    `,

    modal: `
${commonImports}

interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
  screenReaderMode: boolean;
  keyboardNavigation: boolean;
  reduceMotion: boolean;
  textSpacing: boolean;
  focusHighlight: boolean;
}

interface AccessibilityMenuProps {
  ${dataName}?: any;
  className?: string;
  onSettingsChange?: (settings: AccessibilitySettings) => void;
}

const AccessibilityMenuComponent: React.FC<AccessibilityMenuProps> = ({
  ${dataName}: propData,
  className,
  onSettingsChange
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const accessibilityData = ${dataName} || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const resetLabel = ${getField('resetLabel')};
  const saveLabel = ${getField('saveLabel')};

  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: ${getField('fontSize')},
    highContrast: ${getField('highContrast')},
    screenReaderMode: ${getField('screenReaderMode')},
    keyboardNavigation: ${getField('keyboardNavigation')},
    reduceMotion: ${getField('reduceMotion')},
    textSpacing: ${getField('textSpacing')},
    focusHighlight: ${getField('focusHighlight')}
  });

  const [tempSettings, setTempSettings] = useState(settings);

  const handleSettingChange = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setTempSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setSettings(tempSettings);
    applySettings(tempSettings);
    setOpen(false);
  };

  const handleCancel = () => {
    setTempSettings(settings);
    setOpen(false);
  };

  const applySettings = (settings: AccessibilitySettings) => {
    document.documentElement.style.fontSize = \`\${settings.fontSize}px\`;
    document.documentElement.classList.toggle('high-contrast', settings.highContrast);
    document.documentElement.classList.toggle('screen-reader-mode', settings.screenReaderMode);
    document.documentElement.classList.toggle('keyboard-nav', settings.keyboardNavigation);
    document.documentElement.classList.toggle('reduce-motion', settings.reduceMotion);
    document.documentElement.classList.toggle('increased-spacing', settings.textSpacing);
    document.documentElement.classList.toggle('focus-highlight', settings.focusHighlight);
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));

    if (onSettingsChange) {
      onSettingsChange(settings);
    }
  };

  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibilitySettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      setTempSettings(parsed);
      applySettings(parsed);
    }
  }, []);

  const activeCount = Object.values(settings).filter(v => v === true).length;

  return (
    <div className={cn("min-h-screen bg-gray-50 flex items-center justify-center p-4", className)}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="lg" className="gap-2">
            <Settings className="w-5 h-5" />
            Accessibility
            {activeCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-blue-700 rounded-full text-xs">
                {activeCount}
              </span>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              {title}
            </DialogTitle>
            <DialogDescription>{subtitle}</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            {/* Font Size */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  <Label>{${getField('fontSizeLabel')}}</Label>
                </div>
                <span className="text-sm font-medium">{tempSettings.fontSize}px</span>
              </div>
              <Slider
                min={12}
                max={24}
                step={1}
                value={[tempSettings.fontSize]}
                onValueChange={(value) => handleSettingChange('fontSize', value[0])}
              />
            </div>

            <Separator />

            {/* Toggle Options */}
            {[
              { key: 'highContrast' as const, icon: Contrast, label: ${getField('highContrastLabel')}, desc: ${getField('highContrastDescription')} },
              { key: 'screenReaderMode' as const, icon: Eye, label: ${getField('screenReaderLabel')}, desc: ${getField('screenReaderDescription')} },
              { key: 'keyboardNavigation' as const, icon: Keyboard, label: ${getField('keyboardNavLabel')}, desc: ${getField('keyboardNavDescription')} },
              { key: 'reduceMotion' as const, icon: Move, label: ${getField('reduceMotionLabel')}, desc: ${getField('reduceMotionDescription')} },
              { key: 'textSpacing' as const, icon: AlignLeft, label: ${getField('textSpacingLabel')}, desc: ${getField('textSpacingDescription')} },
              { key: 'focusHighlight' as const, icon: Focus, label: ${getField('focusHighlightLabel')}, desc: ${getField('focusHighlightDescription')} }
            ].map((option) => (
              <div key={option.key} className="flex items-start justify-between py-2">
                <div className="flex items-start gap-3 flex-1">
                  <option.icon className="w-5 h-5 mt-1" />
                  <div className="flex-1">
                    <Label>{option.label}</Label>
                    <p className="text-sm text-gray-600 mt-1">{option.desc}</p>
                  </div>
                </div>
                <Switch
                  checked={tempSettings[option.key]}
                  onCheckedChange={(checked) => handleSettingChange(option.key, checked)}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700">
              <Check className="w-4 h-4 mr-2" />
              {saveLabel}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccessibilityMenuComponent;
    `,

    floating: `
${commonImports}

interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
  screenReaderMode: boolean;
  keyboardNavigation: boolean;
  reduceMotion: boolean;
  textSpacing: boolean;
  focusHighlight: boolean;
}

interface AccessibilityMenuProps {
  ${dataName}?: any;
  className?: string;
  onSettingsChange?: (settings: AccessibilitySettings) => void;
}

const AccessibilityMenuComponent: React.FC<AccessibilityMenuProps> = ({
  ${dataName}: propData,
  className,
  onSettingsChange
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const accessibilityData = ${dataName} || {};

  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: ${getField('fontSize')},
    highContrast: ${getField('highContrast')},
    screenReaderMode: ${getField('screenReaderMode')},
    keyboardNavigation: ${getField('keyboardNavigation')},
    reduceMotion: ${getField('reduceMotion')},
    textSpacing: ${getField('textSpacing')},
    focusHighlight: ${getField('focusHighlight')}
  });

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleToggle = <K extends keyof AccessibilitySettings>(key: K) => {
    if (key === 'fontSize') return;
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    applySettings(newSettings);
  };

  const adjustFontSize = (delta: number) => {
    const newSize = Math.max(12, Math.min(24, settings.fontSize + delta));
    const newSettings = { ...settings, fontSize: newSize };
    setSettings(newSettings);
    applySettings(newSettings);
  };

  const applySettings = (settings: AccessibilitySettings) => {
    document.documentElement.style.fontSize = \`\${settings.fontSize}px\`;
    document.documentElement.classList.toggle('high-contrast', settings.highContrast);
    document.documentElement.classList.toggle('screen-reader-mode', settings.screenReaderMode);
    document.documentElement.classList.toggle('keyboard-nav', settings.keyboardNavigation);
    document.documentElement.classList.toggle('reduce-motion', settings.reduceMotion);
    document.documentElement.classList.toggle('increased-spacing', settings.textSpacing);
    document.documentElement.classList.toggle('focus-highlight', settings.focusHighlight);
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));

    if (onSettingsChange) {
      onSettingsChange(settings);
    }
  };

  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibilitySettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      applySettings(parsed);
    }
  }, []);

  return (
    <div className={cn("min-h-screen bg-gray-50 relative", className)}>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl"
        aria-label="Open accessibility menu"
      >
        <Eye className="w-6 h-6" />
      </button>

      {/* Floating Panel */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          />
          <Card className="fixed bottom-24 right-6 z-50 w-80 shadow-2xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl bg-white/95 dark:bg-gray-800/95">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  Accessibility
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Font Size Quick Controls */}
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <Type className="w-4 h-4" />
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => adjustFontSize(-2)}
                    disabled={settings.fontSize <= 12}
                  >
                    A-
                  </Button>
                  <span className="text-sm font-medium w-12 text-center">
                    {settings.fontSize}px
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => adjustFontSize(2)}
                    disabled={settings.fontSize >= 24}
                  >
                    A+
                  </Button>
                </div>
              </div>

              {/* Quick Toggle Buttons */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'highContrast' as const, icon: Contrast, label: 'Contrast' },
                  { key: 'screenReaderMode' as const, icon: Eye, label: 'Reader' },
                  { key: 'keyboardNavigation' as const, icon: Keyboard, label: 'Keyboard' },
                  { key: 'reduceMotion' as const, icon: Move, label: 'Motion' },
                  { key: 'textSpacing' as const, icon: AlignLeft, label: 'Spacing' },
                  { key: 'focusHighlight' as const, icon: Focus, label: 'Focus' }
                ].map((option) => (
                  <Button
                    key={option.key}
                    variant={settings[option.key] ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleToggle(option.key)}
                    className={cn(
                      "flex flex-col gap-1 h-auto py-3",
                      settings[option.key] && "bg-blue-600 hover:bg-blue-700"
                    )}
                  >
                    <option.icon className="w-4 h-4" />
                    <span className="text-xs">{option.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Demo Content */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-2xl text-center space-y-4">
          <h1 className="text-4xl font-bold">Accessibility Menu</h1>
          <p className="text-gray-600 leading-relaxed">
            Click the floating button in the bottom-right corner to access accessibility settings.
            All preferences are automatically saved and applied.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityMenuComponent;
    `
  };

  return variants[variant] || variants.panel;
};
