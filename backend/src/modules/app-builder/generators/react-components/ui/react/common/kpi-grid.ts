import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateKpiGrid = (resolved: ResolvedComponent): string => {
  const dataSource = resolved.dataSource;

  // Get the resolved field names from the field resolver service
  const getField = (fieldName: string): string | null => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `item.${mapping.sourceField}`;
    }
    // Return fallback value
    const fallback = mapping?.fallback;
    if (fallback === null || fallback === undefined) {
      // For ID fields
      if (fieldName === 'id' || fieldName.endsWith('Id')) {
        return `item.id || item._id`;
      }
      // For array fields
      if (fieldName.match(/items|steps|updates|timeline|list|array|images|products|users|orders/i)) {
        return `item.${fieldName} || ([] as any[])`;
      }
      // For object fields
      if (fieldName.match(/address|metadata|config|settings|tracking|gallery/i)) {
        return `item.${fieldName} || ({} as any)`;
      }
      // For scalar values
      return `item.${fieldName} || ''`;
    }
    if (typeof fallback === 'string') {
      return `'${fallback.replace(/'/g, "\\'")}'`;
    }
    if (typeof fallback === 'object') {
      return JSON.stringify(fallback);
    }
    return String(fallback);
  };

  // Parse data source for clean prop naming
  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === '') return 'data';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? lastPart : 'data';
  };

  const dataName = getDataPath();

  return `import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiItem {
  id?: string;
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  changeType?: 'increase' | 'decrease' | 'neutral';
  changeValue?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
}

interface KpiGridProps {
  ${dataName}?: KpiItem[];
  columns?: 2 | 3 | 4;
  loading?: boolean;
  className?: string;
}

export const KpiGrid: React.FC<KpiGridProps> = ({
  ${dataName},
  columns = 4,
  loading = false,
  className
}) => {
  const items = ${dataName} || [];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200',
  };

  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  if (loading) {
    return (
      <div className={cn(\`grid \${gridCols[columns]} gap-4\`, className)}>
        {Array.from({ length: columns }).map((_, index) => (
          <Card key={index} className="w-full">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-8 bg-gray-200 rounded w-2/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn(\`grid \${gridCols[columns]} gap-4\`, className)}>
      {items.map((item: any, index: number) => {
        const color = item.color || 'blue';
        const iconBgColor = colorClasses[color] || colorClasses.blue;

        // Determine trend direction
        const trendDirection = item.trend || item.changeType;
        const isUp = trendDirection === 'up' || trendDirection === 'increase';
        const isDown = trendDirection === 'down' || trendDirection === 'decrease';
        const isNeutral = trendDirection === 'neutral' || (!isUp && !isDown);

        return (
          <Card key={item.id || index} className="w-full hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{${getField('title') || 'item.title'}}</p>
                  <h3 className="text-3xl font-bold text-gray-900">{${getField('value') || 'item.value'}}</h3>
                </div>

                ${getField('icon') ? `{${getField('icon')} && (
                  <div className={\`w-12 h-12 rounded-lg flex items-center justify-center \${iconBgColor}\`}>
                    {${getField('icon')}}
                  </div>
                )}` : `{item.icon && (
                  <div className={\`w-12 h-12 rounded-lg flex items-center justify-center \${iconBgColor}\`}>
                    {item.icon}
                  </div>
                )}`}
              </div>

              <div className="flex items-center justify-between">
                ${getField('description') ? `{${getField('description')} && (
                  <p className="text-sm text-gray-500">{${getField('description')}}</p>
                )}` : `{item.description && (
                  <p className="text-sm text-gray-500">{item.description}</p>
                )}`}

                {trendDirection && (
                  <div className="flex items-center gap-1">
                    {isUp && (
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        {item.changeValue && (
                          <span className="text-sm font-medium">{item.changeValue}</span>
                        )}
                      </div>
                    )}
                    {isDown && (
                      <div className="flex items-center gap-1 text-red-600">
                        <TrendingDown className="w-4 h-4" />
                        {item.changeValue && (
                          <span className="text-sm font-medium">{item.changeValue}</span>
                        )}
                      </div>
                    )}
                    {isNeutral && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <Minus className="w-4 h-4" />
                        {item.changeValue && (
                          <span className="text-sm font-medium">{item.changeValue}</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
  `.trim();
};