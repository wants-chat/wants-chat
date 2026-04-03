import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateVideoThumbnailGrid = (
  resolved: ResolvedComponent,
  variant: 'grid' | 'list' | 'featured' = 'grid'
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
  const dataName = dataSource.split('.').pop() || 'data';

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'videos'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource.split('.').pop() || 'videos';

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Play, Clock, Eye, Calendar, User, Loader2 } from 'lucide-react';`;

  const commonStyles = `
    .video-grid { @apply grid gap-4; }
    .video-card { @apply bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-105 shadow-xl hover:shadow-2xl border-2 border-gray-200 dark:border-gray-700; }
    .thumbnail-wrapper { @apply relative overflow-hidden; }
    .thumbnail-image { @apply w-full aspect-video object-cover; }
    .play-overlay { @apply absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-all; }
    .play-icon { @apply bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full p-3 transition-all shadow-2xl border-2 border-white/20; }
    .duration-badge { @apply absolute bottom-2 right-2 bg-gradient-to-r from-black/90 to-gray-900/90 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg; }
    .video-info { @apply p-4; }
    .video-title { @apply font-bold text-gray-900 dark:text-white line-clamp-2 mb-2; }
    .video-meta { @apply flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 font-medium; }
    .meta-item { @apply flex items-center gap-1; }
  `;

  const variants = {
    grid: `${commonImports}
interface VideoThumbnailGridProps { ${dataName}?: any; className?: string; }
const VideoThumbnailGrid: React.FC<VideoThumbnailGridProps> = ({ ${dataName}: propData, className }) => {
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

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const videosData = ${dataName} || {};
  const videos = videosData.videos || ${getField('videos')};

  return (<>
<div className={className}>
      <div className="video-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((video: any) => (
          <div key={video.id} className="video-card">
            <div className="thumbnail-wrapper">
              <img src={video.thumbnail} alt={video.title} className="thumbnail-image" />
              <div className="play-overlay">
                <div className="play-icon"><Play className="w-8 h-8 text-white" fill="currentColor" /></div>
              </div>
              <div className="duration-badge"><Clock className="w-3 h-3 inline mr-1" />{video.duration}</div>
            </div>
            <div className="video-info">
              <h3 className="video-title">{video.title}</h3>
              <div className="video-meta">
                <div className="meta-item"><Eye className="w-4 h-4" />{video.views}</div>
                <div className="meta-item"><Calendar className="w-4 h-4" />{video.uploadDate}</div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-500 mt-2"><User className="w-3 h-3 inline mr-1" />{video.author}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </>);
};
export default VideoThumbnailGrid;`,

    list: `${commonImports}
interface VideoThumbnailGridProps { ${dataName}?: any; className?: string; }
const VideoThumbnailGrid: React.FC<VideoThumbnailGridProps> = ({ ${dataName}: propData, className }) => {
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

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const videosData = ${dataName} || {};
  const videos = videosData.videos || ${getField('videos')};

  return (<>
<div className={className}>
      <div className="space-y-4">
        {videos.map((video: any) => (
          <div key={video.id} className="flex gap-4 bg-white dark:bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors p-4">
            <div className="thumbnail-wrapper flex-shrink-0" style={{ width: '240px' }}>
              <img src={video.thumbnail} alt={video.title} className="thumbnail-image rounded-lg" />
              <div className="play-overlay rounded-lg">
                <div className="play-icon"><Play className="w-6 h-6 text-white" fill="currentColor" /></div>
              </div>
              <div className="duration-badge"><Clock className="w-3 h-3 inline mr-1" />{video.duration}</div>
            </div>
            <div className="flex-1">
              <h3 className="video-title text-lg">{video.title}</h3>
              <div className="video-meta mt-2">
                <div className="meta-item"><Eye className="w-4 h-4" />{video.views} views</div>
                <div className="meta-item"><Calendar className="w-4 h-4" />{video.uploadDate}</div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-500 mt-2"><User className="w-3 h-3 inline mr-1" />{video.author}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </>);
};
export default VideoThumbnailGrid;`,

    featured: `${commonImports}
interface VideoThumbnailGridProps { ${dataName}?: any; className?: string; }
const VideoThumbnailGrid: React.FC<VideoThumbnailGridProps> = ({ ${dataName}: propData, className }) => {
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

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const videosData = ${dataName} || {};
  const videos = videosData.videos || ${getField('videos')};
  const [featuredVideo] = videos;
  const otherVideos = videos.slice(1);

  return (<>
<div className={className}>
      <div className="space-y-6">
        <div className="video-card">
          <div className="thumbnail-wrapper">
            <img src={featuredVideo.thumbnail} alt={featuredVideo.title} className="thumbnail-image" />
            <div className="play-overlay">
              <div className="play-icon"><Play className="w-12 h-12 text-white" fill="currentColor" /></div>
            </div>
            <div className="duration-badge"><Clock className="w-3 h-3 inline mr-1" />{featuredVideo.duration}</div>
          </div>
          <div className="video-info">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{featuredVideo.title}</h2>
            <div className="video-meta">
              <div className="meta-item"><Eye className="w-4 h-4" />{featuredVideo.views} views</div>
              <div className="meta-item"><Calendar className="w-4 h-4" />{featuredVideo.uploadDate}</div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-500 mt-2"><User className="w-3 h-3 inline mr-1" />{featuredVideo.author}</div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">More Videos</h3>
          <div className="video-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {otherVideos.map((video: any) => (
              <div key={video.id} className="video-card">
                <div className="thumbnail-wrapper">
                  <img src={video.thumbnail} alt={video.title} className="thumbnail-image" />
                  <div className="play-overlay">
                    <div className="play-icon"><Play className="w-6 h-6 text-white" fill="currentColor" /></div>
                  </div>
                  <div className="duration-badge"><Clock className="w-3 h-3 inline mr-1" />{video.duration}</div>
                </div>
                <div className="video-info">
                  <h3 className="video-title text-sm">{video.title}</h3>
                  <div className="video-meta text-xs">
                    <div className="meta-item"><Eye className="w-3 h-3" />{video.views}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </>);
};
export default VideoThumbnailGrid;`
  };

  return variants[variant] || variants.grid;
};
