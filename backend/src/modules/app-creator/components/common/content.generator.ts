/**
 * Content Section Generators
 *
 * Generates reusable content sections including:
 * - AboutStory - Company/brand story section
 * - CTASection - Call-to-action sections
 * - ClientLogos - Logo showcase carousel/grid
 * - TestimonialSlider - Customer testimonials with slider
 * - ProcessSection - Step-by-step process display
 * - ValuesSection - Company values/principles display
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface AboutStoryOptions {
  componentName?: string;
  title?: string;
  subtitle?: string;
  story?: string;
  mission?: string;
  vision?: string;
  foundedYear?: string;
  teamSize?: string;
  imageUrl?: string;
}

export interface CTASectionOptions {
  componentName?: string;
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  variant?: 'centered' | 'split' | 'banner';
  backgroundStyle?: 'gradient' | 'solid' | 'image';
}

export interface ClientLogosOptions {
  componentName?: string;
  title?: string;
  subtitle?: string;
  logos?: Array<{ name: string; imageUrl: string; url?: string }>;
  variant?: 'grid' | 'carousel' | 'marquee';
}

export interface TestimonialSliderOptions {
  componentName?: string;
  title?: string;
  subtitle?: string;
  testimonials?: Array<{
    quote: string;
    author: string;
    role: string;
    company?: string;
    avatarUrl?: string;
    rating?: number;
  }>;
  autoPlay?: boolean;
  interval?: number;
}

export interface ProcessSectionOptions {
  componentName?: string;
  title?: string;
  subtitle?: string;
  steps?: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
  variant?: 'horizontal' | 'vertical' | 'alternating';
}

export interface ValuesSectionOptions {
  componentName?: string;
  title?: string;
  subtitle?: string;
  values?: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
  variant?: 'grid' | 'list' | 'cards';
}

// ============================================================================
// About Story Generator
// ============================================================================

export function generateAboutStory(options: AboutStoryOptions = {}): string {
  const {
    componentName = 'AboutStory',
    title = 'Our Story',
    subtitle = 'Building something meaningful',
    story = 'We started with a simple idea: to make a difference in how people experience technology. What began as a small team with big dreams has grown into a company that serves thousands of customers worldwide.',
    mission = 'To empower individuals and businesses with innovative solutions that simplify complexity and drive success.',
    vision = 'A world where technology seamlessly enhances every aspect of human potential.',
    foundedYear = '2020',
    teamSize = '50+',
    imageUrl = '',
  } = options;

  return `import React from 'react';
import { Target, Eye, Users, Calendar, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ${componentName}Props {
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className }) => {
  const stats = [
    { icon: Calendar, label: 'Founded', value: '${foundedYear}' },
    { icon: Users, label: 'Team Members', value: '${teamSize}' },
  ];

  return (
    <section className={cn('py-16 lg:py-24 bg-white dark:bg-gray-900', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            ${title}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            ${subtitle}
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
          {/* Story Text */}
          <div className="space-y-6">
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              ${story}
            </p>

            {/* Stats */}
            <div className="flex gap-8 pt-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <stat.icon className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            ${imageUrl ? `<img
              src="${imageUrl}"
              alt="Our Story"
              className="w-full h-80 lg:h-96 object-cover rounded-2xl shadow-xl"
            />` : `<div className="w-full h-80 lg:h-96 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl flex items-center justify-center">
              <div className="text-center text-white">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-80" />
                <p className="text-lg font-medium opacity-80">Our Team</p>
              </div>
            </div>`}
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Mission */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Our Mission</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              ${mission}
            </p>
          </div>

          {/* Vision */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Our Vision</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              ${vision}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ${componentName};
`;
}

// ============================================================================
// CTA Section Generator
// ============================================================================

