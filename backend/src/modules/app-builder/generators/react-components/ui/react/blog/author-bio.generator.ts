import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateAuthorBio = (
  resolved: ResolvedComponent,
  variant: 'card' | 'inline' | 'sidebar' = 'card'
) => {
  const dataSource = resolved.dataSource;
  const colorScheme = resolved.uiStyle?.colorScheme || 'blue';

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
    return `/${dataSource || 'authors'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource || 'authors';

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';`;

  const variants = {
    card: `
${commonImports}
import { Twitter, Github, Linkedin, Globe, MapPin, Briefcase, ArrowRight, UserPlus, UserCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

interface CardBioProps {
  data?: any;
  className?: string;
  onFollow?: (isFollowing: boolean) => void;
  onViewAllPosts?: () => void;
  onSocialClick?: (platform: string, url: string) => void;
  onAuthorClick?: (authorName: string) => void;
  onPostClick?: (item: any) => void;
  onReadMore?: (itemId: string | number, item?: any) => void;
  onReadArticle?: (itemId: string | number, item?: any) => void;
  onCategoryClick?: (category: string) => void;
  onTagClick?: (tag: string) => void;
}

const CardAuthorBio: React.FC<CardBioProps> = ({
  data: propData,
  className,
  onFollow,
  onViewAllPosts,
  onSocialClick,
  onAuthorClick
}) => {
  const [isFollowing, setIsFollowing] = useState(false);

  // Dynamic data fetching
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response[0] : (response?.data?.[0] || response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const postsData = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const bioData = postsData || {};

  const title = postsData?.cardTitle || 'About the Author';
  const authorName = postsData?.authorName || postsData?.author?.name || 'Author';
  const authorAvatar = postsData?.authorAvatar || postsData?.author?.avatar || 'https://ui-avatars.com/api/?name=Author&background=0D8ABC&color=fff';
  const authorBio = postsData?.authorBio || postsData?.author?.bio || 'No bio available';
  const authorRole = postsData?.authorRole || postsData?.author?.role || 'Writer';
  const authorCompany = postsData?.authorCompany || postsData?.author?.company || 'Company';
  const authorLocation = postsData?.authorLocation || postsData?.author?.location || 'Location';
  const postCount = postsData?.postCount || 0;
  const followersCount = postsData?.followersCount || 0;
  const followingCount = postsData?.followingCount || 0;
  const socialLinks = postsData?.socialLinks || ([] as any[]);
  const postsLabel = postsData?.postsLabel || 'Posts';
  const followersLabel = postsData?.followersLabel || 'Followers';
  const followingLabel = postsData?.followingLabel || 'Following';
  const viewAllPostsLabel = postsData?.viewAllPostsLabel || 'View All Posts';
  const followLabel = postsData?.followLabel || 'Follow';
  const followingLabelButton = postsData?.followingLabelButton || 'Following';

  const handleFollow = () => {
    const newFollowingState = !isFollowing;
    setIsFollowing(newFollowingState);
    if (onFollow) {
      onFollow(newFollowingState);
    } else {
      console.log('Follow toggled:', newFollowingState);
    }
  };

  const handleViewAllPosts = () => {
    if (onViewAllPosts) {
      onViewAllPosts();
    } else {
      console.log('View all posts clicked');
    }
  };

  const handleSocialClick = (platform: string, url: string) => {
    if (onSocialClick) {
      onSocialClick(platform, url);
    } else {
      console.log('Social link clicked:', platform, url);
      window.open(url, '_blank');
    }
  };

  const handleAuthorClick = () => {
    if (onAuthorClick) {
      onAuthorClick(authorName);
    } else {
      console.log('Author clicked:', authorName);
    }
  };

  const getIcon = (iconName: string) => {
    const icons: any = {
      Twitter: Twitter,
      Github: Github,
      Linkedin: Linkedin,
      Globe: Globe
    };
    return icons[iconName] || Globe;
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-0">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-${colorScheme}-600 to-${colorScheme}-600 h-24" />

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="-mt-12 mb-4">
            <img
              src={authorAvatar}
              alt={authorName}
              onClick={handleAuthorClick}
              className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-900 object-cover cursor-pointer hover:ring-4 hover:ring-blue-400 transition-all"
            />
          </div>

          {/* Name and Title */}
          <div className="mb-4">
            <h3
              onClick={handleAuthorClick}
              className="text-2xl font-bold text-gray-900 dark:text-white mb-1 cursor-pointer hover:text-${colorScheme}-600 transition-colors"
            >
              {authorName}
            </h3>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
              <Briefcase className="h-4 w-4" />
              <span>{authorRole} at {authorCompany}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
              <MapPin className="h-4 w-4" />
              <span>{authorLocation}</span>
            </div>
          </div>

          {/* Bio */}
          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            {authorBio}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b dark:border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{postCount}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{postsLabel}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {followersCount >= 1000 ? \`\${(followersCount / 1000).toFixed(1)}k\` : followersCount}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{followersLabel}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{followingCount}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{followingLabel}</div>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center justify-center gap-3 mb-6">
            {socialLinks.map((link: SocialLink, index: number) => {
              const Icon = getIcon(link.icon);
              return (
                <button
                  key={index}
                  onClick={() => handleSocialClick(link.platform, link.url)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400 hover:text-${colorScheme}-600 dark:hover:text-${colorScheme}-400"
                  title={link.platform}
                >
                  <Icon className="h-5 w-5" />
                </button>
              );
            })}
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={handleFollow}
              className={\`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-colors \${
                isFollowing
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  : 'bg-${colorScheme}-600 text-white hover:bg-${colorScheme}-700'
              }\`}
            >
              {isFollowing ? (
                <>
                  <UserCheck className="h-4 w-4" />
                  {followingLabelButton}
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  {followLabel}
                </>
              )}
            </button>
            <button
              onClick={handleViewAllPosts}
              className="w-full flex items-center justify-center gap-2 py-2.5 border dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {viewAllPostsLabel}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CardAuthorBio;
    `,

    inline: `
${commonImports}
import { Twitter, Github, Linkedin, Globe, UserPlus, UserCheck } from 'lucide-react';

interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

interface InlineBioProps {
  data?: any;
  className?: string;
  onFollow?: (isFollowing: boolean) => void;
  onViewAllPosts?: () => void;
  onSocialClick?: (platform: string, url: string) => void;
  onAuthorClick?: (authorName: string) => void;
  onPostClick?: (item: any) => void;
  onReadMore?: (itemId: string | number, item?: any) => void;
  onReadArticle?: (itemId: string | number, item?: any) => void;
}

const InlineAuthorBio: React.FC<InlineBioProps> = ({
  ${dataName}: propData,
  className,
  onFollow,
  onViewAllPosts,
  onSocialClick,
  onAuthorClick
}) => {
  const [isFollowing, setIsFollowing] = useState(false);

  // Dynamic data fetching
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response[0] : (response?.data?.[0] || response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const postsData = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const bioData = postsData || {};

  const title = postsData?.inlineTitle || 'About the Author';
  const authorName = postsData?.authorName || postsData?.author?.name || 'Author';
  const authorAvatar = postsData?.authorAvatar || postsData?.author?.avatar || 'https://ui-avatars.com/api/?name=Author&background=0D8ABC&color=fff';
  const authorBio = postsData?.authorBio || postsData?.author?.bio || 'No bio available';
  const authorRole = postsData?.authorRole || postsData?.author?.role || 'Writer';
  const postCount = postsData?.postCount || 0;
  const socialLinks = postsData?.socialLinks || ([] as any[]);
  const viewAllPostsLabel = postsData?.viewAllPostsLabel || 'View All Posts';
  const followLabel = postsData?.followLabel || 'Follow';
  const followingLabelButton = postsData?.followingLabelButton || 'Following';
  const postsLabel = postsData?.postsLabel || 'Posts';

  const handleFollow = () => {
    const newFollowingState = !isFollowing;
    setIsFollowing(newFollowingState);
    if (onFollow) {
      onFollow(newFollowingState);
    } else {
      console.log('Follow toggled:', newFollowingState);
    }
  };

  const handleViewAllPosts = () => {
    if (onViewAllPosts) {
      onViewAllPosts();
    } else {
      console.log('View all posts clicked');
    }
  };

  const handleSocialClick = (platform: string, url: string) => {
    if (onSocialClick) {
      onSocialClick(platform, url);
    } else {
      console.log('Social link clicked:', platform, url);
      window.open(url, '_blank');
    }
  };

  const handleAuthorClick = () => {
    if (onAuthorClick) {
      onAuthorClick(authorName);
    } else {
      console.log('Author clicked:', authorName);
    }
  };

  const getIcon = (iconName: string) => {
    const icons: any = {
      Twitter: Twitter,
      Github: Github,
      Linkedin: Linkedin,
      Globe: Globe
    };
    return icons[iconName] || Globe;
  };

  return (
    <div className={cn("bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6", className)}>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{title}</p>

      <div className="flex gap-4">
        <img
          src={authorAvatar}
          alt={authorName}
          onClick={handleAuthorClick}
          className="w-20 h-20 rounded-full object-cover cursor-pointer hover:ring-4 hover:ring-blue-400 transition-all flex-shrink-0"
        />

        <div className="flex-1">
          <h4
            onClick={handleAuthorClick}
            className="text-xl font-bold text-gray-900 dark:text-white mb-1 cursor-pointer hover:text-${colorScheme}-600 transition-colors"
          >
            {authorName}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{authorRole}</p>
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 leading-relaxed">
            {authorBio}
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">{postCount}</span> {postsLabel}
            </span>

            <div className="flex items-center gap-2">
              {socialLinks.map((link: SocialLink, index: number) => {
                const Icon = getIcon(link.icon);
                return (
                  <button
                    key={index}
                    onClick={() => handleSocialClick(link.platform, link.url)}
                    className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400 hover:text-${colorScheme}-600 dark:hover:text-${colorScheme}-400"
                    title={link.platform}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleFollow}
              className={\`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors \${
                isFollowing
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  : 'bg-${colorScheme}-600 text-white hover:bg-${colorScheme}-700'
              }\`}
            >
              {isFollowing ? (
                <>
                  <UserCheck className="h-4 w-4" />
                  {followingLabelButton}
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  {followLabel}
                </>
              )}
            </button>
            <button
              onClick={handleViewAllPosts}
              className="px-4 py-2 border dark:border-gray-600 rounded-lg font-medium text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {viewAllPostsLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InlineAuthorBio;
    `,

    sidebar: `
${commonImports}
import { Twitter, Github, Linkedin, Globe, ArrowRight } from 'lucide-react';

interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

interface SidebarBioProps {
  data?: any;
  className?: string;
  onViewAllPosts?: () => void;
  onSocialClick?: (platform: string, url: string) => void;
  onAuthorClick?: (authorName: string) => void;
  onPostClick?: (item: any) => void;
  onReadMore?: (itemId: string | number, item?: any) => void;
  onReadArticle?: (itemId: string | number, item?: any) => void;
}

const SidebarAuthorBio: React.FC<SidebarBioProps> = ({
  ${dataName}: propData,
  className,
  onViewAllPosts,
  onSocialClick,
  onAuthorClick
}) => {
  // Dynamic data fetching
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response[0] : (response?.data?.[0] || response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const postsData = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const bioData = postsData || {};

  const title = postsData?.sidebarTitle || 'About the Author';
  const authorName = postsData?.authorName || postsData?.author?.name || 'Author';
  const authorAvatar = postsData?.authorAvatar || postsData?.author?.avatar || 'https://ui-avatars.com/api/?name=Author&background=0D8ABC&color=fff';
  const authorBio = postsData?.authorBio || postsData?.author?.bio || 'No bio available';
  const postCount = postsData?.postCount || 0;
  const socialLinks = postsData?.socialLinks || ([] as any[]);
  const viewAllPostsLabel = postsData?.viewAllPostsLabel || 'View All Posts';
  const postsLabel = postsData?.postsLabel || 'Posts';

  const handleViewAllPosts = () => {
    if (onViewAllPosts) {
      onViewAllPosts();
    } else {
      console.log('View all posts clicked');
    }
  };

  const handleSocialClick = (platform: string, url: string) => {
    if (onSocialClick) {
      onSocialClick(platform, url);
    } else {
      console.log('Social link clicked:', platform, url);
      window.open(url, '_blank');
    }
  };

  const handleAuthorClick = () => {
    if (onAuthorClick) {
      onAuthorClick(authorName);
    } else {
      console.log('Author clicked:', authorName);
    }
  };

  const getIcon = (iconName: string) => {
    const icons: any = {
      Twitter: Twitter,
      Github: Github,
      Linkedin: Linkedin,
      Globe: Globe
    };
    return icons[iconName] || Globe;
  };

  return (
    <aside className={cn("w-64", className)}>
      <div className="sticky top-24">
        <div className="bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-700 p-4">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            {title}
          </h4>

          <div className="text-center mb-4">
            <img
              src={authorAvatar}
              alt={authorName}
              onClick={handleAuthorClick}
              className="w-20 h-20 rounded-full object-cover mx-auto mb-3 cursor-pointer hover:ring-4 hover:ring-blue-400 transition-all"
            />
            <h5
              onClick={handleAuthorClick}
              className="font-bold text-gray-900 dark:text-white mb-1 cursor-pointer hover:text-${colorScheme}-600 transition-colors"
            >
              {authorName}
            </h5>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {postCount} {postsLabel}
            </p>
          </div>

          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            {authorBio}
          </p>

          <div className="flex items-center justify-center gap-2 mb-4 pb-4 border-b dark:border-gray-700">
            {socialLinks.map((link: SocialLink, index: number) => {
              const Icon = getIcon(link.icon);
              return (
                <button
                  key={index}
                  onClick={() => handleSocialClick(link.platform, link.url)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400 hover:text-${colorScheme}-600 dark:hover:text-${colorScheme}-400"
                  title={link.platform}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>

          <button
            onClick={handleViewAllPosts}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-${colorScheme}-600 dark:text-${colorScheme}-400 hover:bg-${colorScheme}-50 dark:hover:bg-${colorScheme}-900/20 rounded-lg transition-colors font-medium"
          >
            {viewAllPostsLabel}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default SidebarAuthorBio;
    `
  };

  return variants[variant] || variants.card;
};
