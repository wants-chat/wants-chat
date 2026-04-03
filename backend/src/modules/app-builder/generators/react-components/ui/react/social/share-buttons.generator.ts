import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateShareButtons = (
  resolved: ResolvedComponent,
  variant: 'horizontal' | 'vertical' | 'floating' = 'horizontal'
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
    return `/${dataSource || 'share'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'share';

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';`;

  const variants = {
    horizontal: `
${commonImports}
import { Twitter, Facebook, Linkedin, MessageSquare, MessageCircle, Mail, Link as LinkIcon, Printer, Check } from 'lucide-react';

interface Platform {
  name: string;
  icon: string;
  color: string;
  hoverColor: string;
  shareCount: number;
  url: string;
}

interface HorizontalShareProps {
  ${dataName}?: any;
  className?: string;
  onShare?: (platform: string, url: string) => void;
  onCopyLink?: (url: string) => void;
  onPrint?: () => void;
}

const HorizontalShareButtons: React.FC<HorizontalShareProps> = ({
  ${dataName}: propData,
  className,
  onShare,
  onCopyLink,
  onPrint
}) => {
  const [linkCopied, setLinkCopied] = useState(false);

  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return response?.data || response;
      } catch (err) {
        console.error('Failed to fetch share data:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  // Use prop data if available, otherwise use fetched data
  const ${dataName} = propData || fetchedData || {};

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className={cn("bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg p-6 flex items-center justify-center", className)}>
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Loading share options...</span>
      </div>
    );
  }

  const shareData = ${dataName} || {};

  const title = ${getField('horizontalTitle')};
  const platforms = ${getField('platforms')};
  const shareTitle = ${getField('shareTitle')};
  const shareUrl = ${getField('shareUrl')};
  const showCounts = ${getField('showCounts')};
  const showCopyLink = ${getField('showCopyLink')};
  const showPrint = ${getField('showPrint')};
  const copyLinkLabel = ${getField('copyLinkLabel')};
  const linkCopiedLabel = ${getField('linkCopiedLabel')};
  const printLabel = ${getField('printLabel')};
  const totalSharesLabel = ${getField('totalSharesLabel')};
  const totalShares = ${getField('totalShares')};

  const getIcon = (iconName: string) => {
    const icons: any = {
      Twitter,
      Facebook,
      Linkedin,
      MessageSquare,
      MessageCircle,
      Mail
    };
    return icons[iconName] || Twitter;
  };

  const handleShare = (platform: Platform) => {
    const url = platform.url
      .replace('{url}', encodeURIComponent(shareUrl))
      .replace('{title}', encodeURIComponent(shareTitle));

    if (onShare) {
      onShare(platform.name, url);
    } else {
      console.log('Share on:', platform.name);
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);

      if (onCopyLink) {
        onCopyLink(shareUrl);
      } else {
        console.log('Link copied:', shareUrl);
      }
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className={cn("bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        {showCounts && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {totalSharesLabel}: <span className="font-semibold text-gray-900 dark:text-white">{totalShares.toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {platforms.map((platform: Platform) => {
          const Icon = getIcon(platform.icon);
          return (
            <button
              key={platform.name}
              onClick={() => handleShare(platform)}
              className={\`flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors \${platform.color} \${platform.hoverColor}\`}
              title={\`Share on \${platform.name}\`}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium">{platform.name}</span>
              {showCounts && platform.shareCount > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {platform.shareCount}
                </span>
              )}
            </button>
          );
        })}

        {showCopyLink && (
          <button
            onClick={handleCopyLink}
            className={\`flex items-center gap-2 px-4 py-2 rounded-lg border dark:border-gray-600 transition-colors \${
              linkCopied
                ? 'bg-green-50 dark:bg-green-900/20 text-green-600 border-green-600'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }\`}
          >
            {linkCopied ? (
              <>
                <Check className="h-4 w-4" />
                <span className="font-medium">{linkCopiedLabel}</span>
              </>
            ) : (
              <>
                <LinkIcon className="h-4 w-4" />
                <span className="font-medium">{copyLinkLabel}</span>
              </>
            )}
          </button>
        )}

        {showPrint && (
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span className="font-medium">{printLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default HorizontalShareButtons;
    `,

    vertical: `
${commonImports}
import { Twitter, Facebook, Linkedin, MessageSquare, MessageCircle, Mail, Link as LinkIcon, Check } from 'lucide-react';

interface Platform {
  name: string;
  icon: string;
  color: string;
  hoverColor: string;
  shareCount: number;
  url: string;
}

interface VerticalShareProps {
  ${dataName}?: any;
  className?: string;
  onShare?: (platform: string, url: string) => void;
  onCopyLink?: (url: string) => void;
}

const VerticalShareButtons: React.FC<VerticalShareProps> = ({
  ${dataName}: propData,
  className,
  onShare,
  onCopyLink
}) => {
  const [linkCopied, setLinkCopied] = useState(false);

  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return response?.data || response;
      } catch (err) {
        console.error('Failed to fetch share data:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  // Use prop data if available, otherwise use fetched data
  const ${dataName} = propData || fetchedData || {};

  // Loading state
  if (isLoading && !propData) {
    return (
      <aside className={cn("w-16 flex items-center justify-center py-8", className)}>
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </aside>
    );
  }

  const shareData = ${dataName} || {};

  const title = ${getField('verticalTitle')};
  const platforms = ${getField('platforms')};
  const shareTitle = ${getField('shareTitle')};
  const shareUrl = ${getField('shareUrl')};
  const showCounts = ${getField('showCounts')};
  const showCopyLink = ${getField('showCopyLink')};
  const sharesLabel = ${getField('sharesLabel')};

  const getIcon = (iconName: string) => {
    const icons: any = {
      Twitter,
      Facebook,
      Linkedin,
      MessageSquare,
      MessageCircle,
      Mail
    };
    return icons[iconName] || Twitter;
  };

  const handleShare = (platform: Platform) => {
    const url = platform.url
      .replace('{url}', encodeURIComponent(shareUrl))
      .replace('{title}', encodeURIComponent(shareTitle));

    if (onShare) {
      onShare(platform.name, url);
    } else {
      console.log('Share on:', platform.name);
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);

      if (onCopyLink) {
        onCopyLink(shareUrl);
      } else {
        console.log('Link copied:', shareUrl);
      }
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <aside className={cn("w-16", className)}>
      <div className="sticky top-24">
        <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg p-2">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 text-center mb-3 px-1">
            {title}
          </div>

          <div className="space-y-2">
            {platforms.slice(0, 5).map((platform: Platform) => {
              const Icon = getIcon(platform.icon);
              return (
                <div key={platform.name} className="text-center">
                  <button
                    onClick={() => handleShare(platform)}
                    className={\`w-12 h-12 rounded-lg flex items-center justify-center text-white transition-all \${platform.color} \${platform.hoverColor} hover:scale-110\`}
                    title={platform.name}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                  {showCounts && platform.shareCount > 0 && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {platform.shareCount > 999
                        ? \`\${(platform.shareCount / 1000).toFixed(1)}k\`
                        : platform.shareCount
                      }
                    </div>
                  )}
                </div>
              );
            })}

            {showCopyLink && (
              <div className="pt-2 border-t dark:border-gray-700">
                <button
                  onClick={handleCopyLink}
                  className={\`w-12 h-12 rounded-lg flex items-center justify-center transition-all \${
                    linkCopied
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 hover:scale-110'
                  }\`}
                  title={linkCopied ? 'Copied!' : 'Copy Link'}
                >
                  {linkCopied ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <LinkIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default VerticalShareButtons;
    `,

    floating: `
${commonImports}
import { Twitter, Facebook, Linkedin, MessageSquare, MessageCircle, Mail, Link as LinkIcon, Check, Share2, X } from 'lucide-react';

interface Platform {
  name: string;
  icon: string;
  color: string;
  hoverColor: string;
  shareCount: number;
  url: string;
}

interface FloatingShareProps {
  ${dataName}?: any;
  className?: string;
  onShare?: (platform: string, url: string) => void;
  onCopyLink?: (url: string) => void;
}

const FloatingShareButtons: React.FC<FloatingShareProps> = ({
  ${dataName}: propData,
  className,
  onShare,
  onCopyLink
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return response?.data || response;
      } catch (err) {
        console.error('Failed to fetch share data:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  // Use prop data if available, otherwise use fetched data
  const ${dataName} = propData || fetchedData || {};

  const shareData = ${dataName} || {};

  const platforms = ${getField('platforms')};
  const shareTitle = ${getField('shareTitle')};
  const shareUrl = ${getField('shareUrl')};
  const showCounts = ${getField('showCounts')};
  const showCopyLink = ${getField('showCopyLink')};

  React.useEffect(() => {
    const handleScroll = () => {
      // Show floating button after scrolling 300px
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getIcon = (iconName: string) => {
    const icons: any = {
      Twitter,
      Facebook,
      Linkedin,
      MessageSquare,
      MessageCircle,
      Mail
    };
    return icons[iconName] || Twitter;
  };

  const handleShare = (platform: Platform) => {
    const url = platform.url
      .replace('{url}', encodeURIComponent(shareUrl))
      .replace('{title}', encodeURIComponent(shareTitle));

    if (onShare) {
      onShare(platform.name, url);
    } else {
      console.log('Share on:', platform.name);
      window.open(url, '_blank', 'width=600,height=400');
    }
    setIsOpen(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);

      if (onCopyLink) {
        onCopyLink(shareUrl);
      } else {
        console.log('Link copied:', shareUrl);
      }
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Main Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-40 p-4 rounded-full shadow-lg transition-all",
          isOpen
            ? "bg-gray-600 hover:bg-gray-700"
            : "bg-blue-600 hover:bg-blue-700",
          className
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <Share2 className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Share Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-30"
            onClick={() => setIsOpen(false)}
          />

          {/* Share Options */}
          <div className="fixed bottom-24 right-6 z-40 bg-white dark:bg-gray-900 rounded-lg shadow-2xl border dark:border-gray-700 p-4 w-72">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Share this article</h3>

            <div className="space-y-2">
              {platforms.map((platform: Platform) => {
                const Icon = getIcon(platform.icon);
                return (
                  <button
                    key={platform.name}
                    onClick={() => handleShare(platform)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                  >
                    <div className={\`w-10 h-10 rounded-lg flex items-center justify-center text-white \${platform.color}\`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {platform.name}
                      </div>
                      {showCounts && platform.shareCount > 0 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {platform.shareCount.toLocaleString()} shares
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}

              {showCopyLink && (
                <div className="pt-2 border-t dark:border-gray-700">
                  <button
                    onClick={handleCopyLink}
                    className={\`w-full flex items-center gap-3 p-3 rounded-lg transition-colors \${
                      linkCopied
                        ? 'bg-green-50 dark:bg-green-900/20'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }\`}
                  >
                    <div className={\`w-10 h-10 rounded-lg flex items-center justify-center \${
                      linkCopied
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }\`}>
                      {linkCopied ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <LinkIcon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className={\`font-medium \${
                        linkCopied
                          ? 'text-green-600'
                          : 'text-gray-900 dark:text-white'
                      }\`}>
                        {linkCopied ? 'Link Copied!' : 'Copy Link'}
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default FloatingShareButtons;
    `
  };

  return variants[variant] || variants.horizontal;
};
