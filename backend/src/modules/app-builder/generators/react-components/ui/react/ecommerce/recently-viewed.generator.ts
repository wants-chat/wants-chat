import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateRecentlyViewed = (
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
    return `/${dataSource || 'products'}`;
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

  const getTimeAgo = `(dateString: string) => {
    const now = new Date();
    const viewedDate = new Date(dateString);
    const diffInMs = now.getTime() - viewedDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return \`\${diffInMinutes}m ago\`;
    if (diffInHours < 24) return \`\${diffInHours}h ago\`;
    return \`\${diffInDays}d ago\`;
  }`;

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Eye, ChevronLeft, ChevronRight, X, Clock, Star, Trash2, Loader2 } from 'lucide-react';`;

  const commonStyles = `
    .recently-viewed-container {
      @apply w-full;
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
      @apply absolute top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors;
    }

    .carousel-button-prev {
      @apply left-0 -translate-x-1/2;
    }

    .carousel-button-next {
      @apply right-0 translate-x-1/2;
    }

    .product-card {
      @apply bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700;
    }

    .product-image {
      @apply w-full h-full object-cover;
    }

    .timestamp-badge {
      @apply absolute top-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded-md flex items-center gap-1;
    }

    .grid-container {
      @apply grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4;
    }

    .sidebar-item {
      @apply flex gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer;
    }
  `;

  const variants = {
    carousel: `
${commonImports}

interface RecentlyViewedProps {
  [key: string]: any; // Accept any prop for flexibility
  className?: string;
}

