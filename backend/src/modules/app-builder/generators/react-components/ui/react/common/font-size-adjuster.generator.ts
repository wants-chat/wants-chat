import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateFontSizeAdjuster = (
  resolved: ResolvedComponent,
  variant: 'buttons' | 'slider' | 'preset' = 'buttons'
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
import { Type, Minus, Plus, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';`;

  const variants = {
    buttons: `
${commonImports}

interface FontSizeAdjusterProps {
  ${dataName}?: any;
  className?: string;
  onFontSizeChange?: (size: number) => void;
}

const FontSizeAdjusterComponent: React.FC<FontSizeAdjusterProps> = ({
  ${dataName}: propData,
  className,
  onFontSizeChange
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

  const fontSizeData = ${dataName} || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const smallerLabel = ${getField('smallerLabel')};
  const largerLabel = ${getField('largerLabel')};
  const resetLabel = ${getField('resetLabel')};
  const previewTitle = ${getField('previewTitle')};
  const previewText = ${getField('previewText')};
  const defaultSize = ${getField('currentSize')};
  const minSize = ${getField('minSize')};
  const maxSize = ${getField('maxSize')};
  const step = ${getField('step')};

  const [fontSize, setFontSize] = useState<number>(defaultSize);

  const handleDecrease = () => {
    if (fontSize > minSize) {
      const newSize = fontSize - step;
      setFontSize(newSize);
      applyFontSize(newSize);
    }
  };

  const handleIncrease = () => {
    if (fontSize < maxSize) {
      const newSize = fontSize + step;
      setFontSize(newSize);
      applyFontSize(newSize);
    }
  };

  const handleReset = () => {
    setFontSize(defaultSize);
    applyFontSize(defaultSize);
  };

  const applyFontSize = (size: number) => {
    if (onFontSizeChange) {
      onFontSizeChange(size);
    }
    document.documentElement.style.fontSize = \`\${size}px\`;
    localStorage.setItem('fontSize', String(size));
  };

  useEffect(() => {
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
      const size = parseInt(savedFontSize, 10);
      setFontSize(size);
      document.documentElement.style.fontSize = \`\${size}px\`;
    }
  }, []);

  const getPercentage = () => {
    return Math.round((fontSize / defaultSize) * 100);
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 flex items-center justify-center p-4", className)}>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="w-5 h-5" />
            {title}
          </CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center gap-4 p-6 bg-gray-100 rounded-lg">
            <Button
              variant="outline"
              size="lg"
              onClick={handleDecrease}
              disabled={fontSize <= minSize}
              aria-label="Decrease font size"
            >
              <Minus className="w-4 h-4 mr-2" />
              {smallerLabel}
            </Button>

            <div className="flex flex-col items-center min-w-[120px]">
              <div className="text-4xl font-bold text-blue-600">{fontSize}px</div>
              <div className="text-sm text-gray-600">{getPercentage()}%</div>
            </div>

            <Button
              variant="outline"
              size="lg"
              onClick={handleIncrease}
              disabled={fontSize >= maxSize}
              aria-label="Increase font size"
            >
              <Plus className="w-4 h-4 mr-2" />
              {largerLabel}
            </Button>
          </div>

          <div className="flex justify-center">
            <Button
              variant="ghost"
              onClick={handleReset}
              className="text-blue-600 hover:text-blue-700"
              aria-label="Reset font size to default"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {resetLabel}
            </Button>
          </div>

          <div className="space-y-3">
            <Label>{previewTitle}</Label>
            <div
              className="p-6 bg-white border border-gray-200 rounded-lg"
              style={{ fontSize: \`\${fontSize}px\` }}
            >
              <p className="text-gray-900 leading-relaxed">
                {previewText}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <span>Min: {minSize}px</span>
            <span>Default: {defaultSize}px</span>
            <span>Max: {maxSize}px</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FontSizeAdjusterComponent;
    `,

    slider: `
${commonImports}

interface FontSizeAdjusterProps {
  ${dataName}?: any;
  className?: string;
  onFontSizeChange?: (size: number) => void;
}

const FontSizeAdjusterComponent: React.FC<FontSizeAdjusterProps> = ({
  ${dataName}: propData,
  className,
  onFontSizeChange
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

  const fontSizeData = ${dataName} || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const resetLabel = ${getField('resetLabel')};
  const previewTitle = ${getField('previewTitle')};
  const previewText = ${getField('previewText')};
  const defaultSize = ${getField('currentSize')};
  const minSize = ${getField('minSize')};
  const maxSize = ${getField('maxSize')};

  const [fontSize, setFontSize] = useState<number>(defaultSize);

  const handleSliderChange = (value: number[]) => {
    const newSize = value[0];
    setFontSize(newSize);
    applyFontSize(newSize);
  };

  const handleReset = () => {
    setFontSize(defaultSize);
    applyFontSize(defaultSize);
  };

  const applyFontSize = (size: number) => {
    if (onFontSizeChange) {
      onFontSizeChange(size);
    }
    document.documentElement.style.fontSize = \`\${size}px\`;
    localStorage.setItem('fontSize', String(size));
  };

  useEffect(() => {
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
      const size = parseInt(savedFontSize, 10);
      setFontSize(size);
      document.documentElement.style.fontSize = \`\${size}px\`;
    }
  }, []);

  const getPercentage = () => {
    return Math.round((fontSize / defaultSize) * 100);
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 flex items-center justify-center p-4", className)}>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="w-5 h-5" />
            {title}
          </CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 p-6 bg-gray-100 rounded-lg">
            <div className="flex items-center justify-between">
              <Label htmlFor="font-size-slider">Font Size</Label>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-blue-600">{fontSize}px</span>
                <span className="text-sm text-gray-600">({getPercentage()}%)</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Type className="w-4 h-4 text-gray-400" />
              <Slider
                id="font-size-slider"
                min={minSize}
                max={maxSize}
                step={1}
                value={[fontSize]}
                onValueChange={handleSliderChange}
                className="flex-1"
                aria-label="Adjust font size"
              />
              <Type className="w-6 h-6 text-gray-600" />
            </div>

            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>{minSize}px</span>
              <span>{defaultSize}px (Default)</span>
              <span>{maxSize}px</span>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={fontSize === defaultSize}
              aria-label="Reset font size to default"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {resetLabel}
            </Button>
          </div>

          <div className="space-y-3">
            <Label>{previewTitle}</Label>
            <div
              className="p-6 bg-white border border-gray-200 rounded-lg transition-all duration-200"
              style={{ fontSize: \`\${fontSize}px\` }}
            >
              <p className="text-gray-900 leading-relaxed">
                {previewText}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FontSizeAdjusterComponent;
    `,

    preset: `
${commonImports}

interface Preset {
  label: string;
  value: number;
  description: string;
}

interface FontSizeAdjusterProps {
  ${dataName}?: any;
  className?: string;
  onFontSizeChange?: (size: number) => void;
}

const FontSizeAdjusterComponent: React.FC<FontSizeAdjusterProps> = ({
  ${dataName}: propData,
  className,
  onFontSizeChange
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

  const fontSizeData = ${dataName} || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const previewTitle = ${getField('previewTitle')};
  const previewText = ${getField('previewText')};
  const defaultSize = ${getField('currentSize')};
  const presets = ${getField('presets')};

  const [fontSize, setFontSize] = useState<number>(defaultSize);

  const handlePresetSelect = (preset: Preset) => {
    setFontSize(preset.value);
    applyFontSize(preset.value);
  };

  const applyFontSize = (size: number) => {
    if (onFontSizeChange) {
      onFontSizeChange(size);
    }
    document.documentElement.style.fontSize = \`\${size}px\`;
    localStorage.setItem('fontSize', String(size));
  };

  useEffect(() => {
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
      const size = parseInt(savedFontSize, 10);
      setFontSize(size);
      document.documentElement.style.fontSize = \`\${size}px\`;
    }
  }, []);

  return (
    <div className={cn("min-h-screen bg-gray-50 flex items-center justify-center p-4", className)}>
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="w-5 h-5" />
            {title}
          </CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {presets.map((preset: Preset) => (
              <button
                key={preset.value}
                onClick={() => handlePresetSelect(preset)}
                className={cn(
                  "flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-all hover:shadow-md",
                  fontSize === preset.value
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-gray-300"
                )}
                aria-label={\`Set font size to \${preset.label}\`}
              >
                <Type
                  className={cn(
                    "transition-all",
                    fontSize === preset.value ? "text-blue-600" : "text-gray-600"
                  )}
                  style={{ width: \`\${preset.value}px\`, height: \`\${preset.value}px\` }}
                />
                <div className="text-center">
                  <div className="font-semibold text-sm">{preset.label}</div>
                  <div className="text-xs text-gray-500">{preset.value}px</div>
                  <div className="text-xs text-gray-400 mt-1">{preset.description}</div>
                </div>
                {fontSize === preset.value && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-blue-600 rounded-full p-1">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <Label>{previewTitle}</Label>
            <div
              className="p-6 bg-white border-2 border-gray-200 rounded-lg transition-all duration-300"
              style={{ fontSize: \`\${fontSize}px\` }}
            >
              <p className="text-gray-900 leading-relaxed">
                {previewText}
              </p>
            </div>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>Current size: <span className="font-semibold text-blue-600">{fontSize}px</span></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FontSizeAdjusterComponent;
    `
  };

  return variants[variant] || variants.buttons;
};
