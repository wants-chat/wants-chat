import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateAnnouncementBar = (
  resolved: ResolvedComponent,
  variant: 'top' | 'bottom' | 'rotating' = 'top'
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
    return `/${dataSource || 'announcement-bar'}`;
  };

  const apiRoute = getApiRoute();

  // Derive entity name for query key
  const entity = dataSource ? dataSource.split('.').pop() || 'announcementBar' : 'announcementBar';

  const commonImports = `
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';`;

  const variants = {
    top: `
${commonImports}
import { X, ArrowRight } from 'lucide-react';

interface TopAnnouncementBarProps {
  ${dataName}?: any;
  className?: string;
  dismissible?: boolean;
  backgroundColor?: string;
  textColor?: string;
  onLinkClick?: (link: string) => void;
  onDismiss?: () => void;
}

const TopAnnouncementBar: React.FC<TopAnnouncementBarProps> = ({
  ${dataName}: propData,
  className,
  dismissible = ${getField('dismissible')},
  backgroundColor = ${getField('backgroundColor')},
  textColor = ${getField('textColor')},
  onLinkClick,
  onDismiss
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const announcementData = ${dataName} || {};

  const message = ${getField('topMessage')};
  const link = ${getField('topLink')};
  const linkText = ${getField('topLinkText')};

  useEffect(() => {
    const dismissed = sessionStorage.getItem('announcement-bar-top-dismissed');
    if (dismissed) {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('announcement-bar-top-dismissed', 'true');
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleLinkClick = () => {
    if (onLinkClick) {
      onLinkClick(link);
    } else {
      console.log('Link clicked:', link);
      window.location.href = link;
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn("w-full py-2 px-4 text-center transition-all duration-300", className)}
      style={{ backgroundColor, color: textColor }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        <p className="text-sm font-medium">
          {message}
        </p>
        {link && linkText && (
          <button
            onClick={handleLinkClick}
            className="flex items-center gap-1 text-sm font-semibold hover:underline underline-offset-4"
          >
            {linkText}
            <ArrowRight className="h-3 w-3" />
          </button>
        )}

        {dismissible && (
          <button
            onClick={handleDismiss}
            className="ml-auto p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Dismiss announcement"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default TopAnnouncementBar;
    `,

    bottom: `
${commonImports}
import { X } from 'lucide-react';

interface BottomAnnouncementBarProps {
  ${dataName}?: any;
  className?: string;
  dismissible?: boolean;
  backgroundColor?: string;
  textColor?: string;
  onButtonClick?: () => void;
  onDismiss?: () => void;
}

const BottomAnnouncementBar: React.FC<BottomAnnouncementBarProps> = ({
  ${dataName}: propData,
  className,
  dismissible = ${getField('dismissible')},
  backgroundColor = ${getField('backgroundColor')},
  textColor = ${getField('textColor')},
  onButtonClick,
  onDismiss
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const announcementData = ${dataName} || {};

  const message = ${getField('bottomMessage')};
  const buttonText = ${getField('bottomButtonText')};

  useEffect(() => {
    const dismissed = sessionStorage.getItem('announcement-bar-bottom-dismissed');
    if (dismissed) {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('announcement-bar-bottom-dismissed', 'true');
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      console.log('Button clicked');
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 py-3 px-4 shadow-2xl animate-in slide-in-from-bottom duration-500",
        className
      )}
      style={{ backgroundColor, color: textColor }}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3">
        <p className="text-sm font-medium text-center sm:text-left">
          {message}
        </p>
        <button
          onClick={handleButtonClick}
          className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold text-sm transition-colors whitespace-nowrap"
        >
          {buttonText}
        </button>

        {dismissible && (
          <button
            onClick={handleDismiss}
            className="sm:ml-auto p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Dismiss announcement"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default BottomAnnouncementBar;
    `,

    rotating: `
${commonImports}
import { X, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  link?: string;
  linkText?: string;
  type: string;
}

interface RotatingAnnouncementBarProps {
  ${dataName}?: any;
  className?: string;
  dismissible?: boolean;
  autoRotateInterval?: number;
  backgroundColor?: string;
  textColor?: string;
  onLinkClick?: (link: string, messageId: number) => void;
  onDismiss?: () => void;
}

const RotatingAnnouncementBar: React.FC<RotatingAnnouncementBarProps> = ({
  ${dataName}: propData,
  className,
  dismissible = ${getField('dismissible')},
  autoRotateInterval = ${getField('autoRotateInterval')},
  backgroundColor = ${getField('backgroundColor')},
  textColor = ${getField('textColor')},
  onLinkClick,
  onDismiss
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const announcementData = ${dataName} || {};
  const messages: Message[] = ${getField('rotatingMessages')};

  useEffect(() => {
    const dismissed = sessionStorage.getItem('announcement-bar-rotating-dismissed');
    if (dismissed) {
      setIsVisible(false);
    }
  }, []);

  useEffect(() => {
    if (!isPaused && messages.length > 1 && autoRotateInterval > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % messages.length);
      }, autoRotateInterval);

      return () => clearInterval(interval);
    }
  }, [isPaused, messages.length, autoRotateInterval]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('announcement-bar-rotating-dismissed', 'true');
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleLinkClick = (link: string, messageId: number) => {
    if (onLinkClick) {
      onLinkClick(link, messageId);
    } else {
      console.log('Link clicked:', link);
      window.location.href = link;
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + messages.length) % messages.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % messages.length);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  if (!isVisible || messages.length === 0) return null;

  const currentMessage = messages[currentIndex];

  return (
    <div
      className={cn("w-full py-2 px-4 text-center transition-all duration-300", className)}
      style={{ backgroundColor, color: textColor }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        {messages.length > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevious}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              aria-label="Previous message"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={togglePause}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              aria-label={isPaused ? "Resume rotation" : "Pause rotation"}
            >
              {isPaused ? (
                <Play className="h-4 w-4" />
              ) : (
                <Pause className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={handleNext}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              aria-label="Next message"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex-1 flex items-center justify-center gap-3">
          <p className="text-sm font-medium">
            {currentMessage.text}
          </p>
          {currentMessage.link && currentMessage.linkText && (
            <button
              onClick={() => handleLinkClick(currentMessage.link!, currentMessage.id)}
              className="text-sm font-semibold hover:underline underline-offset-4 whitespace-nowrap"
            >
              {currentMessage.linkText}
            </button>
          )}
        </div>

        {messages.length > 1 && (
          <div className="flex items-center gap-1">
            {messages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all",
                  index === currentIndex
                    ? "bg-white w-4"
                    : "bg-white/40 hover:bg-white/60"
                )}
                aria-label={\`Go to message \${index + 1}\`}
              />
            ))}
          </div>
        )}

        {dismissible && (
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Dismiss announcement"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default RotatingAnnouncementBar;
    `
  };

  return variants[variant] || variants.top;
};