const RecentlyViewed: React.FC<RecentlyViewedProps> = ({ ${dataName}: propData, className }) => {
  // Fetch data from API
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: () => api.get('${apiRoute}'),
  });

  const ${dataName} = propData || apiData;
  const sourceData = ${dataName} || {};
  const productData = sourceData;
  const products = productData.recentlyViewedProducts || ${getField('recentlyViewedProducts')};

  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);

  // Show loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const recentlyViewedTitle = ${getField('recentlyViewedTitle')};
  const addToCartText = ${getField('addToCartText')};
  const clearHistoryText = ${getField('clearHistoryText')};

  const formatPrice = ${formatPrice};
  const getRatingStars = ${getRatingStars};
  const getTimeAgo = ${getTimeAgo};

  const maxScroll = Math.max(0, products.length - itemsPerView);

  const handlePrev = () => {
    setCurrentIndex(Math.max(0, currentIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex(Math.min(maxScroll, currentIndex + 1));
  };

  const addToCart = (product: any) => {
    console.log('Adding to cart:', product);
  };

  const clearHistory = () => {
    console.log('Clearing recently viewed history');
  };

  return (
    <>
<div className="recently-viewed-container p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {recentlyViewedTitle}
          </h2>
          <Button variant="ghost" size="sm" onClick={clearHistory}>
            <Trash2 className="w-4 h-4 mr-2" />
            {clearHistoryText}
          </Button>
        </div>

        {products && products.length > 0 ? (
          <div className="carousel-container">
            {currentIndex > 0 && (
              <button
                onClick={handlePrev}
                className="carousel-button carousel-button-prev"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            <div className="carousel-wrapper">
              <div
                className="carousel-track"
                style={{
                  transform: \`translateX(-\${currentIndex * (100 / itemsPerView)}%)\`
                }}
              >
                {products.map((product: any) => {
                  const productId = ${getField('id')};
                  const name = ${getField('name')};
                  const price = ${getField('price')};
                  const originalPrice = ${getField('originalPrice')};
                  const image = ${getField('image')};
                  const productRating = ${getField('rating')};
                  const reviewCount = ${getField('reviewCount')};
                  const discount = ${getField('discount')};
                  const inStock = ${getField('inStock')};
                  const viewedAt = ${getField('viewedAt')};

                  return (
                    <div
                      key={productId}
                      className="flex-shrink-0"
                      style={{ width: \`calc(100% / \${itemsPerView} - 12px)\` }}
                    >
                      <Card className="product-card">
                        <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
                          <img
                            src={image || '/api/placeholder/250/250'}
                            alt={name}
                            className="product-image"
                          />
                          <div className="timestamp-badge">
                            <Clock className="w-3 h-3" />
                            {getTimeAgo(viewedAt)}
                          </div>
                        </div>

                        <CardContent className="p-4">
                          <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-2 line-clamp-2">
                            {name}
                          </h3>

                          {productRating && (
                            <div className="flex items-center gap-1 mb-2">
                              {getRatingStars(productRating)}
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                ({reviewCount})
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              {formatPrice(price)}
                            </span>
                            {originalPrice && originalPrice > price && (
                              <>
                                <span className="text-xs line-through text-gray-400">
                                  {formatPrice(originalPrice)}
                                </span>
                                {discount && (
                                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 text-xs">
                                    -{discount}%
                                  </Badge>
                                )}
                              </>
                            )}
                          </div>

                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => addToCart(product)}
                            disabled={!inStock}
                          >
                            <ShoppingCart className="w-3 h-3 mr-2" />
                            {addToCartText}
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>

            {currentIndex < maxScroll && (
              <button
                onClick={handleNext}
                className="carousel-button carousel-button-next"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No recently viewed items</p>
          </div>
        )}
      </div>
    </>
  );
};

export default RecentlyViewed;
    `,

    grid: `
${commonImports}

interface RecentlyViewedProps {
  [key: string]: any; // Accept any prop for flexibility
  className?: string;
}

const RecentlyViewed: React.FC<RecentlyViewedProps> = ({ ${dataName}: propData, className }) => {
  // Fetch data from API
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: () => api.get('${apiRoute}'),
  });

  const ${dataName} = propData || apiData;
  const sourceData = ${dataName} || {};
  const productData = sourceData;
  const allProducts = productData.recentlyViewedProducts || ${getField('recentlyViewedProducts')};

  const [showAll, setShowAll] = useState(false);

  // Show loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const recentlyViewedTitle = ${getField('recentlyViewedTitle')};
  const addToCartText = ${getField('addToCartText')};
  const clearHistoryText = ${getField('clearHistoryText')};
  const viewAllText = ${getField('viewAllText')};
  const maxItems = ${getField('maxItems')};

  const formatPrice = ${formatPrice};
  const getRatingStars = ${getRatingStars};
  const getTimeAgo = ${getTimeAgo};

  const displayProducts = showAll ? allProducts : allProducts.slice(0, maxItems);

  const addToCart = (product: any) => {
    console.log('Adding to cart:', product);
  };

  const clearHistory = () => {
    console.log('Clearing recently viewed history');
  };

  return (
    <>
<div className="recently-viewed-container p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {recentlyViewedTitle}
          </h2>
          <div className="flex gap-2">
            {allProducts.length > maxItems && (
              <Button variant="outline" size="sm" onClick={() => setShowAll(!showAll)}>
                {showAll ? 'Show Less' : \`\${viewAllText} (\${allProducts.length})\`}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={clearHistory}>
              <Trash2 className="w-4 h-4 mr-2" />
              {clearHistoryText}
            </Button>
          </div>
        </div>

        {displayProducts && displayProducts.length > 0 ? (
          <div className="grid-container">
            {displayProducts.map((product: any) => {
              const productId = ${getField('id')};
              const name = ${getField('name')};
              const price = ${getField('price')};
              const originalPrice = ${getField('originalPrice')};
              const image = ${getField('image')};
              const productRating = ${getField('rating')};
              const discount = ${getField('discount')};
              const inStock = ${getField('inStock')};
              const viewedAt = ${getField('viewedAt')};

              return (
                <Card key={productId} className="product-card">
                  <div className="relative h-40 bg-gray-100 dark:bg-gray-700">
                    <img
                      src={image || '/api/placeholder/200/200'}
                      alt={name}
                      className="product-image"
                    />
                    <div className="timestamp-badge">
                      <Clock className="w-3 h-3" />
                      {getTimeAgo(viewedAt)}
                    </div>
                  </div>

                  <CardContent className="p-3">
                    <h4 className="font-semibold text-xs text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {name}
                    </h4>

                    {productRating && (
                      <div className="flex items-center gap-0.5 mb-2">
                        {getRatingStars(productRating)}
                      </div>
                    )}

                    <div className="flex items-center gap-1 mb-2 flex-wrap">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {formatPrice(price)}
                      </span>
                      {originalPrice && originalPrice > price && (
                        <span className="text-xs line-through text-gray-400">
                          {formatPrice(originalPrice)}
                        </span>
                      )}
                    </div>

                    <Button
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => addToCart(product)}
                      disabled={!inStock}
                    >
                      {addToCartText}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No recently viewed items</p>
          </div>
        )}
      </div>
    </>
  );
};

export default RecentlyViewed;
    `,

    sidebar: `
${commonImports}

interface RecentlyViewedProps {
  [key: string]: any; // Accept any prop for flexibility
  className?: string;
}

const RecentlyViewed: React.FC<RecentlyViewedProps> = ({ ${dataName}: propData, className }) => {
  // Fetch data from API
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: () => api.get('${apiRoute}'),
  });

  const ${dataName} = propData || apiData;
  const sourceData = ${dataName} || {};
  const productData = sourceData;
  const products = productData.recentlyViewedProducts || ${getField('recentlyViewedProducts')};

  const [hoveredProduct, setHoveredProduct] = useState(null);

  // Show loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  const recentlyViewedTitle = ${getField('recentlyViewedTitle')};
  const clearHistoryText = ${getField('clearHistoryText')};
  const noItemsText = ${getField('noItemsText')};
  const maxItems = ${getField('maxItems')};

  const formatPrice = ${formatPrice};
  const getTimeAgo = ${getTimeAgo};

  const displayProducts = products.slice(0, maxItems);

  const viewProduct = (product: any) => {
    console.log('Viewing product:', product);
  };

  const removeItem = (productId: any, event: any) => {
    event.stopPropagation();
    console.log('Removing item from history:', productId);
  };

  const clearHistory = () => {
    console.log('Clearing recently viewed history');
  };

  return (
    <>
<div className="recently-viewed-container bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {recentlyViewedTitle}
          </h3>
          {products.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearHistory}>
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>

        <Separator className="mb-4" />

        {displayProducts && displayProducts.length > 0 ? (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {displayProducts.map((product: any) => {
              const productId = ${getField('id')};
              const name = ${getField('name')};
              const price = ${getField('price')};
              const originalPrice = ${getField('originalPrice')};
              const image = ${getField('image')};
              const viewedAt = ${getField('viewedAt')};

              return (
                <div
                  key={productId}
                  className="sidebar-item group relative"
                  onClick={() => viewProduct(product)}
                  onMouseEnter={() => setHoveredProduct(productId)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <img
                    src={image || '/api/placeholder/60/60'}
                    alt={name}
                    className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">
                      {name}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {formatPrice(price)}
                      </span>
                      {originalPrice && originalPrice > price && (
                        <span className="text-xs line-through text-gray-400">
                          {formatPrice(originalPrice)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {getTimeAgo(viewedAt)}
                    </p>
                  </div>

                  {hoveredProduct === productId && (
                    <button
                      onClick={(e) => removeItem(productId, e)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Eye className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">{noItemsText}</p>
          </div>
        )}

        {products.length > maxItems && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Showing {maxItems} of {products.length} items
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default RecentlyViewed;
    `
  };

  return variants[variant] || variants.carousel;
};
