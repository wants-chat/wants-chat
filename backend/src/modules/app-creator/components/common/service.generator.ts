/**
 * Service Page Component Generators
 *
 * Generates service page components including:
 * - ServiceContent - Main service description and details
 * - ServiceFeatures - Feature grid for service offerings
 * - ServiceCTA - Call-to-action for service pages
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface ServiceContentOptions {
  componentName?: string;
  layout?: 'standard' | 'split' | 'tabs';
}

export interface ServiceFeaturesOptions {
  componentName?: string;
  layout?: 'grid' | 'list' | 'cards' | 'alternating';
  columns?: 2 | 3 | 4;
  showIcons?: boolean;
}

export interface ServiceCTAOptions {
  componentName?: string;
  variant?: 'standard' | 'pricing' | 'consultation' | 'quote';
  showForm?: boolean;
  showPricing?: boolean;
}

// ============================================================================
// Service Content Generator
// ============================================================================

export function generateServiceContent(options: ServiceContentOptions = {}): string {
  const {
    componentName = 'ServiceContent',
    layout = 'standard',
  } = options;

  return `import React, { useState } from 'react';
import { CheckCircle, ArrowRight, Play, FileText, Users, Clock, Shield, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceSection {
  title: string;
  content: string;
  image?: string;
  highlights?: string[];
}

interface ${componentName}Props {
  title?: string;
  subtitle?: string;
  description?: string;
  sections?: ServiceSection[];
  benefits?: string[];
  imageUrl?: string;
  videoUrl?: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  title = 'Our Service',
  subtitle,
  description,
  sections = [],
  benefits = [],
  imageUrl,
  videoUrl,
  className,
}) => {
  ${layout === 'tabs' ? `const [activeTab, setActiveTab] = useState(0);` : ''}

  return (
    <section className={cn('py-16 lg:py-24 bg-white dark:bg-gray-900', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        ${layout === 'standard' ? `
        {/* Standard Layout */}
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            {subtitle && (
              <span className="inline-block px-4 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-full mb-4">
                {subtitle}
              </span>
            )}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {title}
            </h1>
            {description && (
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
                {description}
              </p>
            )}
          </div>

          {/* Media */}
          {(imageUrl || videoUrl) && (
            <div className="relative mb-16 rounded-2xl overflow-hidden shadow-2xl">
              {videoUrl ? (
                <div className="relative aspect-video bg-gray-900">
                  <img
                    src={imageUrl || '/placeholder-video.jpg'}
                    alt={title}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <button className="absolute inset-0 flex items-center justify-center group">
                    <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                      <Play className="w-8 h-8 text-blue-600 ml-1" />
                    </div>
                  </button>
                </div>
              ) : imageUrl ? (
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-auto"
                />
              ) : null}
            </div>
          )}

          {/* Sections */}
          <div className="space-y-16">
            {sections.map((section, index) => (
              <div key={index} className="prose prose-lg dark:prose-invert max-w-none">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {section.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {section.content}
                </p>
                {section.highlights && section.highlights.length > 0 && (
                  <ul className="mt-6 space-y-3">
                    {section.highlights.map((highlight, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* Benefits */}
          {benefits.length > 0 && (
            <div className="mt-16 p-8 bg-gray-50 dark:bg-gray-800 rounded-2xl">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Key Benefits</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>` : layout === 'split' ? `
        {/* Split Layout */}
        <div className="space-y-24">
          {/* Header */}
          <div className="max-w-3xl">
            {subtitle && (
              <span className="inline-block px-4 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-full mb-4">
                {subtitle}
              </span>
            )}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {title}
            </h1>
            {description && (
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {/* Sections with alternating layout */}
          {sections.map((section, index) => (
            <div
              key={index}
              className={cn(
                'grid lg:grid-cols-2 gap-12 items-center',
                index % 2 === 1 && 'lg:flex-row-reverse'
              )}
            >
              <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {section.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  {section.content}
                </p>
                {section.highlights && section.highlights.length > 0 && (
                  <ul className="space-y-3">
                    {section.highlights.map((highlight, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                {section.image ? (
                  <img
                    src={section.image}
                    alt={section.title}
                    className="w-full h-auto rounded-2xl shadow-xl"
                  />
                ) : (
                  <div className="aspect-[4/3] bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl flex items-center justify-center">
                    <FileText className="w-20 h-20 text-white/50" />
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Benefits Grid */}
          {benefits.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-3xl p-8 md:p-12">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                Why Choose Our Service
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {benefits.slice(0, 8).map((benefit, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-900 rounded-xl p-6 text-center shadow-sm"
                  >
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-3" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>` : `
        {/* Tabs Layout */}
        <div>
          {/* Header */}
          <div className="text-center mb-12">
            {subtitle && (
              <span className="inline-block px-4 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-full mb-4">
                {subtitle}
              </span>
            )}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {title}
            </h1>
            {description && (
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
                {description}
              </p>
            )}
          </div>

          {/* Tabs Navigation */}
          {sections.length > 0 && (
            <>
              <div className="flex flex-wrap justify-center gap-2 mb-12">
                {sections.map((section, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTab(index)}
                    className={cn(
                      'px-6 py-3 rounded-xl font-medium transition-all',
                      activeTab === index
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    )}
                  >
                    {section.title}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="max-w-4xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                      {sections[activeTab].title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                      {sections[activeTab].content}
                    </p>
                    {sections[activeTab].highlights && sections[activeTab].highlights!.length > 0 && (
                      <ul className="space-y-3">
                        {sections[activeTab].highlights!.map((highlight, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700 dark:text-gray-300">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    {sections[activeTab].image ? (
                      <img
                        src={sections[activeTab].image}
                        alt={sections[activeTab].title}
                        className="w-full h-auto rounded-2xl shadow-xl"
                      />
                    ) : (
                      <div className="aspect-[4/3] bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl" />
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Benefits */}
          {benefits.length > 0 && (
            <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                >
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          )}
        </div>`}
      </div>
    </section>
  );
};

export default ${componentName};
`;
}

// ============================================================================
// Service Features Generator
// ============================================================================

export function generateServiceFeatures(options: ServiceFeaturesOptions = {}): string {
  const {
    componentName = 'ServiceFeatures',
    layout = 'grid',
    columns = 3,
    showIcons = true,
  } = options;

  return `import React from 'react';
import {
  Zap, Shield, Clock, Users, TrendingUp, Award,
  CheckCircle, Star, Heart, Target, Layers, Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Feature {
  title: string;
  description: string;
  icon?: string;
  highlights?: string[];
}

interface ${componentName}Props {
  title?: string;
  subtitle?: string;
  description?: string;
  features?: Feature[];
  className?: string;
}

const iconMap: Record<string, React.FC<any>> = {
  Zap, Shield, Clock, Users, TrendingUp, Award,
  CheckCircle, Star, Heart, Target, Layers, Globe,
};

const defaultFeatures: Feature[] = [
  {
    title: 'Fast Delivery',
    description: 'Quick turnaround times without compromising on quality.',
    icon: 'Zap',
  },
  {
    title: 'Secure & Reliable',
    description: 'Enterprise-grade security to protect your data.',
    icon: 'Shield',
  },
  {
    title: '24/7 Support',
    description: 'Round-the-clock assistance whenever you need it.',
    icon: 'Clock',
  },
  {
    title: 'Expert Team',
    description: 'Skilled professionals dedicated to your success.',
    icon: 'Users',
  },
  {
    title: 'Scalable Solutions',
    description: 'Grow seamlessly as your business expands.',
    icon: 'TrendingUp',
  },
  {
    title: 'Quality Assured',
    description: 'Rigorous testing and quality control processes.',
    icon: 'Award',
  },
];

const colorVariants = [
  { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
  { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
  { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
  { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' },
  { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-600 dark:text-pink-400' },
  { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-600 dark:text-cyan-400' },
];

const ${componentName}: React.FC<${componentName}Props> = ({
  title = 'What We Offer',
  subtitle,
  description,
  features = defaultFeatures,
  className,
}) => {
  return (
    <section className={cn('py-16 lg:py-24 bg-gray-50 dark:bg-gray-800/50', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          {subtitle && (
            <span className="inline-block px-4 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-full mb-4">
              {subtitle}
            </span>
          )}
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h2>
          {description && (
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>

        ${layout === 'grid' ? `
        {/* Grid Layout */}
        <div className="grid md:grid-cols-2 lg:grid-cols-${columns} gap-8">
          {features.map((feature, index) => {
            const Icon = ${showIcons} ? (iconMap[feature.icon || 'Zap'] || Zap) : null;
            const colors = colorVariants[index % colorVariants.length];
            return (
              <div
                key={index}
                className="group bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:-translate-y-1"
              >
                ${showIcons ? `
                {Icon && (
                  <div className={cn('inline-flex p-4 rounded-xl mb-6', colors.bg)}>
                    <Icon className={cn('w-7 h-7', colors.text)} />
                  </div>
                )}` : ''}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
                {feature.highlights && feature.highlights.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {feature.highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>` : layout === 'list' ? `
        {/* List Layout */}
        <div className="max-w-3xl mx-auto space-y-6">
          {features.map((feature, index) => {
            const Icon = ${showIcons} ? (iconMap[feature.icon || 'Zap'] || Zap) : null;
            const colors = colorVariants[index % colorVariants.length];
            return (
              <div
                key={index}
                className="flex gap-6 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
              >
                ${showIcons ? `
                {Icon && (
                  <div className={cn('flex-shrink-0 p-4 rounded-xl h-fit', colors.bg)}>
                    <Icon className={cn('w-7 h-7', colors.text)} />
                  </div>
                )}` : ''}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                  {feature.highlights && feature.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {feature.highlights.map((h, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm rounded-full">
                          {h}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>` : layout === 'alternating' ? `
        {/* Alternating Layout */}
        <div className="space-y-16 max-w-5xl mx-auto">
          {features.map((feature, index) => {
            const Icon = ${showIcons} ? (iconMap[feature.icon || 'Zap'] || Zap) : null;
            const colors = colorVariants[index % colorVariants.length];
            const isEven = index % 2 === 0;
            return (
              <div
                key={index}
                className={cn(
                  'flex flex-col md:flex-row gap-8 items-center',
                  !isEven && 'md:flex-row-reverse'
                )}
              >
                {/* Icon/Image */}
                <div className="flex-shrink-0">
                  <div className={cn(
                    'w-32 h-32 rounded-3xl flex items-center justify-center',
                    colors.bg
                  )}>
                    ${showIcons ? `{Icon && <Icon className={cn('w-16 h-16', colors.text)} />}` : ''}
                  </div>
                </div>

                {/* Content */}
                <div className={cn('flex-1', !isEven ? 'md:text-right' : '')}>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                  {feature.highlights && feature.highlights.length > 0 && (
                    <ul className={cn('mt-4 space-y-2', !isEven && 'md:items-end')}>
                      {feature.highlights.map((h, i) => (
                        <li key={i} className={cn('flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400', !isEven && 'md:flex-row-reverse')}>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>` : `
        {/* Cards Layout */}
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = ${showIcons} ? (iconMap[feature.icon || 'Zap'] || Zap) : null;
            const colors = colorVariants[index % colorVariants.length];
            return (
              <div
                key={index}
                className="group relative overflow-hidden bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700"
              >
                {/* Background Decoration */}
                <div className={cn(
                  'absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-10 group-hover:opacity-20 transition-opacity',
                  colors.bg
                )} />

                <div className="relative z-10">
                  ${showIcons ? `
                  {Icon && (
                    <div className={cn('inline-flex p-4 rounded-2xl mb-6 shadow-lg', colors.bg)}>
                      <Icon className={cn('w-8 h-8', colors.text)} />
                    </div>
                  )}` : ''}
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  {feature.highlights && feature.highlights.length > 0 && (
                    <ul className="space-y-2 border-t border-gray-100 dark:border-gray-800 pt-4">
                      {feature.highlights.map((h, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>`}
      </div>
    </section>
  );
};

export default ${componentName};
`;
}

// ============================================================================
// Service CTA Generator
// ============================================================================

export function generateServiceCTA(options: ServiceCTAOptions = {}): string {
  const {
    componentName = 'ServiceCTA',
    variant = 'standard',
    showForm = false,
    showPricing = false,
  } = options;

  return `import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Check, Phone, Mail, Calendar, MessageSquare,
  Clock, Shield, Star, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PricingTier {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  ctaText?: string;
  ctaLink?: string;
}

interface ${componentName}Props {
  title?: string;
  subtitle?: string;
  description?: string;
  primaryCTA?: string;
  primaryCTALink?: string;
  secondaryCTA?: string;
  secondaryCTALink?: string;
  phone?: string;
  email?: string;
  pricingTiers?: PricingTier[];
  guarantees?: string[];
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  title = 'Ready to Get Started?',
  subtitle,
  description = 'Let us help you achieve your goals. Contact us today for a free consultation.',
  primaryCTA = 'Get Started',
  primaryCTALink = '/contact',
  secondaryCTA = 'Learn More',
  secondaryCTALink = '/about',
  phone,
  email,
  pricingTiers = [],
  guarantees = ['Money-back guarantee', '24/7 Support', 'No hidden fees'],
  className,
}) => {
  const navigate = useNavigate();
  ${showForm ? `
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    console.log('Form submitted:', formData);
    setSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };` : ''}

  return (
    <section className={cn('py-16 lg:py-24', className)}>
      ${variant === 'standard' ? `
      {/* Standard CTA */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 py-16 lg:py-24 rounded-3xl mx-4 lg:mx-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              {subtitle && (
                <span className="inline-block px-4 py-1 bg-white/10 backdrop-blur-sm text-white text-sm font-medium rounded-full mb-4">
                  {subtitle}
                </span>
              )}
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                {title}
              </h2>
              <p className="text-lg text-white/80 mb-8 leading-relaxed">
                {description}
              </p>

              {/* Contact Options */}
              {(phone || email) && (
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  {phone && (
                    <a
                      href={\`tel:\${phone}\`}
                      className="flex items-center gap-3 text-white/90 hover:text-white transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                      <span>{phone}</span>
                    </a>
                  )}
                  {email && (
                    <a
                      href={\`mailto:\${email}\`}
                      className="flex items-center gap-3 text-white/90 hover:text-white transition-colors"
                    >
                      <Mail className="w-5 h-5" />
                      <span>{email}</span>
                    </a>
                  )}
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate(primaryCTALink)}
                  className="px-8 py-4 bg-white text-gray-900 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-2 group"
                >
                  {primaryCTA}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate(secondaryCTALink)}
                  className="px-8 py-4 border-2 border-white/30 text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all"
                >
                  {secondaryCTA}
                </button>
              </div>
            </div>

            ${showForm ? `
            {/* Contact Form */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Thank You!</h3>
                  <p className="text-gray-600 dark:text-gray-400">We'll be in touch soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    Send Message
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </form>
              )}
            </div>` : `
            {/* Guarantees Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6">Our Guarantees</h3>
              <div className="space-y-4">
                {guarantees.map((guarantee, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white">{guarantee}</span>
                  </div>
                ))}
              </div>
            </div>`}
          </div>
        </div>
      </div>` : variant === 'pricing' ? `
      {/* Pricing CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          {subtitle && (
            <span className="inline-block px-4 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-full mb-4">
              {subtitle}
            </span>
          )}
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h2>
          {description && (
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>

        {/* Pricing Tiers */}
        ${showPricing ? `
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <div
              key={index}
              className={cn(
                'relative rounded-3xl p-8 transition-all',
                tier.highlighted
                  ? 'bg-blue-600 text-white shadow-2xl scale-105'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:shadow-xl'
              )}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-yellow-400 text-yellow-900 text-sm font-bold rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <h3 className={cn(
                'text-xl font-bold mb-2',
                tier.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'
              )}>
                {tier.name}
              </h3>

              <div className="mb-4">
                <span className={cn(
                  'text-4xl font-bold',
                  tier.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'
                )}>
                  {tier.price}
                </span>
                {tier.period && (
                  <span className={cn(
                    'text-sm',
                    tier.highlighted ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                  )}>
                    /{tier.period}
                  </span>
                )}
              </div>

              <p className={cn(
                'mb-6',
                tier.highlighted ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'
              )}>
                {tier.description}
              </p>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className={cn(
                      'w-5 h-5 flex-shrink-0',
                      tier.highlighted ? 'text-white' : 'text-green-500'
                    )} />
                    <span className={cn(
                      'text-sm',
                      tier.highlighted ? 'text-white/90' : 'text-gray-700 dark:text-gray-300'
                    )}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate(tier.ctaLink || primaryCTALink)}
                className={cn(
                  'w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2',
                  tier.highlighted
                    ? 'bg-white text-blue-600 hover:bg-gray-100'
                    : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90'
                )}
              >
                {tier.ctaText || primaryCTA}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>` : ''}

        {/* Guarantees */}
        <div className="flex flex-wrap justify-center gap-8 mt-12">
          {guarantees.map((guarantee, index) => (
            <div key={index} className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Shield className="w-5 h-5 text-green-500" />
              <span>{guarantee}</span>
            </div>
          ))}
        </div>
      </div>` : variant === 'consultation' ? `
      {/* Consultation CTA */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 md:p-12 lg:p-16 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex p-4 bg-blue-600/20 rounded-2xl mb-6">
              <Calendar className="w-10 h-10 text-blue-400" />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {title}
            </h2>

            <p className="text-lg text-gray-300 mb-8">
              {description}
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                { icon: Clock, text: '30 Min Call' },
                { icon: MessageSquare, text: 'Expert Advice' },
                { icon: Shield, text: 'No Obligation' },
                { icon: Star, text: 'Free Consultation' },
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <item.icon className="w-6 h-6 text-blue-400" />
                  <span className="text-sm text-gray-400">{item.text}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate(primaryCTALink)}
              className="px-10 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group mx-auto"
            >
              <Calendar className="w-5 h-5" />
              Book Your Free Consultation
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-gray-500">
              {guarantees.map((g, i) => (
                <span key={i} className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-500" />
                  {g}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>` : `
      {/* Quote Request CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
          {/* Info Side */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-8 md:p-12 lg:p-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {title}
            </h2>
            <p className="text-lg text-white/80 mb-8">
              {description}
            </p>

            {/* Benefits */}
            <div className="space-y-4 mb-8">
              {[
                { icon: Zap, text: 'Fast response within 24 hours' },
                { icon: Shield, text: 'No commitment required' },
                { icon: Star, text: 'Personalized solutions' },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white">{item.text}</span>
                </div>
              ))}
            </div>

            {/* Contact Info */}
            {(phone || email) && (
              <div className="pt-8 border-t border-white/20 space-y-3">
                <p className="text-white/70 text-sm mb-4">Or reach out directly:</p>
                {phone && (
                  <a href={\`tel:\${phone}\`} className="flex items-center gap-3 text-white hover:text-white/80 transition-colors">
                    <Phone className="w-5 h-5" />
                    {phone}
                  </a>
                )}
                {email && (
                  <a href={\`mailto:\${email}\`} className="flex items-center gap-3 text-white hover:text-white/80 transition-colors">
                    <Mail className="w-5 h-5" />
                    {email}
                  </a>
                )}
              </div>
            )}
          </div>

          ${showForm ? `
          {/* Form Side */}
          <div className="p-8 md:p-12 lg:p-16">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Request a Quote
            </h3>

            {submitted ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Quote Request Received!
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  We'll get back to you with a personalized quote within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Project Details *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tell us about your project requirements..."
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group"
                >
                  Get Your Free Quote
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  By submitting, you agree to our Terms of Service and Privacy Policy.
                </p>
              </form>
            )}
          </div>` : `
          {/* CTA Side */}
          <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Get a Custom Quote
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Fill out our quick form and receive a personalized quote tailored to your needs.
            </p>

            <button
              onClick={() => navigate(primaryCTALink)}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group w-full"
            >
              {primaryCTA}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Guarantees */}
            <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
              <div className="flex flex-wrap gap-4">
                {guarantees.map((g, i) => (
                  <span key={i} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Check className="w-4 h-4 text-green-500" />
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>`}
        </div>
      </div>`}
    </section>
  );
};

export default ${componentName};
`;
}
