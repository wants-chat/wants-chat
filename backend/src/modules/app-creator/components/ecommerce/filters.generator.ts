/**
 * Product Filters Generator for Ecommerce
 *
 * Generates product filtering components with:
 * - ProductFilters: Full filter sidebar/panel
 * - ProductFiltersDesign: Styled filter UI component
 * - CategoryHeader: Header with category info and sort
 * - CategoryPills: Category navigation pills
 */

import { pascalCase, snakeCase } from 'change-case';
import pluralize from 'pluralize';

export interface ProductFiltersOptions {
  componentName?: string;
  showPriceRange?: boolean;
  showCategories?: boolean;
  showBrands?: boolean;
  showRatings?: boolean;
  showAvailability?: boolean;
  showColors?: boolean;
  showSizes?: boolean;
  priceMin?: number;
  priceMax?: number;
  categoriesEndpoint?: string;
  brandsEndpoint?: string;
}

/**
 * Generate a ProductFilters component with full filter functionality
 */
export function generateProductFilters(options: ProductFiltersOptions = {}): string {
  const {
    componentName = 'ProductFilters',
    showPriceRange = true,
    showCategories = true,
    showBrands = true,
    showRatings = true,
    showAvailability = true,
    showColors = false,
    showSizes = false,
    priceMin = 0,
    priceMax = 1000,
    categoriesEndpoint = '/categories',
    brandsEndpoint = '/brands',
  } = options;

  return `import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  Star,
  Check,
  DollarSign,
  Tag,
  Palette,
  Ruler,
  Package
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface FilterValues {
  categories: string[];
  brands: string[];
  priceRange: { min: number; max: number };
  rating: number | null;
  inStock: boolean;
  colors: string[];
  sizes: string[];
}

interface ${componentName}Props {
  className?: string;
  values?: Partial<FilterValues>;
  onChange?: (filters: FilterValues) => void;
  onApply?: (filters: FilterValues) => void;
  layout?: 'sidebar' | 'horizontal' | 'modal';
}

const initialFilters: FilterValues = {
  categories: [],
  brands: [],
  priceRange: { min: ${priceMin}, max: ${priceMax} },
  rating: null,
  inStock: false,
  colors: [],
  sizes: [],
};

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  values: propValues,
  onChange,
  onApply,
  layout = 'sidebar',
}) => {
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    categories: true,
    brands: true,
    price: true,
    rating: true,
    availability: true,
    colors: true,
    sizes: true,
  });

  const currentFilters = { ...filters, ...propValues };

  ${showCategories ? `// Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${categoriesEndpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        return [];
      }
    },
  });` : ''}

  ${showBrands ? `// Fetch brands
  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${brandsEndpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch brands:', err);
        return [];
      }
    },
  });` : ''}

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateFilter = useCallback(<K extends keyof FilterValues>(key: K, value: FilterValues[K]) => {
    const updated = { ...currentFilters, [key]: value };
    setFilters(updated);
    if (onChange) onChange(updated);
  }, [currentFilters, onChange]);

  const toggleArrayFilter = useCallback((key: 'categories' | 'brands' | 'colors' | 'sizes', value: string) => {
    const current = currentFilters[key] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    updateFilter(key, updated);
  }, [currentFilters, updateFilter]);

  const clearAll = useCallback(() => {
    setFilters(initialFilters);
    if (onChange) onChange(initialFilters);
  }, [onChange]);

  const handleApply = useCallback(() => {
    if (onApply) onApply(currentFilters);
  }, [currentFilters, onApply]);

  const hasActiveFilters =
    currentFilters.categories.length > 0 ||
    currentFilters.brands.length > 0 ||
    currentFilters.priceRange.min > ${priceMin} ||
    currentFilters.priceRange.max < ${priceMax} ||
    currentFilters.rating !== null ||
    currentFilters.inStock ||
    currentFilters.colors.length > 0 ||
    currentFilters.sizes.length > 0;

  const FilterSection = ({
    title,
    icon: Icon,
    section,
    children
  }: {
    title: string;
    icon: React.ElementType;
    section: string;
    children: React.ReactNode;
  }) => (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <button
        onClick={() => toggleSection(section)}
        className="flex items-center justify-between w-full py-4 text-left"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="font-medium text-gray-900 dark:text-white">{title}</span>
        </div>
        {expandedSections[section] ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {expandedSections[section] && (
        <div className="pb-4">{children}</div>
      )}
    </div>
  );

  const CheckboxItem = ({
    label,
    checked,
    onChange,
    count
  }: {
    label: string;
    checked: boolean;
    onChange: () => void;
    count?: number;
  }) => (
    <label className="flex items-center justify-between cursor-pointer group py-1">
      <div className="flex items-center gap-2">
        <div className={cn(
          "w-4 h-4 rounded border flex items-center justify-center transition-colors",
          checked
            ? "bg-blue-600 border-blue-600"
            : "border-gray-300 dark:border-gray-600 group-hover:border-blue-400"
        )}>
          {checked && <Check className="w-3 h-3 text-white" />}
        </div>
        <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      </div>
      {count !== undefined && (
        <span className="text-xs text-gray-400">({count})</span>
      )}
    </label>
  );

  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700",
      layout === 'sidebar' && "w-full max-w-xs",
      layout === 'horizontal' && "w-full",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <span className="font-semibold text-gray-900 dark:text-white">Filters</span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
              Active
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="p-4">
        ${showCategories ? `{/* Categories */}
        <FilterSection title="Categories" icon={Tag} section="categories">
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {categories.map((category: any) => (
              <CheckboxItem
                key={category.id || category._id}
                label={category.name}
                checked={currentFilters.categories.includes(category.id || category._id)}
                onChange={() => toggleArrayFilter('categories', category.id || category._id)}
                count={category.product_count}
              />
            ))}
            {categories.length === 0 && (
              <p className="text-sm text-gray-400">No categories available</p>
            )}
          </div>
        </FilterSection>` : ''}

        ${showBrands ? `{/* Brands */}
        <FilterSection title="Brands" icon={Tag} section="brands">
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {brands.map((brand: any) => (
              <CheckboxItem
                key={brand.id || brand._id}
                label={brand.name}
                checked={currentFilters.brands.includes(brand.id || brand._id)}
                onChange={() => toggleArrayFilter('brands', brand.id || brand._id)}
                count={brand.product_count}
              />
            ))}
            {brands.length === 0 && (
              <p className="text-sm text-gray-400">No brands available</p>
            )}
          </div>
        </FilterSection>` : ''}

        ${showPriceRange ? `{/* Price Range */}
        <FilterSection title="Price Range" icon={DollarSign} section="price">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-xs text-gray-500 dark:text-gray-400">Min</label>
                <input
                  type="number"
                  value={currentFilters.priceRange.min}
                  onChange={(e) => updateFilter('priceRange', {
                    ...currentFilters.priceRange,
                    min: Number(e.target.value)
                  })}
                  min={${priceMin}}
                  max={currentFilters.priceRange.max}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm"
                />
              </div>
              <span className="text-gray-400 pt-4">-</span>
              <div className="flex-1">
                <label className="text-xs text-gray-500 dark:text-gray-400">Max</label>
                <input
                  type="number"
                  value={currentFilters.priceRange.max}
                  onChange={(e) => updateFilter('priceRange', {
                    ...currentFilters.priceRange,
                    max: Number(e.target.value)
                  })}
                  min={currentFilters.priceRange.min}
                  max={${priceMax}}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm"
                />
              </div>
            </div>
            <input
              type="range"
              min={${priceMin}}
              max={${priceMax}}
              value={currentFilters.priceRange.max}
              onChange={(e) => updateFilter('priceRange', {
                ...currentFilters.priceRange,
                max: Number(e.target.value)
              })}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </FilterSection>` : ''}

        ${showRatings ? `{/* Rating */}
        <FilterSection title="Rating" icon={Star} section="rating">
          <div className="space-y-2">
            {[4, 3, 2, 1].map((rating) => (
              <label
                key={rating}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors",
                  currentFilters.rating === rating
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                )}
              >
                <input
                  type="radio"
                  name="rating"
                  checked={currentFilters.rating === rating}
                  onChange={() => updateFilter('rating', rating)}
                  className="sr-only"
                />
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-4 h-4",
                        i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">& up</span>
              </label>
            ))}
          </div>
        </FilterSection>` : ''}

        ${showAvailability ? `{/* Availability */}
        <FilterSection title="Availability" icon={Package} section="availability">
          <CheckboxItem
            label="In Stock Only"
            checked={currentFilters.inStock}
            onChange={() => updateFilter('inStock', !currentFilters.inStock)}
          />
        </FilterSection>` : ''}

        ${showColors ? `{/* Colors */}
        <FilterSection title="Colors" icon={Palette} section="colors">
          <div className="flex flex-wrap gap-2">
            {['black', 'white', 'red', 'blue', 'green', 'yellow', 'purple', 'pink', 'gray', 'orange'].map((color) => (
              <button
                key={color}
                onClick={() => toggleArrayFilter('colors', color)}
                className={cn(
                  "w-8 h-8 rounded-full border-2 transition-all",
                  currentFilters.colors.includes(color) ? "border-blue-500 scale-110" : "border-gray-200 dark:border-gray-600"
                )}
                style={{ backgroundColor: color === 'white' ? '#f9fafb' : color }}
                title={color}
              >
                {currentFilters.colors.includes(color) && (
                  <Check className={cn("w-4 h-4 mx-auto", color === 'white' || color === 'yellow' ? "text-gray-800" : "text-white")} />
                )}
              </button>
            ))}
          </div>
        </FilterSection>` : ''}

        ${showSizes ? `{/* Sizes */}
        <FilterSection title="Sizes" icon={Ruler} section="sizes">
          <div className="flex flex-wrap gap-2">
            {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
              <button
                key={size}
                onClick={() => toggleArrayFilter('sizes', size)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors",
                  currentFilters.sizes.includes(size)
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </FilterSection>` : ''}
      </div>

      {/* Apply Button */}
      {onApply && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleApply}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export interface ProductFiltersDesignOptions {
  componentName?: string;
  variant?: 'minimal' | 'detailed' | 'chips';
}

/**
 * Generate a styled ProductFiltersDesign component
 */
export function generateProductFiltersDesign(options: ProductFiltersDesignOptions = {}): string {
  const {
    componentName = 'ProductFiltersDesign',
    variant = 'detailed',
  } = options;

  return `import React, { useState } from 'react';
import {
  Filter,
  X,
  ChevronDown,
  SlidersHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActiveFilter {
  key: string;
  label: string;
  value: string;
}

interface ${componentName}Props {
  className?: string;
  activeFilters?: ActiveFilter[];
  onRemoveFilter?: (key: string) => void;
  onClearAll?: () => void;
  onOpenFilters?: () => void;
  filterCount?: number;
  variant?: 'minimal' | 'detailed' | 'chips';
}

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  activeFilters = [],
  onRemoveFilter,
  onClearAll,
  onOpenFilters,
  filterCount = 0,
  variant = '${variant}',
}) => {
  const [showAll, setShowAll] = useState(false);

  const displayedFilters = showAll ? activeFilters : activeFilters.slice(0, 3);
  const hiddenCount = activeFilters.length - 3;

  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <button
          onClick={onOpenFilters}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="font-medium">Filters</span>
          {filterCount > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded-full">
              {filterCount}
            </span>
          )}
        </button>
      </div>
    );
  }

  if (variant === 'chips') {
    return (
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        <button
          onClick={onOpenFilters}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <Filter className="w-3.5 h-3.5" />
          <span>All Filters</span>
          {filterCount > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded-full">
              {filterCount}
            </span>
          )}
        </button>

        {displayedFilters.map((filter) => (
          <span
            key={filter.key}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm"
          >
            <span className="font-medium">{filter.label}:</span>
            <span>{filter.value}</span>
            <button
              onClick={() => onRemoveFilter?.(filter.key)}
              className="ml-1 hover:text-blue-900 dark:hover:text-blue-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}

        {hiddenCount > 0 && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            +{hiddenCount} more
          </button>
        )}

        {activeFilters.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            Clear all
          </button>
        )}
      </div>
    );
  }

  // Detailed variant
  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4",
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <span className="font-semibold text-gray-900 dark:text-white">Active Filters</span>
          {activeFilters.length > 0 && (
            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
              {activeFilters.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeFilters.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              Clear all
            </button>
          )}
          <button
            onClick={onOpenFilters}
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Edit Filters
          </button>
        </div>
      </div>

      {activeFilters.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No filters applied</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {displayedFilters.map((filter) => (
            <div
              key={filter.key}
              className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
            >
              <div className="text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">{filter.label}:</span>{' '}
                <span className="text-gray-900 dark:text-white">{filter.value}</span>
              </div>
              <button
                onClick={() => onRemoveFilter?.(filter.key)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {hiddenCount > 0 && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ChevronDown className="w-4 h-4" />
              +{hiddenCount} more
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export interface CategoryHeaderOptions {
  componentName?: string;
  showBreadcrumb?: boolean;
  showProductCount?: boolean;
  showSortDropdown?: boolean;
  showViewToggle?: boolean;
}

/**
 * Generate a CategoryHeader component
 */
export function generateCategoryHeader(options: CategoryHeaderOptions = {}): string {
  const {
    componentName = 'CategoryHeader',
    showBreadcrumb = true,
    showProductCount = true,
    showSortDropdown = true,
    showViewToggle = true,
  } = options;

  return `import React from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  Grid3X3,
  List,
  SlidersHorizontal,
  ArrowUpDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface ${componentName}Props {
  className?: string;
  title: string;
  description?: string;
  image?: string;
  breadcrumbs?: BreadcrumbItem[];
  productCount?: number;
  sortValue?: string;
  onSortChange?: (value: string) => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  onOpenFilters?: () => void;
  sortOptions?: Array<{ value: string; label: string }>;
}

const defaultSortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'name-asc', label: 'Name: A-Z' },
  { value: 'name-desc', label: 'Name: Z-A' },
];

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  title,
  description,
  image,
  breadcrumbs = [],
  productCount,
  sortValue = 'featured',
  onSortChange,
  viewMode = 'grid',
  onViewModeChange,
  onOpenFilters,
  sortOptions = defaultSortOptions,
}) => {
  return (
    <div className={cn("mb-8", className)}>
      ${showBreadcrumb ? `{/* Breadcrumb */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-sm mb-4">
          <Link to="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            Home
          </Link>
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={index}>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              {item.href ? (
                <Link
                  to={item.href}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-900 dark:text-white font-medium">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}` : ''}

      {/* Category Hero */}
      {image ? (
        <div className="relative h-48 md:h-64 rounded-xl overflow-hidden mb-6">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{title}</h1>
            {description && (
              <p className="text-white/80 max-w-2xl">{description}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
          {description && (
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl">{description}</p>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-t border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          ${showProductCount ? `{productCount !== undefined && (
            <span className="text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-900 dark:text-white">{productCount}</span> products
            </span>
          )}` : ''}

          {onOpenFilters && (
            <button
              onClick={onOpenFilters}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors md:hidden"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          ${showSortDropdown ? `{/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
            <select
              value={sortValue}
              onChange={(e) => onSortChange?.(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>` : ''}

          ${showViewToggle ? `{/* View Toggle */}
          <div className="hidden md:flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={() => onViewModeChange?.('grid')}
              className={cn(
                "p-2 transition-colors",
                viewMode === 'grid'
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange?.('list')}
              className={cn(
                "p-2 transition-colors",
                viewMode === 'list'
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>` : ''}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export interface CategoryPillsOptions {
  componentName?: string;
  showAllOption?: boolean;
  scrollable?: boolean;
  endpoint?: string;
}

/**
 * Generate a CategoryPills component
 */
export function generateCategoryPills(options: CategoryPillsOptions = {}): string {
  const {
    componentName = 'CategoryPills',
    showAllOption = true,
    scrollable = true,
    endpoint = '/categories',
  } = options;

  return `import React, { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface Category {
  id: string;
  name: string;
  slug?: string;
  icon?: string;
  image?: string;
  product_count?: number;
}

interface ${componentName}Props {
  className?: string;
  categories?: Category[];
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  showProductCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  categories: propCategories,
  selectedId = null,
  onSelect,
  showProductCount = false,
  size = 'md',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch categories if not provided via props
  const { data: fetchedCategories = [], isLoading } = useQuery({
    queryKey: ['categories-pills'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        return [];
      }
    },
    enabled: !propCategories || propCategories.length === 0,
  });

  const categories = propCategories && propCategories.length > 0 ? propCategories : fetchedCategories;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-4", className)}>
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      ${scrollable ? `{/* Left Scroll Button */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-800 shadow-md rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>` : ''}

      <div
        ref={scrollRef}
        className={cn(
          "flex items-center gap-2 overflow-x-auto scrollbar-hide",
          ${scrollable} && "px-10"
        )}
      >
        ${showAllOption ? `{/* All Option */}
        <button
          onClick={() => onSelect?.(null)}
          className={cn(
            "flex-shrink-0 font-medium rounded-full border transition-all",
            sizeClasses[size],
            selectedId === null
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
          )}
        >
          All
        </button>` : ''}

        {categories.map((category: Category) => (
          <button
            key={category.id}
            onClick={() => onSelect?.(category.id)}
            className={cn(
              "flex-shrink-0 flex items-center gap-2 font-medium rounded-full border transition-all",
              sizeClasses[size],
              selectedId === category.id
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
            )}
          >
            {category.icon && (
              <span className="text-lg">{category.icon}</span>
            )}
            <span>{category.name}</span>
            {showProductCount && category.product_count !== undefined && (
              <span className={cn(
                "px-1.5 py-0.5 text-xs rounded-full",
                selectedId === category.id
                  ? "bg-white/20"
                  : "bg-gray-100 dark:bg-gray-700"
              )}>
                {category.product_count}
              </span>
            )}
          </button>
        ))}
      </div>

      ${scrollable ? `{/* Right Scroll Button */}
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-800 shadow-md rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>` : ''}
    </div>
  );
};

export default ${componentName};
`;
}
