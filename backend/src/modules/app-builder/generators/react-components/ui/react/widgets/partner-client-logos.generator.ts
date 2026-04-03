import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generatePartnerClientLogos = (
  resolved: ResolvedComponent,
  variant: 'grid' | 'carousel' | 'marquee' = 'grid'
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
import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    grid: `
${commonImports}

interface Logo {
  id: number;
  name: string;
  logo: string;
  url: string;
  category: string;
}

interface GridLogosProps {
  ${dataName}?: any;
  className?: string;
  enableGrayscale?: boolean;
  onLogoClick?: (logo: Logo) => void;
}

const GridPartnerLogos: React.FC<GridLogosProps> = ({
  ${dataName}: propData,
  className,
  enableGrayscale = ${getField('enableGrayscale')},
  onLogoClick
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

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const logosData = ${dataName} || {};

  const title = ${getField('gridTitle')} || 'Our Partners';
  const subtitle = ${getField('gridSubtitle')} || 'Trusted by leading companies';
  const rawLogos = ${getField('logos')};
  const logos = Array.isArray(rawLogos) ? rawLogos : [];

  const handleLogoClick = (logo: Logo) => {
    if (onLogoClick) {
      onLogoClick(logo);
    } else {
      console.log('Logo clicked:', logo.name);
      if (logo.url) {
        window.open(logo.url, '_blank');
      }
    }
  };

  if (logos.length === 0) {
    return (
      <div className={cn("py-12", className)}>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{title}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">{subtitle}</p>
        </div>
        <div className="text-center text-gray-500">No partners to display</div>
      </div>
    );
  }

  return (
    <div className={cn("py-12", className)}>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{title}</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8">
        {logos.map((logo: Logo) => (
          <div
            key={logo.id}
            onClick={() => handleLogoClick(logo)}
            className="flex items-center justify-center p-6 bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-700 hover:shadow-lg transition-all duration-300 cursor-pointer group"
          >
            <img
              src={logo.logo}
              alt={logo.name}
              className={cn(
                "max-w-full max-h-16 object-contain transition-all duration-300",
                enableGrayscale && "grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100"
              )}
              title={logo.name}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GridPartnerLogos;
    `,

    carousel: `
${commonImports}
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Logo {
  id: number;
  name: string;
  logo: string;
  url: string;
  category: string;
}

interface CarouselLogosProps {
  ${dataName}?: any;
  className?: string;
  enableGrayscale?: boolean;
  autoScrollSpeed?: number;
  slidesToShow?: number;
  onLogoClick?: (logo: Logo) => void;
}

const CarouselPartnerLogos: React.FC<CarouselLogosProps> = ({
  ${dataName}: propData,
  className,
  enableGrayscale = ${getField('enableGrayscale')},
  autoScrollSpeed = ${getField('autoScrollSpeed')},
  slidesToShow = 6,
  onLogoClick
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

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

  const logosData = ${dataName} || {};

  const title = ${getField('carouselTitle')} || 'Our Partners';
  const subtitle = ${getField('carouselSubtitle')} || 'Trusted by leading companies';
  const rawLogos = ${getField('logos')};
  const logos = Array.isArray(rawLogos) ? rawLogos : [];

  useEffect(() => {
    if (!isPaused && autoScrollSpeed > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const maxIndex = Math.max(0, logos.length - slidesToShow);
          return prevIndex >= maxIndex ? 0 : prevIndex + 1;
        });
      }, autoScrollSpeed * 1000);

      return () => clearInterval(interval);
    }
  }, [isPaused, autoScrollSpeed, logos.length, slidesToShow]);

  const handleLogoClick = (logo: Logo) => {
    if (onLogoClick) {
      onLogoClick(logo);
    } else {
      console.log('Logo clicked:', logo.name);
      if (logo.url) {
        window.open(logo.url, '_blank');
      }
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => Math.max(0, prevIndex - 1));
  };

  const handleNext = () => {
    const maxIndex = Math.max(0, logos.length - slidesToShow);
    setCurrentIndex((prevIndex) => Math.min(maxIndex, prevIndex + 1));
  };

  if (logos.length === 0) {
    return (
      <div className={cn("py-12", className)}>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{title}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">{subtitle}</p>
        </div>
        <div className="text-center text-gray-500">No partners to display</div>
      </div>
    );
  }

  return (
    <div className={cn("py-12", className)}>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{title}</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <div
        className="relative overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: \`translateX(-\${currentIndex * (100 / slidesToShow)}%)\`
          }}
        >
          {logos.map((logo: Logo) => (
            <div
              key={logo.id}
              className="flex-shrink-0 px-4"
              style={{ width: \`\${100 / slidesToShow}%\` }}
            >
              <div
                onClick={() => handleLogoClick(logo)}
                className="flex items-center justify-center p-8 bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-700 hover:shadow-lg transition-all duration-300 cursor-pointer group h-32"
              >
                <img
                  src={logo.logo}
                  alt={logo.name}
                  className={cn(
                    "max-w-full max-h-16 object-contain transition-all duration-300",
                    enableGrayscale && "grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100"
                  )}
                  title={logo.name}
                />
              </div>
            </div>
          ))}
        </div>

        {logos.length > slidesToShow && (
          <>
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all z-10"
            >
              <ChevronLeft className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex >= logos.length - slidesToShow}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all z-10"
            >
              <ChevronRight className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CarouselPartnerLogos;
    `,

    marquee: `
${commonImports}

interface Logo {
  id: number;
  name: string;
  logo: string;
  url: string;
  category: string;
}

interface MarqueeLogosProps {
  ${dataName}?: any;
  className?: string;
  enableGrayscale?: boolean;
  autoScrollSpeed?: number;
  pauseOnHover?: boolean;
  onLogoClick?: (logo: Logo) => void;
}

const MarqueePartnerLogos: React.FC<MarqueeLogosProps> = ({
  ${dataName}: propData,
  className,
  enableGrayscale = ${getField('enableGrayscale')},
  autoScrollSpeed = ${getField('autoScrollSpeed')},
  pauseOnHover = ${getField('pauseOnHover')},
  onLogoClick
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const logosData = ${dataName} || {};

  const title = ${getField('marqueeTitle')} || 'Our Partners';
  const subtitle = ${getField('marqueeSubtitle')} || 'Trusted by leading companies';
  const rawLogos = ${getField('logos')};
  const logos = Array.isArray(rawLogos) ? rawLogos : [];

  // Duplicate logos for seamless infinite scroll
  const duplicatedLogos = logos.length > 0 ? [...logos, ...logos] : [];

  const handleLogoClick = (logo: Logo, e: React.MouseEvent) => {
    e.preventDefault();
    if (onLogoClick) {
      onLogoClick(logo);
    } else {
      console.log('Logo clicked:', logo.name);
      if (logo.url) {
        window.open(logo.url, '_blank');
      }
    }
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement || isPaused) return;

    let animationId: number;
    let scrollPosition = 0;
    const scrollWidth = scrollElement.scrollWidth / 2;

    const scroll = () => {
      scrollPosition += 1;
      if (scrollPosition >= scrollWidth) {
        scrollPosition = 0;
      }
      scrollElement.scrollLeft = scrollPosition;
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationId);
  }, [isPaused]);

  if (logos.length === 0) {
    return (
      <div className={cn("py-12 overflow-hidden", className)}>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{title}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">{subtitle}</p>
        </div>
        <div className="text-center text-gray-500">No partners to display</div>
      </div>
    );
  }

  return (
    <div className={cn("py-12 overflow-hidden", className)}>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{title}</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <div
        ref={scrollRef}
        className="flex overflow-x-hidden"
        onMouseEnter={() => pauseOnHover && setIsPaused(true)}
        onMouseLeave={() => pauseOnHover && setIsPaused(false)}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
<div className="flex gap-12 animate-none">
          {duplicatedLogos.map((logo: Logo, index: number) => (
            <div
              key={\`\${logo.id}-\${index}\`}
              onClick={(e) => handleLogoClick(logo, e)}
              className="flex items-center justify-center flex-shrink-0 w-40 h-24 cursor-pointer group"
            >
              <img
                src={logo.logo}
                alt={logo.name}
                className={cn(
                  "max-w-full max-h-20 object-contain transition-all duration-300",
                  enableGrayscale && "grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100"
                )}
                title={logo.name}
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarqueePartnerLogos;
    `
  };

  return variants[variant] || variants.grid;
};
