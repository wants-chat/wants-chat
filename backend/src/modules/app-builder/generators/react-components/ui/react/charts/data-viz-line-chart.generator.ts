import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateDataVizLineChart = (
  resolved: ResolvedComponent,
  variant: 'simple' | 'multiSeries' | 'area' = 'simple'
) => {
  const dataSource = resolved.dataSource;

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

  // Extract props from resolved component
  const props = resolved.props || {};
  const xAxisField = props.xAxisField || 'date';
  const yAxisFields = props.yAxisFields || ['value'];
  const colors = props.colors || ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6'];
  const title = resolved.title || 'Line Chart';

  // Get API route from serverFunction
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource}`;
  };

  const apiRoute = getApiRoute();

  const entity = dataSource?.split('.').pop() || 'analytics';

  const simpleVariant = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface DataPoint {
  label: string;
  value: number;
}

interface Series {
  name: string;
  color: string;
  data: DataPoint[];
}

interface LineChartProps {
  ${dataName}?: any[];
  className?: string;
  [key: string]: any;
}

const LineChart: React.FC<LineChartProps> = ({
  ${dataName}: propData,
  className
}) => {
  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      const data = Array.isArray(response) ? response : (response?.data || []);
      return Array.isArray(data) ? data : [];
    },
    enabled: !propData || propData.length === 0,
    retry: 1,
  });

  const chartData = (propData && propData.length > 0) ? propData : (fetchedData || []);

  // Transform raw data to chart series format
  const xAxisField = '${xAxisField}';
  const yAxisFields = ${JSON.stringify(yAxisFields)};
  const colors = ${JSON.stringify(colors)};

  const series: Series[] = yAxisFields.map((field: string, index: number) => ({
    name: field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' '),
    color: colors[index % colors.length],
    data: chartData.map((item: any) => ({
      label: item[xAxisField] ? new Date(item[xAxisField]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
      value: Number(item[field]) || 0,
    })),
  }));

  const allValues = series.flatMap(s => s.data.map(d => d.value));
  const maxValue = allValues.length > 0 ? Math.max(...allValues, 1) : 100;
  const chartHeight = 300;
  const chartWidth = 800;
  const padding = { top: 20, right: 40, bottom: 50, left: 60 };

  const scaleY = (value: number) => {
    return chartHeight - padding.bottom - ((value / maxValue) * (chartHeight - padding.top - padding.bottom));
  };

  const scaleX = (index: number, dataLength: number) => {
    if (dataLength <= 1) return padding.left;
    const width = chartWidth - padding.left - padding.right;
    return padding.left + (index * (width / (dataLength - 1)));
  };

  const [hoveredPoint, setHoveredPoint] = useState<{ seriesIndex: number; pointIndex: number } | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<number[]>(series.map((_, i) => i));

  const toggleSeries = (index: number) => {
    if (selectedSeries.includes(index)) {
      if (selectedSeries.length > 1) {
        setSelectedSeries(selectedSeries.filter(i => i !== index));
      }
    } else {
      setSelectedSeries([...selectedSeries, index]);
    }
  };

  if (isLoading && !propData) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>${title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || chartData.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>${title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            {error || 'No data available'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>${title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4">
          {series.map((s, index) => (
            <button
              key={index}
              onClick={() => toggleSeries(index)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all hover:bg-gray-50 dark:hover:bg-gray-800"
              style={{
                borderColor: selectedSeries.includes(index) ? s.color : '#d1d5db',
                opacity: selectedSeries.includes(index) ? 1 : 0.5
              }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {s.name}
              </span>
            </button>
          ))}
        </div>

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
            {series[0]?.data.map((point, index) => {
              // Show every nth label to avoid crowding
              const showEvery = Math.ceil(series[0].data.length / 10);
              if (index % showEvery !== 0 && index !== series[0].data.length - 1) return null;
              return (
                <text
                  key={index}
                  x={scaleX(index, series[0].data.length)}
                  y={chartHeight - padding.bottom + 20}
                  textAnchor="middle"
                  className="text-xs fill-gray-600 dark:fill-gray-400"
                >
                  {point.label}
                </text>
              );
            })}

            {/* Lines and points for each series */}
            {series.map((s, seriesIndex) => {
              if (!selectedSeries.includes(seriesIndex)) return null;
              if (s.data.length === 0) return null;

              const pathData = s.data
                .map((point, index) => {
                  const x = scaleX(index, s.data.length);
                  const y = scaleY(point.value);
                  return index === 0 ? \`M \${x} \${y}\` : \`L \${x} \${y}\`;
                })
                .join(' ');

              return (
                <g key={seriesIndex}>
                  <path
                    d={pathData}
                    fill="none"
                    stroke={s.color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {s.data.map((point, pointIndex) => {
                    const x = scaleX(pointIndex, s.data.length);
                    const y = scaleY(point.value);
                    const isHovered = hoveredPoint?.seriesIndex === seriesIndex && hoveredPoint?.pointIndex === pointIndex;

                    return (
                      <g key={pointIndex}>
                        <circle
                          cx={x}
                          cy={y}
                          r={isHovered ? 6 : 4}
                          fill={s.color}
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
                              y={y - 50}
                              width="120"
                              height="40"
                              rx="4"
                              fill="rgb(31, 41, 55)"
                              opacity="0.95"
                            />
                            <text
                              x={x}
                              y={y - 35}
                              textAnchor="middle"
                              className="text-xs fill-white font-medium"
                            >
                              {s.name}
                            </text>
                            <text
                              x={x}
                              y={y - 20}
                              textAnchor="middle"
                              className="text-xs fill-white"
                            >
                              {point.label}: {point.value.toLocaleString()}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
};

export default LineChart;
`;

  const areaVariant = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface LineChartProps {
  ${dataName}?: any[];
  className?: string;
  [key: string]: any;
}

