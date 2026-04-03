import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateTestimonialSlider = (
  resolved: ResolvedComponent,
  variant: 'cards' | 'quotes' | 'video' = 'cards'
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
    return `/${dataSource || 'testimonials'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource.split('.').pop() || 'testimonials';

  const variants = {
    cards: `
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ChevronLeft, ChevronRight, Star, Quote, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestimonialSliderProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function TestimonialSlider({ ${dataName}: propData, className }: TestimonialSliderProps) {
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

  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const testimonialData = ${dataName} || {};

  const testimonials = ${getField('testimonials')};
  const autoRotate = ${getField('autoRotate')};
  const rotateInterval = ${getField('rotateInterval')};
  const sectionHeading = ${getField('sectionHeading')};
  const sectionSubheading = ${getField('sectionSubheading')};

  useEffect(() => {
    if (!autoRotate) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      setProgress(0);
    }, rotateInterval);

    const progressTimer = setInterval(() => {
      setProgress((prev) => Math.min(prev + (100 / (rotateInterval / 100)), 100));
    }, 100);

    return () => {
      clearInterval(timer);
      clearInterval(progressTimer);
    };
  }, [autoRotate, rotateInterval, testimonials.length, currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setProgress(0);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setProgress(0);
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    setProgress(0);
  };

  return (
    <section className={cn('relative bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/10 overflow-hidden', className)}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.05),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.05),transparent_50%)]"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Testimonials
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-4">
            {sectionHeading}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {sectionSubheading}
          </p>
        </div>

        {/* Slider Container */}
        <div className="relative max-w-5xl mx-auto">
          <div className="overflow-hidden rounded-3xl">
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: \`translateX(-\${currentIndex * 100}%)\` }}
            >
              {testimonials.map((testimonial: any, index: number) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <div className="relative bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-800 dark:via-blue-900/20 dark:to-purple-900/20 rounded-3xl p-8 lg:p-12 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
                    {/* Gradient Glow */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>

                    <div className="relative">
                      {/* Quote Icon */}
                      <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg mb-8">
                        <Quote className="w-8 h-8 text-white" />
                      </div>

                      {/* Quote Text */}
                      <p className="text-xl md:text-2xl lg:text-3xl text-gray-900 dark:text-white mb-10 leading-relaxed font-medium">
                        "{testimonial.quote}"
                      </p>

                      {/* Rating */}
                      <div className="flex gap-2 mb-8">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-7 h-7 fill-yellow-400 text-yellow-400 drop-shadow-lg" />
                        ))}
                      </div>

                      {/* Customer Info */}
                      <div className="flex items-center gap-5">
                        <div className="relative">
                          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 blur-md opacity-75"></div>
                          <img
                            src={testimonial.photo}
                            alt={testimonial.name}
                            className="relative w-20 h-20 rounded-full object-cover ring-4 ring-white dark:ring-gray-800 shadow-2xl"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white text-xl mb-1">
                            {testimonial.name}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400 font-medium">
                            {testimonial.title}
                          </div>
                          <div className="inline-block mt-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                            <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                              {testimonial.company}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full shadow-2xl shadow-blue-500/30 hover:shadow-3xl hover:shadow-purple-500/40 hover:scale-110 transition-all duration-300 flex items-center justify-center text-white z-10"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full shadow-2xl shadow-blue-500/30 hover:shadow-3xl hover:shadow-purple-500/40 hover:scale-110 transition-all duration-300 flex items-center justify-center text-white z-10"
          >
            <ChevronRight className="w-7 h-7" />
          </button>

          {/* Dots Navigation with Progress */}
          <div className="flex justify-center items-center gap-3 mt-10">
            {testimonials.map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className="relative group"
              >
                {index === currentIndex && autoRotate && (
                  <div className="absolute inset-0 rounded-full">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="3"
                        strokeDasharray={\`\${progress}, 100\`}
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                )}
                <div className={\`h-3 rounded-full transition-all duration-300 \${
                  index === currentIndex
                    ? 'w-3 bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/50'
                    : 'w-3 bg-gray-300 dark:bg-gray-700 group-hover:bg-gray-400 dark:group-hover:bg-gray-600'
                }\`}></div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
    `,

    quotes: `
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Star, Quote, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestimonialSliderProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function TestimonialSlider({ ${dataName}: propData, className }: TestimonialSliderProps) {
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

  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const testimonialData = ${dataName} || {};

  const testimonials = ${getField('testimonials')};
  const autoRotate = ${getField('autoRotate')};
  const rotateInterval = ${getField('rotateInterval')};
  const sectionHeading = ${getField('sectionHeading')};

  useEffect(() => {
    if (!autoRotate) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      setProgress(0);
    }, rotateInterval);

    const progressTimer = setInterval(() => {
      setProgress((prev) => Math.min(prev + (100 / (rotateInterval / 100)), 100));
    }, 100);

    return () => {
      clearInterval(timer);
      clearInterval(progressTimer);
    };
  }, [autoRotate, rotateInterval, testimonials.length, currentIndex]);

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    setProgress(0);
  };

  return (
    <section className={cn('relative bg-gradient-to-b from-gray-50 via-white to-purple-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/10 overflow-hidden', className)}>
      {/* Floating Gradient Orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-400/10 dark:bg-purple-600/5 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-20">
            {sectionHeading}
          </h2>

          {/* Quote Display */}
          <div className="relative min-h-[400px] flex flex-col items-center justify-center">
            {/* Large Quote Icon Background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 opacity-10">
              <Quote className="w-32 h-32 text-blue-600 dark:text-blue-400" />
            </div>

            {testimonials.map((testimonial: any, index: number) => (
              <div
                key={index}
                className={\`absolute inset-0 transition-all duration-700 \${
                  index === currentIndex
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
                }\`}
              >
                {/* Rating */}
                <div className="flex justify-center gap-2 mb-10">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-8 h-8 fill-yellow-400 text-yellow-400 drop-shadow-xl" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-12 leading-relaxed px-8">
                  "{testimonial.quote}"
                </blockquote>

                {/* Author */}
                <div className="flex flex-col items-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 blur-lg opacity-75 animate-pulse"></div>
                    <img
                      src={testimonial.photo}
                      alt={testimonial.name}
                      className="relative w-24 h-24 rounded-full object-cover ring-4 ring-white dark:ring-gray-800 shadow-2xl"
                    />
                  </div>
                  <div className="font-bold text-2xl bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
                    {testimonial.name}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 font-medium text-lg mb-3">
                    {testimonial.title}
                  </div>
                  <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                    <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                      {testimonial.company}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dots Navigation with Gradient Progress */}
          <div className="flex justify-center items-center gap-3 mt-16">
            {testimonials.map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className="relative group"
              >
                {index === currentIndex && autoRotate && (
                  <div className="absolute inset-0 rounded-full">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="url(#gradient-quotes)"
                        strokeWidth="3"
                        strokeDasharray={\`\${progress}, 100\`}
                      />
                      <defs>
                        <linearGradient id="gradient-quotes" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                )}
                <div className={\`h-3 rounded-full transition-all duration-300 \${
                  index === currentIndex
                    ? 'w-10 bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/50'
                    : 'w-3 bg-gray-300 dark:bg-gray-700 group-hover:bg-gray-400 dark:group-hover:bg-gray-600'
                }\`}></div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
    `,

    video: `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ChevronLeft, ChevronRight, Play, Star, Quote, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestimonialSliderProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function TestimonialSlider({ ${dataName}: propData, className }: TestimonialSliderProps) {
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

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const testimonialData = ${dataName} || {};

  const videoTestimonials = ${getField('videoTestimonials')};
  const sectionHeading = ${getField('sectionHeading')};
  const sectionSubheading = ${getField('sectionSubheading')};

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + videoTestimonials.length) % videoTestimonials.length);
    setIsPlaying(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % videoTestimonials.length);
    setIsPlaying(false);
  };

  const handlePlay = () => {
    setIsPlaying(true);
    console.log('Playing video:', videoTestimonials[currentIndex].videoUrl);
  };

  const currentTestimonial = videoTestimonials[currentIndex];

  return (
    <section className={cn('relative bg-gradient-to-br from-gray-50 via-white to-purple-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/10 overflow-hidden', className)}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.05),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.05),transparent_50%)]"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Video Testimonials
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-4">
            {sectionHeading}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {sectionSubheading}
          </p>
        </div>

        {/* Video Slider */}
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Video Player */}
            <div className="relative group">
              <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
                {!isPlaying ? (
                  <>
                    <img
                      src={currentTestimonial.thumbnail}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/40 to-black/60 flex items-center justify-center backdrop-blur-[1px]">
                      <button
                        onClick={handlePlay}
                        className="relative w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/50 hover:shadow-3xl hover:shadow-purple-500/60 hover:scale-110 transition-all duration-300"
                      >
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 blur-xl opacity-50 animate-pulse"></div>
                        <Play className="relative w-10 h-10 text-white ml-2" />
                      </button>
                    </div>
                  </>
                ) : (
                  <video
                    src={currentTestimonial.videoUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 backdrop-blur-sm rounded-full shadow-2xl shadow-blue-500/30 hover:shadow-3xl hover:scale-110 transition-all flex items-center justify-center text-white opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 backdrop-blur-sm rounded-full shadow-2xl shadow-blue-500/30 hover:shadow-3xl hover:scale-110 transition-all flex items-center justify-center text-white opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Testimonial Content */}
            <div className="relative">
              {/* Quote Icon */}
              <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg mb-8">
                <Quote className="w-6 h-6 text-white" />
              </div>

              {/* Rating */}
              <div className="flex gap-2 mb-8">
                {[...Array(currentTestimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-7 h-7 fill-yellow-400 text-yellow-400 drop-shadow-lg" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-10 leading-relaxed">
                "{currentTestimonial.quote}"
              </blockquote>

              {/* Customer Info */}
              <div className="flex items-center gap-5 mb-10">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 blur-md opacity-75"></div>
                  <img
                    src={currentTestimonial.photo}
                    alt={currentTestimonial.name}
                    className="relative w-20 h-20 rounded-full object-cover ring-4 ring-white dark:ring-gray-800 shadow-2xl"
                  />
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white text-xl mb-1">
                    {currentTestimonial.name}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 font-medium mb-2">
                    {currentTestimonial.title}
                  </div>
                  <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                    <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                      {currentTestimonial.company}
                    </span>
                  </div>
                </div>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-4 flex-wrap">
                {videoTestimonials.map((testimonial: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentIndex(index);
                      setIsPlaying(false);
                    }}
                    className="relative group/thumb"
                  >
                    <div className={\`relative w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 \${
                      index === currentIndex
                        ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20 scale-110 shadow-lg'
                        : 'border-gray-200 dark:border-gray-700 opacity-60 hover:opacity-100 hover:scale-105'
                    }\`}>
                      <img
                        src={testimonial.thumbnail}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                      {index !== currentIndex && (
                        <div className="absolute inset-0 bg-black/20 group-hover/thumb:bg-black/10 transition-colors"></div>
                      )}
                      {index === currentIndex && (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
    `
  };

  return variants[variant] || variants.cards;
};
