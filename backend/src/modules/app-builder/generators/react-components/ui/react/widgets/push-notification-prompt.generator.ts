import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generatePushNotificationPrompt = (
  resolved: ResolvedComponent,
  variant: 'modal' | 'banner' | 'native' = 'modal'
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
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Bell, X, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';`;

  const variants = {
    modal: `
${commonImports}

interface PushNotificationPromptProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function PushNotificationPrompt({ ${dataName}: propData, className }: PushNotificationPromptProps) {
  const [isOpen, setIsOpen] = useState(true);

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

  const promptData = ${dataName} || {};

  const prompt = ${getField('modalPrompt')};

  const handleAllow = () => {
    console.log('Notifications allowed');
    // Request notification permission
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        console.log('Permission:', permission);
      });
    }
    setIsOpen(false);
  };

  const handleLater = () => {
    console.log('Notification prompt dismissed');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleLater}
      />

      {/* Modal */}
      <div className={cn(
        "relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200 border-2 border-gray-200 dark:border-gray-700",
        className
      )}>
        {/* Icon */}
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-4 shadow-lg">
          <Bell className="w-10 h-10 text-white" />
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent dark:from-white dark:to-blue-400 mb-2">
            {prompt.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {prompt.message}
          </p>

          {/* Benefits */}
          {prompt.showBenefits && prompt.benefits && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800 text-left">
              <ul className="space-y-2">
                {prompt.benefits.map((benefit: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <div className="p-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleAllow}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-bold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {prompt.allowText}
          </Button>
          <Button
            onClick={handleLater}
            variant="outline"
            className="w-full dark:border-gray-600 dark:text-gray-300 border-2 transition-all duration-300 hover:border-blue-400 dark:hover:border-purple-500"
          >
            {prompt.laterText}
          </Button>
        </div>
      </div>
    </div>
  );
}
    `,

    banner: `
${commonImports}
import { Sparkles } from 'lucide-react';

interface PushNotificationPromptProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function PushNotificationPrompt({ ${dataName}: propData, className }: PushNotificationPromptProps) {
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

  const [isVisible, setIsVisible] = useState(true);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const promptData = ${dataName} || {};

  const prompt = ${getField('bannerPrompt')};

  const handleAllow = () => {
    console.log('Notifications allowed');
    // Request notification permission
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        console.log('Permission:', permission);
      });
    }
    setIsVisible(false);
  };

  const handleDismiss = () => {
    console.log('Banner dismissed');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 shadow-xl animate-in slide-in-from-top duration-300",
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white mb-1">
                {prompt.title}
              </h3>
              <p className="text-sm text-blue-100">
                {prompt.message}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Button
              onClick={handleAllow}
              className="bg-white text-gray-900 hover:bg-gray-100 font-bold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 rounded-full"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {prompt.allowText}
            </Button>
            <button
              onClick={handleDismiss}
              className="p-2 text-white hover:bg-white/20 rounded-full transition-all duration-300 hover:scale-110"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
    `,

    native: `
${commonImports}

interface PushNotificationPromptProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function PushNotificationPrompt({ ${dataName}: propData, className }: PushNotificationPromptProps) {
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

  const [isOpen, setIsOpen] = useState(true);
  const [dontAskAgain, setDontAskAgain] = useState(false);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const promptData = ${dataName} || {};

  const prompt = ${getField('nativePrompt')};

  const handleAllow = () => {
    console.log('Notifications allowed', { dontAskAgain });
    // Request notification permission
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        console.log('Permission:', permission);
        if (dontAskAgain && permission === 'granted') {
          localStorage.setItem('notification_preference', 'granted');
        }
      });
    }
    setIsOpen(false);
  };

  const handleBlock = () => {
    console.log('Notifications blocked', { dontAskAgain });
    if (dontAskAgain) {
      localStorage.setItem('notification_preference', 'denied');
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleBlock}
      />

      {/* Alert Dialog - Native iOS/Android Style */}
      <div className={cn(
        "relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-xs animate-in zoom-in-95 duration-200 border-2 border-gray-200 dark:border-gray-700",
        className
      )}>
        {/* Content */}
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Bell className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent dark:from-white dark:to-blue-400 mb-2">
            "{prompt.title}"
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {prompt.message}
          </p>
          {prompt.explanation && (
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {prompt.explanation}
            </p>
          )}
        </div>

        {/* Don't Ask Again Option */}
        {prompt.showDontAskAgain && (
          <div className="px-6 pb-4">
            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <input
                type="checkbox"
                checked={dontAskAgain}
                onChange={(e) => setDontAskAgain(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                Don't ask again
              </span>
            </label>
          </div>
        )}

        {/* Actions - iOS Style */}
        <div className="border-t-2 border-gray-200 dark:border-gray-700 flex">
          <button
            onClick={handleBlock}
            className="flex-1 px-4 py-3 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 border-r-2 border-gray-200 dark:border-gray-700"
          >
            {prompt.dontAllowText}
          </button>
          <button
            onClick={handleAllow}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
          >
            {prompt.allowText}
          </button>
        </div>
      </div>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.modal;
};
