import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateToastNotification = (
  resolved: ResolvedComponent,
  variant: 'simple' | 'detailed' | 'action' = 'simple'
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
    simple: `
${commonImports}

interface Toast {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

interface ToastNotificationProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function ToastNotification({ ${dataName}: propData, className }: ToastNotificationProps) {
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
  const toastData = ${dataName} || {};

  const [toasts, setToasts] = useState<Toast[]>([]);
  const position = ${getField('position')};

  useEffect(() => {
    if (isLoading) return;
    const initialToasts = ${getField('simpleToasts')};
    setToasts(initialToasts);
  }, [isLoading, ${dataName}]);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    toasts.forEach(toast => {
      if (toast.duration && toast.duration > 0) {
        const timer = setTimeout(() => {
          removeToast(toast.id);
        }, toast.duration);
        return () => clearTimeout(timer);
      }
    });
  }, [toasts]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return (
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg">
          <CheckCircle className="w-5 h-5 text-white" />
        </div>
      );
      case 'error': return (
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-red-500 to-pink-600 shadow-lg">
          <XCircle className="w-5 h-5 text-white" />
        </div>
      );
      case 'warning': return (
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg">
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
      );
      case 'info': return (
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
          <Info className="w-5 h-5 text-white" />
        </div>
      );
      default: return (
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-gray-500 to-gray-600 shadow-lg">
          <Info className="w-5 h-5 text-white" />
        </div>
      );
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'success': return 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-500 dark:border-green-400';
      case 'error': return 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/30 border-red-500 dark:border-red-400';
      case 'warning': return 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 border-yellow-500 dark:border-yellow-400';
      case 'info': return 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-blue-500 dark:border-purple-400';
      default: return 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/30 border-gray-500 dark:border-gray-400';
    }
  };

  const positionStyles = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  return (
    <div className={cn("fixed z-50 flex flex-col gap-2", positionStyles[position as keyof typeof positionStyles] || positionStyles['top-right'], className)}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-center gap-3 p-4 rounded-xl border-2 shadow-lg hover:shadow-xl min-w-[300px] max-w-md animate-in slide-in-from-top-2 duration-300 transition-all",
            getTypeStyles(toast.type)
          )}
        >
          <div className="flex-shrink-0">
            {getIcon(toast.type)}
          </div>
          <p className="flex-1 text-sm text-gray-900 dark:text-white font-medium">
            {toast.message}
          </p>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center transition-all hover:scale-110 shadow-md"
          >
            <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      ))}
    </div>
  );
}
    `,

    detailed: `
${commonImports}

interface DetailedToast {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp?: string;
  duration?: number;
}

interface ToastNotificationProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function ToastNotification({ ${dataName}: propData, className }: ToastNotificationProps) {
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
  const toastData = ${dataName} || {};

  const [toasts, setToasts] = useState<DetailedToast[]>([]);
  const position = ${getField('position')};

  useEffect(() => {
    if (isLoading) return;
    const initialToasts = ${getField('detailedToasts')};
    setToasts(initialToasts);
  }, [isLoading, ${dataName}]);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    toasts.forEach(toast => {
      if (toast.duration && toast.duration > 0) {
        const timer = setTimeout(() => {
          removeToast(toast.id);
        }, toast.duration);
        return () => clearTimeout(timer);
      }
    });
  }, [toasts]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return (
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg">
          <CheckCircle className="w-6 h-6 text-white" />
        </div>
      );
      case 'error': return (
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r from-red-500 to-pink-600 shadow-lg">
          <XCircle className="w-6 h-6 text-white" />
        </div>
      );
      case 'warning': return (
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg">
          <AlertTriangle className="w-6 h-6 text-white" />
        </div>
      );
      case 'info': return (
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
          <Info className="w-6 h-6 text-white" />
        </div>
      );
      default: return (
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r from-gray-500 to-gray-600 shadow-lg">
          <Info className="w-6 h-6 text-white" />
        </div>
      );
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'success': return 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-500 dark:border-green-400';
      case 'error': return 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/30 border-red-500 dark:border-red-400';
      case 'warning': return 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 border-yellow-500 dark:border-yellow-400';
      case 'info': return 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-blue-500 dark:border-purple-400';
      default: return 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/30 border-gray-500 dark:border-gray-400';
    }
  };

  const positionStyles = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={cn("fixed z-50 flex flex-col gap-3", positionStyles[position as keyof typeof positionStyles] || positionStyles['top-right'], className)}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex gap-4 p-5 rounded-xl border-2 shadow-lg hover:shadow-2xl min-w-[350px] max-w-md animate-in slide-in-from-top-2 duration-300 transition-all",
            getTypeStyles(toast.type)
          )}
        >
          <div className="flex-shrink-0 mt-0.5">
            {getIcon(toast.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="text-base font-bold text-gray-900 dark:text-white">
                {toast.title}
              </h4>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center transition-all hover:scale-110 shadow-md"
              >
                <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              {toast.message}
            </p>
            {toast.timestamp && (
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {formatTimestamp(toast.timestamp)}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
    `,

    action: `
${commonImports}

interface ActionToast {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  actionText?: string;
  duration?: number;
}

interface ToastNotificationProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function ToastNotification({ ${dataName}: propData, className }: ToastNotificationProps) {
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
  const toastData = ${dataName} || {};

  const [toasts, setToasts] = useState<ActionToast[]>([]);
  const position = ${getField('position')};

  useEffect(() => {
    if (isLoading) return;
    const initialToasts = ${getField('actionToasts')};
    setToasts(initialToasts);
  }, [isLoading, ${dataName}]);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleAction = (toast: ActionToast) => {
    console.log('Toast action clicked:', toast.actionText);
    removeToast(toast.id);
  };

  useEffect(() => {
    toasts.forEach(toast => {
      if (toast.duration && toast.duration > 0) {
        const timer = setTimeout(() => {
          removeToast(toast.id);
        }, toast.duration);
        return () => clearTimeout(timer);
      }
    });
  }, [toasts]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return (
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg">
          <CheckCircle className="w-5 h-5 text-white" />
        </div>
      );
      case 'error': return (
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-red-500 to-pink-600 shadow-lg">
          <XCircle className="w-5 h-5 text-white" />
        </div>
      );
      case 'warning': return (
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg">
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
      );
      case 'info': return (
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
          <Info className="w-5 h-5 text-white" />
        </div>
      );
      default: return (
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-gray-500 to-gray-600 shadow-lg">
          <Info className="w-5 h-5 text-white" />
        </div>
      );
    }
  };

  const getActionButtonStyles = (type: string) => {
    switch (type) {
      case 'success': return 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600';
      case 'error': return 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700';
      case 'warning': return 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600';
      case 'info': return 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700';
    }
  };

  const positionStyles = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  return (
    <div className={cn("fixed z-50 flex flex-col gap-3", positionStyles[position as keyof typeof positionStyles] || positionStyles['top-right'], className)}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg hover:shadow-2xl border-2 border-gray-200 dark:border-gray-700 min-w-[350px] max-w-md animate-in slide-in-from-top-2 duration-300 transition-all"
          )}
        >
          <div className="flex gap-3 p-4">
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(toast.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                {toast.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center transition-all hover:scale-110 shadow-md"
            >
              <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          {toast.actionText && (
            <div className="px-4 pb-4 flex gap-2">
              <button
                onClick={() => handleAction(toast)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-bold text-white transition-all hover:scale-105 shadow-lg",
                  getActionButtonStyles(toast.type)
                )}
              >
                {toast.actionText}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
    `
  };

  return variants[variant] || variants.simple;
};
