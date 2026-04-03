import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateProductCardCompact = (
  resolved: ResolvedComponent,
  variant: 'minimal' | 'featured' | 'quick' = 'minimal'
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
    return (
      <div className="flex items-center gap-0.5">
        {Array(fullStars).fill(0).map((_, i) => (
          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
    );
  }`;

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart, Plus, Eye, Heart, Loader2 } from 'lucide-react';`;

  const commonStyles = `
    .compact-card-container {
      @apply w-full;
    }

    .compact-card {
      @apply bg-white dark:bg-gray-800 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer;
    }

    .compact-image-container {
      @apply relative overflow-hidden bg-gray-100 dark:bg-gray-700;
    }

    .compact-image {
      @apply w-full h-full object-cover transition-transform duration-300;
    }

    .compact-card:hover .compact-image {
      @apply scale-105;
    }

    .compact-badge {
      @apply absolute top-1 right-1 px-1.5 py-0.5 text-xs font-semibold rounded;
    }

    .compact-info {
      @apply p-2;
    }

    .compact-name {
      @apply text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 mb-1 min-h-[2.5rem];
    }

    .compact-price {
      @apply text-base font-bold;
    }

    .compact-original-price {
      @apply text-xs line-through text-gray-400 ml-1;
    }

    .compact-rating {
      @apply flex items-center gap-1 text-xs;
    }

    .stock-badge {
      @apply text-xs px-1.5 py-0.5 rounded;
    }

    .quick-actions {
      @apply absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-200 flex items-center justify-center gap-2;
    }

    .compact-card:hover .quick-actions {
      @apply opacity-100;
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .compact-card {
        @apply bg-gray-800;
      }
      .compact-image-container {
        @apply bg-gray-700;
      }
    }
  `;

  const variants = {
    minimal: `
${commonImports}

interface ProductCardCompactProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ProductCardCompact: React.FC<ProductCardCompactProps> = ({ ${dataName}: propData, className }) => {
  // Fetch data from API
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: () => api.get('${apiRoute}'),
  });

  const ${dataName} = propData || apiData;
  const sourceData = ${dataName} || {};
  const productData = sourceData;
  const products = productData.products || ${getField('products')};

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

  const handleProductClick = (product: any) => {
    console.log('Product clicked:', product);
  };

  const addToCart = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    console.log('Adding to cart:', product);
  };

  return (
    <>
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 p-4">
        {products.map((product: any) => {
          const productId = ${getField('id')};
          const name = ${getField('name')};
          const price = ${getField('price')};
          const originalPrice = ${getField('originalPrice')};
          const image = ${getField('image')};
          const rating = ${getField('rating')};
          const stockStatus = ${getField('stockStatus')};
          const badge = ${getField('badge')};

          const isOutOfStock = stockStatus === 'out-of-stock';

          return (
            <Card
              key={productId}
              className="compact-card"
              onClick={() => handleProductClick(product)}
            >
              <div className="compact-image-container aspect-square">
                {badge && (
                  <Badge className="compact-badge bg-red-500 text-white">
                    {badge}
                  </Badge>
                )}
                <img
                  src={image || '/api/placeholder/150/150'}
                  alt={name}
                  className="compact-image"
                />
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{outOfStockText}</span>
                  </div>
                )}
              </div>
              <CardContent className="compact-info">
                <h3 className="compact-name" title={name}>{name}</h3>
                {rating && (
                  <div className="compact-rating mb-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-gray-600 dark:text-gray-400">{rating}</span>
                  </div>
                )}
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="compact-price">{formatPrice(price)}</span>
                    {originalPrice && originalPrice > price && (
                      <span className="compact-original-price">{formatPrice(originalPrice)}</span>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full h-7 text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={(e) => addToCart(e, product)}
                  disabled={isOutOfStock}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {addToCartText}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
};

export default ProductCardCompact;
    `,

    featured: `
${commonImports}

interface ProductCardCompactProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ProductCardCompact: React.FC<ProductCardCompactProps> = ({ ${dataName}: propData, className }) => {
  // Fetch data from API
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: () => api.get('${apiRoute}'),
  });

  const ${dataName} = propData || apiData;
  const sourceData = ${dataName} || {};
  const productData = sourceData;
  const products = productData.products || ${getField('products')};

  const [wishlist, setWishlist] = useState<number[]>([]);

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
  const lowStockText = ${getField('lowStockText')};
  const newText = ${getField('newText')};

  const formatPrice = ${formatPrice};
  const getRatingStars = ${getRatingStars};

  const handleProductClick = (product: any) => {
    console.log('Product clicked:', product);
  };

  const addToCart = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    console.log('Adding to cart:', product);
  };

  const toggleWishlist = (e: React.MouseEvent, productId: number) => {
    e.stopPropagation();
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <>
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
        {products.map((product: any) => {
          const productId = ${getField('id')};
          const name = ${getField('name')};
          const price = ${getField('price')};
          const originalPrice = ${getField('originalPrice')};
          const image = ${getField('image')};
          const rating = ${getField('rating')};
          const stockStatus = ${getField('stockStatus')};
          const stockCount = ${getField('stockCount')};
          const badge = ${getField('badge')};
          const discount = ${getField('discount')};
          const isNew = ${getField('isNew')};
          const isFeatured = ${getField('isFeatured')};

          const isOutOfStock = stockStatus === 'out-of-stock';
          const isLowStock = stockStatus === 'low-stock';

          return (
            <Card
              key={productId}
              className={\`compact-card \${isFeatured ? 'ring-2 ring-blue-500' : ''}\`}
              onClick={() => handleProductClick(product)}
            >
              <div className="compact-image-container aspect-square">
                <div className="absolute top-1 left-1 flex flex-col gap-1">
                  {isNew && (
                    <Badge className="text-xs px-1.5 py-0.5 bg-green-500 text-white">
                      {newText}
                    </Badge>
                  )}
                  {badge && (
                    <Badge className="text-xs px-1.5 py-0.5 bg-red-500 text-white">
                      {badge}
                    </Badge>
                  )}
                  {discount && (
                    <Badge className="text-xs px-1.5 py-0.5 bg-orange-500 text-white">
                      -{discount}%
                    </Badge>
                  )}
                </div>
                <button
                  onClick={(e) => toggleWishlist(e, productId)}
                  className="absolute top-1 right-1 h-8 w-8 p-0 flex items-center justify-center bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Heart
                    className={\`w-3 h-3 \${
                      wishlist.includes(productId)
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-600 dark:text-gray-400'
                    }\`}
                  />
                </button>
                <img
                  src={image || '/api/placeholder/180/180'}
                  alt={name}
                  className="compact-image"
                />
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{outOfStockText}</span>
                  </div>
                )}
              </div>
              <CardContent className="compact-info p-3">
                <h3 className="compact-name text-sm" title={name}>{name}</h3>
                {rating && (
                  <div className="compact-rating mb-2">
                    {getRatingStars(rating)}
                    <span className="text-gray-600 dark:text-gray-400 font-medium">{rating}</span>
                  </div>
                )}
                <div className="mb-2">
                  <span className="compact-price text-lg">{formatPrice(price)}</span>
                  {originalPrice && originalPrice > price && (
                    <div className="compact-original-price">{formatPrice(originalPrice)}</div>
                  )}
                </div>
                {isLowStock && stockCount > 0 && (
                  <div className="stock-badge bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 mb-2">
                    {lowStockText}: {stockCount}
                  </div>
                )}
                <Button
                  size="sm"
                  className="w-full h-8 text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={(e) => addToCart(e, product)}
                  disabled={isOutOfStock}
                >
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  {addToCartText}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
};

export default ProductCardCompact;
    `,

    quick: `
${commonImports}

interface ProductCardCompactProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ProductCardCompact: React.FC<ProductCardCompactProps> = ({ ${dataName}: propData, className }) => {
  // Fetch data from API
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: () => api.get('${apiRoute}'),
  });

  const ${dataName} = propData || apiData;
  const sourceData = ${dataName} || {};
  const productData = sourceData;
  const products = productData.products || ${getField('products')};

  // Show loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const quickAddText = ${getField('quickAddText')};
  const viewText = ${getField('viewText')};
  const outOfStockText = ${getField('outOfStockText')};

  const formatPrice = ${formatPrice};

  const handleProductClick = (product: any) => {
    console.log('Product clicked:', product);
  };

  const quickAdd = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    console.log('Quick adding to cart:', product);
  };

  const quickView = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    console.log('Quick view:', product);
  };

  return (
    <>
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-4">
        {products.map((product: any) => {
          const productId = ${getField('id')};
          const name = ${getField('name')};
          const price = ${getField('price')};
          const originalPrice = ${getField('originalPrice')};
          const image = ${getField('image')};
          const rating = ${getField('rating')};
          const stockStatus = ${getField('stockStatus')};
          const badge = ${getField('badge')};
          const discount = ${getField('discount')};

          const isOutOfStock = stockStatus === 'out-of-stock';

          return (
            <Card
              key={productId}
              className="compact-card group"
              onClick={() => handleProductClick(product)}
            >
              <div className="compact-image-container aspect-square">
                {badge && (
                  <Badge className="compact-badge bg-red-500 text-white z-10">
                    {badge}
                  </Badge>
                )}
                <img
                  src={image || '/api/placeholder/160/160'}
                  alt={name}
                  className="compact-image"
                />
                {!isOutOfStock && (
                  <div className="quick-actions">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={(e) => quickAdd(e, product)}
                    >
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      {quickAddText}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0 flex items-center justify-center focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={(e) => quickView(e, product)}
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                  </div>
                )}
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge className="bg-gray-800 text-white">{outOfStockText}</Badge>
                  </div>
                )}
              </div>
              <CardContent className="compact-info">
                <h3 className="compact-name" title={name}>{name}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="compact-price">{formatPrice(price)}</span>
                    {originalPrice && originalPrice > price && (
                      <span className="compact-original-price">{formatPrice(originalPrice)}</span>
                    )}
                  </div>
                  {rating && (
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">{rating}</span>
                    </div>
                  )}
                </div>
                {discount && (
                  <Badge className="mt-1 text-xs px-1.5 py-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    Save {discount}%
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
};

export default ProductCardCompact;
    `
  };

  return variants[variant] || variants.minimal;
};