export function generateCTASection(options: CTASectionOptions = {}): string {
  const {
    componentName = 'CTASection',
    title = 'Ready to Get Started?',
    description = 'Join thousands of satisfied customers and take your business to the next level.',
    primaryButtonText = 'Get Started',
    primaryButtonLink = '/signup',
    secondaryButtonText = 'Learn More',
    secondaryButtonLink = '/about',
    variant = 'centered',
    backgroundStyle = 'gradient',
  } = options;

  const bgClasses = {
    gradient: 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600',
    solid: 'bg-blue-600 dark:bg-blue-700',
    image: 'bg-gray-900 bg-cover bg-center',
  };

  return `import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ${componentName}Props {
  className?: string;
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  title = '${title}',
  description = '${description}',
  primaryButtonText = '${primaryButtonText}',
  primaryButtonLink = '${primaryButtonLink}',
  secondaryButtonText = '${secondaryButtonText}',
  secondaryButtonLink = '${secondaryButtonLink}',
}) => {
  const navigate = useNavigate();

  return (
    <section className={cn(
      'relative py-20 lg:py-28 overflow-hidden',
      '${bgClasses[backgroundStyle]}',
      className
    )}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        ${variant === 'centered' ? `
        {/* Centered Layout */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-sm text-white/90 font-medium">Limited Time Offer</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {title}
          </h2>

          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate(primaryButtonLink)}
              className="px-8 py-4 bg-white text-gray-900 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-2 group shadow-lg"
            >
              {primaryButtonText}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate(secondaryButtonLink)}
              className="px-8 py-4 border-2 border-white/30 text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all"
            >
              {secondaryButtonText}
            </button>
          </div>
        </div>` : variant === 'split' ? `
        {/* Split Layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {title}
            </h2>
            <p className="text-lg text-white/80 mb-8">
              {description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 lg:justify-end">
            <button
              onClick={() => navigate(primaryButtonLink)}
              className="px-8 py-4 bg-white text-gray-900 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-2 group"
            >
              {primaryButtonText}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate(secondaryButtonLink)}
              className="px-8 py-4 border-2 border-white/30 text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all"
            >
              {secondaryButtonText}
            </button>
          </div>
        </div>` : `
        {/* Banner Layout */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {title}
            </h2>
            <p className="text-white/80">
              {description}
            </p>
          </div>

          <button
            onClick={() => navigate(primaryButtonLink)}
            className="whitespace-nowrap px-8 py-4 bg-white text-gray-900 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-2 group"
          >
            {primaryButtonText}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>`}
      </div>
    </section>
  );
};

export default ${componentName};
`;
}

// ============================================================================
// Client Logos Generator
// ============================================================================

export function generateClientLogos(options: ClientLogosOptions = {}): string {
  const {
    componentName = 'ClientLogos',
    title = 'Trusted by Industry Leaders',
    subtitle = 'Join thousands of companies that trust us',
    logos = [
      { name: 'Company 1', imageUrl: '/logos/company1.svg' },
      { name: 'Company 2', imageUrl: '/logos/company2.svg' },
      { name: 'Company 3', imageUrl: '/logos/company3.svg' },
      { name: 'Company 4', imageUrl: '/logos/company4.svg' },
      { name: 'Company 5', imageUrl: '/logos/company5.svg' },
      { name: 'Company 6', imageUrl: '/logos/company6.svg' },
    ],
    variant = 'grid',
  } = options;

  return `import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface Logo {
  name: string;
  imageUrl: string;
  url?: string;
}

interface ${componentName}Props {
  className?: string;
  title?: string;
  subtitle?: string;
  logos?: Logo[];
}

const defaultLogos: Logo[] = ${JSON.stringify(logos, null, 2)};

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  title = '${title}',
  subtitle = '${subtitle}',
  logos = defaultLogos,
}) => {
  ${variant === 'marquee' ? `const [duplicatedLogos, setDuplicatedLogos] = useState<Logo[]>([]);

  useEffect(() => {
    // Duplicate logos for seamless marquee
    setDuplicatedLogos([...logos, ...logos]);
  }, [logos]);` : ''}

  const LogoItem = ({ logo }: { logo: Logo }) => {
    const content = (
      <div className="flex items-center justify-center p-6 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100">
        {logo.imageUrl ? (
          <img
            src={logo.imageUrl}
            alt={logo.name}
            className="h-8 md:h-10 w-auto object-contain"
          />
        ) : (
          <div className="h-10 px-6 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{logo.name}</span>
          </div>
        )}
      </div>
    );

    if (logo.url) {
      return (
        <a href={logo.url} target="_blank" rel="noopener noreferrer" className="block">
          {content}
        </a>
      );
    }
    return content;
  };

  return (
    <section className={cn('py-16 bg-gray-50 dark:bg-gray-800/50', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-gray-600 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
        )}

        ${variant === 'grid' ? `
        {/* Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {logos.map((logo, index) => (
            <LogoItem key={index} logo={logo} />
          ))}
        </div>` : variant === 'carousel' ? `
        {/* Carousel Layout */}
        <div className="relative overflow-hidden">
          <div className="flex items-center justify-center gap-12 flex-wrap">
            {logos.map((logo, index) => (
              <LogoItem key={index} logo={logo} />
            ))}
          </div>
        </div>` : `
        {/* Marquee Layout */}
        <div className="relative overflow-hidden">
          <div className="flex animate-marquee">
            {duplicatedLogos.map((logo, index) => (
              <div key={index} className="flex-shrink-0 mx-8">
                <LogoItem logo={logo} />
              </div>
            ))}
          </div>
        </div>

        <style>{\`
          @keyframes marquee {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 30s linear infinite;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        \`}</style>`}
      </div>
    </section>
  );
};

