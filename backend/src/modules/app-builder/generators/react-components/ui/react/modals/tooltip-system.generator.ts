import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateTooltipSystem = (
  resolved: ResolvedComponent,
  variant: 'hover' | 'click' | 'always' = 'hover'
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
  const entity = dataSource?.split('.').pop() || 'data';

  const commonImports = `
import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';`;

  const variants = {
    hover: `
${commonImports}
import { Info } from 'lucide-react';

interface TooltipExample {
  id: number;
  elementLabel: string;
  tooltipText: string;
  position: string;
  icon: string;
}

interface HoverTooltipsProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const HoverTooltips: React.FC<HoverTooltipsProps> = ({ ${dataName}: propData, className }) => {
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
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  const tooltipData = ${dataName} || {};

  const title = ${getField('hoverTitle')};
  const tooltipExamples = ${getField('tooltipExamples')};
  const showDelay = ${getField('showDelay')};
  const hideDelay = ${getField('hideDelay')};
  const maxWidth = ${getField('maxWidth')};

  if (isLoading && !propData) {
    return (
      <div className={cn("max-w-4xl mx-auto flex items-center justify-center p-8", className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const handleMouseEnter = (id: number, event: React.MouseEvent<HTMLButtonElement>) => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }

    hoverTimerRef.current = setTimeout(() => {
      const rect = event.currentTarget.getBoundingClientRect();
      const tooltip = tooltipExamples.find((t: TooltipExample) => t.id === id);

      if (tooltip) {
        const position = calculatePosition(rect, tooltip.position);
        setTooltipPosition(position);
        setActiveTooltip(id);
        console.log('Tooltip shown:', id);
      }
    }, showDelay);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }

    hoverTimerRef.current = setTimeout(() => {
      setActiveTooltip(null);
      console.log('Tooltip hidden');
    }, hideDelay);
  };

  const calculatePosition = (rect: DOMRect, position: string) => {
    const offset = 12;
    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = rect.top - offset;
        left = rect.left + rect.width / 2;
        break;
      case 'bottom':
        top = rect.bottom + offset;
        left = rect.left + rect.width / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2;
        left = rect.left - offset;
        break;
      case 'right':
        top = rect.top + rect.height / 2;
        left = rect.right + offset;
        break;
      default:
        top = rect.bottom + offset;
        left = rect.left + rect.width / 2;
    }

    return { top, left };
  };

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  return (
    <div className={cn("max-w-4xl mx-auto", className)}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Hover over the buttons to see tooltips with helpful information
        </p>
      </div>

      <Card className="p-8">
        <div className="grid grid-cols-3 gap-6">
          {tooltipExamples.map((example: TooltipExample) => (
            <button
              key={example.id}
              onMouseEnter={(e) => handleMouseEnter(example.id, e)}
              onMouseLeave={handleMouseLeave}
              className="relative p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all group"
            >
              <div className="text-4xl mb-3">{example.icon}</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {example.elementLabel}
              </div>
              <div className="absolute top-2 right-2">
                <Info className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Tooltip overlay */}
      {activeTooltip !== null && (
        <div
          className="fixed z-50 pointer-events-none animate-in fade-in zoom-in-95"
          style={{
            top: \`\${tooltipPosition.top}px\`,
            left: \`\${tooltipPosition.left}px\`,
            transform: 'translate(-50%, -100%)',
            maxWidth: \`\${maxWidth}px\`
          }}
        >
          <div className="bg-gray-900 dark:bg-gray-800 text-white px-3 py-2 rounded-lg shadow-xl text-sm">
            {tooltipExamples.find((t: TooltipExample) => t.id === activeTooltip)?.tooltipText}
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-800 rotate-45" />
          </div>
        </div>
      )}
    </div>
  );
};

export default HoverTooltips;
    `,

    click: `
${commonImports}
import { Info, X, ExternalLink } from 'lucide-react';

interface DetailedTooltip {
  id: number;
  elementLabel: string;
  title: string;
  content: string;
  features: string[];
  position: string;
}

interface ClickTooltipsProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ClickTooltips: React.FC<ClickTooltipsProps> = ({ ${dataName}: propData, className }) => {
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
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const tooltipData = ${dataName} || {};

  const title = ${getField('clickTitle')};
  const detailedTooltips = ${getField('detailedTooltips')};
  const maxWidth = ${getField('maxWidth')};
  const closeLabel = ${getField('closeLabel')};
  const learnMoreLabel = ${getField('learnMoreLabel')};

  if (isLoading && !propData) {
    return (
      <div className={cn("max-w-5xl mx-auto flex items-center justify-center p-8", className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const handleClick = (id: number, event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const tooltip = detailedTooltips.find((t: DetailedTooltip) => t.id === id);

    if (tooltip) {
      const position = calculatePosition(rect, tooltip.position);
      setTooltipPosition(position);
      setActiveTooltip(activeTooltip === id ? null : id);
      console.log('Click tooltip toggled:', id);
    }
  };

  const handleClose = () => {
    setActiveTooltip(null);
    console.log('Click tooltip closed');
  };

  const handleLearnMore = (tooltipId: number) => {
    console.log('Learn more clicked for tooltip:', tooltipId);
  };

  const calculatePosition = (rect: DOMRect, position: string) => {
    const offset = 16;
    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = rect.top - offset;
        left = rect.left + rect.width / 2;
        break;
      case 'bottom':
        top = rect.bottom + offset;
        left = rect.left + rect.width / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2;
        left = rect.left - offset;
        break;
      case 'right':
        top = rect.top + rect.height / 2;
        left = rect.right + offset;
        break;
      default:
        top = rect.bottom + offset;
        left = rect.left + rect.width / 2;
    }

    return { top, left };
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-tooltip]')) {
        setActiveTooltip(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className={cn("max-w-5xl mx-auto", className)}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Click on the elements to view detailed tooltip information
        </p>
      </div>

      <Card className="p-8">
        <div className="grid grid-cols-2 gap-6">
          {detailedTooltips.map((tooltip: DetailedTooltip) => (
            <button
              key={tooltip.id}
              data-tooltip
              onClick={(e) => handleClick(tooltip.id, e)}
              className={\`relative p-6 border-2 rounded-lg transition-all text-left \${
                activeTooltip === tooltip.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }\`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                    {tooltip.elementLabel}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Click to learn more
                  </p>
                </div>
                <div className={\`p-2 rounded-full transition-colors \${
                  activeTooltip === tooltip.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }\`}>
                  <Info className="h-5 w-5" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Tooltip popover */}
      {activeTooltip !== null && (
        <div
          data-tooltip
          className="fixed z-50 animate-in fade-in zoom-in-95"
          style={{
            top: \`\${tooltipPosition.top}px\`,
            left: \`\${tooltipPosition.left}px\`,
            transform: 'translate(-50%, 0)',
            maxWidth: \`\${maxWidth * 1.5}px\`
          }}
        >
          <Card className="shadow-2xl border-2 border-blue-500">
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                  {detailedTooltips.find((t: DetailedTooltip) => t.id === activeTooltip)?.title}
                </h3>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {detailedTooltips.find((t: DetailedTooltip) => t.id === activeTooltip)?.content}
              </p>

              <div className="mb-4">
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase">
                  Key Features
                </div>
                <ul className="space-y-1">
                  {detailedTooltips
                    .find((t: DetailedTooltip) => t.id === activeTooltip)
                    ?.features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        {feature}
                      </li>
                    ))}
                </ul>
              </div>

              <button
                onClick={() => handleLearnMore(activeTooltip)}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {learnMoreLabel}
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>

            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white dark:bg-gray-800 border-t-2 border-l-2 border-blue-500 rotate-45" />
          </Card>
        </div>
      )}
    </div>
  );
};

export default ClickTooltips;
    `,

    always: `
${commonImports}
import { Info, AlertCircle } from 'lucide-react';

interface TooltipExample {
  id: number;
  elementLabel: string;
  tooltipText: string;
  position: string;
  icon: string;
}

interface AlwaysVisibleTooltipsProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const AlwaysVisibleTooltips: React.FC<AlwaysVisibleTooltipsProps> = ({ ${dataName}: propData, className }) => {
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
  const tooltipData = ${dataName} || {};

  const title = ${getField('alwaysTitle')};
  const tooltipExamples = ${getField('tooltipExamples')};
  const maxWidth = ${getField('maxWidth')};

  if (isLoading && !propData) {
    return (
      <div className={cn("max-w-6xl mx-auto flex items-center justify-center p-8", className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const getArrowClass = (position: string) => {
    switch (position) {
      case 'top':
        return 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 dark:border-t-gray-700';
      case 'bottom':
        return 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 dark:border-b-gray-700';
      case 'left':
        return 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 dark:border-l-gray-700';
      case 'right':
        return 'right-full top-1/2 -translate-y-1/2 border-r-gray-900 dark:border-r-gray-700';
      default:
        return 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 dark:border-t-gray-700';
    }
  };

  const getTooltipPosition = (position: string) => {
    switch (position) {
      case 'top':
        return '-top-16 left-1/2 -translate-x-1/2';
      case 'bottom':
        return '-bottom-16 left-1/2 -translate-x-1/2';
      case 'left':
        return 'top-1/2 -translate-y-1/2 -left-[calc(100%+1rem)]';
      case 'right':
        return 'top-1/2 -translate-y-1/2 -right-[calc(100%+1rem)]';
      default:
        return '-bottom-16 left-1/2 -translate-x-1/2';
    }
  };

  return (
    <div className={cn("max-w-6xl mx-auto", className)}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Tooltips that are always visible for important information
        </p>
      </div>

      <Card className="p-12 bg-gray-50 dark:bg-gray-900">
        <div className="grid grid-cols-3 gap-12">
          {tooltipExamples.map((example: TooltipExample) => (
            <div key={example.id} className="relative">
              <div className="p-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                <div className="text-4xl mb-3 text-center">{example.icon}</div>
                <div className="font-semibold text-center text-gray-900 dark:text-white">
                  {example.elementLabel}
                </div>
              </div>

              {/* Always visible tooltip */}
              <div
                className={\`absolute z-10 \${getTooltipPosition(example.position)}\`}
                style={{ maxWidth: \`\${maxWidth}px\` }}
              >
                <div className="bg-gray-900 dark:bg-gray-700 text-white px-3 py-2 rounded-lg shadow-xl text-xs leading-relaxed">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>{example.tooltipText}</span>
                  </div>

                  {/* Arrow */}
                  <div
                    className={\`absolute w-0 h-0 border-4 border-transparent \${getArrowClass(
                      example.position
                    )}\`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Always Visible Tooltips
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              These tooltips are permanently displayed to provide immediate context and guidance. They're perfect for
              onboarding new users or highlighting critical features that require attention.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlwaysVisibleTooltips;
    `
  };

  return variants[variant] || variants.hover;
};
