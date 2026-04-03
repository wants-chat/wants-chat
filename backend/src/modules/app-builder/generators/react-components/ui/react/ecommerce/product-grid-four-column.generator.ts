import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateProductGridFourColumn = (
  resolved: ResolvedComponent,
  variant: 'fourColumn' | 'compact' | 'featured' = 'fourColumn'
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
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Eye, Star, Loader2, Sparkles } from 'lucide-react';`;

  const commonStyles = `
    .product-grid-four-column {
      @apply w-full;
    }

    .four-column-grid {
      @apply grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5;
    }

    .product-card {
      @apply bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700;
    }

    .product-image-container {
      @apply relative overflow-hidden bg-gray-50 dark:bg-gray-700;
    }

    .product-image {
      @apply w-full h-full object-cover transition-transform duration-500;
    }

    .product-card:hover .product-image {
      @apply scale-110;
    }

    .product-badge {
      @apply absolute top-2 left-2 px-2 py-1 text-xs font-bold rounded-md shadow-md;
    }

    .product-actions {
      @apply absolute top-2 right-2 flex gap-2 opacity-0 transition-opacity duration-300;
    }

    .product-card:hover .product-actions {
      @apply opacity-100;
    }

    .action-button {
      @apply p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:scale-110;
    }

    .price-container {
      @apply flex items-center gap-1 flex-wrap;
    }

    .current-price {
      @apply text-lg font-bold text-gray-900 dark:text-white;
    }

    .original-price {
      @apply line-through text-gray-400 text-xs;
    }

    .discount-badge {
      @apply bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-1.5 py-0.5 rounded text-xs font-bold;
    }

    .featured-badge {
      @apply absolute top-2 left-2 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-md shadow-lg flex items-center gap-1;
    }
  `;

  const variants = {
    fourColumn: `
${commonImports}

