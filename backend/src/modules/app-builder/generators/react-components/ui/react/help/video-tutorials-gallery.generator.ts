import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateVideoTutorialsGallery = (
  resolved: ResolvedComponent,
  variant: 'grid' | 'list' | 'carousel' = 'grid'
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
    return `/${dataSource || 'tutorials'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'tutorials';

  const commonImports = `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';`;

  const variants = {
    grid: `
${commonImports}
import { Play, Clock, Eye, Star, User, Filter } from 'lucide-react';

interface Tutorial {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  category: string;
  views: number;
  instructor: string;
  level: string;
  rating: number;
  uploadDate: string;
}

interface Category {
  id: string;
  label: string;
  count: number;
}

interface VideoGridProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const VideoGrid: React.FC<VideoGridProps> = ({ ${dataName}: propData, className }) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [hoveredVideo, setHoveredVideo] = useState<number | null>(null);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const videoData = ${dataName} || {};

  const title = ${getField('gridTitle')};
  const subtitle = ${getField('gridSubtitle')};
  const tutorials = ${getField('tutorials')};
  const categories = ${getField('categories')};
  const levelFilters = ${getField('levelFilters')};
  const watchNowButton = ${getField('watchNowButton')};
  const durationLabel = ${getField('durationLabel')};
  const viewsLabel = ${getField('viewsLabel')};
  const instructorLabel = ${getField('instructorLabel')};
  const levelLabel = ${getField('levelLabel')};

  const filteredTutorials = tutorials.filter((tutorial: Tutorial) => {
    const categoryMatch = selectedCategory === 'all' || tutorial.category === selectedCategory;
    const levelMatch = selectedLevel === 'All Levels' || tutorial.level === selectedLevel;
    return categoryMatch && levelMatch;
  });

  const handleVideoClick = (videoId: number) => {
    console.log('Video clicked:', videoId);
  };

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return \`\${(views / 1000).toFixed(1)}k\`;
    }
    return views.toString();
  };

  return (
    <div className={cn("max-w-7xl mx-auto", className)}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category: Category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={\`px-4 py-2 rounded-full text-sm font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 \${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-300 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-600'
                }\`}
              >
                {category.label} ({category.count})
              </button>
            ))}
          </div>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {levelFilters.map((level: string) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTutorials.map((tutorial: Tutorial) => (
          <Card
            key={tutorial.id}
            className="overflow-hidden cursor-pointer group"
            onMouseEnter={() => setHoveredVideo(tutorial.id)}
            onMouseLeave={() => setHoveredVideo(null)}
            onClick={() => handleVideoClick(tutorial.id)}
          >
            <div className="relative">
              <img
                src={tutorial.thumbnail}
                alt={tutorial.title}
                className="w-full h-48 object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-transparent to-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-2xl border-2 border-white/20">
                  <Play className="h-8 w-8 text-white ml-1" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 px-3 py-1.5 bg-gradient-to-r from-black/90 to-gray-900/90 rounded-full text-white text-xs font-bold shadow-lg">
                {tutorial.duration}
              </div>
              <div className="absolute top-2 left-2 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white text-xs font-bold shadow-lg">
                {tutorial.category}
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {tutorial.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {tutorial.description}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                <div className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  <span>{formatViews(tutorial.views)} {viewsLabel}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span>{tutorial.rating}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                  <User className="h-3.5 w-3.5" />
                  <span>{tutorial.instructor}</span>
                </div>
                <span className={\`px-2 py-0.5 rounded-full text-xs font-medium \${
                  tutorial.level === 'Beginner' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                  tutorial.level === 'Intermediate' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' :
                  'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                }\`}>
                  {tutorial.level}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VideoGrid;
    `,

    list: `
${commonImports}
import { Play, Clock, Eye, Star, User, Download, Share2 } from 'lucide-react';

interface Tutorial {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  category: string;
  views: number;
  instructor: string;
  level: string;
  rating: number;
  uploadDate: string;
}

interface VideoListProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const VideoList: React.FC<VideoListProps> = ({ ${dataName}: propData, className }) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};
  const [selectedSort, setSelectedSort] = useState('Most Popular');

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const videoData = ${dataName} || {};

  const title = ${getField('listTitle')};
  const subtitle = ${getField('listSubtitle')};
  const tutorials = ${getField('tutorials')};
  const sortOptions = ${getField('sortOptions')};
  const watchNowButton = ${getField('watchNowButton')};
  const downloadButton = ${getField('downloadButton')};
  const shareButton = ${getField('shareButton')};
  const viewsLabel = ${getField('viewsLabel')};

  const sortedTutorials = [...tutorials].sort((a: Tutorial, b: Tutorial) => {
    switch (selectedSort) {
      case 'Most Popular':
        return b.views - a.views;
      case 'Most Recent':
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      case 'Highest Rated':
        return b.rating - a.rating;
      case 'Duration':
        return a.duration.localeCompare(b.duration);
      default:
        return 0;
    }
  });

  const handleVideoClick = (videoId: number) => {
    console.log('Video clicked:', videoId);
  };

  const handleDownload = (videoId: number) => {
    console.log('Download clicked:', videoId);
  };

  const handleShare = (videoId: number) => {
    console.log('Share clicked:', videoId);
  };

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return \`\${(views / 1000).toFixed(1)}k\`;
    }
    return views.toString();
  };

  return (
    <div className={cn("max-w-5xl mx-auto", className)}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      {/* Sort */}
      <div className="flex justify-end mb-6">
        <select
          value={selectedSort}
          onChange={(e) => setSelectedSort(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {sortOptions.map((option: string) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      {/* Video List */}
      <div className="space-y-4">
        {sortedTutorials.map((tutorial: Tutorial) => (
          <Card key={tutorial.id} className="overflow-hidden">
            <div className="flex gap-4 p-4">
              <div
                className="relative w-64 h-36 flex-shrink-0 cursor-pointer group"
                onClick={() => handleVideoClick(tutorial.id)}
              >
                <img
                  src={tutorial.thumbnail}
                  alt={tutorial.title}
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                  <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                    <Play className="h-6 w-6 text-blue-600 ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded text-white text-xs font-medium">
                  {tutorial.duration}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                        {tutorial.category}
                      </span>
                      <span className={\`px-2 py-0.5 rounded text-xs font-medium \${
                        tutorial.level === 'Beginner' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                        tutorial.level === 'Intermediate' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' :
                        'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                      }\`}>
                        {tutorial.level}
                      </span>
                    </div>
                    <h3
                      className="text-lg font-bold text-gray-900 dark:text-white mb-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      onClick={() => handleVideoClick(tutorial.id)}
                    >
                      {tutorial.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {tutorial.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                      <div className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        <span>{tutorial.instructor}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        <span>{formatViews(tutorial.views)} {viewsLabel}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span>{tutorial.rating}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVideoClick(tutorial.id)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        {watchNowButton}
                      </button>
                      <button
                        onClick={() => handleDownload(tutorial.id)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        {downloadButton}
                      </button>
                      <button
                        onClick={() => handleShare(tutorial.id)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                      >
                        <Share2 className="h-4 w-4" />
                        {shareButton}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VideoList;
    `,

    carousel: `
${commonImports}
import { Play, Clock, Eye, Star, ChevronLeft, ChevronRight } from 'lucide-react';

interface Tutorial {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  category: string;
  views: number;
  instructor: string;
  level: string;
  rating: number;
  uploadDate: string;
}

interface VideoCarouselProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const VideoCarousel: React.FC<VideoCarouselProps> = ({ ${dataName}: propData, className }) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};
  const [currentIndex, setCurrentIndex] = useState(0);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const videoData = ${dataName} || {};

  const title = ${getField('carouselTitle')};
  const subtitle = ${getField('carouselSubtitle')};
  const tutorials = ${getField('tutorials')};
  const watchNowButton = ${getField('watchNowButton')};
  const viewsLabel = ${getField('viewsLabel')};

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? tutorials.length - 1 : prev - 1));
    console.log('Previous video');
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === tutorials.length - 1 ? 0 : prev + 1));
    console.log('Next video');
  };

  const handleVideoClick = (videoId: number) => {
    console.log('Video clicked:', videoId);
  };

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return \`\${(views / 1000).toFixed(1)}k\`;
    }
    return views.toString();
  };

  const visibleTutorials = [
    tutorials[(currentIndex - 1 + tutorials.length) % tutorials.length],
    tutorials[currentIndex],
    tutorials[(currentIndex + 1) % tutorials.length]
  ];

  return (
    <div className={cn("max-w-7xl mx-auto", className)}>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <div className="relative">
        {/* Carousel */}
        <div className="flex items-center gap-6 py-8">
          <button
            onClick={handlePrevious}
            className="flex-shrink-0 w-12 h-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft className="h-6 w-6 text-gray-700 dark:text-gray-300" />
          </button>

          <div className="flex-1 grid grid-cols-3 gap-6">
            {visibleTutorials.map((tutorial: Tutorial, idx: number) => (
              <div
                key={tutorial.id}
                className={\`transition-all duration-300 \${
                  idx === 1
                    ? 'scale-110 z-10'
                    : 'scale-90 opacity-60'
                }\`}
              >
                <Card className="overflow-hidden cursor-pointer group" onClick={() => handleVideoClick(tutorial.id)}>
                  <div className="relative">
                    <img
                      src={tutorial.thumbnail}
                      alt={tutorial.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                        <Play className="h-8 w-8 text-blue-600 ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded text-white text-xs font-medium">
                      {tutorial.duration}
                    </div>
                    <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 rounded text-white text-xs font-medium">
                      {tutorial.category}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                      {tutorial.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {tutorial.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        <span>{formatViews(tutorial.views)} {viewsLabel}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span>{tutorial.rating}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex-shrink-0 w-12 h-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronRight className="h-6 w-6 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {tutorials.map((_: any, idx: number) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={\`w-2 h-2 rounded-full transition-all \${
                idx === currentIndex
                  ? 'bg-blue-600 w-8'
                  : 'bg-gray-300 dark:bg-gray-600'
              }\`}
            />
          ))}
        </div>
      </div>

      {/* Featured Video Details */}
      <Card className="mt-8 p-6">
        <div className="flex items-start gap-6">
          <img
            src={tutorials[currentIndex].thumbnail}
            alt={tutorials[currentIndex].title}
            className="w-48 h-28 object-cover rounded-lg"
          />
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {tutorials[currentIndex].title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {tutorials[currentIndex].description}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <span>By {tutorials[currentIndex].instructor}</span>
              <span>•</span>
              <span>{formatViews(tutorials[currentIndex].views)} views</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {tutorials[currentIndex].rating}
              </span>
            </div>
            <button
              onClick={() => handleVideoClick(tutorials[currentIndex].id)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              {watchNowButton}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VideoCarousel;
    `
  };

  return variants[variant] || variants.grid;
};
