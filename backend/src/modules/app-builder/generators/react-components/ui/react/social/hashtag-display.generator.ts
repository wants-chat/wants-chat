import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateHashtagDisplay = (
  resolved: ResolvedComponent,
  variant: 'tag' | 'trending' | 'detailed' = 'tag'
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
  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === "") {
      return "data"; // Default prop name when no data source
    }
    const parts = dataSource.split('.'); return parts[parts.length - 1]; };
  const dataName = getDataPath();

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'hashtags'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'hashtags';

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';`;

  const variants = {
    tag: `
${commonImports}
import { Hash, TrendingUp, Users, Share2, ArrowUpRight } from 'lucide-react';

interface HashtagTagProps { \${dataName}?: any; className?: string; }

const HashtagTag: React.FC<HashtagTagProps> = ({ \${dataName}: propData, className }) => {
  const [isFollowing, setIsFollowing] = useState(false);

  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return response?.data || response;
      } catch (err) {
        console.error('Failed to fetch hashtag data:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  // Use prop data if available, otherwise use fetched data
  const \${dataName} = propData || fetchedData || {};

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className={cn("max-w-2xl mx-auto flex items-center justify-center py-12", className)}>
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <p className="ml-2 text-gray-500">Loading hashtag...</p>
      </div>
    );
  }

  const hashtagData = \${dataName} || {};
  const title = \${getField('tagTitle')};
  const subtitle = \${getField('tagSubtitle')};
  const hashtag = \${getField('hashtag')};
  const followButton = \${getField('followButton')};
  const followingButton = \${getField('followingButton')};
  const viewPostsButton = \${getField('viewPostsButton')};
  const shareButton = \${getField('shareButton')};
  const postsLabel = \${getField('postsLabel')};
  const followersLabel = \${getField('followersLabel')};
  const trendingLabel = \${getField('trendingLabel')};

  const toggleFollow = () => { setIsFollowing(!isFollowing); console.log(\\\`Hashtag #\\\${hashtag.tag} \\\${isFollowing ? 'unfollowed' : 'followed'}\\\`); };
  const handleShare = () => { console.log(\\\`Share hashtag #\\\${hashtag.tag}\\\`); };
  const handleViewPosts = () => { console.log(\\\`View posts for #\\\${hashtag.tag}\\\`); };

  return (
    <div className={cn("max-w-2xl mx-auto", className)}>
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Hash className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">#{hashtag.tag}</h1>
              {hashtag.trending && (
                <Badge className="bg-white/20 text-white border-white/30">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {trendingLabel}
                </Badge>
              )}
            </div>
          </div>
          {hashtag.description && (
            <p className="text-white/90 mb-4">{hashtag.description}</p>
          )}
          <div className="flex items-center gap-6 mb-6">
            <div><span className="text-2xl font-bold">{hashtag.postCount.toLocaleString()}</span><p className="text-sm text-white/80">{postsLabel}</p></div>
            <div><span className="text-2xl font-bold">{hashtag.followerCount.toLocaleString()}</span><p className="text-sm text-white/80">{followersLabel}</p></div>
          </div>
          <div className="flex gap-3">
            <button onClick={toggleFollow} className={\\\`px-6 py-2 rounded-lg font-medium transition-colors \\\${isFollowing ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-white text-purple-600 hover:bg-gray-100'}\\\`}>
              {isFollowing ? followingButton : followButton}
            </button>
            <button onClick={handleShare} className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center gap-2">
              <Share2 className="h-4 w-4" />{shareButton}
            </button>
          </div>
        </div>
        <div className="p-6">
          <button onClick={handleViewPosts} className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
            {viewPostsButton}<ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </Card>
    </div>
  );
};
export default HashtagTag;
    `,
    
    trending: `
${commonImports}
import { Hash, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';

interface TrendingHashtagsProps { \${dataName}?: any; className?: string; }

const TrendingHashtags: React.FC<TrendingHashtagsProps> = ({ \${dataName}: propData, className }) => {
  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return response?.data || response;
      } catch (err) {
        console.error('Failed to fetch trending hashtags:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  // Use prop data if available, otherwise use fetched data
  const \${dataName} = propData || fetchedData || {};

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <p className="ml-2 text-gray-500">Loading trending...</p>
      </div>
    );
  }

  const hashtagData = \${dataName} || {};
  const title = \${getField('trendingTitle')};
  const subtitle = \${getField('trendingSubtitle')};
  const trendingHashtags = \${getField('trendingHashtags')};
  const postsLabel = \${getField('postsLabel')};

  return (
    <div className={cn("", className)}>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>
      <Card>
        <div className="divide-y dark:divide-gray-700">
          {trendingHashtags.map((hashtag: any, index: number) => (
            <div key={hashtag.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-gray-400 dark:text-gray-600 w-8">{index + 1}</div>
                <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Hash className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-gray-900 dark:text-white">#{hashtag.tag}</p>
                    {hashtag.trending && <TrendingUp className="h-4 w-4 text-red-500" />}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{hashtag.postCount.toLocaleString()} {postsLabel}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                    <ArrowUp className="h-4 w-4" />{hashtag.change}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
export default TrendingHashtags;
    `,
    
    detailed: `
${commonImports}
import { Hash, Heart, MessageCircle, TrendingUp, Users } from 'lucide-react';

interface DetailedHashtagProps { \${dataName}?: any; className?: string; }

const DetailedHashtag: React.FC<DetailedHashtagProps> = ({ \${dataName}: propData, className }) => {
  const [isFollowing, setIsFollowing] = useState(false);

  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return response?.data || response;
      } catch (err) {
        console.error('Failed to fetch hashtag data:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  // Use prop data if available, otherwise use fetched data
  const \${dataName} = propData || fetchedData || {};

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <p className="ml-2 text-gray-500">Loading hashtag...</p>
      </div>
    );
  }

  const hashtagData = \${dataName} || {};
  const title = \${getField('detailedTitle')};
  const subtitle = \${getField('detailedSubtitle')};
  const hashtag = \${getField('hashtag')};
  const relatedHashtags = \${getField('relatedHashtags')};
  const recentPosts = \${getField('recentPosts')};
  const followButton = \${getField('followButton')};
  const followingButton = \${getField('followingButton')};
  const postsLabel = \${getField('postsLabel')};
  const relatedHashtagsLabel = \${getField('relatedHashtagsLabel')};
  const recentPostsLabel = \${getField('recentPostsLabel')};

  return (
    <div className={cn("", className)}>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Hash className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">#{hashtag.tag}</h1>
                  <p className="text-gray-600 dark:text-gray-400">{hashtag.category}</p>
                </div>
              </div>
              <button onClick={() => setIsFollowing(!isFollowing)} className={\\\`px-4 py-2 rounded-lg font-medium transition-colors \\\${isFollowing ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white' : 'bg-purple-600 text-white hover:bg-purple-700'}\\\`}>
                {isFollowing ? followingButton : followButton}
              </button>
            </div>
            {hashtag.description && <p className="text-gray-700 dark:text-gray-300 mb-6">{hashtag.description}</p>}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4"><p className="text-2xl font-bold text-purple-600">{hashtag.postCount.toLocaleString()}</p><p className="text-sm text-gray-600 dark:text-gray-400">{postsLabel}</p></Card>
              <Card className="p-4"><p className="text-2xl font-bold text-blue-600">{hashtag.followerCount.toLocaleString()}</p><p className="text-sm text-gray-600 dark:text-gray-400">Followers</p></Card>
              <Card className="p-4"><p className="text-2xl font-bold text-red-600">#{hashtag.rank}</p><p className="text-sm text-gray-600 dark:text-gray-400">Rank</p></Card>
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{recentPostsLabel}</h3>
            <div className="space-y-4">
              {recentPosts.map((post: any) => (
                <div key={post.id} className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{post.author.name}</p>
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">{post.content}</p>
                    {post.image && <img src={post.image} alt="Post" className="w-full h-32 object-cover rounded-lg mb-2" />}
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1"><Heart className="h-4 w-4" />{post.likes}</div>
                      <span>{post.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div>
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{relatedHashtagsLabel}</h3>
            <div className="space-y-3">
              {relatedHashtags.map((tag: any) => (
                <button key={tag.tag} className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">#{tag.tag}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{tag.postCount.toLocaleString()}</span>
                    {tag.trending && <TrendingUp className="h-4 w-4 text-red-500" />}
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default DetailedHashtag;
    `
  };
  return variants[variant] || variants.tag;
};
