import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateHighContrastMode = (
  resolved: ResolvedComponent,
  variant: 'toggle' | 'selector' | 'auto' = 'toggle'
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
    return `/${dataSource || 'data'}`;
  };

  const apiRoute = getApiRoute();

  const commonImports = `
import React, { useState, useEffect } from 'react';
import { Contrast, Eye, Check, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';`;

  const variants = {
    toggle: `
${commonImports}

interface HighContrastModeProps {
  ${dataName}?: any;
  className?: string;
  onModeChange?: (enabled: boolean) => void;
}

const HighContrastModeComponent: React.FC<HighContrastModeProps> = ({
  ${dataName}: propData,
  className,
  onModeChange
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const contrastData = ${dataName} || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const enableLabel = ${getField('enableLabel')};

  const [isEnabled, setIsEnabled] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const handleToggle = (checked: boolean) => {
    setIsEnabled(checked);
    applyContrast(checked);
  };

  const handlePreviewToggle = (checked: boolean) => {
    setIsPreview(checked);
    if (checked) {
      applyContrast(true);
    } else if (!isEnabled) {
      removeContrast();
    }
  };

  const applyContrast = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add('high-contrast');
      document.documentElement.style.setProperty('--bg-color', '#000000');
      document.documentElement.style.setProperty('--text-color', '#FFFFFF');
    } else {
      removeContrast();
    }

    if (onModeChange) {
      onModeChange(enabled);
    }

    localStorage.setItem('highContrastEnabled', String(enabled));
  };

  const removeContrast = () => {
    document.documentElement.classList.remove('high-contrast');
    document.documentElement.style.removeProperty('--bg-color');
    document.documentElement.style.removeProperty('--text-color');
  };

  useEffect(() => {
    const saved = localStorage.getItem('highContrastEnabled') === 'true';
    setIsEnabled(saved);
    if (saved) {
      applyContrast(true);
    }
  }, []);

  return (
    <div className={cn("min-h-screen bg-gray-50 flex items-center justify-center p-4", className)}>
      <style>{\`
        .high-contrast {
          filter: contrast(1.5);
        }
        .high-contrast-preview {
          background-color: var(--bg-color, #000000);
          color: var(--text-color, #FFFFFF);
        }
      \`}</style>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Contrast className="w-5 h-5" />
            {title}
          </CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
            <Label htmlFor="high-contrast-toggle" className="text-base font-medium">
              {enableLabel}
            </Label>
            <Switch
              id="high-contrast-toggle"
              checked={isEnabled}
              onCheckedChange={handleToggle}
              aria-label="Toggle high contrast mode"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Label htmlFor="preview-toggle" className="text-sm font-medium">
              Preview Mode
            </Label>
            <Switch
              id="preview-toggle"
              checked={isPreview}
              onCheckedChange={handlePreviewToggle}
              aria-label="Toggle preview mode"
            />
          </div>

          {(isEnabled || isPreview) && (
            <div className="space-y-3">
              <Label>Preview</Label>
              <div className={cn(
                "p-6 rounded-lg border-2",
                isEnabled || isPreview ? "high-contrast-preview" : "bg-white"
              )}>
                <h3 className="text-lg font-semibold mb-2">Sample Heading</h3>
                <p className="text-sm mb-4">
                  This is how text will appear with high contrast mode enabled.
                  The contrast is enhanced for better visibility.
                </p>
                <Button
                  variant={isEnabled || isPreview ? "outline" : "default"}
                  size="sm"
                >
                  Sample Button
                </Button>
              </div>
            </div>
          )}

          <div className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="flex items-start gap-2">
              <Eye className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>High contrast mode enhances the difference between text and background colors for improved readability.</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HighContrastModeComponent;
    `,

    selector: `
${commonImports}

interface ContrastLevel {
  id: string;
  name: string;
  description: string;
  value: number;
}

interface ContrastTheme {
  id: string;
  name: string;
  bgColor: string;
  textColor: string;
}

interface HighContrastModeProps {
  ${dataName}?: any;
  className?: string;
  onModeChange?: (level: string, theme: string) => void;
}

const HighContrastModeComponent: React.FC<HighContrastModeProps> = ({
  ${dataName}: propData,
  className,
  onModeChange
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const contrastData = ${dataName} || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const contrastLevels = ${getField('contrastLevels')};
  const themes = ${getField('themes')};
  const currentModeValue = ${getField('currentMode')};

  const [selectedLevel, setSelectedLevel] = useState<string>(currentModeValue);
  const [selectedTheme, setSelectedTheme] = useState<string>('default');

  const handleLevelChange = (levelId: string) => {
    setSelectedLevel(levelId);
    applyContrast(levelId, selectedTheme);
  };

  const handleThemeChange = (themeId: string) => {
    setSelectedTheme(themeId);
    applyContrast(selectedLevel, themeId);
  };

  const applyContrast = (levelId: string, themeId: string) => {
    const level = contrastLevels.find((l: ContrastLevel) => l.id === levelId);
    const theme = themes.find((t: ContrastTheme) => t.id === themeId);

    if (levelId === 'normal') {
      document.documentElement.style.filter = '';
      document.documentElement.classList.remove('high-contrast');
    } else {
      document.documentElement.style.filter = \`contrast(\${level?.value || 1})\`;
      document.documentElement.classList.add('high-contrast');
    }

    if (theme && levelId !== 'normal') {
      document.documentElement.style.setProperty('--bg-color', theme.bgColor);
      document.documentElement.style.setProperty('--text-color', theme.textColor);
    } else {
      document.documentElement.style.removeProperty('--bg-color');
      document.documentElement.style.removeProperty('--text-color');
    }

    if (onModeChange) {
      onModeChange(levelId, themeId);
    }

    localStorage.setItem('contrastLevel', levelId);
    localStorage.setItem('contrastTheme', themeId);
  };

  useEffect(() => {
    const savedLevel = localStorage.getItem('contrastLevel') || 'normal';
    const savedTheme = localStorage.getItem('contrastTheme') || 'default';
    setSelectedLevel(savedLevel);
    setSelectedTheme(savedTheme);
    applyContrast(savedLevel, savedTheme);
  }, []);

  return (
    <div className={cn("min-h-screen bg-gray-50 flex items-center justify-center p-4", className)}>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Contrast className="w-5 h-5" />
            {title}
          </CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Contrast Level Selector */}
          <div className="space-y-3">
            <Label>Contrast Level</Label>
            <RadioGroup value={selectedLevel} onValueChange={handleLevelChange}>
              <div className="grid gap-3">
                {contrastLevels.map((level: ContrastLevel) => (
                  <div
                    key={level.id}
                    className={cn(
                      "flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                      selectedLevel === level.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                    onClick={() => handleLevelChange(level.id)}
                  >
                    <RadioGroupItem value={level.id} id={level.id} className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor={level.id} className="font-medium cursor-pointer">
                        {level.name}
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">{level.description}</p>
                      {level.value !== 1 && (
                        <p className="text-xs text-blue-600 mt-1">Contrast: {level.value}x</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Theme Selector (only when contrast is enabled) */}
          {selectedLevel !== 'normal' && (
            <div className="space-y-3">
              <Label>Color Theme</Label>
              <div className="grid grid-cols-2 gap-3">
                {themes.map((theme: ContrastTheme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeChange(theme.id)}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-lg border-2 transition-all hover:shadow-md",
                      selectedTheme === theme.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div
                      className="w-12 h-12 rounded-lg border-2 border-gray-300 flex items-center justify-center text-xs font-bold"
                      style={{
                        backgroundColor: theme.bgColor,
                        color: theme.textColor
                      }}
                    >
                      Aa
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-medium text-sm">{theme.name}</div>
                    </div>
                    {selectedTheme === theme.id && (
                      <Check className="w-5 h-5 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="space-y-3">
            <Label>Preview</Label>
            <div
              className="p-6 rounded-lg border-2"
              style={{
                filter: selectedLevel !== 'normal'
                  ? \`contrast(\${contrastLevels.find((l: ContrastLevel) => l.id === selectedLevel)?.value || 1})\`
                  : 'none',
                backgroundColor: selectedLevel !== 'normal'
                  ? themes.find((t: ContrastTheme) => t.id === selectedTheme)?.bgColor
                  : '#FFFFFF',
                color: selectedLevel !== 'normal'
                  ? themes.find((t: ContrastTheme) => t.id === selectedTheme)?.textColor
                  : '#000000'
              }}
            >
              <h3 className="text-lg font-semibold mb-2">Sample Heading</h3>
              <p className="text-sm mb-4">
                This is how text will appear with your selected contrast settings.
              </p>
              <Button size="sm" variant="outline">
                Sample Button
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HighContrastModeComponent;
    `,

    auto: `
${commonImports}

interface HighContrastModeProps {
  ${dataName}?: any;
  className?: string;
  onModeChange?: (mode: 'auto' | 'enabled' | 'disabled') => void;
}

const HighContrastModeComponent: React.FC<HighContrastModeProps> = ({
  ${dataName}: propData,
  className,
  onModeChange
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const contrastData = ${dataName} || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};

  const [mode, setMode] = useState<'auto' | 'enabled' | 'disabled'>('auto');
  const [systemPreference, setSystemPreference] = useState(false);
  const [contrastLevel, setContrastLevel] = useState(1.5);

  const getEffectiveMode = (): boolean => {
    if (mode === 'auto') {
      return systemPreference;
    }
    return mode === 'enabled';
  };

  const handleModeChange = (newMode: 'auto' | 'enabled' | 'disabled') => {
    setMode(newMode);
    applyContrast(newMode);
  };

  const applyContrast = (selectedMode: 'auto' | 'enabled' | 'disabled') => {
    const shouldApply = selectedMode === 'enabled' || (selectedMode === 'auto' && systemPreference);

    if (shouldApply) {
      document.documentElement.style.filter = \`contrast(\${contrastLevel})\`;
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.style.filter = '';
      document.documentElement.classList.remove('high-contrast');
    }

    if (onModeChange) {
      onModeChange(selectedMode);
    }

    localStorage.setItem('contrastMode', selectedMode);
  };

  useEffect(() => {
    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-contrast: more)');
    setSystemPreference(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches);
      if (mode === 'auto') {
        applyContrast('auto');
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    // Load saved mode
    const savedMode = localStorage.getItem('contrastMode') as 'auto' | 'enabled' | 'disabled';
    if (savedMode) {
      setMode(savedMode);
      applyContrast(savedMode);
    }

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (mode === 'auto') {
      applyContrast('auto');
    }
  }, [systemPreference]);

  return (
    <div className={cn("min-h-screen bg-gray-50 flex items-center justify-center p-4", className)}>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Contrast className="w-5 h-5" />
            {title}
          </CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode Selection */}
          <div className="space-y-3">
            <Label>Contrast Mode</Label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant={mode === 'disabled' ? 'default' : 'outline'}
                onClick={() => handleModeChange('disabled')}
                className={cn(
                  "h-auto flex-col gap-2 py-4",
                  mode === 'disabled' && "bg-blue-600 hover:bg-blue-700"
                )}
              >
                <X className="w-5 h-5" />
                <span className="text-sm">Disabled</span>
              </Button>

              <Button
                variant={mode === 'auto' ? 'default' : 'outline'}
                onClick={() => handleModeChange('auto')}
                className={cn(
                  "h-auto flex-col gap-2 py-4",
                  mode === 'auto' && "bg-blue-600 hover:bg-blue-700"
                )}
              >
                <Eye className="w-5 h-5" />
                <span className="text-sm">Auto</span>
              </Button>

              <Button
                variant={mode === 'enabled' ? 'default' : 'outline'}
                onClick={() => handleModeChange('enabled')}
                className={cn(
                  "h-auto flex-col gap-2 py-4",
                  mode === 'enabled' && "bg-blue-600 hover:bg-blue-700"
                )}
              >
                <Check className="w-5 h-5" />
                <span className="text-sm">Enabled</span>
              </Button>
            </div>
          </div>

          {/* Contrast Level Slider (when enabled) */}
          {(mode === 'enabled' || (mode === 'auto' && systemPreference)) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="contrast-slider">Contrast Level</Label>
                <span className="text-sm font-medium">{contrastLevel.toFixed(2)}x</span>
              </div>
              <Slider
                id="contrast-slider"
                min={1}
                max={3}
                step={0.1}
                value={[contrastLevel]}
                onValueChange={(value) => {
                  setContrastLevel(value[0]);
                  if (getEffectiveMode()) {
                    document.documentElement.style.filter = \`contrast(\${value[0]})\`;
                    localStorage.setItem('contrastLevel', String(value[0]));
                  }
                }}
                aria-label="Adjust contrast level"
              />
              <div className="flex justify-between text-xs text-gray-600">
                <span>Normal</span>
                <span>High</span>
                <span>Maximum</span>
              </div>
            </div>
          )}

          {/* System Preference Info */}
          {mode === 'auto' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>System Preference:</strong> {systemPreference ? 'High contrast preferred' : 'Normal contrast'}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                High contrast will be {systemPreference ? 'enabled' : 'disabled'} based on your system settings.
              </p>
            </div>
          )}

          {/* Preview */}
          <div className="space-y-3">
            <Label>Preview</Label>
            <div
              className="p-6 rounded-lg border-2 bg-white"
              style={{
                filter: getEffectiveMode() ? \`contrast(\${contrastLevel})\` : 'none'
              }}
            >
              <h3 className="text-lg font-semibold mb-2">Sample Heading</h3>
              <p className="text-sm text-gray-700 mb-4">
                This is how text will appear with your selected contrast settings.
                {getEffectiveMode() && ' High contrast is currently active.'}
              </p>
              <div className="flex gap-2">
                <Button size="sm">Primary</Button>
                <Button size="sm" variant="outline">Secondary</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HighContrastModeComponent;
    `
  };

  return variants[variant] || variants.toggle;
};