export default ${componentName};
`;
}

// ============================================================================
// Testimonial Slider Generator
// ============================================================================

export function generateTestimonialSlider(options: TestimonialSliderOptions = {}): string {
  const {
    componentName = 'TestimonialSlider',
    title = 'What Our Customers Say',
    subtitle = 'Hear from the people who trust us',
    testimonials = [
      {
        quote: 'This product has completely transformed how we work. The efficiency gains have been remarkable.',
        author: 'Sarah Johnson',
        role: 'CEO',
        company: 'TechCorp',
        rating: 5,
      },
      {
        quote: 'Outstanding support and an intuitive interface. Highly recommend to anyone looking for a reliable solution.',
        author: 'Michael Chen',
        role: 'Product Manager',
        company: 'InnovateCo',
        rating: 5,
      },
      {
        quote: 'We saw a 40% increase in productivity within the first month. The ROI speaks for itself.',
        author: 'Emily Rodriguez',
        role: 'Operations Director',
        company: 'GrowthLabs',
        rating: 5,
      },
    ],
    autoPlay = true,
    interval = 5000,
  } = options;

  return `import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company?: string;
  avatarUrl?: string;
  rating?: number;
}

interface ${componentName}Props {
  className?: string;
  title?: string;
  subtitle?: string;
  testimonials?: Testimonial[];
  autoPlay?: boolean;
  interval?: number;
}

const defaultTestimonials: Testimonial[] = ${JSON.stringify(testimonials, null, 2)};

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  title = '${title}',
  subtitle = '${subtitle}',
  testimonials = defaultTestimonials,
  autoPlay = ${autoPlay},
  interval = ${interval},
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goToSlide = useCallback((index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating]);

  const nextSlide = useCallback(() => {
    goToSlide((currentIndex + 1) % testimonials.length);
  }, [currentIndex, testimonials.length, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentIndex - 1 + testimonials.length) % testimonials.length);
  }, [currentIndex, testimonials.length, goToSlide]);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, nextSlide]);

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className={cn('py-16 lg:py-24 bg-white dark:bg-gray-900', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Testimonial Card */}
        <div className="relative max-w-4xl mx-auto">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-700">
            {/* Quote Icon */}
            <div className="absolute -top-4 left-8 md:left-12">
              <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                <Quote className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Rating */}
            {currentTestimonial.rating && (
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-5 h-5',
                      i < currentTestimonial.rating!
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200 dark:fill-gray-600 dark:text-gray-600'
                    )}
                  />
                ))}
              </div>
            )}

            {/* Quote */}
            <blockquote className="text-xl md:text-2xl text-gray-700 dark:text-gray-200 leading-relaxed mb-8 transition-opacity duration-500">
              "{currentTestimonial.quote}"
            </blockquote>

            {/* Author */}
            <div className="flex items-center gap-4">
              {currentTestimonial.avatarUrl ? (
                <img
                  src={currentTestimonial.avatarUrl}
                  alt={currentTestimonial.author}
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                  {currentTestimonial.author.charAt(0)}
                </div>
              )}
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {currentTestimonial.author}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {currentTestimonial.role}
                  {currentTestimonial.company && \` at \${currentTestimonial.company}\`}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={prevSlide}
              className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    'w-2.5 h-2.5 rounded-full transition-all',
                    index === currentIndex
                      ? 'bg-blue-600 w-8'
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                  )}
                  aria-label={\`Go to testimonial \${index + 1}\`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ${componentName};
`;
}

