import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateHeroFullWidth = (
  resolved: ResolvedComponent,
  variant: 'image' | 'video' | 'gradient' = 'image'
) => {
  const dataSource = resolved.dataSource;

  const getField = (fieldName: string): string => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `propData?.${mapping.sourceField}`;
    }
    if (fieldName === 'id' || fieldName.endsWith('Id')) {
      return `propData?.id || ${dataName}?._id`;
    }
    if (fieldName.match(/items|steps|updates|timeline|list|array|images|products|users|orders|features|links|stats|statistics|metrics|categories|tags|members|avatars|methods|examples|reviews|comments|notifications|messages|events|courses|lessons|modules|posts|articles|videos|photos|data|results|activities|cards|testimonials|faqs|questions|answers|options|choices|variants|attributes|filters|transactions|invoices|payments|receipts|shipments|deliveries/i)) {
      return `propData?.${fieldName} || ([] as any[])`;
    }
    if (fieldName.match(/address|metadata|config|settings|tracking|gallery/i)) {
      return `propData?.${fieldName} || ({} as any)`;
    }
    return `propData?.${fieldName} || ''`;
  };

  const sanitizeVariableName = (name: string): string => {
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

  const variants = {
    image: `
import { ArrowRight, ChevronDown, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';
import { UI_VARIANT, UI_COLOR_SCHEME } from '@/lib/ui-config';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface HeroFullWidthProps_0 {
  ${dataName}?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  [key: string]: any;
}

export default function HeroFullWidth({
  ${dataName}: propData,
  className,
  variant = UI_VARIANT,
  colorScheme = UI_COLOR_SCHEME
}: HeroFullWidthProps_0) {
  const styles = getVariantStyles(variant, colorScheme);

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}'],
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

  const heroData = ${dataName} || {};

  const backgroundImage = ${getField('backgroundImage')};
  const headline = ${getField('headline')};
  const subheading = ${getField('subheading')};
  const primaryButton = ${getField('primaryButton')};
  const secondaryButton = ${getField('secondaryButton')};
  const scrollText = ${getField('scrollText')};
  const features = ${getField('features')};

  const handlePrimaryClick = () => {
    console.log('Primary CTA clicked');
  };

  const handleSecondaryClick = () => {
    console.log('Secondary CTA clicked');
  };

  const handleScrollClick = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <section className={cn('relative min-h-screen w-full flex items-center justify-center overflow-hidden', className)}>
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: \`url(\${backgroundImage})\` }}
      />

      {/* Overlay */}
      <div className={cn('absolute inset-0', styles.gradient)} style={{ opacity: 0.85 }}></div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] bg-[size:50px_50px] opacity-5"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-current opacity-10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-current opacity-10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className={\`text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 leading-[1.1] \${styles.title}\`}>
          {headline}
        </h1>

        <p className={\`text-xl md:text-2xl lg:text-3xl mb-12 max-w-4xl mx-auto leading-relaxed \${styles.subtitle}\`}>
          {subheading}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            className={\`group px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 \${styles.button} \${styles.buttonHover}\`}
            onClick={handlePrimaryClick}
          >
            {primaryButton}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            className={\`border-2 backdrop-blur-sm px-8 py-4 rounded-xl font-bold text-lg transition-all \${styles.border} \${styles.text}\`}
            onClick={handleSecondaryClick}
          >
            {secondaryButton}
          </button>
        </div>

        {/* Features */}
        <div className="flex flex-wrap justify-center items-center gap-6 text-sm">
          {features.map((feature: string, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <CheckCircle className={\`w-5 h-5 \${styles.accent}\`} />
              <span className={styles.text}>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={handleScrollClick}
        className={\`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-colors cursor-pointer group animate-bounce \${styles.text}\`}
      >
        <span className="text-sm font-medium">{scrollText}</span>
        <ChevronDown className="w-6 h-6 group-hover:translate-y-1 transition-transform" />
      </button>
    </section>
  );
}
    `,

    video: `
import { useState, useRef, useEffect } from 'react';
import { ArrowRight, Play, Pause, Volume2, VolumeX, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';
import { UI_VARIANT, UI_COLOR_SCHEME } from '@/lib/ui-config';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface HeroFullWidthProps_1 {
  ${dataName}?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  [key: string]: any;
}

export default function HeroFullWidth({
  ${dataName}: propData,
  className,
  variant = UI_VARIANT,
  colorScheme = UI_COLOR_SCHEME
}: HeroFullWidthProps_1) {
  const styles = getVariantStyles(variant, colorScheme);

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}'],
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

  const heroData = ${dataName} || {};
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(${getField('autoPlayVideo')});
  const [isMuted, setIsMuted] = useState(${getField('muteVideo')});

  const backgroundVideo = ${getField('backgroundVideo')};
  const overlayOpacity = ${getField('overlayOpacity')};
  const headlineGradient = ${getField('headlineGradient')};
  const subheadingShort = ${getField('subheadingShort')};
  const primaryButtonAlt = ${getField('primaryButtonAlt')};
  const secondaryButtonAlt = ${getField('secondaryButtonAlt')};
  const scrollTextAlt = ${getField('scrollTextAlt')};
  const loopVideo = ${getField('loopVideo')};

  useEffect(() => {
    if (videoRef.current && isPlaying) {
      videoRef.current.play();
    }
  }, [isPlaying]);

  const handlePrimaryClick = () => {
    console.log('Primary CTA clicked');
  };

  const handleSecondaryClick = () => {
    console.log('Secondary CTA clicked');
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleScrollClick = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <section className={cn('relative min-h-screen w-full flex items-center justify-center overflow-hidden', className)}>
      {/* Background Video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay={isPlaying}
        loop={loopVideo}
        muted={isMuted}
        playsInline
      >
        <source src={backgroundVideo} type="video/mp4" />
      </video>

      {/* Overlay */}
      <div
        className={cn('absolute inset-0', styles.gradient)}
        style={{ opacity: overlayOpacity || 0.8 }}
      />

      {/* Video Controls */}
      <div className="absolute top-8 right-8 z-20 flex gap-3">
        <button
          onClick={togglePlayPause}
          className={cn(styles.card, 'w-12 h-12 backdrop-blur-sm rounded-full flex items-center justify-center transition-all')}
        >
          {isPlaying ? <Pause className={\`w-5 h-5 \${styles.accent}\`} /> : <Play className={\`w-5 h-5 ml-0.5 \${styles.accent}\`} />}
        </button>
        <button
          onClick={toggleMute}
          className={cn(styles.card, 'w-12 h-12 backdrop-blur-sm rounded-full flex items-center justify-center transition-all')}
        >
          {isMuted ? <VolumeX className={\`w-5 h-5 \${styles.accent}\`} /> : <Volume2 className={\`w-5 h-5 \${styles.accent}\`} />}
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className={\`text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 leading-[1.1] \${styles.title}\`}>
          {headlineGradient}
        </h1>

        <p className={\`text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed \${styles.subtitle}\`}>
          {subheadingShort}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            className={\`group px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 \${styles.button} \${styles.buttonHover}\`}
            onClick={handlePrimaryClick}
          >
            {primaryButtonAlt}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            className={\`border-2 backdrop-blur-sm px-8 py-4 rounded-xl font-semibold text-lg transition-all \${styles.border} \${styles.text}\`}
            onClick={handleSecondaryClick}
          >
            {secondaryButtonAlt}
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={handleScrollClick}
        className={\`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-colors cursor-pointer group animate-bounce \${styles.text}\`}
      >
        <span className="text-sm font-medium">{scrollTextAlt}</span>
        <ChevronDown className="w-6 h-6 group-hover:translate-y-1 transition-transform" />
      </button>
    </section>
  );
}
    `,

    gradient: `
import { ArrowRight, ChevronDown, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';
import { UI_VARIANT, UI_COLOR_SCHEME } from '@/lib/ui-config';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface HeroFullWidthProps_2 {
  ${dataName}?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  [key: string]: any;
}

export default function HeroFullWidth({
  ${dataName}: propData,
  className,
  variant = UI_VARIANT,
  colorScheme = UI_COLOR_SCHEME
}: HeroFullWidthProps_2) {
  const styles = getVariantStyles(variant, colorScheme);

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}'],
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

  const heroData = ${dataName} || {};

  const headlineMinimal = ${getField('headlineMinimal')};
  const subheadingDetailed = ${getField('subheadingDetailed')};
  const primaryButton = ${getField('primaryButton')};
  const secondaryButton = ${getField('secondaryButton')};
  const scrollText = ${getField('scrollText')};
  const stats = ${getField('stats')};

  const handlePrimaryClick = () => {
    console.log('Primary CTA clicked');
  };

  const handleSecondaryClick = () => {
    console.log('Secondary CTA clicked');
  };

  const handleScrollClick = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <section className={cn('relative min-h-screen w-full flex items-center justify-center overflow-hidden', styles.background, styles.gradient, className)}>
      {/* Animated Gradient Overlay */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-current opacity-30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-current opacity-30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-current opacity-30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 animate-bounce" style={{ animationDuration: '3s' }}>
        <div className={cn(styles.card, 'w-16 h-16 backdrop-blur-sm rounded-2xl flex items-center justify-center')}>
          <Sparkles className={\`w-8 h-8 \${styles.accent}\`} />
        </div>
      </div>
      <div className="absolute bottom-40 right-20 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
        <div className={cn(styles.card, 'w-20 h-20 backdrop-blur-sm rounded-full')}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className={\`inline-flex items-center gap-2 backdrop-blur-sm px-5 py-2 rounded-full mb-8 \${styles.badge}\`}>
          <span className="relative flex h-2 w-2">
            <span className={\`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 \${styles.accent}\`} style={{ background: 'currentColor' }}></span>
            <span className={\`relative inline-flex rounded-full h-2 w-2 \${styles.accent}\`} style={{ background: 'currentColor' }}></span>
          </span>
          <span className="text-sm font-medium">New Platform Launch</span>
        </div>

        <h1 className={\`text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 leading-[1.1] \${styles.title}\`}>
          {headlineMinimal}
        </h1>

        <p className={\`text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed \${styles.subtitle}\`}>
          {subheadingDetailed}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <button
            className={\`group px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 \${styles.button} \${styles.buttonHover}\`}
            onClick={handlePrimaryClick}
          >
            {primaryButton}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            className={\`border-2 backdrop-blur-sm px-8 py-4 rounded-xl font-semibold text-lg transition-all \${styles.border} \${styles.text}\`}
            onClick={handleSecondaryClick}
          >
            {secondaryButton}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
          {stats.map((stat: any, index: number) => (
            <div key={index} className={cn(styles.card, styles.cardHover, 'backdrop-blur-sm rounded-2xl p-6')}>
              <div className={\`text-4xl font-bold mb-2 \${styles.title}\`}>{stat.value}</div>
              <div className={styles.subtitle}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={handleScrollClick}
        className={\`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-colors cursor-pointer group animate-bounce \${styles.text}\`}
      >
        <span className="text-sm font-medium">{scrollText}</span>
        <ChevronDown className="w-6 h-6 group-hover:translate-y-1 transition-transform" />
      </button>
    </section>
  );
}
    `
  };

  return variants[variant] || variants.image;
};