const LineChart: React.FC<LineChartProps> = ({
  ${dataName}: propData,
  className
}) => {
  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      const data = Array.isArray(response) ? response : (response?.data || []);
      return Array.isArray(data) ? data : [];
    },
    enabled: !propData || propData.length === 0,
    retry: 1,
  });

  const chartData = (propData && propData.length > 0) ? propData : (fetchedData || []);

  const xAxisField = '${xAxisField}';
  const yAxisFields = ${JSON.stringify(yAxisFields)};
  const colors = ${JSON.stringify(colors)};

  const series = yAxisFields.map((field: string, index: number) => ({
    name: field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' '),
    color: colors[index % colors.length],
    data: chartData.map((item: any) => ({
      label: item[xAxisField] ? new Date(item[xAxisField]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
      value: Number(item[field]) || 0,
    })),
  }));

  const allValues = series.flatMap((s: any) => s.data.map((d: any) => d.value));
  const maxValue = allValues.length > 0 ? Math.max(...allValues, 1) : 100;
  const chartHeight = 300;
  const chartWidth = 800;
  const padding = { top: 20, right: 40, bottom: 50, left: 60 };

  const scaleY = (value: number) => chartHeight - padding.bottom - ((value / maxValue) * (chartHeight - padding.top - padding.bottom));
  const scaleX = (index: number, len: number) => len <= 1 ? padding.left : padding.left + (index * ((chartWidth - padding.left - padding.right) / (len - 1)));

  if (isLoading && !propData) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader><CardTitle>${title}</CardTitle></CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader><CardTitle>${title}</CardTitle></CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-gray-500">No data available</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader><CardTitle>${title}</CardTitle></CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-4">
          {series.map((s: any, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-sm text-gray-700 dark:text-gray-300">{s.name}</span>
            </div>
          ))}
        </div>
        <div className="w-full overflow-x-auto">
          <svg width={chartWidth} height={chartHeight} className="w-full" viewBox={\`0 0 \${chartWidth} \${chartHeight}\`}>
            <defs>
              {series.map((s: any, i: number) => (
                <linearGradient key={i} id={\`gradient-\${i}\`} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={s.color} stopOpacity="0" />
                </linearGradient>
              ))}
            </defs>
            {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
              const y = scaleY(maxValue * f);
              return (
                <g key={i}>
                  <line x1={padding.left} y1={y} x2={chartWidth - padding.right} y2={y} stroke="#e5e7eb" strokeDasharray="4" />
                  <text x={padding.left - 10} y={y + 4} textAnchor="end" className="text-xs fill-gray-500">{Math.round(maxValue * f)}</text>
                </g>
              );
            })}
            {series.map((s: any, si: number) => {
              if (s.data.length === 0) return null;
              const linePath = s.data.map((p: any, i: number) => \`\${i === 0 ? 'M' : 'L'} \${scaleX(i, s.data.length)} \${scaleY(p.value)}\`).join(' ');
              const areaPath = linePath + \` L \${scaleX(s.data.length - 1, s.data.length)} \${chartHeight - padding.bottom} L \${padding.left} \${chartHeight - padding.bottom} Z\`;
              return (
                <g key={si}>
                  <path d={areaPath} fill={\`url(#gradient-\${si})\`} />
                  <path d={linePath} fill="none" stroke={s.color} strokeWidth="2" />
                </g>
              );
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
};

export default LineChart;
`;

  const variants = {
    simple: simpleVariant,
    multiSeries: simpleVariant, // Use same as simple since it handles multiple series
    area: areaVariant,
  };

  return variants[variant] || variants.simple;
};
