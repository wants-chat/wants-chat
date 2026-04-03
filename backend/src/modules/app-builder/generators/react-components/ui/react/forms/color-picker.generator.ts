import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateColorPicker = (
  resolved: ResolvedComponent,
  variant: 'simple' | 'advanced' | 'swatches' = 'simple'
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
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Pipette, Copy, Check, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';`;

  const variants = {
    simple: `
${commonImports}

interface ColorPickerSimpleProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  [key: string]: any;
}

const ColorPickerSimple: React.FC<ColorPickerSimpleProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className }) => {
  const [color, setColor] = useState('#3B82F6');
  const [hexInput, setHexInput] = useState('#3B82F6');
  const [copied, setCopied] = useState(false);

  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\`${apiRoute}\`),
    enabled: !propData,
  });

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const colorPickerData = propData || fetchedData || {};

  const colorTitle = ${getField('colorTitle')};
  const hexLabel = ${getField('hexLabel')};
  const hexPlaceholder = ${getField('hexPlaceholder')};
  const applyButton = ${getField('applyButton')};

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setColor(newColor);
    setHexInput(newColor);
    console.log('Color changed:', newColor);
  };

  const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHexInput(value);
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      setColor(value);
      console.log('Valid hex entered:', value);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(color);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    console.log('Color copied:', color);
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", className)}>
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{colorTitle}</h2>

          <div className="space-y-6">
            <div
              className="w-full h-48 rounded-lg border-4 border-gray-200 dark:border-gray-700 shadow-inner"
              style={{ backgroundColor: color }}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {hexLabel}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={hexInput}
                  onChange={handleHexInput}
                  placeholder={hexPlaceholder}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {copied ? (
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <Copy className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Color
              </label>
              <input
                type="color"
                value={color}
                onChange={handleColorChange}
                className="w-full h-14 rounded-lg cursor-pointer border border-gray-300 dark:border-gray-600"
              />
            </div>

            <button
              type="button"
              onClick={() => console.log('Color applied:', color)}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              {applyButton}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPickerSimple;
    `,

    advanced: `
${commonImports}

interface ColorPickerAdvancedProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  [key: string]: any;
}

const ColorPickerAdvanced: React.FC<ColorPickerAdvancedProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className }) => {
  const [color, setColor] = useState('#3B82F6');
  const [r, setR] = useState(59);
  const [g, setG] = useState(130);
  const [b, setB] = useState(246);
  const [h, setH] = useState(217);
  const [s, setS] = useState(91);
  const [l, setL] = useState(60);
  const [opacity, setOpacity] = useState(100);
  const [copied, setCopied] = useState(false);

  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\`${apiRoute}\`),
    enabled: !propData,
  });

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const colorPickerData = propData || fetchedData || {};

  const colorTitle = ${getField('colorTitle')};
  const hexLabel = ${getField('hexLabel')};
  const rgbLabel = ${getField('rgbLabel')};
  const hslLabel = ${getField('hslLabel')};
  const redLabel = ${getField('redLabel')};
  const greenLabel = ${getField('greenLabel')};
  const blueLabel = ${getField('blueLabel')};
  const hueLabel = ${getField('hueLabel')};
  const saturationLabel = ${getField('saturationLabel')};
  const lightnessLabel = ${getField('lightnessLabel')};
  const opacityLabel = ${getField('opacityLabel')};
  const applyButton = ${getField('applyButton')};

  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const handleRgbChange = (newR: number, newG: number, newB: number) => {
    setR(newR);
    setG(newG);
    setB(newB);
    setColor(rgbToHex(newR, newG, newB));
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setColor(newColor);
    if (/^#[0-9A-F]{6}$/i.test(newColor)) {
      const rgb = hexToRgb(newColor);
      setR(rgb.r);
      setG(rgb.g);
      setB(rgb.b);
    }
  };

  const handleCopy = () => {
    const colorValue = opacity < 100
      ? \`rgba(\${r}, \${g}, \${b}, \${opacity / 100})\`
      : color;
    navigator.clipboard.writeText(colorValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    console.log('Color copied:', colorValue);
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", className)}>
      <div className="w-full max-w-3xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{colorTitle}</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div
                className="w-full h-64 rounded-lg border-4 border-gray-200 dark:border-gray-700 shadow-inner mb-4"
                style={{
                  backgroundColor: color,
                  opacity: opacity / 100
                }}
              />

              <div className="flex gap-2">
                <input
                  type="text"
                  value={color}
                  onChange={handleHexChange}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {copied ? (
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <Copy className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{rgbLabel}</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm text-gray-600 dark:text-gray-400">{redLabel}</label>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{r}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="255"
                      value={r}
                      onChange={(e) => handleRgbChange(Number(e.target.value), g, b)}
                      className="w-full h-2 bg-gradient-to-r from-black to-red-500 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm text-gray-600 dark:text-gray-400">{greenLabel}</label>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{g}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="255"
                      value={g}
                      onChange={(e) => handleRgbChange(r, Number(e.target.value), b)}
                      className="w-full h-2 bg-gradient-to-r from-black to-green-500 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm text-gray-600 dark:text-gray-400">{blueLabel}</label>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{b}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="255"
                      value={b}
                      onChange={(e) => handleRgbChange(r, g, Number(e.target.value))}
                      className="w-full h-2 bg-gradient-to-r from-black to-blue-500 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{hslLabel}</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm text-gray-600 dark:text-gray-400">{hueLabel}</label>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{h}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={h}
                      onChange={(e) => setH(Number(e.target.value))}
                      className="w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-cyan-500 via-blue-500 via-purple-500 to-red-500 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm text-gray-600 dark:text-gray-400">{saturationLabel}</label>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{s}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={s}
                      onChange={(e) => setS(Number(e.target.value))}
                      className="w-full h-2 bg-gradient-to-r from-gray-500 to-blue-500 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm text-gray-600 dark:text-gray-400">{lightnessLabel}</label>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{l}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={l}
                      onChange={(e) => setL(Number(e.target.value))}
                      className="w-full h-2 bg-gradient-to-r from-black via-blue-500 to-white rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{opacityLabel}</label>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{opacity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => console.log('Color applied:', { color, r, g, b, h, s, l, opacity })}
            className="w-full mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            {applyButton}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColorPickerAdvanced;
    `,

    swatches: `
${commonImports}

interface ColorPickerSwatchesProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  [key: string]: any;
}

const ColorPickerSwatches: React.FC<ColorPickerSwatchesProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className }) => {
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [customColor, setCustomColor] = useState('#3B82F6');
  const [recentColors, setRecentColors] = useState<string[]>(['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6']);
  const [copied, setCopied] = useState(false);

  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\`${apiRoute}\`),
    enabled: !propData,
  });

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const colorPickerData = propData || fetchedData || {};

  const colorTitle = ${getField('colorTitle')};
  const swatchesLabel = ${getField('swatchesLabel')};
  const recentColorsLabel = ${getField('recentColorsLabel')};
  const hexLabel = ${getField('hexLabel')};
  const swatches = ${getField('swatches')};
  const eyedropperButton = ${getField('eyedropperButton')};
  const addSwatchButton = ${getField('addSwatchButton')};
  const applyButton = ${getField('applyButton')};

  const handleSwatchClick = (color: string) => {
    setSelectedColor(color);
    setCustomColor(color);
    addToRecent(color);
    console.log('Swatch selected:', color);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    setSelectedColor(newColor);
    addToRecent(newColor);
    console.log('Custom color selected:', newColor);
  };

  const addToRecent = (color: string) => {
    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== color);
      return [color, ...filtered].slice(0, 10);
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedColor);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    console.log('Color copied:', selectedColor);
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", className)}>
      <div className="w-full max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{colorTitle}</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <div
                className="w-full h-64 rounded-lg border-4 border-gray-200 dark:border-gray-700 shadow-inner mb-4"
                style={{ backgroundColor: selectedColor }}
              />

              <div className="flex gap-2">
                <input
                  type="text"
                  value={selectedColor}
                  readOnly
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white font-mono"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {copied ? (
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <Copy className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Custom Color
              </label>
              <input
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className="w-full h-14 rounded-lg cursor-pointer border border-gray-300 dark:border-gray-600 mb-3"
              />
              <button
                type="button"
                onClick={() => console.log('Eyedropper clicked')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <Pipette className="h-4 w-4" />
                {eyedropperButton}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{recentColorsLabel}</h3>
            <div className="flex gap-2 flex-wrap">
              {recentColors.map((color, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSwatchClick(color)}
                  className={cn(
                    "w-12 h-12 rounded-lg border-2 transition-all hover:scale-110",
                    selectedColor === color
                      ? "border-blue-600 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800"
                      : "border-gray-300 dark:border-gray-600"
                  )}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{swatchesLabel}</h3>
            <div className="grid grid-cols-10 gap-2">
              {swatches.map((color: string, index: number) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSwatchClick(color)}
                  className={cn(
                    "w-full aspect-square rounded-lg border-2 transition-all hover:scale-110",
                    selectedColor === color
                      ? "border-blue-600 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800"
                      : "border-gray-300 dark:border-gray-600"
                  )}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => console.log('Color applied:', selectedColor)}
            className="w-full mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            {applyButton}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColorPickerSwatches;
    `
  };

  return variants[variant] || variants.simple;
};
