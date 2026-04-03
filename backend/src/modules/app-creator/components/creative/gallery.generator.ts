/**
 * Gallery Component Generators for Creative/Design Apps
 *
 * Generates gallery-related components including:
 * - GalleryStats - Stats dashboard for gallery metrics
 * - SalesStatsGallery - Sales statistics for art galleries
 * - ArtworkFilters - Filter components for artwork
 * - PhotoGallery - Photo gallery grid with lightbox
 */

export interface GalleryGeneratorOptions {
  componentName?: string;
  endpoint?: string;
  queryKey?: string;
}

/**
 * Generate GalleryStats component - displays key metrics for galleries
 */
export function generateGalleryStats(options: GalleryGeneratorOptions = {}): string {
  const {
    componentName = 'GalleryStats',
    endpoint = '/gallery/stats',
    queryKey = 'gallery-stats',
  } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Image,
  Eye,
  Heart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Loader2,
  Users,
  ShoppingCart,
  Star,
} from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
  galleryId?: string;
}

interface StatItem {
  key: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  format?: 'number' | 'currency' | 'percentage';
}

const statsConfig: StatItem[] = [
  { key: 'totalArtworks', label: 'Total Artworks', icon: Image, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  { key: 'totalViews', label: 'Total Views', icon: Eye, color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  { key: 'totalLikes', label: 'Total Likes', icon: Heart, color: 'text-pink-600 dark:text-pink-400', bgColor: 'bg-pink-100 dark:bg-pink-900/30' },
  { key: 'totalRevenue', label: 'Total Revenue', icon: DollarSign, color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/30', format: 'currency' },
  { key: 'totalCollectors', label: 'Collectors', icon: Users, color: 'text-indigo-600 dark:text-indigo-400', bgColor: 'bg-indigo-100 dark:bg-indigo-900/30' },
  { key: 'averageRating', label: 'Average Rating', icon: Star, color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
  { key: 'totalSales', label: 'Total Sales', icon: ShoppingCart, color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' },
  { key: 'conversionRate', label: 'Conversion Rate', icon: TrendingUp, color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-900/30', format: 'percentage' },
];

const ${componentName}: React.FC<${componentName}Props> = ({ className, galleryId }) => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['${queryKey}', galleryId],
    queryFn: async () => {
      const url = galleryId ? '${endpoint}?gallery_id=' + galleryId : '${endpoint}';
      const response = await api.get<any>(url);
      return response?.data || response || {};
    },
  });

  const formatValue = (value: any, format?: string) => {
    if (value === undefined || value === null) return '-';
    if (format === 'currency') return '$' + Number(value).toLocaleString();
    if (format === 'percentage') return Number(value).toFixed(1) + '%';
    return Number(value).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className={\`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 \${className || ''}\`}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
        <p className="text-red-600 dark:text-red-400">Failed to load gallery statistics</p>
      </div>
    );
  }

  return (
    <div className={\`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 \${className || ''}\`}>
      {statsConfig.map((stat) => {
        const Icon = stat.icon;
        const value = stats?.[stat.key];
        const change = stats?.[stat.key + 'Change'];

        return (
          <div
            key={stat.key}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={\`p-3 rounded-lg \${stat.bgColor}\`}>
                <Icon className={\`w-6 h-6 \${stat.color}\`} />
              </div>
              {change !== undefined && (
                <div className={\`flex items-center gap-1 text-sm font-medium \${
                  change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }\`}>
                  {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(change)}%
                </div>
              )}
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {formatValue(value, stat.format)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {stat.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate SalesStatsGallery component - sales analytics for art galleries
 */
export function generateSalesStatsGallery(options: GalleryGeneratorOptions = {}): string {
  const {
    componentName = 'SalesStatsGallery',
    endpoint = '/gallery/sales-stats',
    queryKey = 'gallery-sales-stats',
  } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Loader2,
  ShoppingCart,
  Package,
  CreditCard,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
  artistId?: string;
}

type TimeRange = 'week' | 'month' | 'quarter' | 'year' | 'all';

const ${componentName}: React.FC<${componentName}Props> = ({ className, artistId }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  const { data: salesData, isLoading } = useQuery({
    queryKey: ['${queryKey}', artistId, timeRange],
    queryFn: async () => {
      let url = '${endpoint}?period=' + timeRange;
      if (artistId) url += '&artist_id=' + artistId;
      const response = await api.get<any>(url);
      return response?.data || response || {};
    },
  });

  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'all', label: 'All Time' },
  ];

  if (isLoading) {
    return (
      <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 \${className || ''}\`}>
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Sales',
      value: '$' + (salesData?.totalSales || 0).toLocaleString(),
      change: salesData?.salesChange,
      icon: DollarSign,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      label: 'Orders',
      value: (salesData?.totalOrders || 0).toLocaleString(),
      change: salesData?.ordersChange,
      icon: ShoppingCart,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: 'Artworks Sold',
      value: (salesData?.artworksSold || 0).toLocaleString(),
      change: salesData?.artworksSoldChange,
      icon: Package,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      label: 'Avg. Order Value',
      value: '$' + (salesData?.avgOrderValue || 0).toLocaleString(),
      change: salesData?.avgOrderChange,
      icon: CreditCard,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    },
  ];

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className || ''}\`}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sales Overview</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track your gallery sales performance</p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-purple-500"
            >
              {timeRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="flex items-start gap-4">
              <div className={\`p-3 rounded-lg \${stat.bgColor}\`}>
                <Icon className={\`w-6 h-6 \${stat.color}\`} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                {stat.change !== undefined && (
                  <div className={\`flex items-center gap-1 text-sm mt-1 \${
                    stat.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }\`}>
                    {stat.change >= 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {Math.abs(stat.change)}% vs last period
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Transactions */}
      {salesData?.recentTransactions && salesData.recentTransactions.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {salesData.recentTransactions.slice(0, 5).map((tx: any, index: number) => (
              <div key={tx.id || index} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    {tx.artwork_image ? (
                      <img src={tx.artwork_image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{tx.artwork_title || 'Artwork'}</p>
                    <p className="text-sm text-gray-500">{tx.buyer_name || 'Anonymous'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">\${tx.amount?.toLocaleString() || 0}</p>
                  <p className="text-sm text-gray-500">
                    {tx.date ? new Date(tx.date).toLocaleDateString() : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate ArtworkFilters component - filters for artwork galleries
 */
export function generateArtworkFilters(options: GalleryGeneratorOptions = {}): string {
  const {
    componentName = 'ArtworkFilters',
    endpoint = '/artworks/categories',
    queryKey = 'artwork-categories',
  } = options;

  return `import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  X,
  Filter,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Palette,
  Frame,
  Tag,
  DollarSign,
} from 'lucide-react';
import { api } from '@/lib/api';

interface FilterValues {
  search: string;
  category: string;
  medium: string;
  style: string;
  priceRange: { min: string; max: string };
  size: string;
  orientation: string;
  availability: string;
  sortBy: string;
}

interface ${componentName}Props {
  className?: string;
  onChange?: (filters: FilterValues) => void;
  onSearch?: (filters: FilterValues) => void;
  layout?: 'horizontal' | 'vertical' | 'sidebar';
}

const initialFilters: FilterValues = {
  search: '',
  category: '',
  medium: '',
  style: '',
  priceRange: { min: '', max: '' },
  size: '',
  orientation: '',
  availability: '',
  sortBy: 'newest',
};

const mediums = [
  'Oil Paint', 'Acrylic', 'Watercolor', 'Digital Art', 'Photography',
  'Mixed Media', 'Charcoal', 'Pastel', 'Ink', 'Sculpture', 'Print',
];

const styles = [
  'Abstract', 'Realism', 'Impressionism', 'Contemporary', 'Modern',
  'Pop Art', 'Minimalist', 'Surrealism', 'Expressionism', 'Portrait',
];

const sizes = [
  { value: 'small', label: 'Small (under 16")' },
  { value: 'medium', label: 'Medium (16" - 40")' },
  { value: 'large', label: 'Large (40" - 60")' },
  { value: 'oversized', label: 'Oversized (over 60")' },
];

const orientations = [
  { value: 'landscape', label: 'Landscape' },
  { value: 'portrait', label: 'Portrait' },
  { value: 'square', label: 'Square' },
];

const availabilityOptions = [
  { value: 'available', label: 'Available' },
  { value: 'sold', label: 'Sold' },
  { value: 'reserved', label: 'Reserved' },
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'title_asc', label: 'Title: A-Z' },
];

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  onChange,
  onSearch,
  layout = 'horizontal',
}) => {
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [expanded, setExpanded] = useState(true);

  const { data: categories = [] } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch {
        return [];
      }
    },
  });

  const updateFilter = useCallback((name: keyof FilterValues, value: any) => {
    const updated = { ...filters, [name]: value };
    setFilters(updated);
    if (onChange) onChange(updated);
  }, [filters, onChange]);

  const clearAll = useCallback(() => {
    setFilters(initialFilters);
    if (onChange) onChange(initialFilters);
    if (onSearch) onSearch(initialFilters);
  }, [onChange, onSearch]);

  const handleSearch = useCallback(() => {
    if (onSearch) onSearch(filters);
  }, [filters, onSearch]);

  const hasActiveFilters = filters.search || filters.category || filters.medium ||
    filters.style || filters.priceRange.min || filters.priceRange.max ||
    filters.size || filters.orientation || filters.availability;

  const isVertical = layout === 'vertical' || layout === 'sidebar';

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className || ''}\`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-900 dark:text-white">Filter Artworks</span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full">
              Active
            </span>
          )}
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
      </button>

      {expanded && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className={\`\${isVertical ? 'space-y-6' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'}\`}>
            {/* Search */}
            <div className={isVertical ? 'w-full' : 'col-span-full'}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  placeholder="Search artworks, artists..."
                  className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-purple-500"
                />
                {filters.search && (
                  <button onClick={() => updateFilter('search', '')} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Palette className="w-4 h-4 inline mr-1" /> Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat: any) => (
                  <option key={cat.id || cat.value} value={cat.id || cat.value}>
                    {cat.name || cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Medium */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Frame className="w-4 h-4 inline mr-1" /> Medium
              </label>
              <select
                value={filters.medium}
                onChange={(e) => updateFilter('medium', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Mediums</option>
                {mediums.map((medium) => (
                  <option key={medium} value={medium.toLowerCase().replace(' ', '_')}>
                    {medium}
                  </option>
                ))}
              </select>
            </div>

            {/* Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Tag className="w-4 h-4 inline mr-1" /> Style
              </label>
              <select
                value={filters.style}
                onChange={(e) => updateFilter('style', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Styles</option>
                {styles.map((style) => (
                  <option key={style} value={style.toLowerCase().replace(' ', '_')}>
                    {style}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" /> Price Range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={filters.priceRange.min}
                  onChange={(e) => updateFilter('priceRange', { ...filters.priceRange, min: e.target.value })}
                  placeholder="Min"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  value={filters.priceRange.max}
                  onChange={(e) => updateFilter('priceRange', { ...filters.priceRange, max: e.target.value })}
                  placeholder="Max"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Size</label>
              <select
                value={filters.size}
                onChange={(e) => updateFilter('size', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Sizes</option>
                {sizes.map((size) => (
                  <option key={size.value} value={size.value}>{size.label}</option>
                ))}
              </select>
            </div>

            {/* Orientation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Orientation</label>
              <div className="flex flex-wrap gap-2">
                {orientations.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateFilter('orientation', filters.orientation === opt.value ? '' : opt.value)}
                    className={\`px-3 py-1.5 text-sm rounded-full border transition-colors \${
                      filters.orientation === opt.value
                        ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 text-gray-700 dark:text-gray-300'
                    }\`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Availability</label>
              <select
                value={filters.availability}
                onChange={(e) => updateFilter('availability', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All</option>
                {availabilityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-purple-500"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={clearAll}
              disabled={!hasActiveFilters}
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear all filters
            </button>
            {onSearch && (
              <button
                onClick={handleSearch}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Apply Filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate PhotoGallery component - photo grid with lightbox
 */
export function generatePhotoGallery(options: GalleryGeneratorOptions = {}): string {
  const {
    componentName = 'PhotoGallery',
    endpoint = '/photos',
    queryKey = 'photos',
  } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2,
  ZoomIn,
  Download,
  Heart,
  Share2,
  X,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Grid,
  LayoutGrid,
  Rows,
} from 'lucide-react';
import { api } from '@/lib/api';

interface Photo {
  id: string;
  url: string;
  thumbnail_url?: string;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
  likes?: number;
  downloads?: number;
}

interface ${componentName}Props {
  albumId?: string;
  columns?: 2 | 3 | 4 | 5;
  showControls?: boolean;
  className?: string;
}

type LayoutType = 'grid' | 'masonry' | 'list';

const ${componentName}: React.FC<${componentName}Props> = ({
  albumId,
  columns = 4,
  showControls = true,
  className,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [layout, setLayout] = useState<LayoutType>('grid');
  const [cols, setCols] = useState(columns);

  const { data: photos, isLoading, error } = useQuery({
    queryKey: ['${queryKey}', albumId],
    queryFn: async () => {
      const url = '${endpoint}' + (albumId ? '?album_id=' + albumId : '');
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const openLightbox = (photo: Photo, index: number) => {
    setSelectedPhoto(photo);
    setCurrentIndex(index);
  };

  const closeLightbox = () => {
    setSelectedPhoto(null);
  };

  const goNext = () => {
    if (!photos || photos.length === 0) return;
    const nextIndex = (currentIndex + 1) % photos.length;
    setCurrentIndex(nextIndex);
    setSelectedPhoto(photos[nextIndex]);
  };

  const goPrev = () => {
    if (!photos || photos.length === 0) return;
    const prevIndex = (currentIndex - 1 + photos.length) % photos.length;
    setCurrentIndex(prevIndex);
    setSelectedPhoto(photos[prevIndex]);
  };

  const gridColsClass = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 md:grid-cols-3',
    4: 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
  };

  if (isLoading) {
    return (
      <div className={\`flex justify-center py-12 \${className || ''}\`}>
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={\`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center \${className || ''}\`}>
        <p className="text-red-600 dark:text-red-400">Failed to load photos</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Controls */}
      {showControls && (
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {photos?.length || 0} photos
          </p>
          <div className="flex items-center gap-2">
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setLayout('grid')}
                className={\`p-2 \${layout === 'grid' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}\`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayout('masonry')}
                className={\`p-2 \${layout === 'masonry' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}\`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayout('list')}
                className={\`p-2 \${layout === 'list' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}\`}
              >
                <Rows className="w-4 h-4" />
              </button>
            </div>
            <select
              value={cols}
              onChange={(e) => setCols(Number(e.target.value) as 2 | 3 | 4 | 5)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm"
            >
              <option value={2}>2 columns</option>
              <option value={3}>3 columns</option>
              <option value={4}>4 columns</option>
              <option value={5}>5 columns</option>
            </select>
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      {photos && photos.length > 0 ? (
        <div className={\`grid gap-4 \${gridColsClass[cols]}\`}>
          {photos.map((photo: Photo, index: number) => (
            <div
              key={photo.id}
              className={\`relative group cursor-pointer overflow-hidden rounded-xl \${
                layout === 'list' ? 'col-span-full flex gap-4 bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700' : 'aspect-square'
              }\`}
              onClick={() => openLightbox(photo, index)}
            >
              <img
                src={photo.thumbnail_url || photo.url}
                alt={photo.title || ''}
                className={\`object-cover transition-transform group-hover:scale-105 \${
                  layout === 'list' ? 'w-32 h-32 rounded-lg' : 'w-full h-full'
                }\`}
              />
              {layout !== 'list' && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button className="p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm">
                    <ZoomIn className="w-5 h-5 text-white" />
                  </button>
                  <button className="p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm">
                    <Heart className="w-5 h-5 text-white" />
                  </button>
                </div>
              )}
              {layout === 'list' && (
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">{photo.title || 'Untitled'}</h3>
                  {photo.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{photo.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    {photo.likes !== undefined && (
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" /> {photo.likes}
                      </span>
                    )}
                    {photo.downloads !== undefined && (
                      <span className="flex items-center gap-1">
                        <Download className="w-4 h-4" /> {photo.downloads}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No photos found</p>
        </div>
      )}

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-lg z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation */}
          {photos && photos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full z-10"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full z-10"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}

          {/* Image */}
          <div className="max-w-5xl max-h-full p-8" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.title || ''}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            {(selectedPhoto.title || selectedPhoto.description) && (
              <div className="mt-4 text-center text-white">
                {selectedPhoto.title && (
                  <h3 className="text-xl font-semibold">{selectedPhoto.title}</h3>
                )}
                {selectedPhoto.description && (
                  <p className="text-gray-300 mt-2">{selectedPhoto.description}</p>
                )}
              </div>
            )}
            <div className="flex justify-center gap-4 mt-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white">
                <Heart className="w-5 h-5" />
                Like
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white">
                <Share2 className="w-5 h-5" />
                Share
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white">
                <Download className="w-5 h-5" />
                Download
              </button>
            </div>
          </div>

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
            {currentIndex + 1} / {photos?.length || 0}
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
