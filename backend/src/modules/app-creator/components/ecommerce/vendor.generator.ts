/**
 * Vendor Component Generators for Ecommerce
 *
 * Generates vendor/seller components:
 * - VendorCard: Display vendor info in card format
 * - VendorHeader: Header for vendor profile/store page
 */

export interface VendorCardOptions {
  componentName?: string;
  showRating?: boolean;
  showProductCount?: boolean;
  showFollowButton?: boolean;
  showVerifiedBadge?: boolean;
  linkToVendor?: boolean;
  vendorRoute?: string;
}

/**
 * Generate a VendorCard component
 */
export function generateVendorCard(options: VendorCardOptions = {}): string {
  const {
    componentName = 'VendorCard',
    showRating = true,
    showProductCount = true,
    showFollowButton = true,
    showVerifiedBadge = true,
    linkToVendor = true,
    vendorRoute = '/vendors/:id',
  } = options;

  return `import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Star,
  CheckCircle2,
  MapPin,
  Package,
  Users,
  MessageCircle,
  Heart,
  Store,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Vendor {
  id: string;
  name: string;
  slug?: string;
  logo?: string;
  cover_image?: string;
  description?: string;
  location?: string;
  rating?: number;
  review_count?: number;
  product_count?: number;
  follower_count?: number;
  is_verified?: boolean;
  is_following?: boolean;
  joined_date?: string;
  response_time?: string;
}

interface ${componentName}Props {
  vendor: Vendor;
  className?: string;
  variant?: 'default' | 'compact' | 'horizontal';
  onClick?: (vendor: Vendor) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  vendor,
  className,
  variant = 'default',
  onClick,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isFollowing, setIsFollowing] = useState(vendor.is_following || false);

  const followMutation = useMutation({
    mutationFn: async () => {
      if (isFollowing) {
        await api.delete(\`/vendors/\${vendor.id}/follow\`);
      } else {
        await api.post(\`/vendors/\${vendor.id}/follow\`, {});
      }
    },
    onMutate: () => {
      setIsFollowing(!isFollowing);
    },
    onSuccess: () => {
      toast.success(isFollowing ? 'Now following this vendor' : 'Unfollowed vendor');
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
    onError: () => {
      setIsFollowing(!isFollowing);
      toast.error('Failed to update follow status');
    },
  });

  const handleClick = () => {
    if (onClick) {
      onClick(vendor);
    } else ${linkToVendor ? `{
      const route = '${vendorRoute}'.replace(':id', vendor.slug || vendor.id);
      navigate(route);
    }` : '{}'}
  };

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    followMutation.mutate();
  };

  const StarRating = ({ rating, reviewCount }: { rating: number; reviewCount?: number }) => (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              "w-4 h-4",
              i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"
            )}
          />
        ))}
      </div>
      {reviewCount !== undefined && (
        <span className="text-sm text-gray-500 dark:text-gray-400">({reviewCount})</span>
      )}
    </div>
  );

  if (variant === 'compact') {
    return (
      <div
        onClick={handleClick}
        className={cn(
          "flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-all",
          className
        )}
      >
        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
          {vendor.logo ? (
            <img src={vendor.logo} alt={vendor.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Store className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 dark:text-white truncate">{vendor.name}</h3>
            ${showVerifiedBadge ? `{vendor.is_verified && (
              <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
            )}` : ''}
          </div>
          ${showRating ? `{vendor.rating !== undefined && (
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{vendor.rating.toFixed(1)}</span>
            </div>
          )}` : ''}
        </div>
        <ExternalLink className="w-4 h-4 text-gray-400" />
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div
        onClick={handleClick}
        className={cn(
          "flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-all",
          className
        )}
      >
        <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
          {vendor.logo ? (
            <img src={vendor.logo} alt={vendor.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Store className="w-10 h-10 text-gray-400" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{vendor.name}</h3>
            ${showVerifiedBadge ? `{vendor.is_verified && (
              <CheckCircle2 className="w-5 h-5 text-blue-500" />
            )}` : ''}
          </div>

          {vendor.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">
              {vendor.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            ${showRating ? `{vendor.rating !== undefined && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{vendor.rating.toFixed(1)} ({vendor.review_count || 0})</span>
              </div>
            )}` : ''}
            ${showProductCount ? `{vendor.product_count !== undefined && (
              <div className="flex items-center gap-1">
                <Package className="w-4 h-4" />
                <span>{vendor.product_count} products</span>
              </div>
            )}` : ''}
            {vendor.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{vendor.location}</span>
              </div>
            )}
          </div>
        </div>

        ${showFollowButton ? `<button
          onClick={handleFollow}
          className={cn(
            "flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-colors",
            isFollowing
              ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              : "bg-blue-600 text-white hover:bg-blue-700"
          )}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>` : ''}
      </div>
    );
  }

  // Default card variant
  return (
    <div
      onClick={handleClick}
      className={cn(
        "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-lg transition-all group",
        className
      )}
    >
      {/* Cover Image */}
      <div className="relative h-24 bg-gradient-to-r from-blue-500 to-purple-500">
        {vendor.cover_image && (
          <img
            src={vendor.cover_image}
            alt=""
            className="w-full h-full object-cover"
          />
        )}
        {/* Logo */}
        <div className="absolute -bottom-8 left-4">
          <div className="w-16 h-16 rounded-xl bg-white dark:bg-gray-800 border-4 border-white dark:border-gray-800 overflow-hidden shadow-lg">
            {vendor.logo ? (
              <img src={vendor.logo} alt={vendor.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                <Store className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-10 p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {vendor.name}
              </h3>
              ${showVerifiedBadge ? `{vendor.is_verified && (
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
              )}` : ''}
            </div>
            {vendor.location && (
              <div className="flex items-center gap-1 mt-1 text-sm text-gray-500 dark:text-gray-400">
                <MapPin className="w-3.5 h-3.5" />
                <span>{vendor.location}</span>
              </div>
            )}
          </div>
        </div>

        {vendor.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
            {vendor.description}
          </p>
        )}

        ${showRating ? `{/* Rating */}
        {vendor.rating !== undefined && (
          <div className="mb-4">
            <StarRating rating={vendor.rating} reviewCount={vendor.review_count} />
          </div>
        )}` : ''}

        {/* Stats */}
        <div className="flex items-center gap-4 py-3 border-t border-gray-200 dark:border-gray-700 text-sm">
          ${showProductCount ? `<div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
            <Package className="w-4 h-4" />
            <span>{vendor.product_count || 0} products</span>
          </div>` : ''}
          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
            <Users className="w-4 h-4" />
            <span>{vendor.follower_count || 0} followers</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          ${showFollowButton ? `<button
            onClick={handleFollow}
            className={cn(
              "flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2",
              isFollowing
                ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                : "bg-blue-600 text-white hover:bg-blue-700"
            )}
          >
            <Heart className={cn("w-4 h-4", isFollowing && "fill-current")} />
            {isFollowing ? 'Following' : 'Follow'}
          </button>` : ''}
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Handle message action
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export interface VendorHeaderOptions {
  componentName?: string;
  showStats?: boolean;
  showContactInfo?: boolean;
  showSocialLinks?: boolean;
  showFollowButton?: boolean;
  endpoint?: string;
}

/**
 * Generate a VendorHeader component for vendor profile pages
 */
export function generateVendorHeader(options: VendorHeaderOptions = {}): string {
  const {
    componentName = 'VendorHeader',
    showStats = true,
    showContactInfo = true,
    showSocialLinks = true,
    showFollowButton = true,
    endpoint = '/vendors',
  } = options;

  return `import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Store,
  Star,
  CheckCircle2,
  MapPin,
  Package,
  Users,
  Calendar,
  Clock,
  Mail,
  Phone,
  Globe,
  Heart,
  Share2,
  MessageCircle,
  Loader2,
  Facebook,
  Twitter,
  Instagram
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Vendor {
  id: string;
  name: string;
  slug?: string;
  logo?: string;
  cover_image?: string;
  description?: string;
  location?: string;
  rating?: number;
  review_count?: number;
  product_count?: number;
  follower_count?: number;
  order_count?: number;
  is_verified?: boolean;
  is_following?: boolean;
  joined_date?: string;
  response_time?: string;
  email?: string;
  phone?: string;
  website?: string;
  social_links?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
}

