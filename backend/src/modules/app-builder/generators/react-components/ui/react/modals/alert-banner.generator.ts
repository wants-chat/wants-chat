import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateAlertBanner = (
  resolved: ResolvedComponent,
  variant: 'inline' | 'sticky' | 'dismissible' = 'inline'
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
  const entity = dataSource?.split('.').pop() || 'data';

  const commonImports = `
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { X, CheckCircle, XCircle, Info, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';`;

  const variants = {
    inline: `
${commonImports}

interface Alert {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  isDismissible?: boolean;
}

interface AlertBannerProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function AlertBanner({ ${dataName}: propData, className }: AlertBannerProps) {
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
  const alertData = ${dataName} || {};

  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    if (isLoading) return;
    const initialAlerts = ${getField('inlineAlerts')};
    setAlerts(initialAlerts);
  }, [isLoading, ${dataName}]);

  const dismissAlert = (id: number) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  if (isLoading && !propData) {
    return (
      <div className={cn("flex items-center justify-center p-4", className)}>
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'error': return <XCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'info': return <Info className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'success': return 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-l-4 border-green-500 text-green-800 dark:text-green-300';
      case 'error': return 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-l-4 border-red-500 text-red-800 dark:text-red-300';
      case 'warning': return 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-l-4 border-amber-500 text-yellow-800 dark:text-yellow-300';
      case 'info': return 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-l-4 border-blue-500 text-blue-800 dark:text-blue-300';
      default: return 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-l-4 border-gray-500 text-gray-800 dark:text-gray-300';
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={cn(
            "flex items-center gap-3 p-4 rounded-xl shadow-sm animate-in slide-in-from-top-2",
            getTypeStyles(alert.type)
          )}
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/50 dark:bg-black/20 flex items-center justify-center">
            {getIcon(alert.type)}
          </div>
          <p className="flex-1 text-sm font-medium">
            {alert.message}
          </p>
          {alert.isDismissible && (
            <button
              onClick={() => dismissAlert(alert.id)}
              className="flex-shrink-0 w-8 h-8 rounded-lg hover:bg-white/50 dark:hover:bg-black/20 flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
    `,

    sticky: `
${commonImports}

interface StickyAlert {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  position?: 'top' | 'bottom';
  showIcon?: boolean;
}

interface AlertBannerProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function AlertBanner({ ${dataName}: propData, className }: AlertBannerProps) {
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
  const alertData = ${dataName} || {};

  const [alerts, setAlerts] = useState<StickyAlert[]>([]);

  useEffect(() => {
    if (isLoading) return;
    const initialAlerts = ${getField('stickyAlerts')};
    setAlerts(initialAlerts);
  }, [isLoading, ${dataName}]);

  const dismissAlert = (id: number) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  if (isLoading && !propData) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center p-4 bg-blue-600">
        <Loader2 className="w-5 h-5 animate-spin text-white" />
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'error': return <XCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'info': return <Info className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'success': return 'bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 text-white shadow-lg';
      case 'error': return 'bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-700 dark:to-rose-700 text-white shadow-lg';
      case 'warning': return 'bg-gradient-to-r from-yellow-600 to-amber-600 dark:from-yellow-700 dark:to-amber-700 text-white shadow-lg';
      case 'info': return 'bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-700 dark:to-cyan-700 text-white shadow-lg';
      default: return 'bg-gradient-to-r from-gray-600 to-slate-600 dark:from-gray-700 dark:to-slate-700 text-white shadow-lg';
    }
  };

  if (alerts.length === 0) return null;

  return (
    <>
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={cn(
            "fixed left-0 right-0 z-50 shadow-lg",
            alert.position === 'bottom' ? 'bottom-0' : 'top-0'
          )}
        >
          <div className={cn("flex items-center justify-center gap-3 px-4 py-3", getTypeStyles(alert.type), className)}>
            {alert.showIcon && (
              <div className="flex-shrink-0">
                {getIcon(alert.type)}
              </div>
            )}
            <p className="flex-1 text-center text-sm font-medium">
              {alert.message}
            </p>
            <button
              onClick={() => dismissAlert(alert.id)}
              className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </>
  );
}
    `,

    dismissible: `
${commonImports}

interface DismissibleAlert {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  actionText?: string | null;
  actionLink?: string | null;
}

interface AlertBannerProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function AlertBanner({ ${dataName}: propData, className }: AlertBannerProps) {
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
  const alertData = ${dataName} || {};

  const [alerts, setAlerts] = useState<DismissibleAlert[]>([]);

  useEffect(() => {
    if (isLoading) return;
    const initialAlerts = ${getField('dismissibleAlerts')};
    setAlerts(initialAlerts);
  }, [isLoading, ${dataName}]);

  const dismissAlert = (id: number) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  if (isLoading && !propData) {
    return (
      <div className={cn("flex items-center justify-center p-4", className)}>
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  const handleAction = (alert: DismissibleAlert) => {
    console.log('Action clicked for:', alert.title);
    if (alert.actionLink) {
      window.location.href = alert.actionLink;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-6 h-6" />;
      case 'error': return <XCircle className="w-6 h-6" />;
      case 'warning': return <AlertTriangle className="w-6 h-6" />;
      case 'info': return <Info className="w-6 h-6" />;
      default: return <Info className="w-6 h-6" />;
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'success': return {
        container: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
        icon: 'text-green-600 dark:text-green-400',
        title: 'text-green-900 dark:text-green-300',
        message: 'text-green-700 dark:text-green-400',
        button: 'text-green-700 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300'
      };
      case 'error': return {
        container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
        icon: 'text-red-600 dark:text-red-400',
        title: 'text-red-900 dark:text-red-300',
        message: 'text-red-700 dark:text-red-400',
        button: 'text-red-700 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300'
      };
      case 'warning': return {
        container: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
        icon: 'text-yellow-600 dark:text-yellow-400',
        title: 'text-yellow-900 dark:text-yellow-300',
        message: 'text-yellow-700 dark:text-yellow-400',
        button: 'text-yellow-700 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300'
      };
      case 'info': return {
        container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
        icon: 'text-blue-600 dark:text-blue-400',
        title: 'text-blue-900 dark:text-blue-300',
        message: 'text-blue-700 dark:text-blue-400',
        button: 'text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
      };
      default: return {
        container: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800',
        icon: 'text-gray-600 dark:text-gray-400',
        title: 'text-gray-900 dark:text-gray-300',
        message: 'text-gray-700 dark:text-gray-400',
        button: 'text-gray-700 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300'
      };
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div className={cn("space-y-4", className)}>
      {alerts.map((alert) => {
        const styles = getTypeStyles(alert.type);
        return (
          <div
            key={alert.id}
            className={cn(
              "flex gap-4 p-4 rounded-lg border",
              styles.container
            )}
          >
            <div className={cn("flex-shrink-0 mt-0.5", styles.icon)}>
              {getIcon(alert.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={cn("text-sm font-semibold mb-1", styles.title)}>
                {alert.title}
              </h3>
              <p className={cn("text-sm", styles.message)}>
                {alert.message}
              </p>
              {alert.actionText && (
                <button
                  onClick={() => handleAction(alert)}
                  className={cn("text-sm font-medium mt-3 inline-flex items-center transition-colors", styles.button)}
                >
                  {alert.actionText}
                  <span className="ml-1">→</span>
                </button>
              )}
            </div>
            <button
              onClick={() => dismissAlert(alert.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
    `
  };

  return variants[variant] || variants.inline;
};
