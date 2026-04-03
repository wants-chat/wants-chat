import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateKpiCard = (resolved: ResolvedComponent): string => {
  const dataSource = resolved.dataSource;
  const fields = resolved.fieldMappings || [];

  // Get the metric field (usually first field, or 'count' for count operations)
  const valueField = fields.find(f => f.targetField !== 'id')?.targetField || 'count';

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'kpi'}`;
  };

  const apiRoute = getApiRoute();

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Users, DollarSign, Activity, Database, CheckCircle, TrendingUp, ShoppingCart, Package, CreditCard, PieChart, FileText, Clock, Bookmark, Briefcase, Inbox, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface KpiCardProps {
  title?: string;
  icon?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  className?: string;
  filterField?: string;
  filterValue?: string;
  entity?: string;
  [key: string]: any;
}

const KpiCard: React.FC<KpiCardProps> = ({
  title = 'KPI',
  icon: iconName,
  color = 'blue',
  className,
  filterField,
  filterValue,
  entity = '${dataSource || 'kpi'}',
  ...props
}) => {
  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity, title, filterField, filterValue],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return Array.isArray(response) ? response : (response?.data || response);
      } catch (err) {
        console.error('Failed to fetch KPI data:', err);
        return [];
      }
    },
    enabled: !props.data,
    retry: 1,
  });

  // Extract data from props (passed from parent page) or fetched data
  const propData = props.data || fetchedData || props[Object.keys(props).find(k => Array.isArray(props[k])) || ''] || [];

  // Loading state
  if (isLoading && !props.data) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-6 flex items-center justify-center min-h-[100px]">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  // Calculate value - handle both count objects { count: X } and arrays
  let value = 0;
  if (propData && typeof propData === 'object' && 'count' in propData) {
    // Data is a count object like { count: 25 }
    value = propData.count || 0;
  } else if (Array.isArray(propData)) {
    // Data is an array - apply filter and count items
    const filteredData = filterField && filterValue
      ? propData.filter((item: any) => item[filterField] === filterValue)
      : propData;
    value = filteredData.length;
  }

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400',
    red: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400',
    purple: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400',
    gray: 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-700/20 dark:text-gray-400',
  };

  const iconBgColor = colorClasses[color] || colorClasses.blue;

  // Icon selection - support both lowercase and PascalCase
  const iconMap: Record<string, React.ReactNode> = {
    calendar: <Calendar className="w-6 h-6" />,
    Calendar: <Calendar className="w-6 h-6" />,
    users: <Users className="w-6 h-6" />,
    Users: <Users className="w-6 h-6" />,
    dollar: <DollarSign className="w-6 h-6" />,
    DollarSign: <DollarSign className="w-6 h-6" />,
    activity: <Activity className="w-6 h-6" />,
    Activity: <Activity className="w-6 h-6" />,
    database: <Database className="w-6 h-6" />,
    Database: <Database className="w-6 h-6" />,
    'check-circle': <CheckCircle className="w-6 h-6" />,
    CheckCircle: <CheckCircle className="w-6 h-6" />,
    'trending-up': <TrendingUp className="w-6 h-6" />,
    TrendingUp: <TrendingUp className="w-6 h-6" />,
    'shopping-cart': <ShoppingCart className="w-6 h-6" />,
    ShoppingCart: <ShoppingCart className="w-6 h-6" />,
    package: <Package className="w-6 h-6" />,
    Package: <Package className="w-6 h-6" />,
    'credit-card': <CreditCard className="w-6 h-6" />,
    CreditCard: <CreditCard className="w-6 h-6" />,
    'pie-chart': <PieChart className="w-6 h-6" />,
    PieChart: <PieChart className="w-6 h-6" />,
    // Job board specific icons
    FileText: <FileText className="w-6 h-6" />,
    Clock: <Clock className="w-6 h-6" />,
    Bookmark: <Bookmark className="w-6 h-6" />,
    Briefcase: <Briefcase className="w-6 h-6" />,
    Inbox: <Inbox className="w-6 h-6" />,
  };

  const iconComponent = iconName ? (iconMap[iconName] || <Activity className="w-6 h-6" />) : <Activity className="w-6 h-6" />;

  return (
    <Card className={cn('w-full hover:shadow-lg transition-shadow', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value.toLocaleString()}</h3>
          </div>

          <div className={\`w-12 h-12 rounded-lg flex items-center justify-center \${iconBgColor}\`}>
            {iconComponent}
          </div>
        </div>

      </CardContent>
    </Card>
  );
};

export default KpiCard;
`;
};
