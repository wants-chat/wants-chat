import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateProductFilterSidebar = (
  resolved: ResolvedComponent,
  variant: 'sidebar' | 'drawer' | 'accordion' = 'sidebar'
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
    return `/${dataSource || 'product-filter-sidebar'}`;
  };

  const apiRoute = getApiRoute();

  // Derive entity name for query key
  const entity = dataSource ? dataSource.split('.').pop() || 'productFilterSidebar' : 'productFilterSidebar';

  const formatPrice = `(price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numPrice);
  }`;

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Filter, X, ChevronDown, ChevronUp, Star, Loader2 } from 'lucide-react';`;

  const commonStyles = `
    .filter-sidebar {
      @apply w-full h-full;
    }

    .filter-section {
      @apply mb-6;
    }

    .filter-label {
      @apply font-bold text-sm mb-3 block text-gray-900 dark:text-white;
    }

    .filter-option {
      @apply flex items-center justify-between py-2 cursor-pointer hover:bg-gray-50 px-2 rounded transition-colors;
    }

    .filter-option-label {
      @apply flex items-center gap-2 flex-1;
    }

    .filter-count {
      @apply text-xs text-gray-500;
    }

    .color-swatch {
      @apply w-6 h-6 rounded-full border-2 cursor-pointer transition-all;
    }

    .color-swatch.selected {
      @apply ring-2 ring-blue-500 ring-offset-2;
    }

    .price-range-display {
      @apply flex justify-between text-sm font-bold mb-2 text-gray-900 dark:text-white;
    }

    .active-filters-container {
      @apply flex flex-wrap gap-2 mb-4;
    }

    .active-filter-badge {
      @apply flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm;
    }

    .filter-header {
      @apply flex items-center justify-between mb-4;
    }

    .result-count {
      @apply text-sm text-gray-600;
    }
  `;

  const variants = {
    sidebar: `
${commonImports}

interface ProductFilterSidebarProps {
  filterData?: any;
  productFilters?: any;
  categories?: any;
  onFilterChange?: (filters: any) => void;
  onClearFilters?: (data?: any) => void;
  className?: string;
  [key: string]: any;
}

