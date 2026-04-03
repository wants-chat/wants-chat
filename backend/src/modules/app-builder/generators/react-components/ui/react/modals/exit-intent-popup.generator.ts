import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateExitIntentPopup = (
  resolved: ResolvedComponent,
  variant: 'modal' | 'slide' | 'minimal' = 'modal'
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
    return `/${dataSource || 'data'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'data';

  const commonImports = `
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';`;

  const variants = {
    modal: `
${commonImports}
import { X, Mail, Gift } from 'lucide-react';

interface ModalExitPopupProps {
  ${dataName}?: any;
  className?: string;
  sensitivity?: number;
  delayBeforeRepeat?: number;
  showOnlyOnce?: boolean;
  onSubmit?: (email: string) => void;
  onDecline?: () => void;
  onClose?: () => void;
}

const ModalExitIntentPopup: React.FC<ModalExitPopupProps> = ({
  ${dataName}: propData,
  className,
  sensitivity: propSensitivity,
  delayBeforeRepeat: propDelayBeforeRepeat,
  showOnlyOnce: propShowOnlyOnce,
  onSubmit,
  onDecline,
  onClose
}) => {
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
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [hasTriggered, setHasTriggered] = useState(false);

  const popupData = ${dataName} || {};

  const sensitivity = propSensitivity ?? ${getField('sensitivity')};
  const delayBeforeRepeat = propDelayBeforeRepeat ?? ${getField('delayBeforeRepeat')};
  const showOnlyOnce = propShowOnlyOnce ?? ${getField('showOnlyOnce')};
  const title = ${getField('modalTitle')};
  const message = ${getField('modalMessage')};
  const placeholder = ${getField('modalPlaceholder')};
  const submitText = ${getField('modalSubmitText')};
  const declineText = ${getField('modalDeclineText')};

  useEffect(() => {
    const lastShown = localStorage.getItem('exit-intent-last-shown');
    if (lastShown) {
      const timeSinceLastShown = Date.now() - parseInt(lastShown);
      if (showOnlyOnce || timeSinceLastShown < delayBeforeRepeat) {
        return;
      }
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (hasTriggered) return;

      if (e.clientY <= sensitivity) {
        setIsVisible(true);
        setHasTriggered(true);
        localStorage.setItem('exit-intent-last-shown', Date.now().toString());
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasTriggered, sensitivity, delayBeforeRepeat, showOnlyOnce]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(email);
    } else {
      console.log('Email submitted:', email);
    }
    setIsVisible(false);
  };

  const handleDecline = () => {
    if (onDecline) {
      onDecline();
    }
    setIsVisible(false);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center p-4", className)}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-300">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
            <Gift className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {message}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
          >
            {submitText}
          </button>

          <button
            type="button"
            onClick={handleDecline}
            className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium py-2 transition-colors"
          >
            {declineText}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ModalExitIntentPopup;
    `,

    slide: `
${commonImports}
import { X, Mail, TrendingUp } from 'lucide-react';

interface SlideExitPopupProps {
  ${dataName}?: any;
  className?: string;
  sensitivity?: number;
  delayBeforeRepeat?: number;
  showOnlyOnce?: boolean;
  onSubmit?: (email: string) => void;
  onClose?: () => void;
}

const SlideExitIntentPopup: React.FC<SlideExitPopupProps> = ({
  ${dataName}: propData,
  className,
  sensitivity: propSensitivity,
  delayBeforeRepeat: propDelayBeforeRepeat,
  showOnlyOnce: propShowOnlyOnce,
  onSubmit,
  onClose
}) => {
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
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [hasTriggered, setHasTriggered] = useState(false);

  const popupData = ${dataName} || {};

  const sensitivity = propSensitivity ?? ${getField('sensitivity')};
  const delayBeforeRepeat = propDelayBeforeRepeat ?? ${getField('delayBeforeRepeat')};
  const showOnlyOnce = propShowOnlyOnce ?? ${getField('showOnlyOnce')};
  const title = ${getField('slideTitle')};
  const message = ${getField('slideMessage')};
  const placeholder = ${getField('modalPlaceholder')};
  const submitText = ${getField('slideSubmitText')};

  useEffect(() => {
    const lastShown = localStorage.getItem('exit-intent-slide-last-shown');
    if (lastShown) {
      const timeSinceLastShown = Date.now() - parseInt(lastShown);
      if (showOnlyOnce || timeSinceLastShown < delayBeforeRepeat) {
        return;
      }
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (hasTriggered) return;

      if (e.clientY <= sensitivity) {
        setIsVisible(true);
        setHasTriggered(true);
        localStorage.setItem('exit-intent-slide-last-shown', Date.now().toString());
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasTriggered, sensitivity, delayBeforeRepeat, showOnlyOnce]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(email);
    } else {
      console.log('Email submitted:', email);
    }
    setIsVisible(false);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-0 right-0 z-50 m-4 max-w-md w-full",
        "animate-in slide-in-from-right duration-500",
        className
      )}
    >
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg shadow-2xl p-6 text-white">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1">{title}</h3>
            <p className="text-sm text-blue-100">{message}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white/50 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
          >
            {submitText}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SlideExitIntentPopup;
    `,

    minimal: `
${commonImports}
import { X, Mail } from 'lucide-react';

interface MinimalExitPopupProps {
  ${dataName}?: any;
  className?: string;
  sensitivity?: number;
  delayBeforeRepeat?: number;
  showOnlyOnce?: boolean;
  onSubmit?: (email: string) => void;
  onClose?: () => void;
}

const MinimalExitIntentPopup: React.FC<MinimalExitPopupProps> = ({
  ${dataName}: propData,
  className,
  sensitivity: propSensitivity,
  delayBeforeRepeat: propDelayBeforeRepeat,
  showOnlyOnce: propShowOnlyOnce,
  onSubmit,
  onClose
}) => {
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
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [hasTriggered, setHasTriggered] = useState(false);

  const popupData = ${dataName} || {};

  const sensitivity = propSensitivity ?? ${getField('sensitivity')};
  const delayBeforeRepeat = propDelayBeforeRepeat ?? ${getField('delayBeforeRepeat')};
  const showOnlyOnce = propShowOnlyOnce ?? ${getField('showOnlyOnce')};
  const message = ${getField('minimalMessage')};
  const placeholder = ${getField('modalPlaceholder')};
  const submitText = ${getField('minimalSubmitText')};

  useEffect(() => {
    const lastShown = localStorage.getItem('exit-intent-minimal-last-shown');
    if (lastShown) {
      const timeSinceLastShown = Date.now() - parseInt(lastShown);
      if (showOnlyOnce || timeSinceLastShown < delayBeforeRepeat) {
        return;
      }
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (hasTriggered) return;

      if (e.clientY <= sensitivity) {
        setIsVisible(true);
        setHasTriggered(true);
        localStorage.setItem('exit-intent-minimal-last-shown', Date.now().toString());
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasTriggered, sensitivity, delayBeforeRepeat, showOnlyOnce]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(email);
    } else {
      console.log('Email submitted:', email);
    }
    setIsVisible(false);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white shadow-lg",
        "animate-in slide-in-from-top duration-300",
        className
      )}
    >
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          <Mail className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-medium flex-1">{message}</p>

          <form onSubmit={handleSubmit} className="flex gap-2 flex-shrink-0">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              required
              className="px-3 py-1.5 rounded bg-white text-gray-900 placeholder-gray-500 text-sm focus:ring-2 focus:ring-white/50 focus:outline-none w-64"
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-white text-blue-600 font-semibold rounded hover:bg-blue-50 transition-colors text-sm whitespace-nowrap"
            >
              {submitText}
            </button>
          </form>

          <button
            onClick={handleClose}
            className="p-1 hover:bg-white/20 rounded transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MinimalExitIntentPopup;
    `
  };

  return variants[variant] || variants.modal;
};
