import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateShareModalSocial = (
  resolved: ResolvedComponent,
  variant: 'simple' | 'detailed' | 'social' = 'simple'
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

  const variants = {
    simple: `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Link2, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ShareModalSocialProps {
  ${dataName}?: any;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onShare?: (platform: string) => void;
}

export default function ShareModalSocial({ ${dataName}: propData, className, isOpen = true, onClose, onShare }: ShareModalSocialProps) {
  const [copied, setCopied] = useState(false);

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
    enabled: !propData && isOpen,
    retry: 1,
  });

  // Use prop data if available, otherwise use fetched data
  const ${dataName} = propData || fetchedData || {};

  const shareData = ${dataName} || {};

  const title = ${getField('title')};
  const shareUrl = ${getField('shareUrl')};
  const platforms = ${getField('platforms')};
  const copyLinkButton = ${getField('copyLinkButton')};
  const copiedButton = ${getField('copiedButton')};
  const closeButton = ${getField('closeButton')};

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handlePlatformShare = (platformId: string) => {
    if (onShare) {
      onShare(platformId);
    }
    console.log(\`Sharing to \${platformId}\`);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className={cn("bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md", className)}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Copy Link */}
          <div className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none"
              />
              <Button
                onClick={handleCopyLink}
                className={cn(
                  "transition-all",
                  copied
                    ? "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                    : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                )}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {copiedButton}
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4 mr-2" />
                    {copyLinkButton}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Share Platforms */}
          <div className="grid grid-cols-3 gap-3">
            {platforms.map((platform: any) => (
              <button
                key={platform.id}
                onClick={() => handlePlatformShare(platform.id)}
                className="flex flex-col items-center gap-2 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  \`bg-\${platform.color}-100 dark:bg-\${platform.color}-900/20\`
                )}>
                  <div className={cn(
                    "w-6 h-6 rounded-full",
                    \`bg-\${platform.color}-600\`
                  )} />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {platform.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={handleClose}
            variant="outline"
            className="w-full dark:border-gray-600 dark:text-gray-300"
          >
            {closeButton}
          </Button>
        </div>
      </div>
    </div>
  );
}
    `,

    detailed: `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Link2, Check, Mail, MessageSquare, QrCode, Code, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ShareModalSocialProps {
  ${dataName}?: any;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onShare?: (platform: string) => void;
}

export default function ShareModalSocial({ ${dataName}: propData, className, isOpen = true, onClose, onShare }: ShareModalSocialProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);

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
    enabled: !propData && isOpen,
    retry: 1,
  });

  // Use prop data if available, otherwise use fetched data
  const ${dataName} = propData || fetchedData || {};

  const shareData = ${dataName} || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const shareUrl = ${getField('shareUrl')};
  const platforms = ${getField('platforms')};
  const copyLinkButton = ${getField('copyLinkButton')};
  const copiedButton = ${getField('copiedButton')};
  const shareViaEmailButton = ${getField('shareViaEmailButton')};
  const shareViaMessageButton = ${getField('shareViaMessageButton')};
  const generateQRButton = ${getField('generateQRButton')};
  const getEmbedCodeButton = ${getField('getEmbedCodeButton')};
  const closeButton = ${getField('closeButton')};

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handlePlatformShare = (platformId: string) => {
    if (onShare) {
      onShare(platformId);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className={cn("bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg", className)}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Copy Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Share Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none"
              />
              <Button
                onClick={handleCopyLink}
                className={cn(
                  "transition-all",
                  copied
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-600 hover:bg-blue-700"
                )}
              >
                {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Share Platforms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Share to Social Media
            </label>
            <div className="grid grid-cols-3 gap-3">
              {platforms.map((platform: any) => (
                <button
                  key={platform.id}
                  onClick={() => handlePlatformShare(platform.id)}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-blue-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">
                    {platform.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Additional Share Options */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="justify-start dark:border-gray-600 dark:text-gray-300"
            >
              <Mail className="w-4 h-4 mr-2" />
              {shareViaEmailButton}
            </Button>
            <Button
              variant="outline"
              className="justify-start dark:border-gray-600 dark:text-gray-300"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              {shareViaMessageButton}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowQR(!showQR)}
              className="justify-start dark:border-gray-600 dark:text-gray-300"
            >
              <QrCode className="w-4 h-4 mr-2" />
              {generateQRButton}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowEmbed(!showEmbed)}
              className="justify-start dark:border-gray-600 dark:text-gray-300"
            >
              <Code className="w-4 h-4 mr-2" />
              {getEmbedCodeButton}
            </Button>
          </div>

          {/* QR Code Display */}
          {showQR && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <div className="w-48 h-48 mx-auto bg-white rounded-lg flex items-center justify-center mb-3">
                <div className="w-40 h-40 bg-gray-200 dark:bg-gray-600 rounded" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">QR Code for {shareUrl}</p>
            </div>
          )}

          {/* Embed Code Display */}
          {showEmbed && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <code className="block p-3 bg-gray-900 text-green-400 rounded text-xs overflow-x-auto">
                {'<iframe src="' + shareUrl + '" width="600" height="400"></iframe>'}
              </code>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={handleClose}
            variant="outline"
            className="w-full dark:border-gray-600 dark:text-gray-300"
          >
            {closeButton}
          </Button>
        </div>
      </div>
    </div>
  );
}
    `,

    social: `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Link2, Check, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ShareModalSocialProps {
  ${dataName}?: any;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onShare?: (platform: string) => void;
}

export default function ShareModalSocial({ ${dataName}: propData, className, isOpen = true, onClose, onShare }: ShareModalSocialProps) {
  const [copied, setCopied] = useState(false);

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
    enabled: !propData && isOpen,
    retry: 1,
  });

  // Use prop data if available, otherwise use fetched data
  const ${dataName} = propData || fetchedData || {};

  const shareData = ${dataName} || {};

  const title = ${getField('title')};
  const shareUrl = ${getField('shareUrl')};
  const shareTitle = ${getField('shareTitle')};
  const shareDescription = ${getField('shareDescription')};
  const shareCount = ${getField('shareCount')};
  const platforms = ${getField('platforms')};
  const copyLinkButton = ${getField('copyLinkButton')};
  const copiedButton = ${getField('copiedButton')};
  const closeButton = ${getField('closeButton')};
  const shareCountLabel = ${getField('shareCountLabel')};

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handlePlatformShare = (platformId: string) => {
    if (onShare) {
      onShare(platformId);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className={cn("bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-xl", className)}>
        {/* Header with Preview */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Share Preview Card */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{shareTitle}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{shareDescription}</p>
          </div>

          {/* Share Stats */}
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Users className="w-4 h-4" />
            <span>{shareCount} {shareCountLabel}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Copy Link */}
          <div className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none text-sm"
              />
              <Button
                onClick={handleCopyLink}
                className={cn(
                  "transition-all",
                  copied
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-600 hover:bg-blue-700"
                )}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {copiedButton}
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4 mr-2" />
                    {copyLinkButton}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Share Platforms */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Share to your network
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {platforms.map((platform: any) => (
                <button
                  key={platform.id}
                  onClick={() => handlePlatformShare(platform.id)}
                  className="group relative flex flex-col items-center gap-2 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 transition-all hover:shadow-lg"
                >
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110",
                    \`bg-\${platform.color}-100 dark:bg-\${platform.color}-900/20\`
                  )}>
                    <div className={cn(
                      "w-6 h-6 rounded-full",
                      \`bg-\${platform.color}-600\`
                    )} />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {platform.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.simple;
};
