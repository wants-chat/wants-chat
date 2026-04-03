import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateStatusBadge = (
  resolved: ResolvedComponent,
  variant: 'dot' | 'pill' | 'outline' = 'dot'
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

  const commonImports = `
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { CheckCircle, Clock, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    dot: `
${commonImports}

interface StatusBadgeProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function StatusBadge({ ${dataName}: propData, className }: StatusBadgeProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
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

  const badgeData = ${dataName} || {};

  const badges = ${getField('dotBadges')};

  const getDotColor = (color: string) => {
    switch (color) {
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
      case 'blue': return 'bg-blue-500';
      case 'gray': return 'bg-gray-400 dark:bg-gray-500';
      default: return 'bg-gray-400 dark:bg-gray-500';
    }
  };

  return (
    <div className={cn("flex flex-wrap gap-4", className)}>
      {badges.map((badge: any) => (
        <div key={badge.id} className="inline-flex items-center gap-2">
          <span className={cn("w-2 h-2 rounded-full shadow-lg", getDotColor(badge.color))} />
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
            {badge.text}
          </span>
        </div>
      ))}
    </div>
  );
}
    `,

    pill: `
${commonImports}

interface StatusBadgeProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function StatusBadge({ ${dataName}: propData, className }: StatusBadgeProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
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

  const badgeData = ${dataName} || {};

  const badges = ${getField('pillBadges')};

  const sizeClasses = {
    small: 'text-xs px-2 py-0.5',
    medium: 'text-sm px-3 py-1',
    large: 'text-base px-4 py-1.5',
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {badges.map((badge: any) => (
        <span
          key={badge.id}
          className={cn(
            "inline-flex items-center rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105",
            badge.bgColor,
            badge.textColor,
            sizeClasses.medium
          )}
        >
          {badge.text}
        </span>
      ))}
    </div>
  );
}
    `,

    outline: `
${commonImports}

interface StatusBadgeProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function StatusBadge({ ${dataName}: propData, className }: StatusBadgeProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
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

  const badgeData = ${dataName} || {};

  const badges = ${getField('outlineBadges')};

  const getIcon = (status: string) => {
    switch (status) {
      case 'success': return CheckCircle;
      case 'warning': return Clock;
      case 'error': return XCircle;
      case 'info': return AlertCircle;
      default: return AlertCircle;
    }
  };

  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {badges.map((badge: any) => {
        const Icon = getIcon(badge.status);
        return (
          <span
            key={badge.id}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 text-sm font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105",
              badge.borderColor,
              badge.textColor
            )}
          >
            <Icon className={cn("w-4 h-4", badge.iconColor)} />
            {badge.text}
          </span>
        );
      })}
    </div>
  );
}
    `
  };

  return variants[variant] || variants.dot;
};
