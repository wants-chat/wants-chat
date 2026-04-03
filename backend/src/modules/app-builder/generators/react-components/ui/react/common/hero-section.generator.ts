import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateHeroSection = (
  resolved: ResolvedComponent,
  variant: 'modern' | 'statsShowcase' | 'aiGeneration' | 'productShowcase' | 'darkMode' = 'modern'
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

  const variants = {
    modern: `
import React from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';
import { UI_VARIANT, UI_COLOR_SCHEME } from '@/lib/ui-config';

interface HeroProps_0 {
  data?: any;
  title?: string;
  subtitle?: string;
  description?: string;
  primaryCTA?: string;
  secondaryCTA?: string;
  primaryCTALink?: string;
  secondaryCTALink?: string;
  features?: string[];
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  onPostClick?: (item: any) => void;
  onReadMore?: (itemId: string | number, item?: any) => void;
  onCategoryClick?: (category: string) => void;
  onAuthorClick?: (authorName: string) => void;
  onReadArticle?: (itemId: string | number, item?: any) => void;
  [key: string]: any; // Accept any additional props from catalog
}

export default function Hero({
  title = 'Welcome to',
  subtitle = 'Our Platform',
  description = 'Discover amazing services tailored just for you.',
  primaryCTA = 'Get Started',
  secondaryCTA = 'Learn More',
  primaryCTALink = '/services',
  secondaryCTALink = '/about',
  features = ['Easy Booking', 'Secure Payment', '24/7 Support'],
  className,
  variant = UI_VARIANT,
  colorScheme = UI_COLOR_SCHEME
}: HeroProps_0) {
  const navigate = useNavigate();
  const styles = getVariantStyles(variant, colorScheme);

  const handlePrimaryClick = () => {
    if (primaryCTALink) {
      navigate(primaryCTALink);
    }
  };

  const handleSecondaryClick = () => {
    if (secondaryCTALink) {
      navigate(secondaryCTALink);
    }
  };

  return (
    <section className={cn('relative overflow-hidden py-20 lg:py-32', styles.background, styles.gradient, className)}>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className={\`text-5xl md:text-6xl lg:text-7xl mb-6 leading-[1.1] \${styles.title}\`}>
            {title}
            <span className="block mt-2">
              {subtitle}
            </span>
          </h1>

          <p className={\`text-xl md:text-2xl mb-10 leading-relaxed max-w-2xl mx-auto \${styles.subtitle}\`}>
            {description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <button
              className={\`px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 group \${styles.button} \${styles.buttonHover}\`}
              onClick={handlePrimaryClick}
            >
              {primaryCTA}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              className={\`px-8 py-4 rounded-xl font-bold text-lg transition-all \${styles.border} \${styles.text}\`}
              onClick={handleSecondaryClick}
            >
              {secondaryCTA}
            </button>
          </div>

          <div className={\`flex flex-wrap justify-center gap-6 text-sm \${styles.text}\`}>
            {features.map((feature: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className={\`w-5 h-5 \${styles.accent}\`} />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
    `,

    statsShowcase: `
import { ArrowRight, Users, TrendingUp, Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface HeroSectionProps_1 {
  ${dataName}?: any;
  className?: string;
  onCTAClick?: (data?: any) => void;
  onSecondaryClick?: (data?: any) => void;
}

export default function Hero({ ${dataName}: propData, className, onCTAClick, onSecondaryClick }: HeroSectionProps_1) {
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
  
  const badgeTrusted = ${getField('badgeTrusted')};
  const headlineDiscover = ${getField('headlineDiscover')};
  const headlinePossibilities = ${getField('headlinePossibilities')};
  const descriptionInnovation = ${getField('descriptionInnovation')};
  const getStartedFree = ${getField('getStartedFree')};
  const watchDemo = ${getField('watchDemo')};
  const stats = ${getField('stats')};
  const trustText = ${getField('trustText')};
  const companies = ${getField('companies')};

  const iconMap: any = {
    'Active Users': Users,
    'Creators': TrendingUp,
    'Downloads': Download
  };

  const colorMap: any = {
    'Active Users': 'from-blue-500 to-cyan-500',
    'Creators': 'from-purple-500 to-pink-500',
    'Downloads': 'from-orange-500 to-red-500'
  };

  const handleGetStarted = () => {
    if (onCTAClick) {
      onCTAClick(heroData);
    }
  };

  const handleWatchDemo = () => {
    if (onSecondaryClick) {
      onSecondaryClick(heroData);
    }
  };

  return (
    <section className={cn('bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center max-w-4xl mx-auto mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-600 dark:text-blue-400 px-5 py-2 rounded-full text-sm font-medium mb-8 border border-blue-100 dark:border-blue-800">
            <span>{badgeTrusted}</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-8 leading-[1.1]">
            {headlineDiscover}{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {headlinePossibilities}
            </span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto">
            {descriptionInnovation}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button 
              className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 group"
              onClick={handleGetStarted}
            >
              {getStartedFree}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              className="border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-md transition-all"
              onClick={handleWatchDemo}
            >
              {watchDemo}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {stats.map((stat: any, index: number) => {
            const Icon = iconMap[stat.label] || Users;
            const color = colorMap[stat.label] || 'from-blue-500 to-cyan-500';
            return (
              <div
                key={index}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:scale-105"
              >
                {/* Icon with gradient background */}
                <div className={\`inline-flex p-3 rounded-xl bg-gradient-to-br \${color} mb-4\`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Value */}
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.value}
                </div>

                {/* Label */}
                <div className="text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </div>

                {/* Hover effect gradient border */}
                <div className={\`absolute inset-0 rounded-2xl bg-gradient-to-br \${color} opacity-0 group-hover:opacity-10 transition-opacity -z-10\`}></div>
              </div>
            );
          })}
        </div>

        {/* Trust Indicators */}
        <div className="text-center mt-16">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {trustText}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
            {companies.map((company: any, index: number) => {
              const colors = [
                'from-blue-500 to-blue-600',
                'from-purple-500 to-purple-600',
                'from-green-500 to-green-600',
                'from-orange-500 to-orange-600',
                'from-pink-500 to-pink-600'
              ];
              return (
                <div key={index} className="flex items-center gap-2">
                  <div className={\`w-8 h-8 bg-gradient-to-br \${colors[index % colors.length]} rounded-lg flex items-center justify-center\`}>
                    <span className="text-white font-bold text-sm">{company.initial}</span>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400 font-semibold">{company.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
    `,

    aiGeneration: `
import { useState } from 'react';
import { ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface HeroSectionProps_2 {
  ${dataName}?: any;
  className?: string;
  onCTAClick?: (data?: any) => void;
  onSecondaryClick?: (data?: any) => void;
}

export default function Hero({ ${dataName}: propData, className, onCTAClick, onSecondaryClick }: HeroSectionProps_2) {
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
  const [prompt, setPrompt] = useState('');

  const badgeAI = ${getField('badgeAI')};
  const headlineTextToImage = ${getField('headlineTextToImage')};
  const descriptionAI = ${getField('descriptionAI')};
  const promptPlaceholder = ${getField('promptPlaceholder')};
  const generateButton = ${getField('generateButton')};
  const tryText = ${getField('tryText')};
  const quickTags = ${getField('quickTags')};
  const examples = ${getField('examples')};
  const aiStats = ${getField('aiStats')};

  const handleGenerate = () => {
    if (prompt && onCTAClick) {
      onCTAClick({ ...heroData, prompt });
    }
  };

  const handleQuickTag = (tag: string) => {
    setPrompt(tag.toLowerCase());
    if (onSecondaryClick) {
      onSecondaryClick({ ...heroData, tag });
    }
  };

  const handleExampleClick = (example: any) => {
    if (onCTAClick) {
      onCTAClick({ ...heroData, example });
    }
  };

  return (
    <div className={cn('min-h-screen bg-white dark:bg-gray-900 relative overflow-hidden', className)}>
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        {/* Header Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 px-5 py-2 rounded-full border border-blue-100 dark:border-blue-800">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {badgeAI}
            </span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-[1.1]">
            {headlineTextToImage.split('text into images')[0]}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              text into images
            </span>
            {headlineTextToImage.split('text into images')[1]}
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-12">
            {descriptionAI}
          </p>

          {/* Input Section */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-xl border border-gray-200 dark:border-gray-700">
              <input
                type="text"
                placeholder={promptPlaceholder}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
                className="flex-1 px-6 py-4 text-lg text-gray-900 dark:text-white bg-transparent border-none outline-none placeholder:text-gray-400"
              />
              <button
                onClick={handleGenerate}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-lg hover:scale-105 flex items-center justify-center gap-2 group"
              >
                {generateButton}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Quick Examples */}
          <div className="flex flex-wrap justify-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">{tryText}</span>
            {quickTags.map((tag: string) => (
              <button
                key={tag}
                onClick={() => handleQuickTag(tag)}
                className="text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Example Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mt-20">
          {examples.map((example: any, index: number) => (
            <div
              key={index}
              onClick={() => handleExampleClick(example)}
              className="group relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:scale-105 cursor-pointer"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                {example.emoji}
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {example.title}
              </div>

              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          ))}
        </div>

        {/* Stats Footer */}
        <div className="flex flex-wrap justify-center items-center gap-8 mt-20 text-sm text-gray-600 dark:text-gray-400">
          {aiStats.map((stat: any, index: number) => {
            const colorMap: any = {
              green: 'bg-green-500',
              blue: 'bg-blue-500',
              purple: 'bg-purple-500'
            };
            return (
              <div key={index} className="flex items-center gap-2">
                <div className={\`w-2 h-2 rounded-full \${colorMap[stat.color]}\`}></div>
                <span>{stat.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
    `,

    productShowcase: `
import { ArrowRight, Play, Star, Users, TrendingUp, Zap, Activity, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface HeroSectionProps_3 {
  ${dataName}?: any;
  className?: string;
  onCTAClick?: (data?: any) => void;
  onSecondaryClick?: (data?: any) => void;
}

export default function Hero({ ${dataName}: propData, className, onCTAClick, onSecondaryClick }: HeroSectionProps_3) {
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
  
  const rating = ${getField('rating')};
  const reviewText = ${getField('reviewText')};
  const headlineAllInOne = ${getField('headlineAllInOne')};
  const descriptionTeams = ${getField('descriptionTeams')};
  const startFreeTrial = ${getField('startFreeTrial')};
  const watchDemo = ${getField('watchDemo')};
  const features = ${getField('features')};
  const browserUrl = ${getField('browserUrl')};
  const dashboardStats = ${getField('dashboardStats')};
  const teamMembers = ${getField('teamMembers')};

  const iconMap: any = {
    Users: Users,
    TrendingUp: TrendingUp,
    Zap: Zap,
    Activity: Activity
  };

  const handleStartTrial = () => {
    if (onCTAClick) {
      onCTAClick(heroData);
    }
  };

  const handleWatchDemo = () => {
    if (onSecondaryClick) {
      onSecondaryClick(heroData);
    }
  };

  return (
    <section className={cn('bg-white dark:bg-gray-900', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center max-w-5xl mx-auto">
          {/* Rating Badge */}
          <div className="inline-flex items-center gap-2 mb-8">
            <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2 rounded-full border border-yellow-200 dark:border-yellow-800">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white ml-2">
                {rating} {reviewText}
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-[1.1]">
            {headlineAllInOne.split('modern teams')[0]}
            <br />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              modern teams
            </span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            {descriptionTeams}
          </p>

          {/* CTA Section */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button 
              className="group bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all flex items-center gap-2"
              onClick={handleStartTrial}
            >
              {startFreeTrial}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              className="group flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              onClick={handleWatchDemo}
            >
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                <Play className="w-5 h-5 fill-current" />
              </div>
              <span className="font-medium">{watchDemo}</span>
            </button>
          </div>

          {/* Social Proof */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600 dark:text-gray-400 mb-16">
            {features.map((feature: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Product Preview */}
          <div className="relative">
            {/* Main Dashboard Preview */}
            <div className="relative z-10 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Browser Bar */}
              <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 flex items-center gap-2 border-b border-gray-200 dark:border-gray-600">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white dark:bg-gray-600 rounded px-3 py-1 text-xs text-gray-500 dark:text-gray-400">
                    {browserUrl}
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {dashboardStats.map((stat: any, index: number) => {
                    const Icon = iconMap[stat.icon] || Users;
                    const colors = [
                      'text-emerald-600 dark:text-emerald-400',
                      'text-blue-600 dark:text-blue-400',
                      'text-yellow-600 dark:text-yellow-400',
                      'text-purple-600 dark:text-purple-400'
                    ];
                    return (
                      <div key={index} className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <Icon className={\`w-5 h-5 mb-2 \${colors[index % colors.length]}\`} />
                        <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">{stat.label}</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="space-y-3">
                  {teamMembers.map((person: any, i: number) => {
                    const colors = [
                      'from-blue-500 to-cyan-500',
                      'from-purple-500 to-pink-500',
                      'from-green-500 to-emerald-500',
                      'from-orange-500 to-red-500',
                      'from-indigo-500 to-purple-500'
                    ];
                    return (
                      <div key={i} className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 flex items-center gap-4">
                        <div className={\`w-10 h-10 bg-gradient-to-br \${colors[i % colors.length]} rounded-full flex items-center justify-center text-white font-semibold\`}>
                          {person.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 dark:text-white text-sm">{person.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{person.role}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-emerald-500 rounded-2xl opacity-20 blur-2xl"></div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-teal-500 rounded-2xl opacity-20 blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
    `,

    darkMode: `
import { ArrowRight, Check, Zap, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface HeroSectionProps_4 {
  ${dataName}?: any;
  className?: string;
  onCTAClick?: (data?: any) => void;
  onSecondaryClick?: (data?: any) => void;
}

export default function Hero({ ${dataName}: propData, className, onCTAClick, onSecondaryClick }: HeroSectionProps_4) {
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
  
  const badgePerformance = ${getField('badgePerformance')};
  const headlineShipFaster = ${getField('headlineShipFaster')};
  const descriptionDeploy = ${getField('descriptionDeploy')};
  const darkModeFeatures = ${getField('darkModeFeatures')};
  const primaryButton = ${getField('primaryButton')};
  const viewPricing = ${getField('viewPricing')};
  const trustedBy = ${getField('trustedBy')};
  const userAvatars = ${getField('userAvatars')};
  const terminalLabel = ${getField('terminalLabel')};
  const deployUrl = ${getField('deployUrl')};
  const bottomStats = ${getField('bottomStats')};

  const handleGetStarted = () => {
    if (onCTAClick) {
      onCTAClick(heroData);
    }
  };

  const handleViewPricing = () => {
    if (onSecondaryClick) {
      onSecondaryClick(heroData);
    }
  };

  return (
    <section className={cn('relative bg-gray-900 dark:bg-black overflow-hidden', className)}>
      {/* Gradient Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-blue-500/30 via-purple-500/20 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full mb-8">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">
                {badgePerformance}
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1]">
              {headlineShipFaster.split('10x faster')[0]}
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                10x faster
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              {descriptionDeploy}
            </p>

            {/* Features List */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              {darkModeFeatures.map((feature: string, index: number) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                className="group bg-white hover:bg-gray-100 text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-2xl hover:shadow-blue-500/20 flex items-center justify-center gap-2"
                onClick={handleGetStarted}
              >
                {primaryButton}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                className="border-2 border-white/20 hover:border-white/40 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:bg-white/5"
                onClick={handleViewPricing}
              >
                {viewPricing}
              </button>
            </div>

            {/* Trust Badge */}
            <div className="mt-10 flex items-center gap-3 text-sm text-gray-400">
              <div className="flex -space-x-2">
                {userAvatars.map((user: any, i: number) => {
                  const colors = [
                    'from-blue-500 to-blue-600',
                    'from-purple-500 to-purple-600',
                    'from-pink-500 to-pink-600',
                    'from-cyan-500 to-cyan-600'
                  ];
                  return (
                    <div
                      key={i}
                      className={\`w-8 h-8 bg-gradient-to-br \${colors[i % colors.length]} rounded-full border-2 border-gray-900 flex items-center justify-center text-white text-xs font-semibold\`}
                    >
                      {user.name.charAt(0)}
                    </div>
                  );
                })}
              </div>
              <span>{trustedBy}</span>
            </div>
          </div>

          {/* Right Content - Code Preview */}
          <div className="relative">
            {/* Code Window */}
            <div className="relative z-10 bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              {/* Window Bar */}
              <div className="bg-gray-800/80 px-4 py-3 flex items-center justify-between border-b border-white/10">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="text-xs text-gray-400">{terminalLabel}</div>
              </div>

              {/* Code Content */}
              <div className="p-6 font-mono text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">$</span>
                  <span className="text-blue-400">npm</span>
                  <span className="text-gray-300">create app</span>
                </div>
                <div className="text-gray-500 pl-4">Creating project...</div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300">Project initialized</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300">Dependencies installed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300">Ready to deploy</span>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-gray-500">$</span>
                  <span className="text-purple-400">deploy</span>
                  <span className="text-gray-300">--production</span>
                </div>
                <div className="text-gray-500 pl-4">Deploying to production...</div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-gray-300">Deployed in 2.1s</span>
                </div>
                <div className="mt-2 bg-green-500/10 border border-green-500/20 rounded px-3 py-2">
                  <span className="text-green-400">{deployUrl}</span>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute top-1/4 -right-8 w-32 h-32 bg-blue-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 -left-8 w-32 h-32 bg-purple-500 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 pt-12 border-t border-white/10">
          {bottomStats.map((stat: any, index: number) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
    `
  };

  return variants[variant] || variants.modern;
};
