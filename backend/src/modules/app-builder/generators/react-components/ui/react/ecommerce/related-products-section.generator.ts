import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateRelatedProductsSection = (
  resolved: ResolvedComponent,
  variant: 'carousel' | 'grid' | 'sidebar' = 'carousel'
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
    return `/${dataSource || 'data'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'products';

  const formatPrice = `(price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numPrice);
  }`;

  const getRatingStars = `(rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

    return (
      <>
        {Array(fullStars).fill(0).map((_, i) => (
          <Star key={\`full-\${i}\`} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalf && <Star key="half" className="w-3 h-3 fill-yellow-400/50 text-yellow-400" />}
        {Array(emptyStars).fill(0).map((_, i) => (
          <Star key={\`empty-\${i}\`} className="w-3 h-3 text-gray-300" />
        ))}
      </>
    );
  }`;

  const commonImports = `
import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ChevronLeft, ChevronRight, ShoppingCart, Eye, Sparkles, Loader2 } from 'lucide-react';`;

  const commonStyles = `
    .related-products-container {
      @apply w-full;
    }

    .related-products-header {
      @apply flex items-center justify-between mb-6;
    }

    .section-title {
      @apply text-2xl font-bold;
    }

    .product-card {
      @apply bg-white rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer;
    }

    .product-image-container {
      @apply relative overflow-hidden bg-gray-100;
    }

    .product-image {
      @apply w-full h-full object-cover transition-transform duration-300 hover:scale-110;
    }

    .product-badge {
      @apply absolute top-2 left-2 px-2 py-1 text-xs font-semibold rounded-md;
    }

    .product-info {
      @apply p-3;
    }

    .product-name {
      @apply font-semibold text-sm mb-1 line-clamp-2;
    }

    .product-rating {
      @apply flex items-center gap-1 mb-2;
    }

    .product-price {
      @apply text-lg font-bold;
    }

    .original-price {
      @apply line-through text-gray-400 text-sm ml-2;
    }

    .carousel-container {
      @apply relative;
    }

    .carousel-wrapper {
      @apply overflow-hidden;
    }

    .carousel-track {
      @apply flex gap-4 transition-transform duration-300;
    }

    .carousel-button {
      @apply absolute top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 z-10 transition-all;
    }

    .carousel-button-left {
      @apply left-0 -translate-x-1/2;
    }

    .carousel-button-right {
      @apply right-0 translate-x-1/2;
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .product-card {
        @apply bg-gray-800;
      }
      .product-image-container {
        @apply bg-gray-700;
      }
      .carousel-button {
        @apply bg-gray-800/90 hover:bg-gray-800;
      }
    }
  `;

  const variants = {
    carousel: `
${commonImports}

interface RelatedProductsSectionProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const RelatedProductsSection: React.FC<RelatedProductsSectionProps> = ({ ${dataName}: propData, className }) => {
  // Fetch data from API
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: () => api.get('${apiRoute}'),
  });

  const ${dataName} = propData || apiData;
  const sectionData = ${dataName} || {};
  const relatedProducts = sectionData.relatedProducts || ${getField('relatedProducts')};
  const sectionTitle = sectionData.sectionTitle || ${getField('relatedProductsTitle')};
  const displayLimit = sectionData.displayLimit || ${getField('displayLimit')};
  const algorithmType = sectionData.algorithmType || ${getField('algorithmType')};

  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Show loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const addToCartText = ${getField('addToCartText')};
  const quickViewText = ${getField('quickViewText')};
  const viewAllText = ${getField('viewAllText')};

  const formatPrice = ${formatPrice};
  const getRatingStars = ${getRatingStars};

  const displayProducts = relatedProducts.slice(0, displayLimit);
  const itemsPerView = 4;
  const maxIndex = Math.max(0, displayProducts.length - itemsPerView);

  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  };

  const addToCart = (product: any) => {
    console.log('Adding to cart:', product);
  };

  const handleQuickView = (product: any) => {
    console.log('Quick view:', product);
  };

  const handleViewAll = () => {
    console.log('View all related products');
  };

  return (
    <>
<div className="related-products-container p-6">
        <div className="related-products-header">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-600 dark:text-purple-400" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent dark:from-white dark:to-blue-400">{sectionTitle}</h2>
          </div>
          <button
            onClick={handleViewAll}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110"
          >
            {viewAllText}
          </button>
        </div>

        <div className="carousel-container">
          {currentIndex > 0 && (
            <button
              onClick={handlePrevious}
              className="absolute top-1/2 -translate-y-1/2 left-0 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg rounded-full p-3 z-10 transition-all duration-300 hover:scale-110"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          <div className="carousel-wrapper" ref={carouselRef}>
            <div
              className="carousel-track"
              style={{
                transform: \`translateX(-\${currentIndex * (100 / itemsPerView)}%)\`
              }}
            >
              {displayProducts.map((product: any) => {
                const productId = ${getField('id')};
                const name = ${getField('name')};
                const price = ${getField('price')};
                const originalPrice = ${getField('originalPrice')};
                const image = ${getField('image')};
                const rating = ${getField('rating')};
                const reviewCount = ${getField('reviewCount')};
                const badge = ${getField('badge')};
                const discount = ${getField('discount')};
                const inStock = ${getField('inStock')};

                return (
                  <div key={productId} className="flex-shrink-0" style={{ width: \`calc(\${100 / itemsPerView}% - 12px)\` }}>
                    <Card className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-purple-500 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-pointer group hover:scale-105 h-full relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500 z-10 pointer-events-none"></div>
                      <div className="product-image-container h-48 relative z-20">
                        {badge && (
                          <Badge className="product-badge bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold shadow-md">
                            {badge}
                          </Badge>
                        )}
                        <img
                          src={image || '/api/placeholder/200/200'}
                          alt={name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                      <CardContent className="p-4 relative z-20">
                        <h3 className="font-bold text-sm mb-2 line-clamp-2 text-gray-900 dark:text-white group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300" title={name}>{name}</h3>
                        {rating && (
                          <div className="flex items-center gap-1 mb-2">
                            {getRatingStars(rating)}
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {rating} {reviewCount && \`(\${reviewCount})\`}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center mb-3">
                          <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{formatPrice(price)}</span>
                          {originalPrice && originalPrice > price && (
                            <>
                              <span className="line-through text-gray-400 text-sm ml-2">{formatPrice(originalPrice)}</span>
                              {discount && (
                                <Badge className="ml-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold shadow-md">
                                  -{discount}%
                                </Badge>
                              )}
                            </>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 text-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product);
                            }}
                            disabled={!inStock}
                          >
                            <ShoppingCart className="w-3 h-3" />
                            {addToCartText}
                          </button>
                          <button
                            className="px-3 py-2 border-2 border-blue-300 dark:border-purple-600 hover:bg-blue-50 dark:hover:bg-purple-900/20 rounded-full transition-all duration-300 hover:scale-110 shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickView(product);
                            }}
                          >
                            <Eye className="w-4 h-4 text-blue-600 dark:text-purple-400" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>

          {currentIndex < maxIndex && (
            <button
              onClick={handleNext}
              className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg rounded-full p-3 z-10 transition-all duration-300 hover:scale-110"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Navigation dots */}
        {maxIndex > 0 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={\`h-2 rounded-full transition-all duration-300 \${
                  currentIndex === idx ? 'bg-gradient-to-r from-blue-600 to-purple-600 w-8 shadow-md' : 'bg-gray-300 dark:bg-gray-600 w-2'
                }\`}
                aria-label={(\`Go to slide \${idx + 1}\`)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default RelatedProductsSection;
    `,

    grid: `
${commonImports}

interface RelatedProductsSectionProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const RelatedProductsSection: React.FC<RelatedProductsSectionProps> = ({ ${dataName}: propData, className }) => {
  // Fetch data from API
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: () => api.get('${apiRoute}'),
  });

  const ${dataName} = propData || apiData;
  const sectionData = ${dataName} || {};
  const relatedProducts = sectionData.relatedProducts || ${getField('relatedProducts')};
  const sectionTitle = sectionData.sectionTitle || ${getField('relatedProductsTitle')};
  const displayLimit = sectionData.displayLimit || ${getField('displayLimit')};

  // Show loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const addToCartText = ${getField('addToCartText')};
  const viewAllText = ${getField('viewAllText')};
  const outOfStockText = ${getField('outOfStockText')};

  const formatPrice = ${formatPrice};
  const getRatingStars = ${getRatingStars};

  const displayProducts = relatedProducts.slice(0, displayLimit);

  const addToCart = (product: any) => {
    console.log('Adding to cart:', product);
  };

  const handleViewAll = () => {
    console.log('View all related products');
  };

  return (
    <>
<div className="related-products-container p-6">
        <div className="related-products-header">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-600 dark:text-purple-400" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent dark:from-white dark:to-blue-400">{sectionTitle}</h2>
          </div>
          <button
            onClick={handleViewAll}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110"
          >
            {viewAllText} →
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {displayProducts.map((product: any) => {
            const productId = ${getField('id')};
            const name = ${getField('name')};
            const price = ${getField('price')};
            const originalPrice = ${getField('originalPrice')};
            const image = ${getField('image')};
            const rating = ${getField('rating')};
            const reviewCount = ${getField('reviewCount')};
            const badge = ${getField('badge')};
            const discount = ${getField('discount')};
            const inStock = ${getField('inStock')};

            return (
              <Card key={productId} className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-purple-500 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-pointer group hover:scale-105 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500 z-10 pointer-events-none"></div>
                <div className="h-40 relative overflow-hidden bg-gray-100 dark:bg-gray-700 z-20">
                  {badge && (
                    <Badge className="absolute top-2 left-2 px-2 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-md">
                      {badge}
                    </Badge>
                  )}
                  <img
                    src={image || '/api/placeholder/200/200'}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <CardContent className="p-3 relative z-20">
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2 text-gray-900 dark:text-white group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300" title={name}>{name}</h3>
                  {rating && (
                    <div className="flex items-center gap-1 mb-2">
                      {getRatingStars(rating)}
                      <span className="text-xs text-gray-500 dark:text-gray-400">{rating}</span>
                    </div>
                  )}
                  <div className="mb-2">
                    <span className="text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{formatPrice(price)}</span>
                    {originalPrice && originalPrice > price && (
                      <div className="line-through text-gray-400 text-xs block">{formatPrice(originalPrice)}</div>
                    )}
                  </div>
                  <button
                    className="w-full text-xs px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product);
                    }}
                    disabled={!inStock}
                  >
                    {inStock ? addToCartText : outOfStockText}
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default RelatedProductsSection;
    `,

    sidebar: `
${commonImports}

interface RelatedProductsSectionProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const RelatedProductsSection: React.FC<RelatedProductsSectionProps> = ({ ${dataName}: propData, className }) => {
  // Fetch data from API
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: () => api.get('${apiRoute}'),
  });

  const ${dataName} = propData || apiData;
  const sectionData = ${dataName} || {};
  const relatedProducts = sectionData.relatedProducts || ${getField('relatedProducts')};
  const sectionTitle = sectionData.sectionTitle || ${getField('relatedProductsTitle')};
  const displayLimit = sectionData.displayLimit || 4;

  // Show loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  const addToCartText = ${getField('addToCartText')};
  const viewAllText = ${getField('viewAllText')};

  const formatPrice = ${formatPrice};
  const getRatingStars = ${getRatingStars};

  const displayProducts = relatedProducts.slice(0, displayLimit);

  const addToCart = (product: any) => {
    console.log('Adding to cart:', product);
  };

  const handleViewAll = () => {
    console.log('View all related products');
  };

  const handleProductClick = (product: any) => {
    console.log('Product clicked:', product);
  };

  return (
    <>
<div className="related-products-container p-5 bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-purple-500 shadow-lg hover:shadow-2xl transition-all duration-300">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-blue-600 dark:text-purple-400" />
          <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent dark:from-white dark:to-blue-400">{sectionTitle}</h3>
        </div>

        <div className="space-y-2">
          {displayProducts.map((product: any) => {
            const productId = ${getField('id')};
            const name = ${getField('name')};
            const price = ${getField('price')};
            const originalPrice = ${getField('originalPrice')};
            const image = ${getField('image')};
            const rating = ${getField('rating')};
            const badge = ${getField('badge')};
            const discount = ${getField('discount')};

            return (
              <div
                key={productId}
                className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-blue-50 dark:hover:bg-purple-900/20 border-2 border-transparent hover:border-blue-300 dark:hover:border-purple-600 transition-all duration-300 cursor-pointer group hover:scale-[1.02] shadow-sm hover:shadow-md"
                onClick={() => handleProductClick(product)}
              >
                <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 group-hover:border-blue-400 dark:group-hover:border-purple-500 transition-all duration-300">
                  <img
                    src={image || '/api/placeholder/80/80'}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {badge && (
                    <Badge className="absolute -top-1 -right-1 text-xs px-2 py-0.5 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold shadow-md">
                      {badge}
                    </Badge>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm mb-1 line-clamp-2 text-gray-900 dark:text-white group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300" title={name}>{name}</h4>
                  {rating && (
                    <div className="flex items-center gap-1 mb-1">
                      {getRatingStars(rating)}
                      <span className="text-xs text-gray-500 dark:text-gray-400">{rating}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{formatPrice(price)}</span>
                    {originalPrice && originalPrice > price && (
                      <>
                        <span className="text-xs line-through text-gray-400">
                          {formatPrice(originalPrice)}
                        </span>
                        {discount && (
                          <Badge className="text-xs px-1.5 py-0.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold shadow-sm">
                            -{discount}%
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                  <button
                    className="w-full h-7 text-xs px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product);
                    }}
                  >
                    <ShoppingCart className="w-3 h-3" />
                    {addToCartText}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button
          className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110"
          onClick={handleViewAll}
        >
          {viewAllText}
        </button>
      </div>
    </>
  );
};

export default RelatedProductsSection;
    `
  };

  return variants[variant] || variants.carousel;
};