// ============================================================================
// Process Section Generator
// ============================================================================

export function generateProcessSection(options: ProcessSectionOptions = {}): string {
  const {
    componentName = 'ProcessSection',
    title = 'How It Works',
    subtitle = 'Get started in just a few simple steps',
    steps = [
      { title: 'Sign Up', description: 'Create your free account in less than a minute', icon: 'UserPlus' },
      { title: 'Configure', description: 'Customize your settings and preferences', icon: 'Settings' },
      { title: 'Connect', description: 'Integrate with your existing tools and workflows', icon: 'Link' },
      { title: 'Launch', description: 'Go live and start seeing results immediately', icon: 'Rocket' },
    ],
    variant = 'horizontal',
  } = options;

  const iconImports = [...new Set(steps.map(s => s.icon || 'Circle'))].join(', ');

  return `import React from 'react';
import { ${iconImports}, ArrowRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  title: string;
  description: string;
  icon?: string;
}

interface ${componentName}Props {
  className?: string;
  title?: string;
  subtitle?: string;
  steps?: Step[];
}

const defaultSteps: Step[] = ${JSON.stringify(steps, null, 2)};

const iconMap: Record<string, React.FC<any>> = {
  ${steps.map(s => `'${s.icon || 'Circle'}': ${s.icon || 'Circle'}`).join(',\n  ')}
};

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  title = '${title}',
  subtitle = '${subtitle}',
  steps = defaultSteps,
}) => {
  return (
    <section className={cn('py-16 lg:py-24 bg-gray-50 dark:bg-gray-800/50', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        ${variant === 'horizontal' ? `
        {/* Horizontal Layout */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = iconMap[step.icon || 'Circle'] || iconMap['Circle'];
            return (
              <div key={index} className="relative">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-full h-0.5 bg-gray-200 dark:bg-gray-700">
                    <ArrowRight className="absolute -right-2 -top-2 w-4 h-4 text-gray-300 dark:text-gray-600" />
                  </div>
                )}

                <div className="relative z-10 text-center">
                  {/* Step Number & Icon */}
                  <div className="relative inline-flex mb-6">
                    <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex items-center justify-center border border-gray-100 dark:border-gray-700">
                      <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>` : variant === 'vertical' ? `
        {/* Vertical Layout */}
        <div className="max-w-2xl mx-auto space-y-8">
          {steps.map((step, index) => {
            const Icon = iconMap[step.icon || 'Circle'] || iconMap['Circle'];
            return (
              <div key={index} className="relative flex gap-6">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-8 top-20 w-0.5 h-full bg-gray-200 dark:bg-gray-700" />
                )}

                {/* Icon */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex items-center justify-center border border-gray-100 dark:border-gray-700">
                    <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pt-3">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-full">
                      Step {index + 1}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>` : `
        {/* Alternating Layout */}
        <div className="max-w-4xl mx-auto space-y-12">
          {steps.map((step, index) => {
            const Icon = iconMap[step.icon || 'Circle'] || iconMap['Circle'];
            const isEven = index % 2 === 0;
            return (
              <div
                key={index}
                className={cn(
                  'flex flex-col md:flex-row gap-8 items-center',
                  !isEven && 'md:flex-row-reverse'
                )}
              >
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-xl flex items-center justify-center">
                      <Icon className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-blue-600 font-bold shadow-lg border border-gray-100 dark:border-gray-700">
                      {index + 1}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className={cn('flex-1 text-center md:text-left', !isEven && 'md:text-right')}>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
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
// Values Section Generator
// ============================================================================

export function generateValuesSection(options: ValuesSectionOptions = {}): string {
  const {
    componentName = 'ValuesSection',
    title = 'Our Core Values',
    subtitle = 'The principles that guide everything we do',
    values = [
      { title: 'Innovation', description: 'We constantly push boundaries and embrace new ideas to stay ahead of the curve.', icon: 'Lightbulb' },
      { title: 'Integrity', description: 'We maintain the highest ethical standards in all our business dealings.', icon: 'Shield' },
      { title: 'Excellence', description: 'We strive for excellence in every product, service, and interaction.', icon: 'Award' },
      { title: 'Collaboration', description: 'We believe in the power of teamwork and diverse perspectives.', icon: 'Users' },
      { title: 'Customer Focus', description: 'Our customers are at the heart of every decision we make.', icon: 'Heart' },
      { title: 'Sustainability', description: 'We are committed to building a better future for generations to come.', icon: 'Leaf' },
    ],
    variant = 'grid',
  } = options;

  const iconImports = [...new Set(values.map(v => v.icon || 'Circle'))].join(', ');

  return `import React from 'react';
import { ${iconImports} } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Value {
  title: string;
  description: string;
  icon?: string;
}

interface ${componentName}Props {
  className?: string;
  title?: string;
  subtitle?: string;
  values?: Value[];
}

const defaultValues: Value[] = ${JSON.stringify(values, null, 2)};

const iconMap: Record<string, React.FC<any>> = {
  ${values.map(v => `'${v.icon || 'Circle'}': ${v.icon || 'Circle'}`).join(',\n  ')}
};

const colorVariants = [
  { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
  { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
  { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
  { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' },
  { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-600 dark:text-pink-400' },
  { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-600 dark:text-cyan-400' },
];

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  title = '${title}',
  subtitle = '${subtitle}',
  values = defaultValues,
}) => {
  return (
    <section className={cn('py-16 lg:py-24 bg-white dark:bg-gray-900', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        ${variant === 'grid' ? `
        {/* Grid Layout */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, index) => {
            const Icon = iconMap[value.icon || 'Circle'] || iconMap['Circle'];
            const colors = colorVariants[index % colorVariants.length];
            return (
              <div
                key={index}
                className="group p-8 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={cn('inline-flex p-4 rounded-xl mb-6', colors.bg)}>
                  <Icon className={cn('w-7 h-7', colors.text)} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>` : variant === 'list' ? `
        {/* List Layout */}
        <div className="max-w-3xl mx-auto space-y-6">
          {values.map((value, index) => {
            const Icon = iconMap[value.icon || 'Circle'] || iconMap['Circle'];
            const colors = colorVariants[index % colorVariants.length];
            return (
              <div
                key={index}
                className="flex gap-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
              >
                <div className={cn('flex-shrink-0 p-3 rounded-xl h-fit', colors.bg)}>
                  <Icon className={cn('w-6 h-6', colors.text)} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {value.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>` : `
        {/* Cards Layout */}
        <div className="grid md:grid-cols-2 gap-6">
          {values.map((value, index) => {
            const Icon = iconMap[value.icon || 'Circle'] || iconMap['Circle'];
            const colors = colorVariants[index % colorVariants.length];
            return (
              <div
                key={index}
                className="group relative overflow-hidden p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-500"
              >
                {/* Background Decoration */}
                <div className={cn(
                  'absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 group-hover:opacity-30 transition-opacity',
                  colors.bg
                )} />

                <div className="relative z-10">
                  <div className={cn('inline-flex p-4 rounded-xl mb-6', colors.bg)}>
                    <Icon className={cn('w-7 h-7', colors.text)} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {value.description}
                  </p>
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
