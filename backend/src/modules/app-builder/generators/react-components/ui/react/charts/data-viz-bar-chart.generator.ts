import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateDataVizBarChart = (
  resolved: ResolvedComponent,
  variant: 'vertical' | 'horizontal' | 'stacked' = 'vertical'
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
  const entity = dataSource?.split('.').pop() || resolved.data?.entity || 'expenses';

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';`;

  const variants = {
    vertical: `
${commonImports}

interface DataItem {
  label: string;
  value: number;
  color: string;
}

interface BarChartProps {
  ${dataName}?: any;
  className?: string;
  title?: string;
  [key: string]: any;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const BarChart: React.FC<BarChartProps> = ({
  ${dataName}: propData,
  className,
  title = 'Chart'
}) => {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      // Handle both response formats: [...] directly or { data: [...] }
      const items = Array.isArray(response) ? response : (response?.data || []);

      // Group by category and sum amounts
      const grouped: Record<string, number> = {};
      items.forEach((item: any) => {
        const category = item.category_id || item.category || item.name || 'Other';
        const amount = parseFloat(item.amount) || 0;
        grouped[category] = (grouped[category] || 0) + amount;
      });

      // Convert to chart data format
      const chartData = Object.entries(grouped).map(([label, value], index) => ({
        label: label.substring(0, 15),
        value: Math.round(value * 100) / 100,
        color: COLORS[index % COLORS.length]
      }));

      return chartData.length > 0 ? chartData : [{ label: 'No Data', value: 0, color: '#cbd5e1' }];
    },
    enabled: !propData,
    retry: 1,
  });

  const dataSeries: DataItem[] = propData?.dataSeries || fetchedData || [];

  const maxValue = Math.max(...dataSeries.map(d => d.value), 1);
  const chartHeight = 400;
  const chartWidth = 700;
  const padding = { top: 40, right: 40, bottom: 60, left: 70 };

  const barWidth = dataSeries.length > 0 ? (chartWidth - padding.left - padding.right) / dataSeries.length * 0.7 : 50;
  const barSpacing = dataSeries.length > 0 ? (chartWidth - padding.left - padding.right) / dataSeries.length : 50;

  const scaleY = (value: number) => {
    return chartHeight - padding.bottom - ((value / maxValue) * (chartHeight - padding.top - padding.bottom));
  };

  if (isLoading && !propData) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-80">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="h-4 w-4" />
            Export
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
            {[0, 0.25, 0.5, 0.75, 1].map((fraction, i) => {
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

            {/* Y-axis label */}
            <text
              x={20}
              y={chartHeight / 2}
              textAnchor="middle"
              transform={\`rotate(-90, 20, \${chartHeight / 2})\`}
              className="text-xs fill-gray-600 dark:fill-gray-400 font-medium"
            >
              Amount
            </text>

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

            {/* Bars */}
            {dataSeries.map((item: any, index: number) => {
              const x = padding.left + (index * barSpacing) + (barSpacing - barWidth) / 2;
              const y = scaleY(item.value);
              const height = (chartHeight - padding.bottom) - y;
              const isHovered = hoveredBar === index;

              return (
                <g key={index}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={height}
                    fill={item.color}
                    opacity={isHovered ? 0.8 : 1}
                    className="cursor-pointer transition-opacity"
                    onMouseEnter={() => setHoveredBar(index)}
                    onMouseLeave={() => setHoveredBar(null)}
                    rx="4"
                  />

                  {/* Value label */}
                  <text
                    x={x + barWidth / 2}
                    y={y - 8}
                    textAnchor="middle"
                    className="text-xs fill-gray-700 dark:fill-gray-300 font-medium"
                  >
                    ${'\$'}{item.value.toLocaleString()}
                  </text>

                  {/* X-axis label */}
                  <text
                    x={x + barWidth / 2}
                    y={chartHeight - padding.bottom + 20}
                    textAnchor="middle"
                    className="text-xs fill-gray-600 dark:fill-gray-400"
                  >
                    {item.label.length > 10 ? item.label.substring(0, 10) + '...' : item.label}
                  </text>

                  {/* Tooltip */}
                  {isHovered && (
                    <g>
                      <rect
                        x={x + barWidth / 2 - 60}
                        y={y - 60}
                        width="120"
                        height="40"
                        rx="4"
                        fill="rgb(31, 41, 55)"
                        opacity="0.95"
                      />
                      <text
                        x={x + barWidth / 2}
                        y={y - 42}
                        textAnchor="middle"
                        className="text-xs fill-white font-medium"
                      >
                        {item.label}
                      </text>
                      <text
                        x={x + barWidth / 2}
                        y={y - 28}
                        textAnchor="middle"
                        className="text-sm fill-white font-bold"
                      >
                        {item.value.toLocaleString()}
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

export default BarChart;
    `,

    horizontal: `
${commonImports}

interface DataItem {
  label: string;
  value: number;
  color: string;
}

interface BarChartProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const BarChart: React.FC<BarChartProps> = ({
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
  const dataSeries: DataItem[] = ${getField('dataSeries')};
  const showGrid = ${getField('showGrid')};
  const showValueLabels = ${getField('showValueLabels')};
  const exportLabel = ${getField('exportLabel')};

  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const maxValue = Math.max(...dataSeries.map(d => d.value));
  const chartHeight = 400;
  const chartWidth = 700;
  const padding = { top: 20, right: 80, bottom: 40, left: 120 };

  const barHeight = (chartHeight - padding.top - padding.bottom) / dataSeries.length * 0.7;
  const barSpacing = (chartHeight - padding.top - padding.bottom) / dataSeries.length;

  const scaleX = (value: number) => {
    return padding.left + ((value / maxValue) * (chartWidth - padding.left - padding.right));
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
        <div className="w-full overflow-x-auto">
          <svg
            width={chartWidth}
            height={chartHeight}
            className="w-full"
            viewBox={\`0 0 \${chartWidth} \${chartHeight}\`}
          >
            {/* Grid lines */}
            {showGrid && [0, 0.25, 0.5, 0.75, 1].map((fraction, i) => {
              const x = padding.left + (fraction * (chartWidth - padding.left - padding.right));
              return (
                <g key={i}>
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={chartHeight - padding.bottom}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                    strokeDasharray="4"
                  />
                  <text
                    x={x}
                    y={chartHeight - padding.bottom + 20}
                    textAnchor="middle"
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

            {/* Bars */}
            {dataSeries.map((item: any, index: number) => {
              const y = padding.top + (index * barSpacing) + (barSpacing - barHeight) / 2;
              const width = scaleX(item.value) - padding.left;
              const isHovered = hoveredBar === index;

              return (
                <g key={index}>
                  <rect
                    x={padding.left}
                    y={y}
                    width={width}
                    height={barHeight}
                    fill={item.color}
                    opacity={isHovered ? 0.8 : 1}
                    className="cursor-pointer transition-opacity"
                    onMouseEnter={() => setHoveredBar(index)}
                    onMouseLeave={() => setHoveredBar(null)}
                    rx="4"
                  />

                  {/* Y-axis label */}
                  <text
                    x={padding.left - 10}
                    y={y + barHeight / 2 + 4}
                    textAnchor="end"
                    className="text-sm fill-gray-700 dark:fill-gray-300 font-medium"
                  >
                    {item.label}
                  </text>

                  {/* Value label */}
                  {showValueLabels && (
                    <text
                      x={padding.left + width + 10}
                      y={y + barHeight / 2 + 4}
                      className="text-xs fill-gray-700 dark:fill-gray-300 font-medium"
                    >
                      {item.value.toLocaleString()}
                    </text>
                  )}

                  {/* Tooltip */}
                  {isHovered && (
                    <g>
                      <rect
                        x={padding.left + width / 2 - 60}
                        y={y - 35}
                        width="120"
                        height="30"
                        rx="4"
                        fill="rgb(31, 41, 55)"
                        opacity="0.95"
                      />
                      <text
                        x={padding.left + width / 2}
                        y={y - 15}
                        textAnchor="middle"
                        className="text-sm fill-white font-bold"
                      >
                        {item.value.toLocaleString()}
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

export default BarChart;
    `,

    stacked: `
${commonImports}

interface StackedDataSeries {
  name: string;
  color: string;
  data: number[];
}

interface StackedData {
  labels: string[];
  series: StackedDataSeries[];
}

interface BarChartProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const BarChart: React.FC<BarChartProps> = ({
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
  const stackedData: StackedData = ${getField('stackedData')};
  const showGrid = ${getField('showGrid')};
  const showLegend = ${getField('showLegend')};
  const exportLabel = ${getField('exportLabel')};

  const [hoveredBar, setHoveredBar] = useState<{ categoryIndex: number; seriesIndex: number } | null>(null);

  // Calculate totals for each category
  const totals = stackedData.labels.map((_, labelIndex) =>
    stackedData.series.reduce((sum, series) => sum + series.data[labelIndex], 0)
  );
  const maxValue = Math.max(...totals);

  const chartHeight = 400;
  const chartWidth = 700;
  const padding = { top: 60, right: 40, bottom: 60, left: 70 };

  const barWidth = (chartWidth - padding.left - padding.right) / stackedData.labels.length * 0.7;
  const barSpacing = (chartWidth - padding.left - padding.right) / stackedData.labels.length;

  const scaleY = (value: number) => {
    return chartHeight - padding.bottom - ((value / maxValue) * (chartHeight - padding.top - padding.bottom));
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
            {stackedData.series.map((series, index) => (
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

            {/* Stacked bars */}
            {stackedData.labels.map((label, categoryIndex) => {
              const x = padding.left + (categoryIndex * barSpacing) + (barSpacing - barWidth) / 2;
              let cumulativeHeight = 0;

              return (
                <g key={categoryIndex}>
                  {stackedData.series.map((series, seriesIndex) => {
                    const value = series.data[categoryIndex];
                    const segmentHeight = ((value / maxValue) * (chartHeight - padding.top - padding.bottom));
                    const y = scaleY(cumulativeHeight + value);
                    cumulativeHeight += value;

                    const isHovered = hoveredBar?.categoryIndex === categoryIndex && hoveredBar?.seriesIndex === seriesIndex;

                    return (
                      <g key={seriesIndex}>
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={segmentHeight}
                          fill={series.color}
                          opacity={isHovered ? 0.8 : 1}
                          className="cursor-pointer transition-opacity"
                          onMouseEnter={() => setHoveredBar({ categoryIndex, seriesIndex })}
                          onMouseLeave={() => setHoveredBar(null)}
                        />

                        {isHovered && (
                          <g>
                            <rect
                              x={x + barWidth / 2 - 60}
                              y={y - 50}
                              width="120"
                              height="40"
                              rx="4"
                              fill="rgb(31, 41, 55)"
                              opacity="0.95"
                            />
                            <text
                              x={x + barWidth / 2}
                              y={y - 32}
                              textAnchor="middle"
                              className="text-xs fill-white font-medium"
                            >
                              {series.name}
                            </text>
                            <text
                              x={x + barWidth / 2}
                              y={y - 18}
                              textAnchor="middle"
                              className="text-sm fill-white font-bold"
                            >
                              {value.toLocaleString()}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {/* X-axis label */}
                  <text
                    x={x + barWidth / 2}
                    y={chartHeight - padding.bottom + 20}
                    textAnchor="middle"
                    className="text-xs fill-gray-600 dark:fill-gray-400"
                  >
                    {label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
};

export default BarChart;
    `
  };

  return variants[variant] || variants.vertical;
};
