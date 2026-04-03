import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateSliderRange = (
  resolved: ResolvedComponent,
  variant: 'single' | 'dual' | 'stepped' = 'single'
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

  const dataName = dataSource.split('.').pop() || 'data';

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'slider'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource.split('.').pop() || 'slider';

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';`;

  const variants = {
    single: `
${commonImports}

interface SliderRangeProps {
  ${dataName}?: any;
  className?: string;
  onChange?: (value: number) => void;
}

const SliderRangeComponent: React.FC<SliderRangeProps> = ({
  ${dataName}: propData,
  className,
  onChange
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

  const [isDragging, setIsDragging] = useState(false);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sliderData = ${dataName} || {};

  const minValue = ${getField('minValue')};
  const maxValue = ${getField('maxValue')};
  const step = ${getField('step')};
  const [value, setValue] = useState(${getField('defaultValue')});

  const label = ${getField('label')};
  const unit = ${getField('unit')};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const percentage = ((value - minValue) / (maxValue - minValue)) * 100;

  return (
    <div className={cn("w-full max-w-md mx-auto p-6", className)}>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
          <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
            {value}{unit}
          </span>
        </div>
      </div>

      <div className="relative pt-2 pb-8">
        <input
          type="range"
          min={minValue}
          max={maxValue}
          step={step}
          value={value}
          onChange={handleChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
          style={{
            background: \`linear-gradient(to right, #3b82f6 0%, #3b82f6 \${percentage}%, #e5e7eb \${percentage}%, #e5e7eb 100%)\`
          }}
        />

        <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{minValue}{unit}</span>
          <span>{maxValue}{unit}</span>
        </div>

        {isDragging && (
          <div
            className="absolute top-0 bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium"
            style={{ left: \`calc(\${percentage}% - 20px)\`, transform: 'translateY(-100%)' }}
          >
            {value}{unit}
          </div>
        )}
      </div>
</div>
  );
};

export default SliderRangeComponent;
    `,

    dual: `
${commonImports}

interface SliderRangeProps {
  ${dataName}?: any;
  className?: string;
  onChange?: (start: number, end: number) => void;
}

const SliderRangeComponent: React.FC<SliderRangeProps> = ({
  ${dataName}: propData,
  className,
  onChange
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

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sliderData = ${dataName} || {};

  const minValue = ${getField('minValue')};
  const maxValue = ${getField('maxValue')};
  const step = ${getField('step')};
  const [rangeStart, setRangeStart] = useState(${getField('defaultRangeStart')});
  const [rangeEnd, setRangeEnd] = useState(${getField('defaultRangeEnd')});

  const rangeLabel = ${getField('rangeLabel')};
  const prefix = ${getField('prefix')};

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = Math.min(Number(e.target.value), rangeEnd - step);
    setRangeStart(newStart);
    if (onChange) {
      onChange(newStart, rangeEnd);
    }
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = Math.max(Number(e.target.value), rangeStart + step);
    setRangeEnd(newEnd);
    if (onChange) {
      onChange(rangeStart, newEnd);
    }
  };

  const startPercentage = ((rangeStart - minValue) / (maxValue - minValue)) * 100;
  const endPercentage = ((rangeEnd - minValue) / (maxValue - minValue)) * 100;

  return (
    <div className={cn("w-full max-w-lg mx-auto p-6", className)}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {rangeLabel}
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {prefix}{rangeStart} - {prefix}{rangeEnd}
            </span>
          </div>
        </div>
      </div>

      <div className="relative pt-2 pb-8">
        <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
          <div
            className="absolute h-2 bg-blue-600 rounded-lg"
            style={{
              left: \`\${startPercentage}%\`,
              right: \`\${100 - endPercentage}%\`
            }}
          />
        </div>

        <input
          type="range"
          min={minValue}
          max={maxValue}
          step={step}
          value={rangeStart}
          onChange={handleStartChange}
          className="absolute top-0 w-full h-2 appearance-none cursor-pointer bg-transparent pointer-events-none range-thumb-start"
          style={{ zIndex: rangeStart > (maxValue - minValue) / 2 ? 5 : 3 }}
        />

        <input
          type="range"
          min={minValue}
          max={maxValue}
          step={step}
          value={rangeEnd}
          onChange={handleEndChange}
          className="absolute top-0 w-full h-2 appearance-none cursor-pointer bg-transparent pointer-events-none range-thumb-end"
          style={{ zIndex: rangeEnd <= (maxValue - minValue) / 2 ? 5 : 3 }}
        />

        <div className="flex justify-between mt-4 text-xs text-gray-500 dark:text-gray-400">
          <span>{prefix}{minValue}</span>
          <span>{prefix}{maxValue}</span>
        </div>
      </div>
</div>
  );
};

export default SliderRangeComponent;
    `,

    stepped: `
${commonImports}

interface SliderRangeProps {
  ${dataName}?: any;
  className?: string;
  onChange?: (value: number) => void;
}

const SliderRangeComponent: React.FC<SliderRangeProps> = ({
  ${dataName}: propData,
  className,
  onChange
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

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sliderData = ${dataName} || {};

  const minValue = ${getField('minValue')};
  const maxValue = ${getField('maxValue')};
  const step = ${getField('stepWithMarks')};
  const [value, setValue] = useState(${getField('defaultValue')});

  const label = ${getField('label')};
  const suffix = ${getField('suffix')};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const percentage = ((value - minValue) / (maxValue - minValue)) * 100;
  const marks = [];
  for (let i = minValue; i <= maxValue; i += step) {
    marks.push(i);
  }

  return (
    <div className={cn("w-full max-w-2xl mx-auto p-6", className)}>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <label className="text-lg font-semibold text-gray-900 dark:text-white">
              {label}
            </label>
            <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {value}{suffix}
              </span>
            </div>
          </div>
        </div>

        <div className="relative pt-6 pb-12">
          <input
            type="range"
            min={minValue}
            max={maxValue}
            step={step}
            value={value}
            onChange={handleChange}
            className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer stepped-slider"
            style={{
              background: \`linear-gradient(to right, #3b82f6 0%, #3b82f6 \${percentage}%, #e5e7eb \${percentage}%, #e5e7eb 100%)\`
            }}
          />

          {/* Marks */}
          <div className="absolute w-full top-0 flex justify-between px-1">
            {marks.map((mark) => {
              const markPercentage = ((mark - minValue) / (maxValue - minValue)) * 100;
              const isActive = mark <= value;

              return (
                <div
                  key={mark}
                  className="relative flex flex-col items-center"
                  style={{ left: \`\${markPercentage}%\`, transform: 'translateX(-50%)' }}
                >
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full border-2 transition-colors",
                      isActive
                        ? "bg-blue-600 border-blue-600"
                        : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                    )}
                  />
                  <span className="mt-6 text-xs font-medium text-gray-600 dark:text-gray-400">
                    {mark}{suffix}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full" />
            <span>Step: {step}{suffix}</span>
          </div>
        </div>
      </div>
</div>
  );
};

export default SliderRangeComponent;
    `
  };

  return variants[variant] || variants.single;
};
