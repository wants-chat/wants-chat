import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateTabsNavigation = (
  resolved: ResolvedComponent,
  variant: 'horizontal' | 'vertical' | 'pills' = 'horizontal'
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
    if (fieldName.match(/items|steps|updates|timeline|list|array|images|products|users|orders|features|links|stats|statistics|metrics|categories|tags|members|avatars|methods|examples|reviews|comments|notifications|messages|events|courses|lessons|modules|posts|articles|videos|photos|data|results|activities|cards|testimonials|faqs|questions|answers|options|choices|variants|attributes|filters|transactions|invoices|payments|receipts|shipments|deliveries|tracks|albums|artists|playlists/i)) {
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
    return `/${dataSource || 'tabs'}`;
  };

  const apiRoute = getApiRoute();

  // Derive entity name for query key
  const entity = dataSource ? dataSource.split('.').pop() || 'tabs' : 'tabs';

  const commonImports = `
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { Music, Disc, Users, List, Play, Clock, Heart, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';`;

  const variants = {
    horizontal: `
${commonImports}

interface TabsNavigationProps {
  data?: any;
  className?: string;
  tabItems?: any[];
  defaultActiveTab?: string;
  itemsPerPage?: number;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  [key: string]: any;
}

export default function TabsNavigation({ data: componentData, className, tabItems: propTabItems, defaultActiveTab: propDefaultTab, itemsPerPage = 12, variant = 'minimal', colorScheme = 'blue', ...props }: TabsNavigationProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
    },
    enabled: !componentData,
    retry: 1,
  });

  const data = componentData || fetchedData || {};
  const navigate = useNavigate();
  const styles = getVariantStyles(variant, colorScheme);

  const [activeTab, setActiveTab] = useState('tracks');
  const [currentPage, setCurrentPage] = useState(1);

  if (isLoading && !componentData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Get data from props or from data object - handle multiple fetch actions
  const tabItems = propTabItems || data?.tabItems || props.tabs || [];
  const tracks = props.tracksData || data?.tracks || (Array.isArray(data) ? data : []);
  const albums = props.albumsData || data?.albums || [];
  const artists = props.artistsData || data?.artists || [];
  const playlists = props.playlistsData || data?.playlists || [];
  const defaultActiveTab = propDefaultTab || data?.defaultActiveTab || (tabItems[0]?.id || 'tracks');

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setCurrentPage(1); // Reset to first page when switching tabs
  };

  const getIcon = (iconName: string) => {
    const icons: any = {
      Music,
      Disc,
      Users,
      List,
      Play,
      Clock,
      Heart
    };
    const Icon = icons[iconName];
    return Icon ? <Icon className="w-5 h-5" /> : null;
  };

  // Get data for active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'tracks':
        return tracks;
      case 'albums':
        return albums;
      case 'artists':
        return artists;
      case 'playlists':
        return playlists;
      default:
        return tracks;
    }
  };

  const currentData = getCurrentData();

  // Pagination logic
  const totalPages = Math.ceil((currentData?.length || 0) / itemsPerPage);
  const paginatedData = useMemo(() => {
    if (!currentData || currentData.length === 0) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return currentData.slice(startIndex, endIndex);
  }, [currentData, currentPage, itemsPerPage]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToNextPage = () => goToPage(currentPage + 1);
  const goToPreviousPage = () => goToPage(currentPage - 1);

  // Format duration from seconds to MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return \`\${mins}:\${secs.toString().padStart(2, '0')}\`;
  };

  // Render item card based on type
  const renderItem = (item: any, type: string) => {
    if (type === 'tracks') {
      return (
        <div key={item.id} onClick={() => navigate(\`/tracks/\${item.id}\`)} className={cn("group relative rounded-lg p-4 transition-all duration-300 cursor-pointer", styles.card, styles.cardHover)}>
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <img
                src={item.cover_image || '/placeholder-track.png'}
                alt={item.title}
                className="w-16 h-16 rounded-md object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                <Play className="w-6 h-6 text-white" fill="white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={\`font-semibold truncate \${styles.title}\`}>{item.title || item.name || 'Untitled'}</h3>
              <p className={\`text-sm truncate \${styles.subtitle}\`}>{item.artist_name || \`Artist ID: \${item.artist_id || 'Unknown'}\`}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-500">
                {item.duration_seconds && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(item.duration_seconds)}
                  </span>
                )}
                {item.play_count !== undefined && (
                  <span className="flex items-center gap-1">
                    <Play className="w-3 h-3" />
                    {item.play_count.toLocaleString()} plays
                  </span>
                )}
                {item.genre && (
                  <span className={\`px-2 py-0.5 rounded-full \${styles.badge}\`}>
                    {item.genre}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    } else if (type === 'albums') {
      return (
        <div key={item.id} onClick={() => navigate(\`/albums/\${item.id}\`)} className={cn("group relative rounded-lg overflow-hidden transition-all duration-300 cursor-pointer", styles.card, styles.cardHover)}>
          <div className="relative aspect-square">
            <img
              src={item.cover_image || '/placeholder-album.png'}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <button className={\`absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-lg \${styles.button} \${styles.buttonHover}\`}>
              <Play className="w-6 h-6 text-white ml-1" fill="white" />
            </button>
          </div>
          <div className="p-4">
            <h3 className={\`font-bold truncate \${styles.title}\`}>{item.title || item.name || 'Untitled'}</h3>
            <p className={\`text-sm truncate mt-1 \${styles.subtitle}\`}>{item.artist_name || \`Artist ID: \${item.artist_id || 'Unknown'}\`}</p>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-500">
              {item.release_date && <span>{new Date(item.release_date).getFullYear()}</span>}
              {item.track_count !== undefined && <span>{item.track_count} tracks</span>}
            </div>
          </div>
        </div>
      );
    } else if (type === 'artists') {
      return (
        <div key={item.id} onClick={() => navigate(\`/artists/\${item.id}\`)} className={cn("group relative rounded-lg overflow-hidden transition-all duration-300 cursor-pointer", styles.card, styles.cardHover)}>
          <div className="relative aspect-square">
            <img
              src={item.profile_image || '/placeholder-artist.png'}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="font-bold text-white text-lg truncate">{item.name || item.title || 'Unknown'}</h3>
              {item.verified && (
                <span className="inline-block mt-1 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                  ✓ Verified
                </span>
              )}
            </div>
          </div>
          <div className="p-4">
            {item.bio && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">{item.bio}</p>
            )}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
              {item.follower_count !== undefined && (
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {item.follower_count.toLocaleString()} followers
                </span>
              )}
            </div>
          </div>
        </div>
      );
    } else if (type === 'playlists') {
      return (
        <div key={item.id} onClick={() => navigate(\`/playlists/\${item.id}\`)} className={cn("group relative rounded-lg overflow-hidden transition-all duration-300 cursor-pointer", styles.card, styles.cardHover)}>
          <div className="relative aspect-square bg-gradient-to-br from-purple-500 to-blue-600">
            {item.cover_image ? (
              <img
                src={item.cover_image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <List className="w-20 h-20 text-white/30" />
              </div>
            )}
            <button className={\`absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-lg \${styles.button} \${styles.buttonHover}\`}>
              <Play className="w-6 h-6 text-white ml-1" fill="white" />
            </button>
          </div>
          <div className="p-4">
            <h3 className="font-bold text-gray-900 dark:text-white truncate">{item.name || item.title || 'Untitled'}</h3>
            <p className={\`text-sm line-clamp-2 mt-1 \${styles.subtitle}\`}>{item.description || 'No description available'}</p>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-500">
              {item.track_count !== undefined && <span>{item.track_count} tracks</span>}
              {item.is_public !== undefined && (
                <span className={item.is_public ? 'text-green-600' : 'text-gray-500'}>
                  {item.is_public ? 'Public' : 'Private'}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Debug: Log data to console
  console.log('TabsNavigation Data:', { tracks, albums, artists, playlists, activeTab, currentData });

  return (
    <div className="w-full">
      <div className={cn('bg-white dark:bg-gray-800 rounded-lg shadow-sm', className)}>
        {/* Tabs Header */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px overflow-x-auto">
            {tabItems.map((tab: any) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-all duration-300 whitespace-nowrap',
                  activeTab === tab.id
                    ? \`\${styles.accent} \${styles.background}\`
                    : \`\${styles.text} \${styles.border} hover:\${styles.accent}\`
                )}
              >
                {getIcon(tab.icon)}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {currentData && currentData.length > 0 ? (
            <>
              {/* Section Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tabItems.find((t: any) => t.id === activeTab)?.label || activeTab}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {currentData.length} {activeTab} available
                </p>
              </div>

              <div className={cn(
                'grid gap-4 mb-6',
                activeTab === 'tracks' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
              )}>
                {paginatedData.map((item: any) => renderItem(item, activeTab))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, currentData.length)} of {currentData.length} results
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        const showPage = page === 1 ||
                                        page === totalPages ||
                                        (page >= currentPage - 1 && page <= currentPage + 1);

                        const showEllipsis = (page === currentPage - 2 && currentPage > 3) ||
                                            (page === currentPage + 2 && currentPage < totalPages - 2);

                        if (showEllipsis) {
                          return <span key={page} className="px-2 text-gray-500">...</span>;
                        }

                        if (!showPage) return null;

                        return (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={\`px-3 py-2 text-sm font-medium rounded-lg transition-colors \${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }\`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-600 mb-2">
                {getIcon(tabItems.find((t: any) => t.id === activeTab)?.icon || 'Music')}
              </div>
              <p className="text-gray-600 dark:text-gray-400">No {activeTab} found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
    `,

    vertical: `
${commonImports}

interface TabsNavigationProps {
  data?: any;
  className?: string;
  tabItems?: any[];
  defaultActiveTab?: string;
  itemsPerPage?: number;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  [key: string]: any;
}

export default function TabsNavigation({ data: componentData, className, tabItems: propTabItems, defaultActiveTab: propDefaultTab, itemsPerPage = 12, ...props }: TabsNavigationProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
    },
    enabled: !componentData,
    retry: 1,
  });

  const data = componentData || fetchedData || {};

  const [activeTab, setActiveTab] = useState('tracks');
  const [currentPage, setCurrentPage] = useState(1);

  if (isLoading && !componentData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const tabItems = propTabItems || data?.tabItems || props.tabs || [];
  const tracks = props.tracksData || data?.tracks || (Array.isArray(data) ? data : []);
  const albums = props.albumsData || data?.albums || [];
  const artists = props.artistsData || data?.artists || [];
  const playlists = props.playlistsData || data?.playlists || [];
  const defaultActiveTab = propDefaultTab || data?.defaultActiveTab || (tabItems[0]?.id || 'tracks');

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setCurrentPage(1); // Reset to first page when switching tabs
  };

  const getIcon = (iconName: string) => {
    const icons: any = {
      Music,
      Disc,
      Users,
      List,
      Play,
      Clock,
      Heart
    };
    const Icon = icons[iconName];
    return Icon ? <Icon className="w-5 h-5" /> : null;
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'tracks':
        return tracks;
      case 'albums':
        return albums;
      case 'artists':
        return artists;
      case 'playlists':
        return playlists;
      default:
        return tracks;
    }
  };

  const currentData = getCurrentData();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return \`\${mins}:\${secs.toString().padStart(2, '0')}\`;
  };

  const renderItem = (item: any, type: string) => {
    if (type === 'tracks') {
      return (
        <div key={item.id} className="group relative bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500">
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <img
                src={item.cover_image || '/placeholder-track.png'}
                alt={item.title}
                className="w-16 h-16 rounded-md object-cover"
              />
              <button className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                <Play className="w-6 h-6 text-white" fill="white" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={\`font-semibold truncate \${styles.title}\`}>{item.title || item.name || 'Untitled'}</h3>
              <p className={\`text-sm truncate \${styles.subtitle}\`}>{item.artist_name || \`Artist ID: \${item.artist_id || 'Unknown'}\`}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-500">
                {item.duration_seconds && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(item.duration_seconds)}
                  </span>
                )}
                {item.play_count !== undefined && (
                  <span className="flex items-center gap-1">
                    <Play className="w-3 h-3" />
                    {item.play_count.toLocaleString()} plays
                  </span>
                )}
                {item.genre && (
                  <span className={\`px-2 py-0.5 rounded-full \${styles.badge}\`}>
                    {item.genre}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    } else if (type === 'albums') {
      return (
        <div key={item.id} onClick={() => navigate(\`/albums/\${item.id}\`)} className={cn("group relative rounded-lg overflow-hidden transition-all duration-300 cursor-pointer", styles.card, styles.cardHover)}>
          <div className="relative aspect-square">
            <img
              src={item.cover_image || '/placeholder-album.png'}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <button className={\`absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-lg \${styles.button} \${styles.buttonHover}\`}>
              <Play className="w-6 h-6 text-white ml-1" fill="white" />
            </button>
          </div>
          <div className="p-4">
            <h3 className={\`font-bold truncate \${styles.title}\`}>{item.title || item.name || 'Untitled'}</h3>
            <p className={\`text-sm truncate mt-1 \${styles.subtitle}\`}>{item.artist_name || \`Artist ID: \${item.artist_id || 'Unknown'}\`}</p>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-500">
              {item.release_date && <span>{new Date(item.release_date).getFullYear()}</span>}
              {item.track_count !== undefined && <span>{item.track_count} tracks</span>}
            </div>
          </div>
        </div>
      );
    } else if (type === 'artists') {
      return (
        <div key={item.id} onClick={() => navigate(\`/artists/\${item.id}\`)} className={cn("group relative rounded-lg overflow-hidden transition-all duration-300 cursor-pointer", styles.card, styles.cardHover)}>
          <div className="relative aspect-square">
            <img
              src={item.profile_image || '/placeholder-artist.png'}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="font-bold text-white text-lg truncate">{item.name || item.title || 'Unknown'}</h3>
              {item.verified && (
                <span className="inline-block mt-1 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                  ✓ Verified
                </span>
              )}
            </div>
          </div>
          <div className="p-4">
            {item.bio && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">{item.bio}</p>
            )}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
              {item.follower_count !== undefined && (
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {item.follower_count.toLocaleString()} followers
                </span>
              )}
            </div>
          </div>
        </div>
      );
    } else if (type === 'playlists') {
      return (
        <div key={item.id} onClick={() => navigate(\`/playlists/\${item.id}\`)} className={cn("group relative rounded-lg overflow-hidden transition-all duration-300 cursor-pointer", styles.card, styles.cardHover)}>
          <div className="relative aspect-square bg-gradient-to-br from-purple-500 to-blue-600">
            {item.cover_image ? (
              <img
                src={item.cover_image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <List className="w-20 h-20 text-white/30" />
              </div>
            )}
            <button className={\`absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-lg \${styles.button} \${styles.buttonHover}\`}>
              <Play className="w-6 h-6 text-white ml-1" fill="white" />
            </button>
          </div>
          <div className="p-4">
            <h3 className="font-bold text-gray-900 dark:text-white truncate">{item.name || item.title || 'Untitled'}</h3>
            <p className={\`text-sm line-clamp-2 mt-1 \${styles.subtitle}\`}>{item.description || 'No description available'}</p>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-500">
              {item.track_count !== undefined && <span>{item.track_count} tracks</span>}
              {item.is_public !== undefined && (
                <span className={item.is_public ? 'text-green-600' : 'text-gray-500'}>
                  {item.is_public ? 'Public' : 'Private'}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Debug: Log data to console
  console.log('TabsNavigation Data:', { tracks, albums, artists, playlists, activeTab, currentData });

  return (
    <div className="w-full">
      <div className={cn('flex gap-6', className)}>
        {/* Vertical Tabs */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <nav className="p-2 space-y-1">
              {tabItems.map((tab: any) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors',
                    activeTab === tab.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  )}
                >
                  {getIcon(tab.icon)}
                  <span className="flex-1 text-left">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          {currentData && currentData.length > 0 ? (
            <>
              {/* Section Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tabItems.find((t: any) => t.id === activeTab)?.label || activeTab}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {currentData.length} {activeTab} available
                </p>
              </div>

              <div className={cn(
                'grid gap-4 mb-6',
                activeTab === 'tracks' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              )}>
                {paginatedData.map((item: any) => renderItem(item, activeTab))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, currentData.length)} of {currentData.length} results
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        const showPage = page === 1 ||
                                        page === totalPages ||
                                        (page >= currentPage - 1 && page <= currentPage + 1);

                        const showEllipsis = (page === currentPage - 2 && currentPage > 3) ||
                                            (page === currentPage + 2 && currentPage < totalPages - 2);

                        if (showEllipsis) {
                          return <span key={page} className="px-2 text-gray-500">...</span>;
                        }

                        if (!showPage) return null;

                        return (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={\`px-3 py-2 text-sm font-medium rounded-lg transition-colors \${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }\`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-600 mb-2">
                {getIcon(tabItems.find((t: any) => t.id === activeTab)?.icon || 'Music')}
              </div>
              <p className="text-gray-600 dark:text-gray-400">No {activeTab} found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
    `,

    pills: `
${commonImports}

interface TabsNavigationProps {
  data?: any;
  className?: string;
  tabItems?: any[];
  defaultActiveTab?: string;
  itemsPerPage?: number;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  [key: string]: any;
}

export default function TabsNavigation({ data: componentData, className, tabItems: propTabItems, defaultActiveTab: propDefaultTab, itemsPerPage = 12, ...props }: TabsNavigationProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
    },
    enabled: !componentData,
    retry: 1,
  });

  const data = componentData || fetchedData || {};

  const [activeTab, setActiveTab] = useState('tracks');
  const [currentPage, setCurrentPage] = useState(1);

  if (isLoading && !componentData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const tabItems = propTabItems || data?.tabItems || props.tabs || [];
  const tracks = props.tracksData || data?.tracks || (Array.isArray(data) ? data : []);
  const albums = props.albumsData || data?.albums || [];
  const artists = props.artistsData || data?.artists || [];
  const playlists = props.playlistsData || data?.playlists || [];
  const defaultActiveTab = propDefaultTab || data?.defaultActiveTab || (tabItems[0]?.id || 'tracks');

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setCurrentPage(1); // Reset to first page when switching tabs
  };

  const getIcon = (iconName: string) => {
    const icons: any = {
      Music,
      Disc,
      Users,
      List,
      Play,
      Clock,
      Heart
    };
    const Icon = icons[iconName];
    return Icon ? <Icon className="w-5 h-5" /> : null;
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'tracks':
        return tracks;
      case 'albums':
        return albums;
      case 'artists':
        return artists;
      case 'playlists':
        return playlists;
      default:
        return tracks;
    }
  };

  const currentData = getCurrentData();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return \`\${mins}:\${secs.toString().padStart(2, '0')}\`;
  };

  const renderItem = (item: any, type: string) => {
    if (type === 'tracks') {
      return (
        <div key={item.id} className="group relative bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500">
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <img
                src={item.cover_image || '/placeholder-track.png'}
                alt={item.title}
                className="w-16 h-16 rounded-md object-cover"
              />
              <button className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                <Play className="w-6 h-6 text-white" fill="white" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={\`font-semibold truncate \${styles.title}\`}>{item.title || item.name || 'Untitled'}</h3>
              <p className={\`text-sm truncate \${styles.subtitle}\`}>{item.artist_name || \`Artist ID: \${item.artist_id || 'Unknown'}\`}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-500">
                {item.duration_seconds && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(item.duration_seconds)}
                  </span>
                )}
                {item.play_count !== undefined && (
                  <span className="flex items-center gap-1">
                    <Play className="w-3 h-3" />
                    {item.play_count.toLocaleString()} plays
                  </span>
                )}
                {item.genre && (
                  <span className={\`px-2 py-0.5 rounded-full \${styles.badge}\`}>
                    {item.genre}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    } else if (type === 'albums') {
      return (
        <div key={item.id} onClick={() => navigate(\`/albums/\${item.id}\`)} className={cn("group relative rounded-lg overflow-hidden transition-all duration-300 cursor-pointer", styles.card, styles.cardHover)}>
          <div className="relative aspect-square">
            <img
              src={item.cover_image || '/placeholder-album.png'}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <button className={\`absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-lg \${styles.button} \${styles.buttonHover}\`}>
              <Play className="w-6 h-6 text-white ml-1" fill="white" />
            </button>
          </div>
          <div className="p-4">
            <h3 className={\`font-bold truncate \${styles.title}\`}>{item.title || item.name || 'Untitled'}</h3>
            <p className={\`text-sm truncate mt-1 \${styles.subtitle}\`}>{item.artist_name || \`Artist ID: \${item.artist_id || 'Unknown'}\`}</p>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-500">
              {item.release_date && <span>{new Date(item.release_date).getFullYear()}</span>}
              {item.track_count !== undefined && <span>{item.track_count} tracks</span>}
            </div>
          </div>
        </div>
      );
    } else if (type === 'artists') {
      return (
        <div key={item.id} onClick={() => navigate(\`/artists/\${item.id}\`)} className={cn("group relative rounded-lg overflow-hidden transition-all duration-300 cursor-pointer", styles.card, styles.cardHover)}>
          <div className="relative aspect-square">
            <img
              src={item.profile_image || '/placeholder-artist.png'}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="font-bold text-white text-lg truncate">{item.name || item.title || 'Unknown'}</h3>
              {item.verified && (
                <span className="inline-block mt-1 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                  ✓ Verified
                </span>
              )}
            </div>
          </div>
          <div className="p-4">
            {item.bio && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">{item.bio}</p>
            )}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
              {item.follower_count !== undefined && (
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {item.follower_count.toLocaleString()} followers
                </span>
              )}
            </div>
          </div>
        </div>
      );
    } else if (type === 'playlists') {
      return (
        <div key={item.id} onClick={() => navigate(\`/playlists/\${item.id}\`)} className={cn("group relative rounded-lg overflow-hidden transition-all duration-300 cursor-pointer", styles.card, styles.cardHover)}>
          <div className="relative aspect-square bg-gradient-to-br from-purple-500 to-blue-600">
            {item.cover_image ? (
              <img
                src={item.cover_image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <List className="w-20 h-20 text-white/30" />
              </div>
            )}
            <button className={\`absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-lg \${styles.button} \${styles.buttonHover}\`}>
              <Play className="w-6 h-6 text-white ml-1" fill="white" />
            </button>
          </div>
          <div className="p-4">
            <h3 className="font-bold text-gray-900 dark:text-white truncate">{item.name || item.title || 'Untitled'}</h3>
            <p className={\`text-sm line-clamp-2 mt-1 \${styles.subtitle}\`}>{item.description || 'No description available'}</p>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-500">
              {item.track_count !== undefined && <span>{item.track_count} tracks</span>}
              {item.is_public !== undefined && (
                <span className={item.is_public ? 'text-green-600' : 'text-gray-500'}>
                  {item.is_public ? 'Public' : 'Private'}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Debug: Log data to console
  console.log('TabsNavigation Data:', { tracks, albums, artists, playlists, activeTab, currentData });

  return (
    <div className="w-full">
      <div className={cn('bg-white dark:bg-gray-800 rounded-lg shadow-sm', className)}>
        {/* Pills Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex flex-wrap gap-2">
            {tabItems.map((tab: any) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-300',
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                {getIcon(tab.icon)}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {currentData && currentData.length > 0 ? (
            <>
              {/* Section Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tabItems.find((t: any) => t.id === activeTab)?.label || activeTab}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {currentData.length} {activeTab} available
                </p>
              </div>

              <div className={cn(
                'grid gap-4 mb-6',
                activeTab === 'tracks' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
              )}>
                {paginatedData.map((item: any) => renderItem(item, activeTab))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, currentData.length)} of {currentData.length} results
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        const showPage = page === 1 ||
                                        page === totalPages ||
                                        (page >= currentPage - 1 && page <= currentPage + 1);

                        const showEllipsis = (page === currentPage - 2 && currentPage > 3) ||
                                            (page === currentPage + 2 && currentPage < totalPages - 2);

                        if (showEllipsis) {
                          return <span key={page} className="px-2 text-gray-500">...</span>;
                        }

                        if (!showPage) return null;

                        return (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={\`px-3 py-2 text-sm font-medium rounded-lg transition-colors \${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }\`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                {getIcon(tabItems.find((t: any) => t.id === activeTab)?.icon || 'Music')}
              </div>
              <p className="text-gray-600 dark:text-gray-400">No {activeTab} found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.horizontal;
};
