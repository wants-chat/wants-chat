/**
 * Page Header and Project Display Generators
 *
 * Generates page header and project-related components including:
 * - PageHeader - Generic page header with breadcrumb
 * - ProjectHero - Project detail hero section
 * - ProjectContent - Project description and details
 * - ProjectGallery - Project image gallery
 * - ProjectTestimonial - Client testimonial for project
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface PageHeaderOptions {
  componentName?: string;
  title?: string;
  subtitle?: string;
  showBreadcrumb?: boolean;
  backgroundStyle?: 'gradient' | 'solid' | 'image' | 'pattern';
  alignment?: 'left' | 'center';
}

export interface ProjectHeroOptions {
  componentName?: string;
  showTags?: boolean;
  showClient?: boolean;
  showDate?: boolean;
  layout?: 'full-width' | 'contained' | 'split';
}

export interface ProjectContentOptions {
  componentName?: string;
  showSidebar?: boolean;
  sections?: Array<{
    title: string;
    key: string;
  }>;
}

export interface ProjectGalleryOptions {
  componentName?: string;
  layout?: 'grid' | 'masonry' | 'carousel' | 'lightbox';
  columns?: 2 | 3 | 4;
}

export interface ProjectTestimonialOptions {
  componentName?: string;
  variant?: 'card' | 'quote' | 'minimal';
}

// ============================================================================
// Page Header Generator
// ============================================================================

export function generatePageHeader(options: PageHeaderOptions = {}): string {
  const {
    componentName = 'PageHeader',
    title = 'Page Title',
    subtitle = 'Page description goes here',
    showBreadcrumb = true,
    backgroundStyle = 'gradient',
    alignment = 'center',
  } = options;

  const bgStyles = {
    gradient: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
    solid: 'bg-gray-900 dark:bg-gray-950',
    image: 'bg-gray-900 bg-cover bg-center',
    pattern: 'bg-gray-900',
  };

  return `import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Breadcrumb {
  label: string;
  path: string;
}

interface ${componentName}Props {
  title?: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  showBreadcrumb?: boolean;
  backgroundImage?: string;
  className?: string;
  children?: React.ReactNode;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  title = '${title}',
  subtitle = '${subtitle}',
  breadcrumbs,
  showBreadcrumb = ${showBreadcrumb},
  backgroundImage,
  className,
  children,
}) => {
  const location = useLocation();

  // Generate breadcrumbs from current path if not provided
  const generatedBreadcrumbs = React.useMemo(() => {
    if (breadcrumbs) return breadcrumbs;

    const paths = location.pathname.split('/').filter(Boolean);
    return paths.map((path, index) => ({
      label: path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' '),
      path: '/' + paths.slice(0, index + 1).join('/'),
    }));
  }, [location.pathname, breadcrumbs]);

  return (
    <header
      className={cn(
        'relative py-16 lg:py-24 overflow-hidden',
        '${bgStyles[backgroundStyle]}',
        className
      )}
      style={backgroundImage ? { backgroundImage: \`url(\${backgroundImage})\` } : undefined}
    >
      {/* Overlay for image background */}
      {backgroundImage && (
        <div className="absolute inset-0 bg-gray-900/80" />
      )}

      ${backgroundStyle === 'pattern' ? `
      {/* Pattern Background */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>` : `
      {/* Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />`}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        ${showBreadcrumb ? `
        {/* Breadcrumb */}
        {showBreadcrumb && (
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <Home className="w-4 h-4" />
                  <span className="sr-only">Home</span>
                </Link>
              </li>
              {generatedBreadcrumbs.map((crumb, index) => (
                <li key={crumb.path} className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                  {index === generatedBreadcrumbs.length - 1 ? (
                    <span className="text-white font-medium">{crumb.label}</span>
                  ) : (
                    <Link
                      to={crumb.path}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}` : ''}

        {/* Content */}
        <div className="${alignment === 'center' ? 'text-center max-w-3xl mx-auto' : 'max-w-3xl'}">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
              {subtitle}
            </p>
          )}
          {children && (
            <div className="mt-8">
              {children}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default ${componentName};
`;
}

// ============================================================================
// Project Hero Generator
// ============================================================================

export function generateProjectHero(options: ProjectHeroOptions = {}): string {
  const {
    componentName = 'ProjectHero',
    showTags = true,
    showClient = true,
    showDate = true,
    layout = 'full-width',
  } = options;

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Building2, ExternalLink, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ${componentName}Props {
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  tags?: string[];
  client?: {
    name: string;
    logo?: string;
    url?: string;
  };
  date?: string;
  liveUrl?: string;
  backLink?: string;
  backLabel?: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  title,
  subtitle,
  description,
  imageUrl,
  tags = [],
  client,
  date,
  liveUrl,
  backLink = '/projects',
  backLabel = 'Back to Projects',
  className,
}) => {
  return (
    <section className={cn('relative', className)}>
      ${layout === 'full-width' ? `
      {/* Full Width Layout */}
      <div className="relative h-[60vh] min-h-[500px] max-h-[700px]">
        {/* Background Image */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700" />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-gray-900/30" />

        {/* Content */}
        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-12">
          {/* Back Link */}
          <Link
            to={backLink}
            className="absolute top-6 left-4 sm:left-6 lg:left-8 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{backLabel}</span>
          </Link>

          ${showTags ? `
          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-white/10 backdrop-blur-sm text-white text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}` : ''}

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            {title}
          </h1>

          {subtitle && (
            <p className="text-xl md:text-2xl text-white/80 mb-6 max-w-3xl">
              {subtitle}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-white/70">
            ${showClient ? `
            {client && (
              <div className="flex items-center gap-2">
                {client.logo ? (
                  <img src={client.logo} alt={client.name} className="w-6 h-6 rounded" />
                ) : (
                  <Building2 className="w-5 h-5" />
                )}
                {client.url ? (
                  <a href={client.url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    {client.name}
                  </a>
                ) : (
                  <span>{client.name}</span>
                )}
              </div>
            )}` : ''}

            ${showDate ? `
            {date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{date}</span>
              </div>
            )}` : ''}

            {liveUrl && (
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Live</span>
              </a>
            )}
          </div>
        </div>
      </div>` : layout === 'split' ? `
      {/* Split Layout */}
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="grid lg:grid-cols-2 min-h-screen">
          {/* Content Side */}
          <div className="flex flex-col justify-center px-8 lg:px-16 py-16">
            {/* Back Link */}
            <Link
              to={backLink}
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-8 w-fit"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{backLabel}</span>
            </Link>

            ${showTags ? `
            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}` : ''}

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {title}
            </h1>

            {subtitle && (
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
                {subtitle}
              </p>
            )}

            {description && (
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                {description}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-gray-500 dark:text-gray-400">
              ${showClient ? `
              {client && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  <span>{client.name}</span>
                </div>
              )}` : ''}

              ${showDate ? `
              {date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{date}</span>
                </div>
              )}` : ''}
            </div>

            {liveUrl && (
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors w-fit"
              >
                <ExternalLink className="w-5 h-5" />
                <span>View Live Project</span>
              </a>
            )}
          </div>

          {/* Image Side */}
          <div className="relative min-h-[400px] lg:min-h-screen">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600" />
            )}
          </div>
        </div>
      </div>` : `
      {/* Contained Layout */}
      <div className="py-12 lg:py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Link
            to={backLink}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{backLabel}</span>
          </Link>

          <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-xl">
            {/* Image */}
            <div className="relative h-64 md:h-96">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600" />
              )}
            </div>

            {/* Content */}
            <div className="p-8 md:p-12">
              ${showTags ? `
              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}` : ''}

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {title}
              </h1>

              {description && (
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  {description}
                </p>
              )}

              {/* Meta & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                <div className="flex flex-wrap items-center gap-6 text-gray-500 dark:text-gray-400">
                  ${showClient ? `
                  {client && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      <span>{client.name}</span>
                    </div>
                  )}` : ''}

                  ${showDate ? `
                  {date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      <span>{date}</span>
                    </div>
                  )}` : ''}
                </div>

                {liveUrl && (
                  <a
                    href={liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span>View Live</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>`}
    </section>
  );
};

export default ${componentName};
`;
}

// ============================================================================
// Project Content Generator
// ============================================================================

export function generateProjectContent(options: ProjectContentOptions = {}): string {
  const {
    componentName = 'ProjectContent',
    showSidebar = true,
    sections = [
      { title: 'Overview', key: 'overview' },
      { title: 'Challenge', key: 'challenge' },
      { title: 'Solution', key: 'solution' },
      { title: 'Results', key: 'results' },
    ],
  } = options;

  return `import React from 'react';
import { CheckCircle, TrendingUp, Award, Clock, Users, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectDetails {
  duration?: string;
  team?: string;
  technologies?: string[];
  deliverables?: string[];
}

interface ProjectMetric {
  label: string;
  value: string;
  change?: string;
}

interface ${componentName}Props {
  overview?: string;
  challenge?: string;
  solution?: string;
  results?: string;
  details?: ProjectDetails;
  metrics?: ProjectMetric[];
  highlights?: string[];
  className?: string;
}

const sections = ${JSON.stringify(sections, null, 2)};

const ${componentName}: React.FC<${componentName}Props> = ({
  overview,
  challenge,
  solution,
  results,
  details,
  metrics = [],
  highlights = [],
  className,
}) => {
  const contentMap: Record<string, string | undefined> = {
    overview,
    challenge,
    solution,
    results,
  };

  return (
    <section className={cn('py-16 lg:py-24 bg-white dark:bg-gray-900', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="${showSidebar ? 'grid lg:grid-cols-3 gap-12' : ''}">
          {/* Main Content */}
          <div className="${showSidebar ? 'lg:col-span-2' : 'max-w-4xl mx-auto'} space-y-12">
            {sections.map((section) => {
              const content = contentMap[section.key];
              if (!content) return null;
              return (
                <div key={section.key} id={section.key}>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    {section.title}
                  </h2>
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {content}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Highlights */}
            {highlights.length > 0 && (
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  Key Highlights
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {highlights.map((highlight, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metrics */}
            {metrics.length > 0 && (
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  Impact & Results
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {metrics.map((metric, index) => (
                    <div
                      key={index}
                      className="p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700"
                    >
                      <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        {metric.value}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400 mb-1">
                        {metric.label}
                      </div>
                      {metric.change && (
                        <div className="flex items-center gap-1 text-green-500 text-sm">
                          <TrendingUp className="w-4 h-4" />
                          <span>{metric.change}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          ${showSidebar ? `
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Project Details */}
              {details && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Project Details
                  </h3>
                  <div className="space-y-4">
                    {details.duration && (
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Duration</div>
                          <div className="text-gray-900 dark:text-white">{details.duration}</div>
                        </div>
                      </div>
                    )}
                    {details.team && (
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Team Size</div>
                          <div className="text-gray-900 dark:text-white">{details.team}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Technologies */}
              {details?.technologies && details.technologies.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Technologies Used
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {details.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg border border-gray-200 dark:border-gray-600"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Deliverables */}
              {details?.deliverables && details.deliverables.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Deliverables
                  </h3>
                  <ul className="space-y-2">
                    {details.deliverables.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Award className="w-4 h-4 text-blue-500 flex-shrink-0 mt-1" />
                        <span className="text-gray-700 dark:text-gray-300 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Table of Contents */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Contents
                </h3>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <a
                      key={section.key}
                      href={\`#\${section.key}\`}
                      className="block text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors"
                    >
                      {section.title}
                    </a>
                  ))}
                </nav>
              </div>
            </div>
          </div>` : ''}
        </div>
      </div>
    </section>
  );
};

export default ${componentName};
`;
}

// ============================================================================
// Project Gallery Generator
// ============================================================================

export function generateProjectGallery(options: ProjectGalleryOptions = {}): string {
  const {
    componentName = 'ProjectGallery',
    layout = 'grid',
    columns = 3,
  } = options;

  return `import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

interface ${componentName}Props {
  images: GalleryImage[];
  title?: string;
  subtitle?: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  images,
  title = 'Project Gallery',
  subtitle,
  className,
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = '';
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
  };

  if (!images || images.length === 0) return null;

  return (
    <section className={cn('py-16 lg:py-24 bg-gray-50 dark:bg-gray-800/50', className)}>
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
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}

        ${layout === 'grid' ? `
        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-6">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => openLightbox(index)}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <ZoomIn className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm">{image.caption}</p>
                </div>
              )}
            </button>
          ))}
        </div>` : layout === 'masonry' ? `
        {/* Masonry Layout */}
        <div className="columns-1 md:columns-2 lg:columns-${columns} gap-6 space-y-6">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => openLightbox(index)}
              className="group relative block w-full overflow-hidden rounded-2xl bg-gray-200 dark:bg-gray-700 break-inside-avoid focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <ZoomIn className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
        </div>` : layout === 'carousel' ? `
        {/* Carousel Layout */}
        <div className="relative">
          <div className="overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-500"
              style={{ transform: \`translateX(-\${currentIndex * 100}%)\` }}
            >
              {images.map((image, index) => (
                <div key={index} className="w-full flex-shrink-0">
                  <button
                    onClick={() => openLightbox(index)}
                    className="w-full aspect-video focus:outline-none"
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                  </button>
                  {image.caption && (
                    <p className="text-center text-gray-600 dark:text-gray-400 mt-4">
                      {image.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Carousel Navigation */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  'w-2.5 h-2.5 rounded-full transition-all',
                  index === currentIndex
                    ? 'bg-blue-600 w-8'
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                )}
              />
            ))}
          </div>
        </div>` : `
        {/* Lightbox Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => openLightbox(index)}
              className="group relative aspect-square overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
            </button>
          ))}
        </div>`}

        {/* Lightbox Modal */}
        {lightboxOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="dialog"
            aria-modal="true"
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors z-10"
              aria-label="Close lightbox"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Navigation */}
            <button
              onClick={goToPrevious}
              className="absolute left-4 p-3 text-white/80 hover:text-white transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 p-3 text-white/80 hover:text-white transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-10 h-10" />
            </button>

            {/* Image */}
            <div className="max-w-5xl max-h-[80vh] mx-4">
              <img
                src={images[currentIndex].src}
                alt={images[currentIndex].alt}
                className="max-w-full max-h-[80vh] object-contain"
              />
              {images[currentIndex].caption && (
                <p className="text-center text-white/80 mt-4">
                  {images[currentIndex].caption}
                </p>
              )}
            </div>

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ${componentName};
`;
}

// ============================================================================
// Project Testimonial Generator
// ============================================================================

export function generateProjectTestimonial(options: ProjectTestimonialOptions = {}): string {
  const {
    componentName = 'ProjectTestimonial',
    variant = 'card',
  } = options;

  return `import React from 'react';
import { Quote, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ${componentName}Props {
  quote: string;
  author: {
    name: string;
    title: string;
    company?: string;
    avatarUrl?: string;
  };
  rating?: number;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  quote,
  author,
  rating,
  className,
}) => {
  return (
    <section className={cn('py-16 lg:py-24 bg-white dark:bg-gray-900', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        ${variant === 'card' ? `
        {/* Card Variant */}
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 dark:border-gray-700">
            {/* Quote Icon */}
            <div className="absolute -top-6 left-8 md:left-12">
              <div className="p-4 bg-blue-600 rounded-2xl shadow-lg">
                <Quote className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Rating */}
            {rating && (
              <div className="flex gap-1 mb-6 justify-center md:justify-start">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-6 h-6',
                      i < rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'
                    )}
                  />
                ))}
              </div>
            )}

            {/* Quote */}
            <blockquote className="text-xl md:text-2xl lg:text-3xl text-gray-700 dark:text-gray-200 leading-relaxed mb-8 text-center md:text-left font-medium">
              "{quote}"
            </blockquote>

            {/* Author */}
            <div className="flex items-center gap-4 justify-center md:justify-start">
              {author.avatarUrl ? (
                <img
                  src={author.avatarUrl}
                  alt={author.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                  {author.name.charAt(0)}
                </div>
              )}
              <div>
                <div className="font-bold text-lg text-gray-900 dark:text-white">
                  {author.name}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {author.title}
                  {author.company && (
                    <span className="text-gray-400 dark:text-gray-500"> at {author.company}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>` : variant === 'quote' ? `
        {/* Quote Variant */}
        <div className="max-w-4xl mx-auto text-center">
          <Quote className="w-16 h-16 text-blue-600/20 dark:text-blue-400/20 mx-auto mb-8" />

          {/* Rating */}
          {rating && (
            <div className="flex gap-1 mb-6 justify-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'w-6 h-6',
                    i < rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'
                  )}
                />
              ))}
            </div>
          )}

          <blockquote className="text-2xl md:text-3xl lg:text-4xl text-gray-700 dark:text-gray-200 leading-relaxed mb-10 font-light italic">
            "{quote}"
          </blockquote>

          {/* Author */}
          <div className="flex flex-col items-center">
            {author.avatarUrl ? (
              <img
                src={author.avatarUrl}
                alt={author.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-xl mb-4"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl mb-4">
                {author.name.charAt(0)}
              </div>
            )}
            <div className="font-bold text-xl text-gray-900 dark:text-white">
              {author.name}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              {author.title}
              {author.company && <span> at {author.company}</span>}
            </div>
          </div>
        </div>` : `
        {/* Minimal Variant */}
        <div className="max-w-3xl mx-auto">
          <div className="border-l-4 border-blue-600 pl-8 py-4">
            <blockquote className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6 italic">
              "{quote}"
            </blockquote>

            <div className="flex items-center gap-3">
              {author.avatarUrl ? (
                <img
                  src={author.avatarUrl}
                  alt={author.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold">
                  {author.name.charAt(0)}
                </div>
              )}
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {author.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {author.title}
                  {author.company && <span>, {author.company}</span>}
                </div>
              </div>

              {rating && (
                <div className="ml-auto flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'w-4 h-4',
                        i < rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-gray-200 text-gray-200'
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>`}
      </div>
    </section>
  );
};

export default ${componentName};
`;
}
