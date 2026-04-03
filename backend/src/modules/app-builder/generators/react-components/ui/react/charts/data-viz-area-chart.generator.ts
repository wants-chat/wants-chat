import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateDataVizAreaChart = (
  resolved: ResolvedComponent,
  variant: 'filled' | 'stacked' | 'gradient' = 'filled'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';`;

  const variants = {
    filled: `
${commonImports}

interface DataPoint {
  label: string;
  value: number;
}

interface Series {
  name: string;
  color: string;
  data: DataPoint[];
}

interface AreaChartProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const AreaChart: React.FC<AreaChartProps> = ({
  ${dataName}: propData,
  className
}) => {
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

  const chartTitle = ${getField('chartTitle')};
  const chartSubtitle = ${getField('chartSubtitle')};
  const dataSeries: Series[] = ${getField('dataSeries')};
  const showGrid = ${getField('showGrid')};
  const opacity = ${getField('opacity')};
  const exportLabel = ${getField('exportLabel')};

  const [hoveredPoint, setHoveredPoint] = useState<{ seriesIndex: number; pointIndex: number } | null>(null);

  const series = dataSeries[0];

  // Handle empty data
  if (!series || !series.data || series.data.length === 0) {
    return (
      <div className={cn('w-full p-8 bg-white dark:bg-gray-800 rounded-lg shadow', className)}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          No data available for chart
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...series.data.map(d => d.value));
  const chartHeight = 350;
  const chartWidth = 800;
  const padding = { top: 40, right: 40, bottom: 60, left: 80 };

  const scaleY = (value: number) => {
    return chartHeight - padding.bottom - ((value / maxValue) * (chartHeight - padding.top - padding.bottom));
  };

  const scaleX = (index: number) => {
    const width = chartWidth - padding.left - padding.right;
    return padding.left + (index * (width / (series.data.length - 1)));
  };

  const linePath = series.data
    .map((point, index) => {
      const x = scaleX(index);
      const y = scaleY(point.value);
      return index === 0 ? \`M \${x} \${y}\` : \`L \${x} \${y}\`;
    })
    .join(' ');

  const areaPath = linePath + \` L \${scaleX(series.data.length - 1)} \${chartHeight - padding.bottom} L \${padding.left} \${chartHeight - padding.bottom} Z\`;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{chartTitle}</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{chartSubtitle}</p>
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="h-4 w-4" />
            {exportLabel}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <svg
            width={chartWidth}
            height={chartHeight}
            className="w-full"
            viewBox={\`0 0 \${chartWidth} \${chartHeight}\`}
          >
            {/* Grid lines */}
            {showGrid && [0, 0.25, 0.5, 0.75, 1].map((fraction, i) => {
              const y = chartHeight - padding.bottom - (fraction * (chartHeight - padding.top - padding.bottom));
              return (
                <g key={i}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={chartWidth - padding.right}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                    strokeDasharray="4"
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="text-xs fill-gray-600 dark:fill-gray-400"
                  >
                    {Math.round(maxValue * fraction).toLocaleString()}
                  </text>
                </g>
              );
            })}

            {/* Axes */}
            <line
              x1={padding.left}
              y1={chartHeight - padding.bottom}
              x2={chartWidth - padding.right}
              y2={chartHeight - padding.bottom}
              stroke="#d1d5db"
              strokeWidth="2"
            />
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={chartHeight - padding.bottom}
              stroke="#d1d5db"
              strokeWidth="2"
            />

            {/* Area fill */}
            <path
              d={areaPath}
              fill={series.color}
              opacity={opacity}
            />

            {/* Line */}
            <path
              d={linePath}
              fill="none"
              stroke={series.color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {series.data.map((point, index) => {
              const x = scaleX(index);
              const y = scaleY(point.value);
              const isHovered = hoveredPoint?.pointIndex === index;

              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 6 : 4}
                    fill={series.color}
                    stroke="white"
                    strokeWidth="2"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPoint({ seriesIndex: 0, pointIndex: index })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />

                  <text
                    x={x}
                    y={chartHeight - padding.bottom + 20}
                    textAnchor="middle"
                    className="text-xs fill-gray-600 dark:fill-gray-400"
                  >
                    {point.label}
                  </text>

                  {isHovered && (
                    <g>
                      <rect
                        x={x - 50}
                        y={y - 50}
                        width="100"
                        height="35"
                        rx="4"
                        fill="rgb(31, 41, 55)"
                        opacity="0.95"
                      />
                      <text
                        x={x}
                        y={y - 32}
                        textAnchor="middle"
                        className="text-xs fill-white font-medium"
                      >
                        {point.label}
                      </text>
                      <text
                        x={x}
                        y={y - 18}
                        textAnchor="middle"
                        className="text-sm fill-white font-bold"
                      >
                        {point.value.toLocaleString()}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
};

export default AreaChart;
    `,

    stacked: `
${commonImports}

interface DataPoint {
  label: string;
  value: number;
}

interface Series {
  name: string;
  color: string;
  data: DataPoint[];
}

interface AreaChartProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const AreaChart: React.FC<AreaChartProps> = ({
  ${dataName}: propData,
  className
}) => {
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

  const chartTitle = ${getField('chartTitle')};
  const stackedSeriesData: Series[] = ${getField('stackedSeriesData')};
  const showGrid = ${getField('showGrid')};
  const showLegend = ${getField('showLegend')};
  const exportLabel = ${getField('exportLabel')};

  const [hoveredPoint, setHoveredPoint] = useState<{ seriesIndex: number; pointIndex: number } | null>(null);

  // Calculate stacked values
  const stackedData = stackedSeriesData[0].data.map((_, index) => {
    let cumulative = 0;
    return stackedSeriesData.map(series => {
      const value = series.data[index].value;
      cumulative += value;
      return cumulative;
    });
  });

  const maxValue = Math.max(...stackedData.map(values => Math.max(...values)));
  const chartHeight = 400;
  const chartWidth = 800;
  const padding = { top: 60, right: 40, bottom: 60, left: 80 };

  const scaleY = (value: number) => {
    return chartHeight - padding.bottom - ((value / maxValue) * (chartHeight - padding.top - padding.bottom));
  };

  const scaleX = (index: number) => {
    const width = chartWidth - padding.left - padding.right;
    return padding.left + (index * (width / (stackedSeriesData[0].data.length - 1)));
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{chartTitle}</CardTitle>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="h-4 w-4" />
            {exportLabel}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {showLegend && (
          <div className="flex flex-wrap gap-4 mb-6">
            {stackedSeriesData.map((series, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: series.color }}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {series.name}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="w-full overflow-x-auto">
          <svg
            width={chartWidth}
            height={chartHeight}
            className="w-full"
            viewBox={\`0 0 \${chartWidth} \${chartHeight}\`}
          >
            {/* Grid lines */}
            {showGrid && [0, 0.25, 0.5, 0.75, 1].map((fraction, i) => {
              const y = chartHeight - padding.bottom - (fraction * (chartHeight - padding.top - padding.bottom));
              return (
                <g key={i}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={chartWidth - padding.right}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                    strokeDasharray="4"
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="text-xs fill-gray-600 dark:fill-gray-400"
                  >
                    {Math.round(maxValue * fraction).toLocaleString()}
                  </text>
                </g>
              );
            })}

            {/* Axes */}
            <line
              x1={padding.left}
              y1={chartHeight - padding.bottom}
              x2={chartWidth - padding.right}
              y2={chartHeight - padding.bottom}
              stroke="#d1d5db"
              strokeWidth="2"
            />
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={chartHeight - padding.bottom}
              stroke="#d1d5db"
              strokeWidth="2"
            />

            {/* X-axis labels */}
            {stackedSeriesData[0].data.map((point, index) => (
              <text
                key={index}
                x={scaleX(index)}
                y={chartHeight - padding.bottom + 20}
                textAnchor="middle"
                className="text-xs fill-gray-600 dark:fill-gray-400"
              >
                {point.label}
              </text>
            ))}

            {/* Stacked areas */}
            {[...stackedSeriesData].reverse().map((series, reversedIndex) => {
              const seriesIndex = stackedSeriesData.length - 1 - reversedIndex;

              const linePath = series.data
                .map((point, index) => {
                  const x = scaleX(index);
                  const y = scaleY(stackedData[index][seriesIndex]);
                  return index === 0 ? \`M \${x} \${y}\` : \`L \${x} \${y}\`;
                })
                .join(' ');

              const baselinePath = series.data
                .map((point, index) => {
                  const x = scaleX(series.data.length - 1 - index);
                  const y = seriesIndex > 0
                    ? scaleY(stackedData[series.data.length - 1 - index][seriesIndex - 1])
                    : chartHeight - padding.bottom;
                  return \`L \${x} \${y}\`;
                })
                .join(' ');

              const areaPath = linePath + baselinePath + ' Z';

              return (
                <g key={seriesIndex}>
                  <path
                    d={areaPath}
                    fill={series.color}
                    opacity={0.7}
                  />
                  <path
                    d={linePath}
                    fill="none"
                    stroke={series.color}
                    strokeWidth="2"
                  />
                </g>
              );
            })}

            {/* Interactive points */}
            {stackedSeriesData.map((series, seriesIndex) =>
              series.data.map((point, pointIndex) => {
                const x = scaleX(pointIndex);
                const y = scaleY(stackedData[pointIndex][seriesIndex]);
                const isHovered = hoveredPoint?.seriesIndex === seriesIndex && hoveredPoint?.pointIndex === pointIndex;

                return (
                  <g key={\`\${seriesIndex}-\${pointIndex}\`}>
                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? 6 : 3}
                      fill={series.color}
                      stroke="white"
                      strokeWidth="2"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredPoint({ seriesIndex, pointIndex })}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                    {isHovered && (
                      <g>
                        <rect
                          x={x - 60}
                          y={y - 55}
                          width="120"
                          height="45"
                          rx="4"
                          fill="rgb(31, 41, 55)"
                          opacity="0.95"
                        />
                        <text
                          x={x}
                          y={y - 38}
                          textAnchor="middle"
                          className="text-xs fill-white font-medium"
                        >
                          {series.name}
                        </text>
                        <text
                          x={x}
                          y={y - 24}
                          textAnchor="middle"
                          className="text-xs fill-white"
                        >
                          {point.label}: {point.value.toLocaleString()}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })
            )}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
};

export default AreaChart;
    `,

    gradient: `
${commonImports}

interface DataPoint {
  label: string;
  value: number;
}

interface Series {
  name: string;
  color: string;
  data: DataPoint[];
}

interface AreaChartProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const AreaChart: React.FC<AreaChartProps> = ({
  ${dataName}: propData,
  className
}) => {
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

  const chartTitle = ${getField('chartTitle')};
  const chartSubtitle = ${getField('chartSubtitle')};
  const dataSeries: Series[] = ${getField('dataSeries')};
  const showGrid = ${getField('showGrid')};
  const exportLabel = ${getField('exportLabel')};

  const [hoveredPoint, setHoveredPoint] = useState<{ seriesIndex: number; pointIndex: number } | null>(null);

  const series = dataSeries[0];

  // Handle empty data
  if (!series || !series.data || series.data.length === 0) {
    return (
      <div className={cn('w-full p-8 bg-white dark:bg-gray-800 rounded-lg shadow', className)}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          No data available for chart
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...series.data.map(d => d.value));
  const chartHeight = 350;
  const chartWidth = 800;
  const padding = { top: 40, right: 40, bottom: 60, left: 80 };

  const scaleY = (value: number) => {
    return chartHeight - padding.bottom - ((value / maxValue) * (chartHeight - padding.top - padding.bottom));
  };

  const scaleX = (index: number) => {
    const width = chartWidth - padding.left - padding.right;
    return padding.left + (index * (width / (series.data.length - 1)));
  };

  const linePath = series.data
    .map((point, index) => {
      const x = scaleX(index);
      const y = scaleY(point.value);
      return index === 0 ? \`M \${x} \${y}\` : \`L \${x} \${y}\`;
    })
    .join(' ');

  const areaPath = linePath + \` L \${scaleX(series.data.length - 1)} \${chartHeight - padding.bottom} L \${padding.left} \${chartHeight - padding.bottom} Z\`;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{chartTitle}</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{chartSubtitle}</p>
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="h-4 w-4" />
            {exportLabel}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <svg
            width={chartWidth}
            height={chartHeight}
            className="w-full"
            viewBox={\`0 0 \${chartWidth} \${chartHeight}\`}
          >
            <defs>
              <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={series.color} stopOpacity="0.6" />
                <stop offset="50%" stopColor={series.color} stopOpacity="0.3" />
                <stop offset="100%" stopColor={series.color} stopOpacity="0.05" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Grid lines */}
            {showGrid && [0, 0.25, 0.5, 0.75, 1].map((fraction, i) => {
              const y = chartHeight - padding.bottom - (fraction * (chartHeight - padding.top - padding.bottom));
              return (
                <g key={i}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={chartWidth - padding.right}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                    strokeDasharray="4"
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="text-xs fill-gray-600 dark:fill-gray-400"
                  >
                    {Math.round(maxValue * fraction).toLocaleString()}
                  </text>
                </g>
              );
            })}

            {/* Axes */}
            <line
              x1={padding.left}
              y1={chartHeight - padding.bottom}
              x2={chartWidth - padding.right}
              y2={chartHeight - padding.bottom}
              stroke="#d1d5db"
              strokeWidth="2"
            />
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={chartHeight - padding.bottom}
              stroke="#d1d5db"
              strokeWidth="2"
            />

            {/* Gradient area fill */}
            <path
              d={areaPath}
              fill="url(#areaGradient)"
            />

            {/* Glowing line */}
            <path
              d={linePath}
              fill="none"
              stroke={series.color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
            />

            {/* Data points */}
            {series.data.map((point, index) => {
              const x = scaleX(index);
              const y = scaleY(point.value);
              const isHovered = hoveredPoint?.pointIndex === index;

              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 8 : 5}
                    fill="white"
                    stroke={series.color}
                    strokeWidth="3"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPoint({ seriesIndex: 0, pointIndex: index })}
                    onMouseLeave={() => setHoveredPoint(null)}
                    filter={isHovered ? "url(#glow)" : ""}
                  />

                  <text
                    x={x}
                    y={chartHeight - padding.bottom + 20}
                    textAnchor="middle"
                    className="text-xs fill-gray-600 dark:fill-gray-400"
                  >
                    {point.label}
                  </text>

                  {isHovered && (
                    <g>
                      <rect
                        x={x - 50}
                        y={y - 60}
                        width="100"
                        height="40"
                        rx="6"
                        fill="rgb(31, 41, 55)"
                        opacity="0.95"
                      />
                      <text
                        x={x}
                        y={y - 42}
                        textAnchor="middle"
                        className="text-xs fill-white font-medium"
                      >
                        {point.label}
                      </text>
                      <text
                        x={x}
                        y={y - 26}
                        textAnchor="middle"
                        className="text-sm fill-white font-bold"
                      >
                        {point.value.toLocaleString()}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
};

export default AreaChart;
    `
  };

  return variants[variant] || variants.filled;
};