interface ProductGridFourColumnProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ProductGridFourColumn: React.FC<ProductGridFourColumnProps> = ({ ${dataName}: propData, className }) => {
  // Fetch data from API
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: () => api.get('${apiRoute}'),
  });

  const ${dataName} = propData || apiData;
  const sourceData = ${dataName} || {};
  const products = ${dataName} || ${getField('products')};

  const [wishlist, setWishlist] = useState<any[]>([]);

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
  const outOfStockText = ${getField('outOfStockText')};

  const formatPrice = ${formatPrice};
  const getRatingStars = ${getRatingStars};

  const toggleWishlist = (productId: any) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
    console.log('Wishlist toggled for product:', productId);
  };

  const addToCart = (product: any) => {
    console.log('Adding to cart:', product);
  };

  const quickView = (product: any) => {
    console.log('Quick view:', product);
  };

  return (
    <>
<div className="product-grid-four-column p-4 md:p-6">
        <div className="four-column-grid">
          {products.map((product: any) => {
            const productId = ${getField('id')};
            const name = ${getField('name')};
            const price = ${getField('price')};
            const originalPrice = ${getField('originalPrice')};
            const image = ${getField('image')};
            const description = ${getField('description')};
            const productRating = ${getField('rating')};
            const reviewCount = ${getField('reviewCount')};
            const discount = ${getField('discount')};
            const badge = ${getField('badge')};
            const inStock = ${getField('inStock')};

            return (
              <Card key={productId} className="product-card">
                <div className="product-image-container h-48 md:h-56">
                  {badge && (
                    <Badge className="product-badge bg-red-500 text-white">
                      {badge}
                    </Badge>
                  )}
                  <img
                    src={image || '/api/placeholder/300/300'}
                    alt={name}
                    className="product-image"
                  />
                  <div className="product-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(productId);
                      }}
                      className="action-button"
                      title="Add to Wishlist"
                    >
                      <Heart
                        className={\`w-4 h-4 \${wishlist.includes(productId) ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300'}\`}
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        quickView(product);
                      }}
                      className="action-button"
                      title={quickViewText}
                    >
                      <Eye className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>
                </div>

                <CardContent className="p-3 md:p-4">
                  <h3 className="font-bold text-sm md:text-base mb-1 text-gray-900 dark:text-white line-clamp-2">
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

                  <div className="price-container mb-3">
                    <span className="current-price">{formatPrice(price)}</span>
                    {originalPrice && originalPrice > price && (
                      <>
                        <span className="original-price">{formatPrice(originalPrice)}</span>
                        {discount && (
                          <span className="discount-badge">-{discount}%</span>
                        )}
                      </>
                    )}
                  </div>

                  <Button
                    className="w-full"
                    size="sm"
                    onClick={() => addToCart(product)}
                    disabled={!inStock}
                  >
                    <ShoppingCart className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                    {inStock ? addToCartText : outOfStockText}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ProductGridFourColumn;
    `,

    compact: `
${commonImports}

interface ProductGridFourColumnProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ProductGridFourColumn: React.FC<ProductGridFourColumnProps> = ({ ${dataName}: propData, className }) => {
  // Fetch data from API
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: () => api.get('${apiRoute}'),
  });

  const ${dataName} = propData || apiData;
  const sourceData = ${dataName} || {};
  const products = ${dataName} || ${getField('products')};

  const [wishlist, setWishlist] = useState<any[]>([]);

  // Show loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const addToCartText = ${getField('addToCartText')};
  const outOfStockText = ${getField('outOfStockText')};

  const formatPrice = ${formatPrice};
  const getRatingStars = ${getRatingStars};

  const toggleWishlist = (productId: any) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
    console.log('Wishlist toggled for product:', productId);
  };

  const addToCart = (product: any) => {
    console.log('Adding to cart:', product);
  };

  return (
    <>
<div className="product-grid-four-column p-3 md:p-4">
        <div className="compact-grid">
          {products.map((product: any) => {
            const productId = ${getField('id')};
            const name = ${getField('name')};
            const price = ${getField('price')};
            const originalPrice = ${getField('originalPrice')};
            const image = ${getField('image')};
            const productRating = ${getField('rating')};
            const badge = ${getField('badge')};
            const inStock = ${getField('inStock')};

            return (
              <div key={productId} className="compact-card">
                <div className="compact-image-container">
                  {badge && (
                    <Badge className="product-badge bg-red-500 text-white">
                      {badge}
                    </Badge>
                  )}
                  <img
                    src={image || '/api/placeholder/250/250'}
                    alt={name}
                    className="product-image"
                  />
                  <button
                    onClick={() => toggleWishlist(productId)}
                    className="absolute top-2 right-2 action-button p-1.5"
                  >
                    <Heart
                      className={\`w-3.5 h-3.5 \${wishlist.includes(productId) ? 'fill-red-500 text-red-500' : 'text-gray-600'}\`}
                    />
                  </button>
                </div>

                <div className="p-2.5 md:p-3">
                  <h4 className="text-xs md:text-sm font-medium text-gray-900 dark:text-white truncate mb-1">
                    {name}
                  </h4>

                  {productRating && (
                    <div className="flex items-center gap-0.5 mb-2">
                      <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {productRating}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 mb-2 flex-wrap">
                    <span className="text-sm md:text-base font-bold text-gray-900 dark:text-white">
                      {formatPrice(price)}
                    </span>
                    {originalPrice && originalPrice > price && (
                      <span className="text-xs line-through text-gray-400">
                        {formatPrice(originalPrice)}
                      </span>
                    )}
                  </div>

                  <Button
                    className="w-full text-xs"
                    size="sm"
                    onClick={() => addToCart(product)}
                    disabled={!inStock}
                  >
                    {inStock ? addToCartText : outOfStockText}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ProductGridFourColumn;
    `,

    featured: `
${commonImports}

interface ProductGridFourColumnProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ProductGridFourColumn: React.FC<ProductGridFourColumnProps> = ({ ${dataName}: propData, className }) => {
  // Fetch data from API
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: () => api.get('${apiRoute}'),
  });

  const ${dataName} = propData || apiData;
  const sourceData = ${dataName} || {};
  const allProducts = ${dataName} || ${getField('products')};

  const [wishlist, setWishlist] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'featured'>('all');

  // Show loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const addToCartText = ${getField('addToCartText')};
  const outOfStockText = ${getField('outOfStockText')};
  const featuredText = ${getField('featuredText')};

  const formatPrice = ${formatPrice};
  const getRatingStars = ${getRatingStars};

  const featuredProducts = allProducts.filter((product: any) => {
    const isFeatured = ${getField('isFeatured')};
    return isFeatured === true;
  });

  const displayProducts = activeTab === 'featured' ? featuredProducts : allProducts;

  const toggleWishlist = (productId: any) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
    console.log('Wishlist toggled for product:', productId);
  };

  const addToCart = (product: any) => {
    console.log('Adding to cart:', product);
  };

  return (
    <>
<div className="product-grid-four-column p-4 md:p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {activeTab === 'featured' ? 'Featured Products' : 'All Products'}
            </h2>
            <div className="flex gap-2">
              <Button
                variant={activeTab === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('all')}
              >
                All ({allProducts.length})
              </Button>
              <Button
                variant={activeTab === 'featured' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('featured')}
              >
                <Sparkles className="w-4 h-4 mr-1" />
                Featured ({featuredProducts.length})
              </Button>
            </div>
          </div>
        </div>

        <div className="four-column-grid">
          {displayProducts.map((product: any) => {
            const productId = ${getField('id')};
            const name = ${getField('name')};
            const price = ${getField('price')};
            const originalPrice = ${getField('originalPrice')};
            const image = ${getField('image')};
            const description = ${getField('description')};
            const productRating = ${getField('rating')};
            const reviewCount = ${getField('reviewCount')};
            const discount = ${getField('discount')};
            const badge = ${getField('badge')};
            const inStock = ${getField('inStock')};
            const isFeatured = ${getField('isFeatured')};

            return (
              <Card key={productId} className="product-card">
                <div className="product-image-container h-56">
                  {isFeatured && (
                    <div className="featured-badge">
                      <Sparkles className="w-3 h-3" />
                      {featuredText}
                    </div>
                  )}
                  {badge && !isFeatured && (
                    <Badge className="product-badge bg-red-500 text-white">
                      {badge}
                    </Badge>
                  )}
                  <img
                    src={image || '/api/placeholder/300/300'}
                    alt={name}
                    className="product-image"
                  />
                  <button
                    onClick={() => toggleWishlist(productId)}
                    className="absolute top-2 right-2 action-button"
                  >
                    <Heart
                      className={\`w-4 h-4 \${wishlist.includes(productId) ? 'fill-red-500 text-red-500' : 'text-gray-600'}\`}
                    />
                  </button>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-bold text-sm md:text-base mb-1 text-gray-900 dark:text-white line-clamp-2">
                    {name}
                  </h3>

                  {description && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                      {description}
                    </p>
                  )}

                  {productRating && (
                    <div className="flex items-center gap-1 mb-3">
                      {getRatingStars(productRating)}
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">
                        {productRating}
                      </span>
                      {reviewCount && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({reviewCount})
                        </span>
                      )}
                    </div>
                  )}

                  <div className="price-container mb-3">
                    <span className="current-price">{formatPrice(price)}</span>
                    {originalPrice && originalPrice > price && (
                      <>
                        <span className="original-price">{formatPrice(originalPrice)}</span>
                        {discount && (
                          <span className="discount-badge">-{discount}%</span>
                        )}
                      </>
                    )}
                  </div>

                  <Button
                    className="w-full"
                    size="sm"
                    onClick={() => addToCart(product)}
                    disabled={!inStock}
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    {inStock ? addToCartText : outOfStockText}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ProductGridFourColumn;
    `
  };

  return variants[variant] || variants.fourColumn;
};