const ProductFilterSidebar: React.FC<ProductFilterSidebarProps> = ({ filterData: filterDataProp, categories: categoriesProp, onFilterChange, className }) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
    },
    enabled: !filterDataProp && !categoriesProp,
    retry: 1,
  });

  const filterData = filterDataProp || fetchedData || (categoriesProp ? { filters: { categories: categoriesProp } } : {});
  const filters = filterData.filters || {};

  const [categories, setCategories] = useState(filters.categories || categoriesProp || []);
  const [brands, setBrands] = useState(filters.brands || []);
  const [priceRange, setPriceRange] = useState(filters.priceRange || { min: 0, max: 500, currentMin: 0, currentMax: 500 });
  const [ratings, setRatings] = useState(filters.ratings || []);
  const [colors, setColors] = useState(filters.colors || []);
  const [sizes, setSizes] = useState(filters.sizes || []);
  const [availability, setAvailability] = useState(filters.availability || { inStockOnly: false, onSale: false });
  const [activeFilters, setActiveFilters] = useState<any[]>([]);

  if (isLoading && !filterDataProp && !categoriesProp) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const clearAllText = filterData.clearAllText || 'Clear All';
  const categoriesLabel = filterData.categoriesLabel || 'Categories';
  const brandsLabel = filterData.brandsLabel || 'Brands';
  const priceRangeLabel = filterData.priceRangeLabel || 'Price Range';
  const ratingsLabel = filterData.ratingsLabel || 'Ratings';
  const colorsLabel = filterData.colorsLabel || 'Colors';
  const sizesLabel = filterData.sizesLabel || 'Sizes';
  const availabilityLabel = filterData.availabilityLabel || 'Availability';
  const inStockOnlyText = filterData.inStockOnlyText || 'In Stock Only';
  const onSaleText = filterData.onSaleText || 'On Sale';
  const resultsFoundText = filterData.resultsFoundText || 'results found';
  const resultCount = filterData.resultCount || 0;

  const formatPrice = ${formatPrice};

  const toggleCategory = (categoryId: number) => {
    const updated = categories.map((cat: any) =>
      cat.id === categoryId ? { ...cat, selected: !cat.selected } : cat
    );
    setCategories(updated);
    updateActiveFilters();
    onFilterChange?.({ categories: updated, brands, priceRange, ratings, colors, sizes, availability });
  };

  const toggleBrand = (brandId: number) => {
    const updated = brands.map((brand: any) =>
      brand.id === brandId ? { ...brand, selected: !brand.selected } : brand
    );
    setBrands(updated);
    updateActiveFilters();
    onFilterChange?.({ categories, brands: updated, priceRange, ratings, colors, sizes, availability });
  };

  const toggleRating = (stars: number) => {
    const updated = ratings.map((rating: any) =>
      rating.stars === stars ? { ...rating, selected: !rating.selected } : rating
    );
    setRatings(updated);
    updateActiveFilters();
    onFilterChange?.({ categories, brands, priceRange, ratings: updated, colors, sizes, availability });
  };

  const toggleColor = (colorName: string) => {
    const updated = colors.map((color: any) =>
      color.name === colorName ? { ...color, selected: !color.selected } : color
    );
    setColors(updated);
    updateActiveFilters();
    onFilterChange?.({ categories, brands, priceRange, ratings, colors: updated, sizes, availability });
  };

  const toggleSize = (sizeName: string) => {
    const updated = sizes.map((size: any) =>
      size.name === sizeName ? { ...size, selected: !size.selected } : size
    );
    setSizes(updated);
    updateActiveFilters();
    onFilterChange?.({ categories, brands, priceRange, ratings, colors, sizes: updated, availability });
  };

  const handlePriceChange = (values: number[]) => {
    setPriceRange({ ...priceRange, currentMin: values[0], currentMax: values[1] });
    onFilterChange?.({ categories, brands, priceRange: { ...priceRange, currentMin: values[0], currentMax: values[1] }, ratings, colors, sizes, availability });
  };

  const toggleAvailability = (key: 'inStockOnly' | 'onSale') => {
    const updated = { ...availability, [key]: !availability[key] };
    setAvailability(updated);
    updateActiveFilters();
    onFilterChange?.({ categories, brands, priceRange, ratings, colors, sizes, availability: updated });
  };

  const updateActiveFilters = () => {
    const active: any[] = [];
    categories.forEach((cat: any) => cat.selected && active.push({ type: 'category', value: cat.name, id: cat.id }));
    brands.forEach((brand: any) => brand.selected && active.push({ type: 'brand', value: brand.name, id: brand.id }));
    ratings.forEach((rating: any) => rating.selected && active.push({ type: 'rating', value: \`\${rating.stars}+ stars\`, id: rating.stars }));
    colors.forEach((color: any) => color.selected && active.push({ type: 'color', value: color.name, id: color.name }));
    sizes.forEach((size: any) => size.selected && active.push({ type: 'size', value: size.name, id: size.name }));
    if (availability.inStockOnly) active.push({ type: 'availability', value: inStockOnlyText, id: 'inStock' });
    if (availability.onSale) active.push({ type: 'availability', value: onSaleText, id: 'onSale' });
    setActiveFilters(active);
  };

  const removeFilter = (filter: any) => {
    if (filter.type === 'category') toggleCategory(filter.id);
    if (filter.type === 'brand') toggleBrand(filter.id);
    if (filter.type === 'rating') toggleRating(filter.id);
    if (filter.type === 'color') toggleColor(filter.id);
    if (filter.type === 'size') toggleSize(filter.id);
    if (filter.type === 'availability') toggleAvailability(filter.id);
  };

  const clearAllFilters = () => {
    setCategories(categories.map((cat: any) => ({ ...cat, selected: false })));
    setBrands(brands.map((brand: any) => ({ ...brand, selected: false })));
    setRatings(ratings.map((rating: any) => ({ ...rating, selected: false })));
    setColors(colors.map((color: any) => ({ ...color, selected: false })));
    setSizes(sizes.map((size: any) => ({ ...size, selected: false })));
    setAvailability({ inStockOnly: false, onSale: false });
    setPriceRange({ ...priceRange, currentMin: priceRange.min, currentMax: priceRange.max });
    setActiveFilters([]);
    onFilterChange?.({
      categories: categories.map((cat: any) => ({ ...cat, selected: false })),
      brands: brands.map((brand: any) => ({ ...brand, selected: false })),
      priceRange: { ...priceRange, currentMin: priceRange.min, currentMax: priceRange.max },
      ratings: ratings.map((rating: any) => ({ ...rating, selected: false })),
      colors: colors.map((color: any) => ({ ...color, selected: false })),
      sizes: sizes.map((size: any) => ({ ...size, selected: false })),
      availability: { inStockOnly: false, onSale: false }
    });
  };

  return (
    <>
<div className="filter-sidebar">
        <Card>
          <CardHeader className="pb-4">
            <div className="filter-header">
              <CardTitle className="text-lg">Filters</CardTitle>
              {activeFilters.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="font-bold">
                  {clearAllText}
                </Button>
              )}
            </div>
            <p className="result-count">{resultCount} {resultsFoundText}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <div>
                <div className="active-filters-container">
                  {activeFilters.map((filter: any, idx: number) => (
                    <div key={idx} className="active-filter-badge">
                      {filter.value}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeFilter(filter)}
                      />
                    </div>
                  ))}
                </div>
                <Separator />
              </div>
            )}

            {/* Categories */}
            {categories && categories.length > 0 && (
              <div className="filter-section">
                <label className="filter-label">{categoriesLabel}</label>
                <div className="space-y-1">
                  {categories.map((category: any) => (
                    <div
                      key={category.id}
                      className="filter-option"
                      onClick={() => toggleCategory(category.id)}
                    >
                      <div className="filter-option-label">
                        <Checkbox checked={category.selected} />
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <span className="filter-count">({category.count})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Price Range */}
            <div className="filter-section">
              <label className="filter-label">{priceRangeLabel}</label>
              <div className="price-range-display">
                <span>{formatPrice(priceRange.currentMin)}</span>
                <span>{formatPrice(priceRange.currentMax)}</span>
              </div>
              <Slider
                min={priceRange.min}
                max={priceRange.max}
                step={10}
                value={[priceRange.currentMin, priceRange.currentMax]}
                onValueChange={handlePriceChange}
                className="mt-2"
              />
            </div>

            <Separator />

            {/* Brands */}
            {brands && brands.length > 0 && (
              <div className="filter-section">
                <label className="filter-label">{brandsLabel}</label>
                <div className="space-y-1">
                  {brands.map((brand: any) => (
                    <div
                      key={brand.id}
                      className="filter-option"
                      onClick={() => toggleBrand(brand.id)}
                    >
                      <div className="filter-option-label">
                        <Checkbox checked={brand.selected} />
                        <span className="text-sm">{brand.name}</span>
                      </div>
                      <span className="filter-count">({brand.count})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Ratings */}
            {ratings && ratings.length > 0 && (
              <div className="filter-section">
                <label className="filter-label">{ratingsLabel}</label>
                <div className="space-y-1">
                  {ratings.map((rating: any) => (
                    <div
                      key={rating.stars}
                      className="filter-option"
                      onClick={() => toggleRating(rating.stars)}
                    >
                      <div className="filter-option-label">
                        <Checkbox checked={rating.selected} />
                        <div className="flex items-center gap-1">
                          {Array(rating.stars).fill(0).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                          <span className="text-sm ml-1">& up</span>
                        </div>
                      </div>
                      <span className="filter-count">({rating.count})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Colors */}
            {colors && colors.length > 0 && (
              <div className="filter-section">
                <label className="filter-label">{colorsLabel}</label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color: any) => (
                    <div
                      key={color.name}
                      className={\`color-swatch \${color.selected ? 'selected' : ''}\`}
                      style={{ backgroundColor: color.hex, borderColor: color.hex === '#FFFFFF' ? '#e5e7eb' : color.hex }}
                      onClick={() => toggleColor(color.name)}
                      title={\`\${color.name} (\${color.count})\`}
                    />
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Sizes */}
            {sizes && sizes.length > 0 && (
              <div className="filter-section">
                <label className="filter-label">{sizesLabel}</label>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size: any) => (
                    <Badge
                      key={size.name}
                      variant={size.selected ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleSize(size.name)}
                    >
                      {size.name} ({size.count})
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Availability */}
            <div className="filter-section">
              <label className="filter-label">{availabilityLabel}</label>
              <div className="space-y-2">
                <div
                  className="filter-option"
                  onClick={() => toggleAvailability('inStockOnly')}
                >
                  <div className="filter-option-label">
                    <Checkbox checked={availability.inStockOnly} />
                    <span className="text-sm">{inStockOnlyText}</span>
                  </div>
                </div>
                <div
                  className="filter-option"
                  onClick={() => toggleAvailability('onSale')}
                >
                  <div className="filter-option-label">
                    <Checkbox checked={availability.onSale} />
                    <span className="text-sm">{onSaleText}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ProductFilterSidebar;
    `,

    drawer: `
${commonImports}

interface ProductFilterSidebarProps {
  filterData?: any;
  productFilters?: any;
  categories?: any;
  onFilterChange?: (filters: any) => void;
  onClearFilters?: (data?: any) => void;
  className?: string;
  [key: string]: any;
}

const ProductFilterSidebar: React.FC<ProductFilterSidebarProps> = ({ filterData: filterDataProp, categories: categoriesProp, onFilterChange, className }) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
    },
    enabled: !filterDataProp && !categoriesProp,
    retry: 1,
  });

  const filterData = filterDataProp || fetchedData || (categoriesProp ? { filters: { categories: categoriesProp } } : {});
  const filters = filterData.filters || {};

  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState(filters.categories || []);
  const [brands, setBrands] = useState(filters.brands || []);
  const [priceRange, setPriceRange] = useState(filters.priceRange || { min: 0, max: 500, currentMin: 0, currentMax: 500 });
  const [ratings, setRatings] = useState(filters.ratings || []);
  const [activeFilters, setActiveFilters] = useState<any[]>([]);

  if (isLoading && !filterDataProp && !categoriesProp) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const applyFiltersText = filterData.applyFiltersText || 'Apply Filters';
  const clearAllText = filterData.clearAllText || 'Clear All';
  const categoriesLabel = filterData.categoriesLabel || 'Categories';
  const brandsLabel = filterData.brandsLabel || 'Brands';
  const priceRangeLabel = filterData.priceRangeLabel || 'Price Range';
  const ratingsLabel = filterData.ratingsLabel || 'Ratings';
  const resultsFoundText = filterData.resultsFoundText || 'results found';
  const resultCount = filterData.resultCount || 0;

  const formatPrice = ${formatPrice};

  const toggleCategory = (categoryId: number) => {
    setCategories(categories.map((cat: any) =>
      cat.id === categoryId ? { ...cat, selected: !cat.selected } : cat
    ));
  };

  const toggleBrand = (brandId: number) => {
    setBrands(brands.map((brand: any) =>
      brand.id === brandId ? { ...brand, selected: !brand.selected } : brand
    ));
  };

  const toggleRating = (stars: number) => {
    setRatings(ratings.map((rating: any) =>
      rating.stars === stars ? { ...rating, selected: !rating.selected } : rating
    ));
  };

  const handlePriceChange = (values: number[]) => {
    setPriceRange({ ...priceRange, currentMin: values[0], currentMax: values[1] });
  };

  const applyFilters = () => {
    onFilterChange?.({ categories, brands, priceRange, ratings });
    setIsOpen(false);
  };

  const clearAllFilters = () => {
    setCategories(categories.map((cat: any) => ({ ...cat, selected: false })));
    setBrands(brands.map((brand: any) => ({ ...brand, selected: false })));
    setRatings(ratings.map((rating: any) => ({ ...rating, selected: false })));
    setPriceRange({ ...priceRange, currentMin: priceRange.min, currentMax: priceRange.max });
  };

  return (
    <>
<Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <p className="result-count">{resultCount} {resultsFoundText}</p>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Categories */}
            {categories && categories.length > 0 && (
              <div className="filter-section">
                <label className="filter-label">{categoriesLabel}</label>
                <div className="space-y-1">
                  {categories.map((category: any) => (
                    <div
                      key={category.id}
                      className="filter-option"
                      onClick={() => toggleCategory(category.id)}
                    >
                      <div className="filter-option-label">
                        <Checkbox checked={category.selected} />
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <span className="filter-count">({category.count})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Price Range */}
            <div className="filter-section">
              <label className="filter-label">{priceRangeLabel}</label>
              <div className="price-range-display">
                <span>{formatPrice(priceRange.currentMin)}</span>
                <span>{formatPrice(priceRange.currentMax)}</span>
              </div>
              <Slider
                min={priceRange.min}
                max={priceRange.max}
                step={10}
                value={[priceRange.currentMin, priceRange.currentMax]}
                onValueChange={handlePriceChange}
                className="mt-2"
              />
            </div>

            <Separator />

            {/* Brands */}
            {brands && brands.length > 0 && (
              <div className="filter-section">
                <label className="filter-label">{brandsLabel}</label>
                <div className="space-y-1">
                  {brands.map((brand: any) => (
                    <div
                      key={brand.id}
                      className="filter-option"
                      onClick={() => toggleBrand(brand.id)}
                    >
                      <div className="filter-option-label">
                        <Checkbox checked={brand.selected} />
                        <span className="text-sm">{brand.name}</span>
                      </div>
                      <span className="filter-count">({brand.count})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Ratings */}
            {ratings && ratings.length > 0 && (
              <div className="filter-section">
                <label className="filter-label">{ratingsLabel}</label>
                <div className="space-y-1">
                  {ratings.map((rating: any) => (
                    <div
                      key={rating.stars}
                      className="filter-option"
                      onClick={() => toggleRating(rating.stars)}
                    >
                      <div className="filter-option-label">
                        <Checkbox checked={rating.selected} />
                        <div className="flex items-center gap-1">
                          {Array(rating.stars).fill(0).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                          <span className="text-sm ml-1">& up</span>
                        </div>
                      </div>
                      <span className="filter-count">({rating.count})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 space-y-2">
            <Button className="w-full font-bold" onClick={applyFilters}>
              {applyFiltersText}
            </Button>
            <Button variant="outline" className="w-full font-bold" onClick={clearAllFilters}>
              {clearAllText}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ProductFilterSidebar;
    `,

    accordion: `
${commonImports}

interface ProductFilterSidebarProps {
  filterData?: any;
  productFilters?: any;
  categories?: any;
  onFilterChange?: (filters: any) => void;
  onClearFilters?: (data?: any) => void;
  className?: string;
  [key: string]: any;
}

const ProductFilterSidebar: React.FC<ProductFilterSidebarProps> = ({ filterData: filterDataProp, categories: categoriesProp, onFilterChange, className }) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
    },
    enabled: !filterDataProp && !categoriesProp,
    retry: 1,
  });

  const filterData = filterDataProp || fetchedData || (categoriesProp ? { filters: { categories: categoriesProp } } : {});
  const filters = filterData.filters || {};

  const [openSections, setOpenSections] = useState(['categories', 'price']);
  const [categories, setCategories] = useState(filters.categories || []);
  const [brands, setBrands] = useState(filters.brands || []);
  const [priceRange, setPriceRange] = useState(filters.priceRange || { min: 0, max: 500, currentMin: 0, currentMax: 500 });
  const [ratings, setRatings] = useState(filters.ratings || []);
  const [colors, setColors] = useState(filters.colors || []);

  if (isLoading && !filterDataProp && !categoriesProp) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const clearAllText = filterData.clearAllText || 'Clear All';
  const categoriesLabel = filterData.categoriesLabel || 'Categories';
  const brandsLabel = filterData.brandsLabel || 'Brands';
  const priceRangeLabel = filterData.priceRangeLabel || 'Price Range';
  const ratingsLabel = filterData.ratingsLabel || 'Ratings';
  const colorsLabel = filterData.colorsLabel || 'Colors';
  const resultsFoundText = filterData.resultsFoundText || 'results found';
  const resultCount = filterData.resultCount || 0;

  const formatPrice = ${formatPrice};

  const toggleSection = (section: string) => {
    setOpenSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const toggleCategory = (categoryId: number) => {
    const updated = categories.map((cat: any) =>
      cat.id === categoryId ? { ...cat, selected: !cat.selected } : cat
    );
    setCategories(updated);
    onFilterChange?.({ categories: updated, brands, priceRange, ratings, colors });
  };

  const toggleBrand = (brandId: number) => {
    const updated = brands.map((brand: any) =>
      brand.id === brandId ? { ...brand, selected: !brand.selected } : brand
    );
    setBrands(updated);
    onFilterChange?.({ categories, brands: updated, priceRange, ratings, colors });
  };

  const toggleRating = (stars: number) => {
    const updated = ratings.map((rating: any) =>
      rating.stars === stars ? { ...rating, selected: !rating.selected } : rating
    );
    setRatings(updated);
    onFilterChange?.({ categories, brands, priceRange, ratings: updated, colors });
  };

  const toggleColor = (colorName: string) => {
    const updated = colors.map((color: any) =>
      color.name === colorName ? { ...color, selected: !color.selected } : color
    );
    setColors(updated);
    onFilterChange?.({ categories, brands, priceRange, ratings, colors: updated });
  };

  const handlePriceChange = (values: number[]) => {
    setPriceRange({ ...priceRange, currentMin: values[0], currentMax: values[1] });
    onFilterChange?.({ categories, brands, priceRange: { ...priceRange, currentMin: values[0], currentMax: values[1] }, ratings, colors });
  };

  const clearAllFilters = () => {
    setCategories(categories.map((cat: any) => ({ ...cat, selected: false })));
    setBrands(brands.map((brand: any) => ({ ...brand, selected: false })));
    setRatings(ratings.map((rating: any) => ({ ...rating, selected: false })));
    setColors(colors.map((color: any) => ({ ...color, selected: false })));
    setPriceRange({ ...priceRange, currentMin: priceRange.min, currentMax: priceRange.max });
  };

  return (
    <>
<Card>
        <CardHeader>
          <div className="filter-header">
            <CardTitle className="text-lg">Filters</CardTitle>
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="font-bold">
              {clearAllText}
            </Button>
          </div>
          <p className="result-count">{resultCount} {resultsFoundText}</p>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Categories Accordion */}
          <Collapsible
            open={openSections.includes('categories')}
            onOpenChange={() => toggleSection('categories')}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full py-3 hover:bg-gray-50 px-2 rounded">
              <span className="font-bold text-sm text-gray-900 dark:text-white">{categoriesLabel}</span>
              {openSections.includes('categories') ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 pb-4">
              <div className="space-y-1">
                {categories.map((category: any) => (
                  <div
                    key={category.id}
                    className="filter-option"
                    onClick={() => toggleCategory(category.id)}
                  >
                    <div className="filter-option-label">
                      <Checkbox checked={category.selected} />
                      <span className="text-sm">{category.name}</span>
                    </div>
                    <span className="filter-count">({category.count})</span>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Price Range Accordion */}
          <Collapsible
            open={openSections.includes('price')}
            onOpenChange={() => toggleSection('price')}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full py-3 hover:bg-gray-50 px-2 rounded">
              <span className="font-bold text-sm text-gray-900 dark:text-white">{priceRangeLabel}</span>
              {openSections.includes('price') ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 pb-4 px-2">
              <div className="price-range-display">
                <span>{formatPrice(priceRange.currentMin)}</span>
                <span>{formatPrice(priceRange.currentMax)}</span>
              </div>
              <Slider
                min={priceRange.min}
                max={priceRange.max}
                step={10}
                value={[priceRange.currentMin, priceRange.currentMax]}
                onValueChange={handlePriceChange}
                className="mt-2"
              />
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Brands Accordion */}
          <Collapsible
            open={openSections.includes('brands')}
            onOpenChange={() => toggleSection('brands')}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full py-3 hover:bg-gray-50 px-2 rounded">
              <span className="font-bold text-sm text-gray-900 dark:text-white">{brandsLabel}</span>
              {openSections.includes('brands') ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 pb-4">
              <div className="space-y-1">
                {brands.map((brand: any) => (
                  <div
                    key={brand.id}
                    className="filter-option"
                    onClick={() => toggleBrand(brand.id)}
                  >
                    <div className="filter-option-label">
                      <Checkbox checked={brand.selected} />
                      <span className="text-sm">{brand.name}</span>
                    </div>
                    <span className="filter-count">({brand.count})</span>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Ratings Accordion */}
          <Collapsible
            open={openSections.includes('ratings')}
            onOpenChange={() => toggleSection('ratings')}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full py-3 hover:bg-gray-50 px-2 rounded">
              <span className="font-bold text-sm text-gray-900 dark:text-white">{ratingsLabel}</span>
              {openSections.includes('ratings') ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 pb-4">
              <div className="space-y-1">
                {ratings.map((rating: any) => (
                  <div
                    key={rating.stars}
                    className="filter-option"
                    onClick={() => toggleRating(rating.stars)}
                  >
                    <div className="filter-option-label">
                      <Checkbox checked={rating.selected} />
                      <div className="flex items-center gap-1">
                        {Array(rating.stars).fill(0).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="text-sm ml-1">& up</span>
                      </div>
                    </div>
                    <span className="filter-count">({rating.count})</span>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Colors Accordion */}
          <Collapsible
            open={openSections.includes('colors')}
            onOpenChange={() => toggleSection('colors')}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full py-3 hover:bg-gray-50 px-2 rounded">
              <span className="font-bold text-sm text-gray-900 dark:text-white">{colorsLabel}</span>
              {openSections.includes('colors') ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 pb-4 px-2">
              <div className="flex flex-wrap gap-2">
                {colors.map((color: any) => (
                  <div
                    key={color.name}
                    className={\`color-swatch \${color.selected ? 'selected' : ''}\`}
                    style={{ backgroundColor: color.hex, borderColor: color.hex === '#FFFFFF' ? '#e5e7eb' : color.hex }}
                    onClick={() => toggleColor(color.name)}
                    title={\`\${color.name} (\${color.count})\`}
                  />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </>
  );
};

export default ProductFilterSidebar;
    `
  };

  return variants[variant] || variants.sidebar;
};
