import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateHero = (
  resolved: ResolvedComponent,
  variant: 'investment' | 'discovery' | 'fluxezImage' = 'investment'
) => {
  const dataSource = resolved.dataSource;

  // Get the resolved field names from the field resolver service
  const getField = (fieldName: string): string | null => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `heroData.${mapping.sourceField}`;
    }
    // Return fallback value
    const fallback = mapping?.fallback;
    if (fallback === null || fallback === undefined) {
      // For ID fields
      if (fieldName === 'id' || fieldName.endsWith('Id')) {
        return `heroData.id || heroData._id`;
      }
      // For array fields
      if (fieldName.match(/items|steps|updates|timeline|list|array|images|products|users|orders/i)) {
        return `heroData.${fieldName} || ([] as any[])`;
      }
      // For object fields
      if (fieldName.match(/address|metadata|config|settings|tracking|gallery/i)) {
        return `heroData.${fieldName} || ({} as any)`;
      }
      // For scalar values
      return `heroData.${fieldName} || ''`;
    }
    if (typeof fallback === 'string') {
      return `'${fallback.replace(/'/g, "\\'")}'`;
    }
    if (typeof fallback === 'object') {
      return JSON.stringify(fallback);
    }
    return String(fallback);
  };

  // Parse data source for clean prop naming
  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === '') return 'data';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? lastPart : 'data';
  };

  const dataName = getDataPath();

  const commonImports = `
import React, { useState } from 'react';
import { ArrowRight, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';`;

  return `
${commonImports}

interface HeroProps {
  title?: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  primaryAction?: { text: string; onClick?: () => void };
  secondaryAction?: { text: string; onClick?: () => void };
  backgroundImage?: string;
  backgroundGradient?: string;
  overlay?: boolean;
  alignment?: 'left' | 'center' | 'right';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onCTAClick?: (data: any) => void;
}

export const Hero: React.FC<HeroProps> = ({
  title,
  subtitle,
  description,
  badge,
  primaryAction,
  secondaryAction,
  backgroundImage,
  backgroundGradient,
  overlay = false,
  alignment = 'center',
  size = 'md',
  className
}) => {
  const headline = title || 'We invest in the world\\'s potential';
  const desc = description || subtitle || 'Here at Flowbite we focus on markets where technology, innovation, and capital can unlock long-term value and drive economic growth.';
  const primaryButtonText = primaryAction?.text || 'Learn more';
  const secondaryButtonText = secondaryAction?.text || 'Watch video';

  const handleLearnMore = () => {
    if (primaryAction?.onClick) {
      primaryAction.onClick();
    } else {
      console.log('Learn more clicked');
    }
  };

  const handleWatchVideo = () => {
    if (secondaryAction?.onClick) {
      secondaryAction.onClick();
    } else {
      console.log('Watch video clicked');
    }
  };

  return (
    <section className={cn('relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 dark:from-blue-900 dark:via-purple-900 dark:to-indigo-950 py-20 lg:py-32 overflow-hidden', className)}>
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:50px_50px]"></div>

      {/* Floating Gradient Orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Content */}
        <div className="text-center max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-[1.1] animate-fade-in-up">
            <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              {headline}
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/90 mb-12 leading-relaxed max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {desc}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Button
              onClick={handleLearnMore}
              size="lg"
              className="gap-2 bg-gradient-to-r from-white to-gray-100 text-gray-900 hover:scale-105 shadow-2xl hover:shadow-white/50 font-bold text-lg px-8 py-6 rounded-xl transition-all"
            >
              {primaryButtonText}
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              onClick={handleWatchVideo}
              variant="outline"
              size="lg"
              className="gap-2 border-2 border-white/30 backdrop-blur-sm text-white hover:bg-white/10 hover:border-white/50 font-bold text-lg px-8 py-6 rounded-xl transition-all"
            >
              <Play className="w-5 h-5" />
              {secondaryButtonText}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
  `.trim();
};