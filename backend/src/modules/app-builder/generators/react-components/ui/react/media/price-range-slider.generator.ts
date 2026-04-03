import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generatePriceRangeSlider = (
  resolved: ResolvedComponent,
  variant: 'slider' | 'dual' | 'withInputs' = 'slider'
) => {
  const dataSource = resolved.dataSource;

  // Get the resolved field names from the field resolver service
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

  // Parse data source for clean prop naming
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
  const entity = dataSource?.split('.').pop() || 'data';

  const formatPrice = `(price: number, currencySymbol: string = '$') => {
    return \`\${currencySymbol}\${price.toLocaleString()}\`;
  }`;

  const commonImports = `
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';`;

  const commonStyles = `
    .price-range-container {
      @apply w-full;
    }

    .slider-track {
      @apply relative w-full h-2 bg-gray-200 rounded-full;
    }

    .slider-range {
      @apply absolute h-full bg-blue-600 rounded-full;
    }

    .slider-thumb {
      @apply absolute w-5 h-5 bg-white border-2 border-blue-600 rounded-full cursor-pointer shadow-md transition-transform hover:scale-110;
      top: 50%;
      transform: translate(-50%, -50%);
    }

    .slider-thumb:active {
      @apply scale-125;
    }

    .price-input {
      @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500;
    }

    .price-label {
      @apply text-sm font-medium text-gray-700 dark:text-gray-300 mb-2;
    }

    .price-display {
      @apply text-lg font-bold text-gray-900 dark:text-gray-100;
    }

    .filter-buttons {
      @apply flex gap-2 mt-4;
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .slider-track {
        @apply bg-gray-700;
      }
      .slider-thumb {
        @apply bg-gray-800 border-blue-500;
      }
      .price-input {
        @apply bg-gray-800 border-gray-600 text-gray-100;
      }
    }
  `;

  const variants = {
    slider: `
${commonImports}

interface PriceRangeSliderProps {
  ${dataName}?: any;
  className?: string;
  onPriceChange?: (min: number, max: number) => void;
}

const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({ ${dataName}: propData, className, onPriceChange }) => {
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

  const filterData = ${dataName} || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const minPrice = filterData.minPrice ?? ${getField('minPrice')};
  const maxPrice = filterData.maxPrice ?? ${getField('maxPrice')};
  const initialMinPrice = filterData.currentMinPrice ?? ${getField('currentMinPrice')};
  const initialMaxPrice = filterData.currentMaxPrice ?? ${getField('currentMaxPrice')};
  const stepIncrement = filterData.stepIncrement ?? ${getField('stepIncrement')};
  const currencySymbol = filterData.currencySymbol ?? ${getField('currencySymbol')};
  const priceRangeLabel = filterData.priceRangeLabel ?? ${getField('priceRangeLabel')};
  const updateTrigger = filterData.updateTrigger ?? ${getField('updateTrigger')};

  const [currentMin, setCurrentMin] = useState(initialMinPrice);
  const [currentMax, setCurrentMax] = useState(initialMaxPrice);
  const [isDragging, setIsDragging] = useState(false);

  const formatPrice = ${formatPrice};

  const handleMinChange = (value: number) => {
    const newMin = Math.min(value, currentMax - stepIncrement);
    setCurrentMin(newMin);
    if (updateTrigger === 'change' && !isDragging) {
      onPriceChange?.(newMin, currentMax);
    }
  };

  const handleMaxChange = (value: number) => {
    const newMax = Math.max(value, currentMin + stepIncrement);
    setCurrentMax(newMax);
    if (updateTrigger === 'change' && !isDragging) {
      onPriceChange?.(currentMin, newMax);
    }
  };

  const handleSliderChange = (values: number[]) => {
    setCurrentMin(values[0]);
    setCurrentMax(values[1]);
    if (updateTrigger === 'change') {
      onPriceChange?.(values[0], values[1]);
    }
  };

  const handleSliderCommit = (values: number[]) => {
    setIsDragging(false);
    if (updateTrigger === 'release') {
      onPriceChange?.(values[0], values[1]);
    }
  };

  return (
    <>
<Card className="price-range-container">
        <CardHeader>
          <CardTitle className="text-lg">{priceRangeLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="price-display">{formatPrice(currentMin, currencySymbol)}</span>
              <span className="text-gray-500">-</span>
              <span className="price-display">{formatPrice(currentMax, currencySymbol)}</span>
            </div>

            <Slider
              min={minPrice}
              max={maxPrice}
              step={stepIncrement}
              value={[currentMin, currentMax]}
              onValueChange={handleSliderChange}
              onValueCommit={handleSliderCommit}
              onMouseDown={() => setIsDragging(true)}
              className="w-full"
            />

            <div className="flex justify-between mt-2 text-sm text-gray-500">
              <span>{formatPrice(minPrice, currencySymbol)}</span>
              <span>{formatPrice(maxPrice, currencySymbol)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default PriceRangeSlider;
    `,

    dual: `
${commonImports}

interface PriceRangeSliderProps {
  ${dataName}?: any;
  className?: string;
  onPriceChange?: (min: number, max: number) => void;
}

const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({ ${dataName}: propData, className, onPriceChange }) => {
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

  const filterData = ${dataName} || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const minPrice = filterData.minPrice ?? ${getField('minPrice')};
  const maxPrice = filterData.maxPrice ?? ${getField('maxPrice')};
  const initialMinPrice = filterData.currentMinPrice ?? ${getField('currentMinPrice')};
  const initialMaxPrice = filterData.currentMaxPrice ?? ${getField('currentMaxPrice')};
  const stepIncrement = filterData.stepIncrement ?? ${getField('stepIncrement')};
  const currencySymbol = filterData.currencySymbol ?? ${getField('currencySymbol')};
  const priceRangeLabel = filterData.priceRangeLabel ?? ${getField('priceRangeLabel')};
  const updateTrigger = filterData.updateTrigger ?? ${getField('updateTrigger')};
  const applyFilterText = filterData.applyFilterText ?? ${getField('applyFilterText')};
  const resetFilterText = filterData.resetFilterText ?? ${getField('resetFilterText')};

  const [currentMin, setCurrentMin] = useState(initialMinPrice);
  const [currentMax, setCurrentMax] = useState(initialMaxPrice);
  const [pendingMin, setPendingMin] = useState(initialMinPrice);
  const [pendingMax, setPendingMax] = useState(initialMaxPrice);

  const sliderRef = useRef<HTMLDivElement>(null);
  const minThumbRef = useRef<HTMLDivElement>(null);
  const maxThumbRef = useRef<HTMLDivElement>(null);

  const formatPrice = ${formatPrice};

  const getPercentage = (value: number) => {
    return ((value - minPrice) / (maxPrice - minPrice)) * 100;
  };

  const handleApply = () => {
    setCurrentMin(pendingMin);
    setCurrentMax(pendingMax);
    onPriceChange?.(pendingMin, pendingMax);
  };

  const handleReset = () => {
    setPendingMin(initialMinPrice);
    setPendingMax(initialMaxPrice);
    setCurrentMin(initialMinPrice);
    setCurrentMax(initialMaxPrice);
    onPriceChange?.(initialMinPrice, initialMaxPrice);
  };

  const handleSliderClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const value = Math.round((minPrice + percent * (maxPrice - minPrice)) / stepIncrement) * stepIncrement;

    const distToMin = Math.abs(value - pendingMin);
    const distToMax = Math.abs(value - pendingMax);

    if (distToMin < distToMax) {
      setPendingMin(Math.min(value, pendingMax - stepIncrement));
    } else {
      setPendingMax(Math.max(value, pendingMin + stepIncrement));
    }
  };

  return (
    <>
<Card className="price-range-container">
        <CardHeader>
          <CardTitle className="text-lg">{priceRangeLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-6">
              <span className="price-display">{formatPrice(pendingMin, currencySymbol)}</span>
              <span className="text-gray-500">-</span>
              <span className="price-display">{formatPrice(pendingMax, currencySymbol)}</span>
            </div>

            <div className="relative mb-8">
              <div
                ref={sliderRef}
                className="slider-track"
                onClick={handleSliderClick}
              >
                <div
                  className="slider-range"
                  style={{
                    left: \`\${getPercentage(pendingMin)}%\`,
                    right: \`\${100 - getPercentage(pendingMax)}%\`
                  }}
                />
                <div
                  ref={minThumbRef}
                  className="slider-thumb"
                  style={{ left: \`\${getPercentage(pendingMin)}%\` }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const startX = e.clientX;
                    const startValue = pendingMin;

                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      if (!sliderRef.current) return;
                      const rect = sliderRef.current.getBoundingClientRect();
                      const deltaX = moveEvent.clientX - startX;
                      const deltaValue = (deltaX / rect.width) * (maxPrice - minPrice);
                      const newValue = Math.round((startValue + deltaValue) / stepIncrement) * stepIncrement;
                      const clampedValue = Math.max(minPrice, Math.min(pendingMax - stepIncrement, newValue));
                      setPendingMin(clampedValue);
                      if (updateTrigger === 'change') {
                        onPriceChange?.(clampedValue, pendingMax);
                      }
                    };

                    const handleMouseUp = () => {
                      if (updateTrigger === 'release') {
                        onPriceChange?.(pendingMin, pendingMax);
                      }
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };

                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                />
                <div
                  ref={maxThumbRef}
                  className="slider-thumb"
                  style={{ left: \`\${getPercentage(pendingMax)}%\` }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const startX = e.clientX;
                    const startValue = pendingMax;

                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      if (!sliderRef.current) return;
                      const rect = sliderRef.current.getBoundingClientRect();
                      const deltaX = moveEvent.clientX - startX;
                      const deltaValue = (deltaX / rect.width) * (maxPrice - minPrice);
                      const newValue = Math.round((startValue + deltaValue) / stepIncrement) * stepIncrement;
                      const clampedValue = Math.max(pendingMin + stepIncrement, Math.min(maxPrice, newValue));
                      setPendingMax(clampedValue);
                      if (updateTrigger === 'change') {
                        onPriceChange?.(pendingMin, clampedValue);
                      }
                    };

                    const handleMouseUp = () => {
                      if (updateTrigger === 'release') {
                        onPriceChange?.(pendingMin, pendingMax);
                      }
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };

                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                />
              </div>

              <div className="flex justify-between mt-2 text-sm text-gray-500">
                <span>{formatPrice(minPrice, currencySymbol)}</span>
                <span>{formatPrice(maxPrice, currencySymbol)}</span>
              </div>
            </div>

            <div className="filter-buttons">
              <Button className="flex-1" onClick={handleApply}>
                {applyFilterText}
              </Button>
              <Button variant="outline" onClick={handleReset}>
                {resetFilterText}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default PriceRangeSlider;
    `,

    withInputs: `
${commonImports}

interface PriceRangeSliderProps {
  ${dataName}?: any;
  className?: string;
  onPriceChange?: (min: number, max: number) => void;
}

const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({ ${dataName}: propData, className, onPriceChange }) => {
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

  const filterData = ${dataName} || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const minPrice = filterData.minPrice ?? ${getField('minPrice')};
  const maxPrice = filterData.maxPrice ?? ${getField('maxPrice')};
  const initialMinPrice = filterData.currentMinPrice ?? ${getField('currentMinPrice')};
  const initialMaxPrice = filterData.currentMaxPrice ?? ${getField('currentMaxPrice')};
  const stepIncrement = filterData.stepIncrement ?? ${getField('stepIncrement')};
  const currencySymbol = filterData.currencySymbol ?? ${getField('currencySymbol')};
  const priceRangeLabel = filterData.priceRangeLabel ?? ${getField('priceRangeLabel')};
  const minPriceLabel = filterData.minPriceLabel ?? ${getField('minPriceLabel')};
  const maxPriceLabel = filterData.maxPriceLabel ?? ${getField('maxPriceLabel')};
  const updateTrigger = filterData.updateTrigger ?? ${getField('updateTrigger')};
  const applyFilterText = filterData.applyFilterText ?? ${getField('applyFilterText')};
  const resetFilterText = filterData.resetFilterText ?? ${getField('resetFilterText')};
  const fromText = filterData.fromText ?? ${getField('fromText')};
  const toText = filterData.toText ?? ${getField('toText')};

  const [currentMin, setCurrentMin] = useState(initialMinPrice);
  const [currentMax, setCurrentMax] = useState(initialMaxPrice);
  const [minInput, setMinInput] = useState(String(initialMinPrice));
  const [maxInput, setMaxInput] = useState(String(initialMaxPrice));

  const formatPrice = ${formatPrice};

  const handleSliderChange = (values: number[]) => {
    setCurrentMin(values[0]);
    setCurrentMax(values[1]);
    setMinInput(String(values[0]));
    setMaxInput(String(values[1]));
    if (updateTrigger === 'change') {
      onPriceChange?.(values[0], values[1]);
    }
  };

  const handleSliderCommit = (values: number[]) => {
    if (updateTrigger === 'release') {
      onPriceChange?.(values[0], values[1]);
    }
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinInput(e.target.value);
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxInput(e.target.value);
  };

  const handleMinInputBlur = () => {
    const value = parseInt(minInput) || minPrice;
    const clampedValue = Math.max(minPrice, Math.min(currentMax - stepIncrement, value));
    setCurrentMin(clampedValue);
    setMinInput(String(clampedValue));
    if (updateTrigger === 'change') {
      onPriceChange?.(clampedValue, currentMax);
    }
  };

  const handleMaxInputBlur = () => {
    const value = parseInt(maxInput) || maxPrice;
    const clampedValue = Math.max(currentMin + stepIncrement, Math.min(maxPrice, value));
    setCurrentMax(clampedValue);
    setMaxInput(String(clampedValue));
    if (updateTrigger === 'change') {
      onPriceChange?.(currentMin, clampedValue);
    }
  };

  const handleApply = () => {
    onPriceChange?.(currentMin, currentMax);
  };

  const handleReset = () => {
    setCurrentMin(initialMinPrice);
    setCurrentMax(initialMaxPrice);
    setMinInput(String(initialMinPrice));
    setMaxInput(String(initialMaxPrice));
    onPriceChange?.(initialMinPrice, initialMaxPrice);
  };

  return (
    <>
<Card className="price-range-container">
        <CardHeader>
          <CardTitle className="text-lg">{priceRangeLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Input Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="price-label">{fromText}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {currencySymbol}
                  </span>
                  <Input
                    type="number"
                    min={minPrice}
                    max={currentMax - stepIncrement}
                    step={stepIncrement}
                    value={minInput}
                    onChange={handleMinInputChange}
                    onBlur={handleMinInputBlur}
                    className="pl-8 price-input"
                  />
                </div>
              </div>
              <div>
                <Label className="price-label">{toText}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {currencySymbol}
                  </span>
                  <Input
                    type="number"
                    min={currentMin + stepIncrement}
                    max={maxPrice}
                    step={stepIncrement}
                    value={maxInput}
                    onChange={handleMaxInputChange}
                    onBlur={handleMaxInputBlur}
                    className="pl-8 price-input"
                  />
                </div>
              </div>
            </div>

            {/* Slider */}
            <div>
              <Slider
                min={minPrice}
                max={maxPrice}
                step={stepIncrement}
                value={[currentMin, currentMax]}
                onValueChange={handleSliderChange}
                onValueCommit={handleSliderCommit}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>{formatPrice(minPrice, currencySymbol)}</span>
                <span>{formatPrice(maxPrice, currencySymbol)}</span>
              </div>
            </div>

            {/* Current Range Display */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Selected Range</p>
              <p className="price-display">
                {formatPrice(currentMin, currencySymbol)} - {formatPrice(currentMax, currencySymbol)}
              </p>
            </div>

            {/* Action Buttons */}
            {updateTrigger === 'release' && (
              <div className="filter-buttons">
                <Button className="flex-1" onClick={handleApply}>
                  {applyFilterText}
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  {resetFilterText}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default PriceRangeSlider;
    `
  };

  return variants[variant] || variants.slider;
};
