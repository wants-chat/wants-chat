import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateReadingProgressBar = (
  resolved: ResolvedComponent,
  variant: 'top' | 'bottom' | 'circular' = 'top'
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

  const commonImports = `
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    top: `
${commonImports}

interface TopProgressBarProps {
  ${dataName}?: any;
  className?: string;
  barColor?: string;
  barHeight?: number;
  showPercentage?: boolean;
  hideOnComplete?: boolean;
}

const TopProgressBar: React.FC<TopProgressBarProps> = ({
  ${dataName}: propData,
  className,
  barColor = '#3b82f6',
  barHeight = 4,
  showPercentage = true,
  hideOnComplete = false
}) => {
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

  const [scrollProgress, setScrollProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  useEffect(() => {
    const calculateScrollProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      const totalScrollableHeight = documentHeight - windowHeight;
      const progress = (scrollTop / totalScrollableHeight) * 100;

      const clampedProgress = Math.min(Math.max(progress, 0), 100);
      setScrollProgress(clampedProgress);
      setIsComplete(clampedProgress >= 100);
    };

    calculateScrollProgress();
    window.addEventListener('scroll', calculateScrollProgress);
    window.addEventListener('resize', calculateScrollProgress);

    return () => {
      window.removeEventListener('scroll', calculateScrollProgress);
      window.removeEventListener('resize', calculateScrollProgress);
    };
  }, []);

  if (hideOnComplete && isComplete) {
    return null;
  }

  return (
    <div className={cn("fixed top-0 left-0 right-0 z-50", className)}>
      {/* Progress Bar */}
      <div
        className="h-1 bg-gray-200 dark:bg-gray-800 shadow-md"
        style={{ height: \`\${barHeight}px\` }}
      >
        <div
          className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 transition-all duration-200 ease-out shadow-lg"
          style={{
            width: \`\${scrollProgress}%\`,
            backgroundColor: barColor
          }}
        />
      </div>

      {/* Percentage Badge */}
      {showPercentage && scrollProgress > 0 && (
        <div
          className="absolute top-2 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-full px-3 py-1 text-xs font-bold border border-gray-200 dark:border-gray-700"
          style={{ color: barColor }}
        >
          {Math.round(scrollProgress)}%
        </div>
      )}
    </div>
  );
};

export default TopProgressBar;
    `,

    bottom: `
${commonImports}
import { ArrowUp, Loader2 } from 'lucide-react';

interface BottomProgressBarProps {
  ${dataName}?: any;
  className?: string;
  barColor?: string;
  barHeight?: number;
  showScrollToTop?: boolean;
}

const BottomProgressBar: React.FC<BottomProgressBarProps> = ({
  ${dataName}: propData,
  className,
  barColor = '#3b82f6',
  barHeight = 6,
  showScrollToTop = true
}) => {
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

  const [scrollProgress, setScrollProgress] = useState(0);
  const [showButton, setShowButton] = useState(false);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  useEffect(() => {
    const calculateScrollProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      const totalScrollableHeight = documentHeight - windowHeight;
      const progress = (scrollTop / totalScrollableHeight) * 100;

      const clampedProgress = Math.min(Math.max(progress, 0), 100);
      setScrollProgress(clampedProgress);
      setShowButton(scrollTop > 300);
    };

    calculateScrollProgress();
    window.addEventListener('scroll', calculateScrollProgress);
    window.addEventListener('resize', calculateScrollProgress);

    return () => {
      window.removeEventListener('scroll', calculateScrollProgress);
      window.removeEventListener('resize', calculateScrollProgress);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className={cn("fixed bottom-0 left-0 right-0 z-50", className)}>
      {/* Glass Effect Background */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 shadow-lg">
        {/* Progress Info */}
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Reading Progress
            </div>
            <div className="text-2xl font-bold" style={{ color: barColor }}>
              {Math.round(scrollProgress)}%
            </div>
          </div>

          {showScrollToTop && showButton && (
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
              style={{
                backgroundColor: barColor,
                color: 'white'
              }}
            >
              <ArrowUp className="h-4 w-4" />
              Back to Top
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div
          className="bg-gray-200 dark:bg-gray-800"
          style={{ height: \`\${barHeight}px\` }}
        >
          <div
            className="h-full transition-all duration-200 ease-out"
            style={{
              width: \`\${scrollProgress}%\`,
              backgroundColor: barColor
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default BottomProgressBar;
    `,

    circular: `
${commonImports}
import { ArrowUp, BookOpen, Loader2 } from 'lucide-react';

interface CircularProgressProps {
  ${dataName}?: any;
  className?: string;
  barColor?: string;
  circleSize?: number;
  showPercentage?: boolean;
  position?: 'bottom-right' | 'bottom-left';
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  ${dataName}: propData,
  className,
  barColor = '#3b82f6',
  circleSize = 64,
  showPercentage = true,
  position = 'bottom-right'
}) => {
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

  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  useEffect(() => {
    const calculateScrollProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      const totalScrollableHeight = documentHeight - windowHeight;
      const progress = (scrollTop / totalScrollableHeight) * 100;

      const clampedProgress = Math.min(Math.max(progress, 0), 100);
      setScrollProgress(clampedProgress);
      setIsVisible(scrollTop > 100);
    };

    calculateScrollProgress();
    window.addEventListener('scroll', calculateScrollProgress);
    window.addEventListener('resize', calculateScrollProgress);

    return () => {
      window.removeEventListener('scroll', calculateScrollProgress);
      window.removeEventListener('resize', calculateScrollProgress);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const radius = (circleSize - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  const positionClasses = {
    'bottom-right': 'bottom-8 right-8',
    'bottom-left': 'bottom-8 left-8'
  };

  return (
    <div
      className={cn(
        "fixed z-50 transition-all duration-300",
        positionClasses[position],
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none',
        className
      )}
    >
      <button
        onClick={scrollToTop}
        className="relative group"
        aria-label="Scroll to top"
      >
        {/* Circular Progress SVG */}
        <svg
          width={circleSize}
          height={circleSize}
          className="transform -rotate-90"
        >
          {/* Background Circle */}
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            fill="white"
            stroke="#e5e7eb"
            strokeWidth="4"
            className="dark:fill-gray-800 dark:stroke-gray-700"
          />

          {/* Progress Circle */}
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            fill="none"
            stroke={barColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-200 ease-out"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          {showPercentage ? (
            <div className="flex flex-col items-center">
              <span
                className="text-sm font-bold"
                style={{ color: barColor }}
              >
                {Math.round(scrollProgress)}%
              </span>
            </div>
          ) : (
            <ArrowUp
              className="h-6 w-6 group-hover:scale-110 transition-transform"
              style={{ color: barColor }}
            />
          )}
        </div>

        {/* Hover Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
            Scroll to top
          </div>
        </div>

        {/* Shadow/Glow Effect */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity"
          style={{ backgroundColor: barColor }}
        />
      </button>

      {/* Reading Time Indicator (Optional) */}
      {scrollProgress > 0 && scrollProgress < 100 && (
        <div className="absolute -top-12 right-0 bg-white dark:bg-gray-800 shadow-lg rounded-lg px-3 py-2 text-xs font-medium border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <BookOpen className="h-3 w-3" style={{ color: barColor }} />
            <span className="text-gray-700 dark:text-gray-300">
              {Math.round((100 - scrollProgress) / 10)} min left
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CircularProgress;
    `
  };

  return variants[variant] || variants.top;
};
