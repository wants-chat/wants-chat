import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateDataVizPieChart = (
  resolved: ResolvedComponent,
  variant: 'pie' | 'donut' | 'exploded' = 'donut'
) => {
  const dataSource = resolved.dataSource;

  // Parse data source for clean prop naming (sanitize to camelCase)
  const sanitizeVariableName = (name: string): string => {
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
  const labelField = props.labelField || 'label';
  const valueField = props.valueField || 'value';
  const title = resolved.title || 'Pie Chart';

  // Default colors for pie segments
  const defaultColors = [
    '#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
  ];

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

  const donutVariant = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface DataSegment {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

interface PieChartProps {
  ${dataName}?: any[];
  className?: string;
  [key: string]: any;
}

const PieChart: React.FC<PieChartProps> = ({
  ${dataName}: propData,
  className
}) => {
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);

  const colors = ${JSON.stringify(defaultColors)};

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

  // Transform raw data to pie segments
  const labelField = '${labelField}';
  const valueField = '${valueField}';

  const total = chartData.reduce((sum, item) => sum + (Number(item[valueField]) || 0), 0);

  const dataSegments: DataSegment[] = chartData.map((item: any, index: number) => ({
    label: String(item[labelField] || 'Unknown'),
    value: Number(item[valueField]) || 0,
    percentage: total > 0 ? Math.round((Number(item[valueField]) || 0) / total * 100) : 0,
    color: colors[index % colors.length],
  }));

  const centerX = 150;
  const centerY = 150;
  const outerRadius = 100;
  const innerRadius = 60;

  const createDonutArc = (startAngle: number, endAngle: number) => {
    const outerStartX = centerX + outerRadius * Math.cos(startAngle);
    const outerStartY = centerY + outerRadius * Math.sin(startAngle);
    const outerEndX = centerX + outerRadius * Math.cos(endAngle);
    const outerEndY = centerY + outerRadius * Math.sin(endAngle);

    const innerStartX = centerX + innerRadius * Math.cos(endAngle);
    const innerStartY = centerY + innerRadius * Math.sin(endAngle);
    const innerEndX = centerX + innerRadius * Math.cos(startAngle);
    const innerEndY = centerY + innerRadius * Math.sin(startAngle);

    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

    return [
      \`M \${outerStartX} \${outerStartY}\`,
      \`A \${outerRadius} \${outerRadius} 0 \${largeArcFlag} 1 \${outerEndX} \${outerEndY}\`,
      \`L \${innerStartX} \${innerStartY}\`,
      \`A \${innerRadius} \${innerRadius} 0 \${largeArcFlag} 0 \${innerEndX} \${innerEndY}\`,
      'Z'
    ].join(' ');
  };

  if (isLoading && !propData) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>${title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
            {error ? 'Failed to load chart data' : 'No data available'}
          </div>
        </CardContent>
      </Card>
    );
  }

  let currentAngle = -Math.PI / 2;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>${title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center gap-6">
          {/* Donut Chart */}
          <div className="relative flex-shrink-0">
            <svg width="300" height="300" viewBox="0 0 300 300">
              {dataSegments.map((segment, index) => {
                if (segment.value === 0) {
                  return null;
                }
                const segmentAngle = (segment.value / total) * 2 * Math.PI;
                const endAngle = currentAngle + segmentAngle;

                const path = createDonutArc(currentAngle, endAngle);
                const isHovered = hoveredSegment === index;

                const result = (
                  <path
                    key={index}
                    d={path}
                    fill={segment.color}
                    opacity={hoveredSegment === null || isHovered ? 1 : 0.5}
                    className="cursor-pointer transition-opacity"
                    onMouseEnter={() => setHoveredSegment(index)}
                    onMouseLeave={() => setHoveredSegment(null)}
                  />
                );

                currentAngle = endAngle;
                return result;
              })}

              {/* Center text */}
              <text
                x={centerX}
                y={centerY - 8}
                textAnchor="middle"
                className="text-sm fill-gray-500"
              >
                Total
              </text>
              <text
                x={centerX}
                y={centerY + 16}
                textAnchor="middle"
                className="text-2xl fill-gray-900 dark:fill-white font-bold"
              >
                {total.toLocaleString()}
              </text>
            </svg>
          </div>

          {/* Legend */}
          <div className="space-y-2 flex-1 w-full">
            {dataSegments.map((segment, index) => {
              const isHovered = hoveredSegment === index;
              return (
                <div
                  key={index}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all",
                    isHovered ? "bg-gray-100 dark:bg-gray-800" : "hover:bg-gray-50 dark:hover:bg-gray-900"
                  )}
                  onMouseEnter={() => setHoveredSegment(index)}
                  onMouseLeave={() => setHoveredSegment(null)}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: segment.color }}
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {segment.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {segment.value.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      ({segment.percentage}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PieChart;
`;

  const pieVariant = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface DataSegment {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

interface PieChartProps {
  ${dataName}?: any[];
  className?: string;
  [key: string]: any;
}

const PieChart: React.FC<PieChartProps> = ({
  ${dataName}: propData,
  className
}) => {
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);

  const colors = ${JSON.stringify(defaultColors)};

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

  const labelField = '${labelField}';
  const valueField = '${valueField}';

  const total = chartData.reduce((sum, item) => sum + (Number(item[valueField]) || 0), 0);

  const dataSegments: DataSegment[] = chartData.map((item: any, index: number) => ({
    label: String(item[labelField] || 'Unknown'),
    value: Number(item[valueField]) || 0,
    percentage: total > 0 ? Math.round((Number(item[valueField]) || 0) / total * 100) : 0,
    color: colors[index % colors.length],
  }));

  const centerX = 150;
  const centerY = 150;
  const radius = 100;

  const createArc = (startAngle: number, endAngle: number, outerRadius: number) => {
    const startX = centerX + outerRadius * Math.cos(startAngle);
    const startY = centerY + outerRadius * Math.sin(startAngle);
    const endX = centerX + outerRadius * Math.cos(endAngle);
    const endY = centerY + outerRadius * Math.sin(endAngle);

    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

    return [
      \`M \${centerX} \${centerY}\`,
      \`L \${startX} \${startY}\`,
      \`A \${outerRadius} \${outerRadius} 0 \${largeArcFlag} 1 \${endX} \${endY}\`,
      'Z'
    ].join(' ');
  };

  if (isLoading && !propData) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>${title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
            {error ? 'Failed to load chart data' : 'No data available'}
          </div>
        </CardContent>
      </Card>
    );
  }

  let currentAngle = -Math.PI / 2;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>${title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <svg width="300" height="300" viewBox="0 0 300 300" className="flex-shrink-0">
            {dataSegments.map((segment, index) => {
              if (segment.value === 0) return null;
              const segmentAngle = (segment.value / total) * 2 * Math.PI;
              const endAngle = currentAngle + segmentAngle;
              const midAngle = currentAngle + segmentAngle / 2;

              const path = createArc(currentAngle, endAngle, radius);
              const isHovered = hoveredSegment === index;

              const labelRadius = radius * 0.65;
              const labelX = centerX + labelRadius * Math.cos(midAngle);
              const labelY = centerY + labelRadius * Math.sin(midAngle);

              const result = (
                <g key={index}>
                  <path
                    d={path}
                    fill={segment.color}
                    opacity={hoveredSegment === null || isHovered ? 1 : 0.5}
                    className="cursor-pointer transition-opacity"
                    onMouseEnter={() => setHoveredSegment(index)}
                    onMouseLeave={() => setHoveredSegment(null)}
                  />
                  {segment.percentage >= 5 && (
                    <text
                      x={labelX}
                      y={labelY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-xs fill-white font-bold pointer-events-none"
                    >
                      {segment.percentage}%
                    </text>
                  )}
                </g>
              );

              currentAngle = endAngle;
              return result;
            })}
          </svg>

          <div className="space-y-2 flex-1 w-full">
            {dataSegments.map((segment, index) => {
              const isHovered = hoveredSegment === index;
              return (
                <div
                  key={index}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all",
                    isHovered ? "bg-gray-100 dark:bg-gray-800" : "hover:bg-gray-50 dark:hover:bg-gray-900"
                  )}
                  onMouseEnter={() => setHoveredSegment(index)}
                  onMouseLeave={() => setHoveredSegment(null)}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }} />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{segment.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{segment.value.toLocaleString()}</span>
                    <span className="text-xs text-gray-500 ml-2">({segment.percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PieChart;
`;

  const variants = {
    pie: pieVariant,
    donut: donutVariant,
    exploded: pieVariant, // Use pie variant for exploded as well
  };

  return variants[variant] || variants.donut;
};
