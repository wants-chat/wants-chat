import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateChartWidget = (
  resolved: ResolvedComponent,
  variant: 'area' | 'bar' | 'line' | 'pie' | 'donut' = 'area'
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
    return `/${dataSource || 'analytics'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'analytics';

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';`;

  const variants = {
    area: `
${commonImports}

interface AreaChartProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const AreaChart: React.FC<AreaChartProps> = ({ ${dataName}: propData, className }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Fetch data from API if no props data provided
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

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sourceData = ${dataName} || {};

  const data = ${getField('areaData')};
  const title = ${getField('areaTitle')};
  const subtitle = ${getField('areaSubtitle')};
  const color = ${getField('primaryColor')};

  const maxValue = Math.max(...data.map((d: any) => d.value));
  const chartHeight = 200;
  const chartWidth = 600;

  const generatePath = () => {
    const points = data.map((point: any, index: number) => {
      const x = (index / (data.length - 1)) * chartWidth;
      const y = chartHeight - (point.value / maxValue) * chartHeight;
      return \`\${x},\${y}\`;
    });

    const pathData = points.map((point: string, index: number) => {
      if (index === 0) return \`M \${point}\`;
      return \`L \${point}\`;
    }).join(' ');

    const areaPath = \`\${pathData} L \${chartWidth},\${chartHeight} L 0,\${chartHeight} Z\`;
    return { linePath: pathData, areaPath };
  };

  const { linePath, areaPath } = generatePath();

  const handlePointClick = (index: number, point: any) => {
    console.log('Data point clicked:', { index, label: point.label, value: point.value });
  };

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6", className)}>
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <div className="relative">
        <svg viewBox={\`0 0 \${chartWidth} \${chartHeight}\`} className="w-full" style={{ height: '250px' }}>
          {[0, 1, 2, 3, 4].map((i: number) => (
            <line
              key={i}
              x1="0"
              y1={(chartHeight / 4) * i}
              x2={chartWidth}
              y2={(chartHeight / 4) * i}
              stroke="currentColor"
              strokeWidth="1"
              className="text-gray-200 dark:text-gray-700"
              opacity="0.5"
            />
          ))}

          <path
            d={areaPath}
            fill={color}
            opacity="0.2"
          />

          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {data.map((point: any, index: number) => {
            const x = (index / (data.length - 1)) * chartWidth;
            const y = chartHeight - (point.value / maxValue) * chartHeight;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r={hoveredIndex === index ? 6 : 4}
                fill={color}
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handlePointClick(index, point)}
              />
            );
          })}
        </svg>

        <div className="flex justify-between mt-2">
          {data.map((point: any, index: number) => (
            <div key={index} className="text-xs text-gray-600 dark:text-gray-400 text-center">
              {point.label}
            </div>
          ))}
        </div>

        {hoveredIndex !== null && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded text-sm font-medium">
            {data[hoveredIndex].label}: {data[hoveredIndex].value}
          </div>
        )}
      </div>
    </div>
  );
};

export default AreaChart;
    `,

    bar: `
${commonImports}

interface BarChartProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const BarChart: React.FC<BarChartProps> = ({ ${dataName}: propData, className }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Fetch data from API if no props data provided
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

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sourceData = ${dataName} || {};

  const data = ${getField('barData')};
  const title = ${getField('barTitle')};
  const subtitle = ${getField('barSubtitle')};
  const color = ${getField('primaryColor')};

  const maxValue = Math.max(...data.map((d: any) => d.value));
  const chartHeight = 300;

  const handleBarClick = (index: number, point: any) => {
    console.log('Bar clicked:', { index, label: point.label, value: point.value });
  };

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6", className)}>
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <div className="relative pl-12">
        <div className="absolute left-0 top-0 flex flex-col justify-between text-xs text-gray-600 dark:text-gray-400" style={{ height: \`\${chartHeight}px\` }}>
          <span>{maxValue}</span>
          <span>{Math.round(maxValue * 0.75)}</span>
          <span>{Math.round(maxValue * 0.5)}</span>
          <span>{Math.round(maxValue * 0.25)}</span>
          <span>0</span>
        </div>

        <div className="flex items-end justify-between gap-2" style={{ height: \`\${chartHeight}px\` }}>
          {data.map((point: any, index: number) => {
            const barHeight = (point.value / maxValue) * chartHeight;
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="relative w-full flex items-end" style={{ height: \`\${chartHeight}px\` }}>
                  {hoveredIndex === index && (
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap z-10">
                      {point.value}
                    </div>
                  )}
                  <div
                    className="w-full rounded-t-lg cursor-pointer transition-all duration-200 hover:opacity-100"
                    style={{
                      height: \`\${barHeight}px\`,
                      backgroundColor: color,
                      opacity: hoveredIndex === index ? 1 : 0.85
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => handleBarClick(index, point)}
                  />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-3 font-medium">
                  {point.label}
                </div>
              </div>
            );
          })}
        </div>

        <div className="absolute left-12 right-0 top-0 pointer-events-none" style={{ height: \`\${chartHeight}px\` }}>
          {[0, 1, 2, 3, 4].map((i: number) => (
            <div
              key={i}
              className="absolute w-full border-t border-gray-200 dark:border-gray-700"
              style={{ top: \`\${(i / 4) * chartHeight}px\` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BarChart;
    `,

    line: `
${commonImports}

interface LineChartProps {
  ${dataName}?: any;
  className?: string;
  onDataPointClick?: (point: any) => void;
  onLegendClick?: (series: string) => void;
  onZoom?: (range: any) => void;
  onExport?: () => void;
  [key: string]: any;
}

const LineChart: React.FC<LineChartProps> = ({ ${dataName}: propData, className }) => {
  const [hoveredSeries, setHoveredSeries] = useState<number | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ seriesIndex: number; pointIndex: number } | null>(null);

  // Fetch data from API if no props data provided
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

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sourceData = ${dataName} || {};

  const series = ${getField('lineSeries')};
  const labels = ${getField('lineLabels')};
  const title = ${getField('lineTitle')};
  const subtitle = ${getField('lineSubtitle')};

  const allValues = series.flatMap((s: any) => s.data);
  const maxValue = Math.max(...allValues);
  const chartHeight = 200;
  const chartWidth = 600;

  const generatePath = (data: number[]) => {
    const points = data.map((value: number, index: number) => {
      const x = (index / (data.length - 1)) * chartWidth;
      const y = chartHeight - (value / maxValue) * chartHeight;
      return \`\${x},\${y}\`;
    });

    return points.map((point: string, index: number) => {
      if (index === 0) return \`M \${point}\`;
      return \`L \${point}\`;
    }).join(' ');
  };

  const handlePointClick = (seriesIndex: number, pointIndex: number, value: number) => {
    console.log('Point clicked:', {
      series: series[seriesIndex].label,
      label: labels[pointIndex],
      value
    });
  };

  const handleLegendClick = (index: number) => {
    console.log('Legend clicked:', series[index].label);
  };

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6", className)}>
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <div className="flex gap-4 mb-4">
        {series.map((s: any, index: number) => (
          <button
            key={index}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onMouseEnter={() => setHoveredSeries(index)}
            onMouseLeave={() => setHoveredSeries(null)}
            onClick={() => handleLegendClick(index)}
          >
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-sm font-medium text-gray-900 dark:text-white">{s.label}</span>
          </button>
        ))}
      </div>

      <div className="relative">
        <svg viewBox={\`0 0 \${chartWidth} \${chartHeight}\`} className="w-full" style={{ height: '250px' }}>
          {[0, 1, 2, 3, 4].map((i: number) => (
            <line
              key={i}
              x1="0"
              y1={(chartHeight / 4) * i}
              x2={chartWidth}
              y2={(chartHeight / 4) * i}
              stroke="currentColor"
              strokeWidth="1"
              className="text-gray-200 dark:text-gray-700"
              opacity="0.5"
            />
          ))}

          {series.map((s: any, seriesIndex: number) => {
            const path = generatePath(s.data);
            const isHighlighted = hoveredSeries === null || hoveredSeries === seriesIndex;

            return (
              <g key={seriesIndex}>
                <path
                  d={path}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={isHighlighted ? 1 : 0.3}
                  className="transition-opacity"
                />

                {s.data.map((value: number, pointIndex: number) => {
                  const x = (pointIndex / (s.data.length - 1)) * chartWidth;
                  const y = chartHeight - (value / maxValue) * chartHeight;
                  const isHovered = hoveredPoint?.seriesIndex === seriesIndex && hoveredPoint?.pointIndex === pointIndex;

                  return (
                    <circle
                      key={pointIndex}
                      cx={x}
                      cy={y}
                      r={isHovered ? 6 : 4}
                      fill={s.color}
                      opacity={isHighlighted ? 1 : 0.3}
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setHoveredPoint({ seriesIndex, pointIndex })}
                      onMouseLeave={() => setHoveredPoint(null)}
                      onClick={() => handlePointClick(seriesIndex, pointIndex, value)}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>

        <div className="flex justify-between mt-2">
          {labels.map((label: string, index: number) => (
            <div key={index} className="text-xs text-gray-600 dark:text-gray-400 text-center">
              {label}
            </div>
          ))}
        </div>

        {hoveredPoint !== null && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded text-sm font-medium">
            <div>{series[hoveredPoint.seriesIndex].label}</div>
            <div className="text-xs">
              {labels[hoveredPoint.pointIndex]}: {series[hoveredPoint.seriesIndex].data[hoveredPoint.pointIndex]}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LineChart;
    `,

    pie: `
${commonImports}

interface PieChartProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const PieChart: React.FC<PieChartProps> = ({ ${dataName}: propData, className }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Fetch data from API if no props data provided
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

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sourceData = ${dataName} || {};

  const data = ${getField('pieData')};
  const title = ${getField('pieTitle')};
  const subtitle = ${getField('pieSubtitle')};
  const totalLabel = ${getField('totalLabel')};

  const total = data.reduce((sum: number, point: any) => sum + point.value, 0);
  const size = 200;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 10;

  const createArc = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArc = endAngle - startAngle <= 180 ? 0 : 1;

    return [
      'M', centerX, centerY,
      'L', start.x, start.y,
      'A', radius, radius, 0, largeArc, 0, end.x, end.y,
      'Z'
    ].join(' ');
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angle: number) => {
    const angleInRadians = ((angle - 90) * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  };

  let currentAngle = 0;
  const segments = data.map((point: any, index: number) => {
    const angle = (point.value / total) * 360;
    const segment = {
      path: createArc(currentAngle, currentAngle + angle),
      color: point.color,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
      percentage: ((point.value / total) * 100).toFixed(1)
    };
    currentAngle += angle;
    return segment;
  });

  const handleSegmentClick = (index: number, point: any) => {
    console.log('Segment clicked:', { index, label: point.label, value: point.value, percentage: segments[index].percentage });
  };

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6", className)}>
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="relative">
          <svg width={size} height={size} className="transform -rotate-90">
            {segments.map((segment: any, index: number) => (
              <path
                key={index}
                d={segment.path}
                fill={segment.color}
                className="cursor-pointer transition-all"
                opacity={hoveredIndex === index ? 1 : 0.9}
                stroke="white"
                strokeWidth="2"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleSegmentClick(index, data[index])}
              />
            ))}
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{total}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{totalLabel}</div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="space-y-3">
            {data.map((point: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleSegmentClick(index, point)}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: point.color }}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {point.label}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {point.value}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {segments[index].percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PieChart;
    `,

    donut: `
${commonImports}

interface DonutChartProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const DonutChart: React.FC<DonutChartProps> = ({ ${dataName}: propData, className }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Fetch data from API if no props data provided
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

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sourceData = ${dataName} || {};

  const data = ${getField('donutData')};
  const title = ${getField('donutTitle')};
  const subtitle = ${getField('donutSubtitle')};
  const totalLabel = ${getField('totalLabel')};

  const total = data.reduce((sum: number, point: any) => sum + point.value, 0);
  const size = 200;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 10;
  const innerRadius = radius * 0.6;

  const createDonutArc = (startAngle: number, endAngle: number, isHovered: boolean) => {
    const outerRadius = isHovered ? radius + 5 : radius;
    const outerStart = polarToCartesian(centerX, centerY, outerRadius, endAngle);
    const outerEnd = polarToCartesian(centerX, centerY, outerRadius, startAngle);
    const innerStart = polarToCartesian(centerX, centerY, innerRadius, endAngle);
    const innerEnd = polarToCartesian(centerX, centerY, innerRadius, startAngle);
    const largeArc = endAngle - startAngle <= 180 ? 0 : 1;

    return [
      'M', outerStart.x, outerStart.y,
      'A', outerRadius, outerRadius, 0, largeArc, 0, outerEnd.x, outerEnd.y,
      'L', innerEnd.x, innerEnd.y,
      'A', innerRadius, innerRadius, 0, largeArc, 1, innerStart.x, innerStart.y,
      'Z'
    ].join(' ');
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angle: number) => {
    const angleInRadians = ((angle - 90) * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  };

  let currentAngle = 0;
  const segments = data.map((point: any, index: number) => {
    const angle = (point.value / total) * 360;
    const isHovered = hoveredIndex === index;
    const segment = {
      path: createDonutArc(currentAngle, currentAngle + angle, isHovered),
      color: point.color,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
      percentage: ((point.value / total) * 100).toFixed(1)
    };
    currentAngle += angle;
    return segment;
  });

  const handleSegmentClick = (index: number, point: any) => {
    console.log('Segment clicked:', { index, label: point.label, value: point.value, percentage: segments[index].percentage });
  };

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6", className)}>
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="relative">
          <svg width={size} height={size} className="transform -rotate-90">
            {segments.map((segment: any, index: number) => (
              <path
                key={index}
                d={segment.path}
                fill={segment.color}
                className="cursor-pointer transition-all duration-200"
                stroke="white"
                strokeWidth="2"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleSegmentClick(index, data[index])}
              />
            ))}
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{total}%</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{totalLabel}</div>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full">
          <div className="space-y-3">
            {data.map((point: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleSegmentClick(index, point)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: point.color }}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {point.label}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {point.value}%
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white min-w-[3rem] text-right">
                    {segments[index].percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonutChart;
    `
  };

  return variants[variant] || variants.area;
};