interface ${componentName}Props {
  vendor?: Vendor;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  vendor: propVendor,
  className,
}) => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  // Fetch vendor data if not provided via props
  const { data: vendor, isLoading } = useQuery({
    queryKey: ['vendor', id],
    queryFn: async () => {
      try {
        const response = await api.get<any>(\`${endpoint}/\${id}\`);
        return response?.data || response;
      } catch (err) {
        console.error('Failed to fetch vendor:', err);
        return null;
      }
    },
    enabled: !propVendor && !!id,
    initialData: propVendor,
  });

  const [isFollowing, setIsFollowing] = useState(vendor?.is_following || false);

  const followMutation = useMutation({
    mutationFn: async () => {
      if (isFollowing) {
        await api.delete(\`/vendors/\${vendor?.id}/follow\`);
      } else {
        await api.post(\`/vendors/\${vendor?.id}/follow\`, {});
      }
    },
    onMutate: () => {
      setIsFollowing(!isFollowing);
    },
    onSuccess: () => {
      toast.success(isFollowing ? 'Now following this vendor' : 'Unfollowed vendor');
      queryClient.invalidateQueries({ queryKey: ['vendor', id] });
    },
    onError: () => {
      setIsFollowing(!isFollowing);
      toast.error('Failed to update follow status');
    },
  });

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: vendor?.name,
          text: vendor?.description,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className={cn("text-center py-12", className)}>
        <Store className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Vendor not found</h3>
      </div>
    );
  }

  const joinedDate = vendor.joined_date ? new Date(vendor.joined_date) : null;

  return (
    <div className={cn("bg-white dark:bg-gray-800", className)}>
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-blue-600 to-purple-600">
        {vendor.cover_image && (
          <img
            src={vendor.cover_image}
            alt=""
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-16 md:-mt-20 pb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
            {/* Logo */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white dark:bg-gray-800 border-4 border-white dark:border-gray-800 overflow-hidden shadow-xl flex-shrink-0">
              {vendor.logo ? (
                <img src={vendor.logo} alt={vendor.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                  <Store className="w-12 h-12 md:w-16 md:h-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                      {vendor.name}
                    </h1>
                    {vendor.is_verified && (
                      <CheckCircle2 className="w-6 h-6 text-blue-500" />
                    )}
                  </div>

                  {vendor.location && (
                    <div className="flex items-center gap-1 mt-1 text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span>{vendor.location}</span>
                    </div>
                  )}

                  {/* Rating */}
                  {vendor.rating !== undefined && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {vendor.rating.toFixed(1)}
                        </span>
                      </div>
                      {vendor.review_count !== undefined && (
                        <span className="text-gray-500 dark:text-gray-400">
                          ({vendor.review_count} reviews)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  ${showFollowButton ? `<button
                    onClick={() => followMutation.mutate()}
                    disabled={followMutation.isPending}
                    className={cn(
                      "px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2",
                      isFollowing
                        ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    )}
                  >
                    <Heart className={cn("w-4 h-4", isFollowing && "fill-current")} />
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>` : ''}
                  <button
                    onClick={handleShare}
                    className="p-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button className="p-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <MessageCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {vendor.description && (
            <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-3xl">
              {vendor.description}
            </p>
          )}

          ${showStats ? `{/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                <Package className="w-4 h-4" />
                <span className="text-sm">Products</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {vendor.product_count || 0}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-sm">Followers</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {vendor.follower_count || 0}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                <Star className="w-4 h-4" />
                <span className="text-sm">Reviews</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {vendor.review_count || 0}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Joined</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {joinedDate ? joinedDate.getFullYear() : '-'}
              </p>
            </div>
          </div>` : ''}

          ${showContactInfo ? `{/* Contact Info */}
          {(vendor.email || vendor.phone || vendor.website || vendor.response_time) && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Contact & Info</h3>
              <div className="flex flex-wrap gap-4">
                {vendor.response_time && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>Usually responds in {vendor.response_time}</span>
                  </div>
                )}
                {vendor.email && (
                  <a
                    href={\`mailto:\${vendor.email}\`}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{vendor.email}</span>
                  </a>
                )}
                {vendor.phone && (
                  <a
                    href={\`tel:\${vendor.phone}\`}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{vendor.phone}</span>
                  </a>
                )}
                {vendor.website && (
                  <a
                    href={vendor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Website</span>
                  </a>
                )}
              </div>
            </div>
          )}` : ''}

          ${showSocialLinks ? `{/* Social Links */}
          {vendor.social_links && (vendor.social_links.facebook || vendor.social_links.twitter || vendor.social_links.instagram) && (
            <div className="mt-4 flex items-center gap-3">
              {vendor.social_links.facebook && (
                <a
                  href={vendor.social_links.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {vendor.social_links.twitter && (
                <a
                  href={vendor.social_links.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-500 hover:text-blue-400 dark:text-gray-400 dark:hover:text-blue-300 transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {vendor.social_links.instagram && (
                <a
                  href={vendor.social_links.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-500 hover:text-pink-600 dark:text-gray-400 dark:hover:text-pink-400 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
            </div>
          )}` : ''}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
