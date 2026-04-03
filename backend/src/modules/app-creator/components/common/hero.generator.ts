/**
 * Hero Section Generator for App Creator
 *
 * Generates hero section components with:
 * - Customizable title/subtitle
 * - CTA buttons
 * - Feature highlights
 * - Multiple variants
 */

interface HeroOptions {
  title?: string;
  subtitle?: string;
  description?: string;
  primaryCTA?: string;
  primaryCTALink?: string;
  secondaryCTA?: string;
  secondaryCTALink?: string;
  features?: string[];
  variant?: 'modern' | 'centered' | 'split';
}

/**
 * Generate a hero section component
 */
export function generateHero(options: HeroOptions = {}): string {
  const {
    title = 'Welcome',
    subtitle = 'To Our Platform',
    description = 'Discover amazing features tailored just for you.',
    primaryCTA = 'Get Started',
    primaryCTALink = '/get-started',
    secondaryCTA = 'Learn More',
    secondaryCTALink = '/about',
    features = ['Easy to Use', 'Fast & Reliable', '24/7 Support'],
    variant = 'modern',
  } = options;

  return `import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroProps {
  title?: string;
  subtitle?: string;
  description?: string;
  primaryCTA?: string;
  primaryCTALink?: string;
  secondaryCTA?: string;
  secondaryCTALink?: string;
  features?: string[];
  className?: string;
}

const Hero: React.FC<HeroProps> = ({
  title = '${title}',
  subtitle = '${subtitle}',
  description = '${description}',
  primaryCTA = '${primaryCTA}',
  primaryCTALink = '${primaryCTALink}',
  secondaryCTA = '${secondaryCTA}',
  secondaryCTALink = '${secondaryCTALink}',
  features = ${JSON.stringify(features)},
  className,
}) => {
  const navigate = useNavigate();

  return (
    <section className={cn(
      'relative overflow-hidden py-20 lg:py-32',
      'bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800',
      className
    )}>
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-[1.1]">
            {title}
            <span className="block mt-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {subtitle}
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto">
            {description}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <button
              onClick={() => navigate(primaryCTALink)}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 group shadow-lg hover:shadow-xl"
            >
              {primaryCTA}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate(secondaryCTALink)}
              className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl font-bold text-lg transition-all hover:border-gray-400 dark:hover:border-gray-500"
            >
              {secondaryCTA}
            </button>
          </div>

          {/* Feature highlights */}
          {features.length > 0 && (
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
`;
}

/**
 * Generate a hero with stats variant
 */
export function generateHeroWithStats(options: HeroOptions & { stats?: Array<{ value: string; label: string }> } = {}): string {
  const {
    title = 'Build Something Amazing',
    subtitle = 'Today',
    description = 'Join thousands of users who trust our platform.',
    primaryCTA = 'Start Free Trial',
    primaryCTALink = '/signup',
    stats = [
      { value: '10K+', label: 'Active Users' },
      { value: '99.9%', label: 'Uptime' },
      { value: '24/7', label: 'Support' },
    ],
  } = options;

  return `import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Users, TrendingUp, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroStatsProps {
  title?: string;
  subtitle?: string;
  description?: string;
  primaryCTA?: string;
  primaryCTALink?: string;
  stats?: Array<{ value: string; label: string }>;
  className?: string;
}

const HeroStats: React.FC<HeroStatsProps> = ({
  title = '${title}',
  subtitle = '${subtitle}',
  description = '${description}',
  primaryCTA = '${primaryCTA}',
  primaryCTALink = '${primaryCTALink}',
  stats = ${JSON.stringify(stats)},
  className,
}) => {
  const navigate = useNavigate();

  const iconMap: Record<string, any> = {
    'Active Users': Users,
    'Users': Users,
    'Uptime': TrendingUp,
    'Support': Shield,
  };

  const colorMap: Record<string, string> = {
    'Active Users': 'from-blue-500 to-cyan-500',
    'Users': 'from-blue-500 to-cyan-500',
    'Uptime': 'from-green-500 to-emerald-500',
    'Support': 'from-purple-500 to-pink-500',
  };

  return (
    <section className={cn(
      'bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800',
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-8 leading-[1.1]">
            {title}{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {subtitle}
            </span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto">
            {description}
          </p>

          <button
            onClick={() => navigate(primaryCTALink)}
            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 group mx-auto"
          >
            {primaryCTA}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {stats.map((stat, index) => {
            const Icon = iconMap[stat.label] || Users;
            const color = colorMap[stat.label] || 'from-blue-500 to-cyan-500';

            return (
              <div
                key={index}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:scale-105"
              >
                <div className={\`inline-flex p-3 rounded-xl bg-gradient-to-br \${color} mb-4\`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HeroStats;
`;
}
